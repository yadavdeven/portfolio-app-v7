# SSL Public-Key Pinning

End-to-end documentation of the SSL pinning feature in this app: what it is, the
attack it defeats, why the AWS default API URL could **not** be pinned, how we
fixed that with a custom domain, every command used (with real values), the app
wiring, and how to demo it.

---

## Table of contents

1. [What SSL pinning is](#1-what-ssl-pinning-is)
2. [The attack we defeat (Proxyman MITM)](#2-the-attack-we-defeat-proxyman-mitm)
3. [Library choice](#3-library-choice)
4. [Why the AWS default URL could NOT be pinned](#4-why-the-aws-default-url-could-not-be-pinned)
5. [The fix: a custom domain (full process + commands)](#5-the-fix-a-custom-domain-full-process--commands)
6. [Extracting the pins](#6-extracting-the-pins)
7. [App implementation](#7-app-implementation)
8. [The demo toggle (MMKV persistence + why relaunch)](#8-the-demo-toggle-mmkv-persistence--why-relaunch)
9. [Interview demo script](#9-interview-demo-script)
10. [Production notes & caveats](#10-production-notes--caveats)
11. [Command appendix](#11-command-appendix)

---

## 1. What SSL pinning is

Normal HTTPS trusts **any** certificate that chains up to a Certificate
Authority (CA) the operating system trusts. That's usually fine — but if an
attacker can install a **rogue CA** on the device (corporate MDM, malware, or a
debugging proxy like Proxyman/Charles), they can present their **own** "valid"
certificate and silently man-in-the-middle (MITM) your traffic.

**SSL pinning** hard-codes the server's identity into the app so it stops
trusting "any CA" and instead trusts **only the specific key(s) you pinned**.

We pin the **public key** (the SHA-256 hash of the certificate's
*Subject Public Key Info*, "SPKI"), not the whole certificate. This is the
OWASP-recommended approach because the leaf certificate rotates (AWS ACM
re-issues it periodically) while you can keep pinning a stable key higher in the
chain.

- **What gets pinned:** `api.deven-portfolio.xyz` (our custom domain)
- **Pins:** the leaf key (tightest) + the intermediate `Amazon RSA 2048 M01`
  (backup that survives leaf rotation). Pinning passes if **any** cert in the
  presented chain matches **any** pin; iOS requires **at least two** pins.

---

## 2. The attack we defeat (Proxyman MITM)

Reproduced before pinning to prove the app was vulnerable:

1. Installed **Proxyman** and installed its root CA on the iOS simulator.
2. Every request/response became visible & decrypted in Proxyman.
3. Set a **breakpoint** on the API URL and **tampered** the request.
4. The tampered values were reflected in the response → full MITM.

After pinning, the same Proxyman interception causes the TLS handshake to be
**rejected before any request is sent** — the breakpoint never even triggers.

---

## 3. Library choice

[`react-native-ssl-public-key-pinning`](https://github.com/frw/react-native-ssl-public-key-pinning)

It is a thin React Native bridge over the **industry-standard native engines**:

| Platform | Engine | Notes |
|----------|--------|-------|
| iOS | [TrustKit](https://github.com/datatheorem/TrustKit) (DataTheorem) | The canonical iOS pinning lib, referenced by OWASP MASTG |
| Android | OkHttp `CertificatePinner` | Square's built-in pinning mechanism |

All requests through the standard networking stack (`fetch`, `axios`,
`XMLHttpRequest`) are pinned automatically once initialized — **no change to the
existing API layer**. Runtime control: `initializeSslPinning`,
`disableSslPinning`, `addSslPinningErrorListener`.

Install:

```sh
npm install react-native-ssl-public-key-pinning
cd ios && pod install   # pulls in TrustKit 3.0.7
```

> No patches anywhere. Everything runs on stock, unmodified libraries.

---

## 4. Why the AWS default URL could NOT be pinned

Original base URL:

```
https://8m1jnn1od3.execute-api.ap-south-1.amazonaws.com/dev/api/v1
```

When pinning was initialized against that host, iOS crashed at startup with:

```
TrustKit was initialized with an invalid domain
8m1jnn1od3.execute-api.ap-south-1.amazonaws.com
```

### Root cause (proven, not guessed)

TrustKit validates each pinned host against a bundled **Public Suffix List
(PSL)** via `GetRegistryLength()`. The throw is here:

```c
// TrustKit/parse_configuration.m
if (GetRegistryLength([domainName UTF8String]) == 0) {
    [NSException raise:@"TrustKit configuration invalid"
                format:@"TrustKit was initialized with an invalid domain %@", domainName];
}
```

AWS registered its regional service domains (e.g. `ap-south-1.amazonaws.com`) as
**public suffixes** in the PSL — so each AWS service endpoint gets browser
cookie/origin isolation. That means our host has **no registrable domain**, and
`GetRegistryLength` returns **0** → TrustKit refuses to pin it.

We confirmed this empirically by compiling TrustKit's own registry function:

```
8m1jnn1od3.execute-api.ap-south-1.amazonaws.com   ->  GetRegistryLength = 0   REJECTED
execute-api.ap-south-1.amazonaws.com              ->  GetRegistryLength = 0   REJECTED
www.google.com                                    ->  GetRegistryLength = 3   OK
httpbin.org                                       ->  GetRegistryLength = 3   OK
api.deven-portfolio.xyz                           ->  GetRegistryLength = 3   OK
```

> Note: **Android (OkHttp) is unaffected** — it doesn't consult the PSL, so the
> same pins work there directly. This is an iOS/TrustKit-specific limitation.

### Conclusion

You cannot pin an AWS **default** `*.execute-api.*.amazonaws.com` URL on iOS.
The production-grade fix is to put a **custom domain** in front of the API — which
is also better for branding and certificate control.

---

## 5. The fix: a custom domain (full process + commands)

We bought `deven-portfolio.xyz` (GoDaddy) and put `api.deven-portfolio.xyz` in
front of the existing API Gateway. `*.xyz` is a normal TLD (registrable domain),
so TrustKit accepts it (`GetRegistryLength = 3`, proven above).

**Cost: effectively $0** — ACM certs are free, API Gateway custom domains have no
extra charge, and DNS stays at GoDaddy (avoiding Route 53's ~$0.50/mo hosted
zone). Endpoint type chosen: **Regional** (cert in `ap-south-1`, same region; no
edge/CloudFront layer).

### 5.0 Identify the API (CLI already configured for `ap-south-1`)

```sh
aws sts get-caller-identity
# Account: 984974409684

aws apigateway get-rest-apis \
  --query "items[].{id:id,name:name,endpoint:endpointConfiguration.types}" --output table
# 8m1jnn1od3  PortfolioApi-dev  EDGE  (REST API)

aws apigateway get-stages --rest-api-id 8m1jnn1od3 --region ap-south-1 \
  --query "item[].{stage:stageName}" --output table
# stage: dev
```

Key facts: **REST API**, id `8m1jnn1od3`, stage `dev`, region `ap-south-1`.

### 5.1 Request the ACM certificate (DNS validation, free)

```sh
aws acm request-certificate \
  --domain-name api.deven-portfolio.xyz \
  --validation-method DNS \
  --region ap-south-1
# CertificateArn:
# arn:aws:acm:ap-south-1:984974409684:certificate/bb276327-87aa-4eff-83c0-c9b7c7704bca
```

### 5.2 Get the DNS validation record

```sh
ARN="arn:aws:acm:ap-south-1:984974409684:certificate/bb276327-87aa-4eff-83c0-c9b7c7704bca"
aws acm describe-certificate --certificate-arn "$ARN" --region ap-south-1 \
  --query "Certificate.DomainValidationOptions[0].ResourceRecord" --output json
```

Result → add this **CNAME** at GoDaddy (GoDaddy auto-appends the root domain and
adds trailing dots, so enter the **Name** without `.deven-portfolio.xyz` and drop
trailing dots):

| Field | Value (as entered in GoDaddy) |
|-------|-------------------------------|
| Type  | CNAME |
| Name  | `_8b0bae15b579c14e83adb039d7f123b6.api` |
| Value | `_496c0318c23feecef470e8aed3124c47.jkddzztszm.acm-validations.aws` |

> The CNAME **is** the proof of domain ownership for ACM — there is no separate
> "verify ownership" step. (Separately, click the GoDaddy/ICANN *registrant email*
> verification so the domain isn't suspended; unrelated to AWS.)

### 5.3 Wait for the cert to validate

```sh
dig +short _8b0bae15b579c14e83adb039d7f123b6.api.deven-portfolio.xyz CNAME @8.8.8.8
# -> _496c0318c23feecef470e8aed3124c47.jkddzztszm.acm-validations.aws.   (propagated)

aws acm wait certificate-validated --certificate-arn "$ARN" --region ap-south-1
# Status -> ISSUED
```

### 5.4 Create the Regional custom domain & map it to the API

```sh
CERT="arn:aws:acm:ap-south-1:984974409684:certificate/bb276327-87aa-4eff-83c0-c9b7c7704bca"

aws apigateway create-domain-name \
  --domain-name api.deven-portfolio.xyz \
  --regional-certificate-arn "$CERT" \
  --endpoint-configuration types=REGIONAL \
  --region ap-south-1 \
  --query "{domain:domainName,target:regionalDomainName,zone:regionalHostedZoneId}" --output table
# target: d-r3sqi0q1k0.execute-api.ap-south-1.amazonaws.com
# zone:   Z3VO1THU9YC4UR

# Map the custom domain root path -> the `dev` stage (drops the /dev prefix)
aws apigateway create-base-path-mapping \
  --domain-name api.deven-portfolio.xyz \
  --rest-api-id 8m1jnn1od3 \
  --stage dev \
  --region ap-south-1
```

`target` (`d-r3sqi0q1k0.execute-api.ap-south-1.amazonaws.com`) is the
AWS-managed endpoint behind the custom domain. We never call or pin it directly;
the app only ever talks to `api.deven-portfolio.xyz`.

### 5.5 Final DNS record at GoDaddy

| Field | Value |
|-------|-------|
| Type  | CNAME |
| Name  | `api` |
| Value | `d-r3sqi0q1k0.execute-api.ap-south-1.amazonaws.com` |

### 5.6 Verify the custom domain serves the API

```sh
dig +short api.deven-portfolio.xyz @8.8.8.8
# d-r3sqi0q1k0.execute-api.ap-south-1.amazonaws.com.  ->  13.207.236.12 / 13.206.165.140

curl -s -w "HTTP %{http_code} | TLS %{ssl_verify_result}\n" \
  -X POST "https://api.deven-portfolio.xyz/api/v1/ssl-pinning/echo-request?queryParam=hello" \
  -H "Content-Type: application/json" \
  -d '{"stringParam":"customdomain","numberParam":42}'
# HTTP 200 | TLS 0
# {"isSuccess":true,"message":"Echo successful", ... }
```

### URL change summary

| | URL | Pinnable on iOS? |
|---|-----|------------------|
| Old (default) | `https://8m1jnn1od3.execute-api.ap-south-1.amazonaws.com/dev/api/v1` | No (public suffix) |
| New (custom)  | `https://api.deven-portfolio.xyz/api/v1` | **Yes** |

The old URL still works as a fallback. Note the new URL has **no `/dev`** because
the base-path mapping points the stage at root. Endpoint constants
(`SSL_PINNING_ECHO: 'ssl-pinning/echo-request'`) are unchanged — only the base
URL changed.

---

## 6. Extracting the pins

General one-liner for a single cert's SPKI pin:

```sh
openssl s_client -connect HOST:443 -servername HOST </dev/null 2>/dev/null \
  | openssl x509 -pubkey -noout \
  | openssl pkey -pubin -outform der \
  | openssl dgst -sha256 -binary \
  | openssl enc -base64
```

Full chain (leaf + intermediate + root), which is what we used:

```sh
HOST=api.deven-portfolio.xyz
openssl s_client -connect ${HOST}:443 -servername ${HOST} -showcerts </dev/null 2>/dev/null \
| awk 'BEGIN{c=0} /BEGIN CERTIFICATE/{c++} /BEGIN CERTIFICATE/,/END CERTIFICATE/{print > ("/tmp/c_" c ".pem")}'
for f in /tmp/c_*.pem; do
  echo "$(openssl x509 -in "$f" -noout -subject)"
  openssl x509 -in "$f" -pubkey -noout | openssl pkey -pubin -outform der \
    | openssl dgst -sha256 -binary | openssl enc -base64
done
```

Result for `api.deven-portfolio.xyz`:

| Cert | Subject | SPKI SHA-256 pin |
|------|---------|------------------|
| Leaf | `api.deven-portfolio.xyz` | `gUshJfFZtqGmhLTxllVsa1R6In8knbGFn8RTXKcls/I=` |
| Intermediate | `Amazon RSA 2048 M01` | `DxH4tt40L+eduF6szpY6TONlxhZhBd+pJ9wbHlQ2fuw=` |
| Root | `Amazon Root CA 1` | `++MBgDH5WGvL9Bcn5Be30cRcL0f5O+NyoXuWtQdX1aI=` |

We pin **leaf + intermediate** (`M01`). The leaf is the tightest pin; the
intermediate is the backup that survives ACM leaf-cert rotation.

---

## 7. App implementation

### 7.1 Pin config + persistence — [`src/utils/ssl-pinning.ts`](../src/utils/ssl-pinning.ts)

```ts
import {
  initializeSslPinning,
  disableSslPinning,
  isSslPinningAvailable,
} from 'react-native-ssl-public-key-pinning';
import { createMMKV } from 'react-native-mmkv';

const API_HOST = 'api.deven-portfolio.xyz';

const PIN_CONFIG = {
  [API_HOST]: {
    includeSubdomains: false,
    publicKeyHashes: [
      'gUshJfFZtqGmhLTxllVsa1R6In8knbGFn8RTXKcls/I=', // primary (leaf)
      'DxH4tt40L+eduF6szpY6TONlxhZhBd+pJ9wbHlQ2fuw=', // backup (intermediate)
    ],
  },
};

export const enablePinning = async () => {
  if (!isSslPinningAvailable()) return false;
  await initializeSslPinning(PIN_CONFIG);
  return true;
};
export const disablePinning = () => disableSslPinning();

// Persisted demo toggle (MMKV — synchronous reads, no startup race).
const prefs = createMMKV({ id: 'ssl-pinning' });
const PIN_PREF_KEY = 'enabled';

export const isPinningPreferenceOn = (): boolean =>
  prefs.getBoolean(PIN_PREF_KEY) ?? false;            // default OFF for the demo
export const setPinningPreference = (on: boolean) => prefs.set(PIN_PREF_KEY, on);

export const applyPinningFromPreference = async () => {
  if (isPinningPreferenceOn()) await enablePinning();
  else await disablePinning();
};
```

### 7.2 Apply at startup — [`src/providers/AppProvider.tsx`](../src/providers/AppProvider.tsx)

```tsx
useEffect(() => {
  applyPinningFromPreference();   // before any request; builds native client correctly
}, []);
```

### 7.3 Base URL — [`.env.development`](../.env.development) & [`src/api/axiosClient.ts`](../src/api/axiosClient.ts)

```
BASE_API_URL=https://api.deven-portfolio.xyz/api/v1
```
```ts
const USE_LOCAL_BACKEND = false;   // hit the deployed (pinnable) host
```

### 7.4 Toggle UI — [`SSLPinningScreen.tsx`](../src/screens/features/ssl-pinning/SSLPinningScreen.tsx)

Switch initialised from the saved preference; on flip it persists the choice and
best-effort applies it live (see §8 for why a relaunch is needed for a guaranteed
effect).

---

## 8. The demo toggle (MMKV persistence + why relaunch)

Pinning is configured in the **native** HTTP client, and that client:

- **reuses pooled HTTP/2 connections** (the pin check runs only at the TLS
  handshake of a *new* connection — reused connections skip it), and
- on **Android** the OkHttpClient is built **once** with the pinner and cached.

So a live JS flip is **best-effort** — a warm connection can ignore it. To make
the toggle deterministic we:

1. **Persist** the desired state in **MMKV** (synchronous read = no startup race).
2. **Apply it at startup** in `AppProvider`, before the first request.
3. **Relaunch** after toggling → fresh native client, empty connection pool, pins
   applied before any request fires.

Storage stack (MMKV v4 uses Nitro modules):

```sh
npm install react-native-mmkv react-native-nitro-modules
cd ios && pod install
```

> **A full app relaunch (kill & reopen) is required after toggling — not a JS
> reload (Cmd+R).** A JS reload does not restart the native side or clear the
> connection pool.

---

## 9. Interview demo script

> "Pinning is global and applied at startup, like production. The toggle is a
> demo affordance — in production you'd never expose an off-switch from JS."

1. **Vulnerable state** — switch **OFF**, relaunch. Proxyman capturing
   `api.deven-portfolio.xyz` → Send Request → succeeds, set a breakpoint and
   **tamper** the request. *"No pinning: fully interceptable."*
2. **Protected state** — switch **ON**, **kill & relaunch**. Same Proxyman, same
   network → Send Request → **Network Error**; in Proxyman the handshake is
   rejected and the breakpoint never fires. Login (and every request) fails too,
   because **pinning is global**. *"Pinning on: the proxy is locked out."*
3. **Prove it's pinning** — switch **OFF**, relaunch → interceptable again. Only
   the switch changed. Undeniable A/B.

What to explain about the AWS journey: the default `execute-api` domain can't be
pinned on iOS because it's a public suffix (TrustKit rejects it; proven with
`GetRegistryLength`), so we fronted the API with a custom domain
`api.deven-portfolio.xyz` via a free ACM cert + regional API Gateway custom
domain + a GoDaddy CNAME.

---

## 10. Production notes & caveats

- **No runtime off-switch in production.** Pins should be applied at startup
  (or via native config: Android `network_security_config.xml`, iOS TrustKit in
  `Info.plist`) so they can't be disabled from JS. The toggle here is demo-only.
- **Pin the intermediate as backup.** AWS ACM rotates the **leaf** cert; pinning
  `Amazon RSA 2048 M01` keeps the app working across leaf rotations. If Amazon
  ever rotates the intermediate too (e.g. → `M02`), ship updated pins (or also
  pin the root `Amazon Root CA 1`, which is essentially permanent, and/or set an
  `expirationDate`).
- **iOS requires ≥2 pins** per domain.
- **Local dev:** `USE_LOCAL_BACKEND = true` in `axiosClient.ts` points at the LAN
  backend (`http://192.168.1.24:5002`), which is HTTP and unpinned — pinning only
  applies to the configured HTTPS host.
- **Android** doesn't have the PSL limitation; the same pins work on the default
  AWS URL there. The custom domain was needed for iOS.

---

## 11. Command appendix

```sh
# ── Packages ───────────────────────────────────────────────
npm install react-native-ssl-public-key-pinning
npm install react-native-mmkv react-native-nitro-modules
cd ios && pod install                       # TrustKit + NitroMmkv

# ── Identify API ───────────────────────────────────────────
aws sts get-caller-identity
aws apigateway get-rest-apis --query "items[].{id:id,name:name,endpoint:endpointConfiguration.types}" --output table
aws apigateway get-stages --rest-api-id 8m1jnn1od3 --region ap-south-1 --query "item[].{stage:stageName}" --output table

# ── ACM certificate ────────────────────────────────────────
aws acm request-certificate --domain-name api.deven-portfolio.xyz --validation-method DNS --region ap-south-1
ARN="arn:aws:acm:ap-south-1:984974409684:certificate/bb276327-87aa-4eff-83c0-c9b7c7704bca"
aws acm describe-certificate --certificate-arn "$ARN" --region ap-south-1 \
  --query "Certificate.DomainValidationOptions[0].ResourceRecord" --output json
aws acm wait certificate-validated --certificate-arn "$ARN" --region ap-south-1

# ── Custom domain + mapping ────────────────────────────────
aws apigateway create-domain-name --domain-name api.deven-portfolio.xyz \
  --regional-certificate-arn "$ARN" --endpoint-configuration types=REGIONAL --region ap-south-1
aws apigateway create-base-path-mapping --domain-name api.deven-portfolio.xyz \
  --rest-api-id 8m1jnn1od3 --stage dev --region ap-south-1

# ── Verify ─────────────────────────────────────────────────
dig +short api.deven-portfolio.xyz @8.8.8.8
curl -s -X POST "https://api.deven-portfolio.xyz/api/v1/ssl-pinning/echo-request?queryParam=hello" \
  -H "Content-Type: application/json" -d '{"stringParam":"x","numberParam":1}'

# ── Extract a pin (SPKI SHA-256, base64) ───────────────────
HOST=api.deven-portfolio.xyz
openssl s_client -connect ${HOST}:443 -servername ${HOST} </dev/null 2>/dev/null \
  | openssl x509 -pubkey -noout | openssl pkey -pubin -outform der \
  | openssl dgst -sha256 -binary | openssl enc -base64

# ── Build ──────────────────────────────────────────────────
npx react-native start --reset-cache
npx react-native run-ios          # or run-android
```

---

### Key values reference

| Thing | Value |
|-------|-------|
| API | `PortfolioApi-dev`, id `8m1jnn1od3`, REST/EDGE, `ap-south-1`, stage `dev` |
| Custom domain | `api.deven-portfolio.xyz` |
| New base URL | `https://api.deven-portfolio.xyz/api/v1` |
| ACM cert ARN | `arn:aws:acm:ap-south-1:984974409684:certificate/bb276327-87aa-4eff-83c0-c9b7c7704bca` |
| Custom domain target | `d-r3sqi0q1k0.execute-api.ap-south-1.amazonaws.com` (zone `Z3VO1THU9YC4UR`) |
| Leaf pin | `gUshJfFZtqGmhLTxllVsa1R6In8knbGFn8RTXKcls/I=` |
| Intermediate pin (`Amazon RSA 2048 M01`) | `DxH4tt40L+eduF6szpY6TONlxhZhBd+pJ9wbHlQ2fuw=` |
| Root pin (`Amazon Root CA 1`) | `++MBgDH5WGvL9Bcn5Be30cRcL0f5O+NyoXuWtQdX1aI=` |
