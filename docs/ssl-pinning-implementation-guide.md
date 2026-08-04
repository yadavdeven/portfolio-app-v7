# SSL Pinning in React Native — Implementation Guide

A general-purpose guide for adding SSL/TLS public-key pinning to a React Native
app. Nothing here is tied to a specific cloud provider or backend stack.

Audience: the React Native developer implementing it, plus the backend/DevOps
team who must supply the certificate information and agree to a rotation policy.

---

## Table of contents

1. [What SSL pinning is](#1-what-ssl-pinning-is)
2. [The threat model — what it does and does not protect against](#2-the-threat-model)
3. [What to pin: certificate vs public key](#3-what-to-pin-certificate-vs-public-key)
4. [Where in the chain to pin: leaf, intermediate, or root](#4-where-in-the-chain-to-pin)
5. [The single biggest risk: bricking the app](#5-the-single-biggest-risk-bricking-the-app)
6. [React Native implementation steps](#6-react-native-implementation-steps)
7. [How to extract the pins yourself](#7-how-to-extract-the-pins-yourself)
8. [Testing and verification](#8-testing-and-verification)
9. [What to ask the backend / DevOps team](#9-what-to-ask-the-backend--devops-team)
10. [Rollout plan](#10-rollout-plan)
11. [Known gotchas](#11-known-gotchas)
12. [Command appendix](#12-command-appendix)

---

## 1. What SSL pinning is

### How normal HTTPS works

When your app opens an HTTPS connection, the server presents a **certificate
chain**:

```
leaf certificate  (api.yourcompany.com)
      ↓ signed by
intermediate CA   (e.g. "DigiCert TLS RSA SHA256 2020 CA1")
      ↓ signed by
root CA           (e.g. "DigiCert Global Root CA")  ← preinstalled on the device
```

The OS validates that chain: correct hostname, not expired, signatures valid,
and the root is in the device's **trust store**. If all checks pass, the
connection is trusted.

The weakness: the device trusts **~150 root CAs** by default, and anyone who can
add a root CA to the device can mint a certificate for *your* domain that passes
every one of those checks.

Who can add a root CA?

- A corporate MDM profile on a managed device
- Malware or a rooted/jailbroken device
- **The user themselves** — installing Charles Proxy, Proxyman, mitmproxy, or
  Burp Suite takes about two minutes

### What pinning changes

Pinning tells the app: *"For this specific hostname, don't accept just any
CA-signed certificate. Accept it only if the chain contains a key I already
know."*

You embed one or more **SHA-256 hashes** in the app. At handshake time the
native TLS layer hashes the certificates the server presented and compares. No
match → the handshake is **aborted before a single byte of your request is
sent**. The attacker sees an encrypted handshake failure and nothing else.

### The practical effect

| | Without pinning | With pinning |
|---|---|---|
| Attacker with rogue CA on device | Reads and edits all traffic | Handshake rejected |
| Developer with Charles/Proxyman | Full visibility | Sees nothing usable |
| Real server, real certificate | Works | Works |
| Certificate rotated without app update | Works | **App breaks** ← the cost |

That last row is the entire reason this needs backend coordination.

---

## 2. The threat model

**Pinning protects against:**

- Man-in-the-middle via an untrusted/attacker-installed root CA
- A compromised or coerced public CA issuing a fraudulent cert for your domain
- Casual API reverse-engineering (someone proxying the app to map your endpoints)
- Traffic tampering — modifying request/response bodies in flight

**Pinning does NOT protect against:**

- A compromised server. If the backend is breached, pinning is irrelevant.
- A rooted/jailbroken device running Frida. Pinning lives in the app binary,
  and anything in the binary can be patched out by someone with root. Pinning
  raises cost, it does not create an impassable wall.
- Anything on the device itself — insecure local storage, logging tokens,
  screenshots. Those are separate concerns.
- Attacks against non-pinned domains. If you pin `api.yourcompany.com` but the
  app also talks to `cdn.yourcompany.com`, the CDN traffic is unprotected.

Set expectations honestly when presenting this: pinning is a strong control
against network-position attackers, not a general anti-tampering measure.

---

## 3. What to pin: certificate vs public key

Two options exist. **Pin the public key.**

**Certificate pinning** hashes the entire certificate. Every field is part of
the hash — including the expiry date. When the cert is renewed, the hash
changes, *even if the underlying key is identical*. That means an app update on
every renewal. With modern 90-day certificates (Let's Encrypt, ACM auto-renew),
this is unworkable.

**Public-key pinning (SPKI pinning)** hashes only the *Subject Public Key Info* —
the public key itself. If the team renews the certificate while **reusing the
same key pair**, the pin stays valid and no app update is needed. This is the
OWASP-recommended approach and what every mainstream RN library implements.

> The value you'll work with looks like `sha256/AbCdEf...=` — a base64-encoded
> SHA-256 of the DER-encoded SPKI. Same format HTTP Public Key Pinning used.

**Important caveat to raise with backend:** automatic renewal in many systems
generates a *new key pair* each time. Key reuse usually has to be explicitly
enabled. This is question #4 in the backend section.

---

## 4. Where in the chain to pin

You can pin at any level. The tradeoff is security vs. operational fragility.

| Pin target | Security | Breaks when | Verdict |
|---|---|---|---|
| **Leaf** (your server cert) | Tightest — only your exact key is accepted | Cert rotates with a new key | Good primary pin |
| **Intermediate CA** | Any cert that CA issues for your domain is accepted | The CA retires the intermediate (rare, years of notice) | **Good backup pin** |
| **Root CA** | Weak — anything that CA ever issues passes | Almost never | Not worth it |

### Recommended configuration

Pin **at least two** hashes:

1. **Primary** — the leaf's public key.
2. **Backup** — either the intermediate CA's key, or the leaf key of a
   pre-generated backup certificate held in reserve by the backend team.

Pinning succeeds if **any** certificate in the presented chain matches **any**
configured pin. Two pins means leaf rotation doesn't brick the app — the
intermediate still matches.

> iOS/TrustKit **requires** a minimum of two pins and will refuse to initialize
> with one. This is deliberate: it forces you to have a backup.

The stronger-but-harder alternative preferred by security teams: backend
generates a second key pair now, keeps the private key offline, and gives you
the hash of its public key as the backup pin. Then a compromise of the live key
can be recovered from without shipping an app update. Ask if they're willing to
do this — many teams aren't set up for it, and the intermediate pin is an
acceptable fallback.

---

## 5. The single biggest risk: bricking the app

Understand this clearly before you write any code, and make sure your manager
does too.

If the pinned certificate is replaced and no configured pin matches the new
chain, **every installed copy of the app loses all API connectivity**. Not a
degraded experience — a total outage. And you cannot fix it server-side: the fix
is a new app build, submitted to App Store review, downloaded by every user.
That's a multi-day outage in the worst case.

The mitigations, in order of importance:

1. **A backup pin that is not the leaf.** Non-negotiable.
2. **A written agreement that DevOps notifies mobile before any cert change.**
   This is a process problem, not a technical one, and it is where pinning
   deployments actually fail.
3. **A remote kill switch** — a server-controlled flag the app reads at startup
   to disable pinning. Note the bootstrapping problem: if pinning already blocks
   all traffic you can't fetch the flag. It must be served from a **separate,
   unpinned** endpoint, and that endpoint becomes a target. Discuss with your
   security team; some consider it an unacceptable weakening.
4. **Calendar reminders** at cert-expiry-minus-60-days for both teams.
5. **Monitoring** — alert on a spike in TLS handshake failures.

---

## 6. React Native implementation steps

### Step 0 — Decide the scope

List every domain the app talks to and decide which to pin:

- Your own API → **pin**
- Auth server, if separate → **pin**
- Third-party SDKs (Firebase, analytics, Sentry, payment SDKs) → **do not pin**.
  You don't control their rotation and they use short-lived certs. Pinning them
  will break your app on someone else's schedule.
- CDN / image hosts → usually skip; public assets, and CDN certs rotate often.

Start with a single domain: your primary API.

### Step 1 — Choose a library

Options, in rough order of preference for a new implementation:

| Library | How it works | Notes |
|---|---|---|
| `react-native-ssl-public-key-pinning` | Configures native layer globally (TrustKit on iOS, OkHttp `CertificatePinner` on Android) | Works with **any** HTTP client — axios, fetch, third-party SDKs. Recommended. |
| `react-native-ssl-pinning` | Provides its own `fetch` replacement | You must route every call through its API; axios interceptors don't apply. Avoid unless you have a reason. |
| Native config only | iOS `Info.plist` + Android `network_security_config.xml` | No JS dependency, but Android's `<pin-set>` supports only cert pinning declaratively and iOS's ATS pinning is limited. Not recommended as the primary approach. |

The rest of this guide assumes the **global native configuration** approach,
because "every request in the app is protected, including ones you didn't write"
is the property you actually want.

```bash
npm install react-native-ssl-public-key-pinning
cd ios && pod install && cd ..
```

Both Android and iOS are autolinked. No manual native changes needed for the
common case.

### Step 2 — Store the pins

Keep pins in one module, not scattered through the codebase.

```ts
// src/security/pinning-config.ts

// The exact hostname on the certificate. Not a URL — no scheme, no path, no port.
const API_HOST = 'api.yourcompany.com';

export const PIN_CONFIG = {
  [API_HOST]: {
    includeSubdomains: false,
    publicKeyHashes: [
      '<base64-sha256-of-leaf-SPKI>',         // primary
      '<base64-sha256-of-intermediate-SPKI>', // backup
    ],
  },
};
```

Notes on this shape:

- `includeSubdomains: true` covers `*.yourcompany.com`, but only one level deep
  and it requires that every subdomain shares the pinned chain. Prefer listing
  hosts explicitly.
- Pins are **not secrets**. They're hashes of public keys — anyone can compute
  them from your server. There's no need to obfuscate or fetch them at runtime.
  Do not build a "secure pin delivery" mechanism; it adds attack surface for no
  gain.
- If you have separate dev/staging/prod hosts, key the config off your build
  environment and pin each accordingly. Many teams pin production only and leave
  debug builds unpinned so QA can use a proxy — see Step 4.

### Step 3 — Initialize at app startup

Pinning must be active **before the first network request**. Initialize it in
your root provider or `App.tsx`, ahead of any data fetching.

```ts
// src/security/pinning.ts
import {
  initializeSslPinning,
  isSslPinningAvailable,
} from 'react-native-ssl-public-key-pinning';
import { PIN_CONFIG } from './pinning-config';

export const enablePinning = async () => {
  // False on unsupported platforms (e.g. web) — don't crash there.
  if (!isSslPinningAvailable()) return false;
  await initializeSslPinning(PIN_CONFIG);
  return true;
};
```

```tsx
// App.tsx (or your root provider)
useEffect(() => {
  enablePinning();
}, []);
```

Two subtleties worth knowing:

- **Connection pooling.** Enabling or disabling pinning at runtime may not
  affect already-open HTTP/2 connections. Treat pinning state as a
  launch-time decision; if you ever toggle it, relaunch to be certain.
- **Race conditions.** If any request can fire before that `useEffect` runs
  (a splash-screen config fetch, a persisted-Redux rehydration), that request
  goes out unpinned. Either gate your first request on pinning being ready, or
  initialize synchronously at module scope.

### Step 4 — Handle debug builds

Your QA team will need Charles/Proxyman, and so will you. Pin in release builds
only:

```ts
if (!__DEV__) {
  await enablePinning();
}
```

Ship this deliberately, not by accident. Some security reviewers will require
pinning in all builds — ask before deciding. If pinning is on in debug, you'll
need a documented way for QA to inspect traffic (a separate unpinned build
variant is the usual answer).

### Step 5 — Handle the failure case in the UI

A pinning failure surfaces as a **generic network error**, not a distinctive
error code. In axios it typically looks like a request with no `error.response`
and a message like `Network Error` (iOS) or an SSL handshake exception
(Android). You cannot reliably distinguish "pinning rejected this" from "the
wifi dropped."

Practical approach:

```ts
// In your axios response interceptor
if (!error.response) {
  // Could be: no connectivity, timeout, DNS failure, OR a pinning rejection.
  // Show one honest message; don't guess.
  showError('Unable to connect securely. Check your connection and try again.');
}
```

Do **not** tell the user "a security threat was detected" — you'll alarm people
whose train just went into a tunnel. Do **log** these events to your crash
reporter with the target host, so a spike is visible to you. (Your crash
reporter's own endpoint must not be pinned, or you'll lose exactly the telemetry
you need.)

### Step 6 — Verify it actually works

See [section 8](#8-testing-and-verification). Do not skip this. A misconfigured
pinning setup that silently does nothing looks identical to a working one in
normal use, and it is a genuinely common outcome.

---

## 7. How to extract the pins yourself

Ideally backend gives you the hashes. But you should be able to derive them
independently — it's the fastest way to verify what they sent you, and it
unblocks you if they're slow.

### Leaf public-key hash, from a live server

```bash
openssl s_client -servername api.yourcompany.com \
                 -connect api.yourcompany.com:443 </dev/null 2>/dev/null \
  | openssl x509 -pubkey -noout \
  | openssl pkey -pubin -outform der \
  | openssl dgst -sha256 -binary \
  | openssl enc -base64
```

Output is your primary pin, e.g. `gUshJfFZtqGmhLTxllVsa1R6In8knbGFn8RTXKcls/I=`.

### Full chain, to get the intermediate

```bash
openssl s_client -servername api.yourcompany.com \
                 -connect api.yourcompany.com:443 -showcerts </dev/null
```

This prints every certificate the server sends. Save the **second** block
(the intermediate — the first is the leaf) to `intermediate.pem`, then:

```bash
openssl x509 -in intermediate.pem -pubkey -noout \
  | openssl pkey -pubin -outform der \
  | openssl dgst -sha256 -binary \
  | openssl enc -base64
```

That's your backup pin.

> **Check the chain is complete.** Some servers are misconfigured to send only
> the leaf. Mobile devices are less forgiving about this than browsers (which
> often fetch missing intermediates automatically). If `-showcerts` returns one
> certificate, that's a server bug to report — and it means you cannot use an
> intermediate pin.

### From a `.pem` / `.crt` file backend sent you

```bash
openssl x509 -in cert.pem -pubkey -noout \
  | openssl pkey -pubin -outform der \
  | openssl dgst -sha256 -binary \
  | openssl enc -base64
```

### Sanity check

Confirm the same hash appears in your browser's certificate viewer or via an
independent tool (e.g. SSL Labs) before shipping. A wrong pin is an outage.

---

## 8. Testing and verification

### Test 1 — Happy path

Release build, real certificate, normal network. All API calls succeed. This
only proves you didn't break anything; it does not prove pinning is on.

### Test 2 — Prove pinning is actually enforced (the important one)

1. Install Charles Proxy, Proxyman, or mitmproxy on your machine.
2. Configure the device/emulator to use it as an HTTP proxy.
3. Install the proxy's root CA on the device and mark it fully trusted.
   - iOS: Settings → General → About → Certificate Trust Settings (this second
     step is required and easy to miss).
   - Android: needs a build with a `network_security_config` that trusts user
     CAs, or an emulator with a system-level cert.
4. **Before enabling pinning**, confirm you can read the app's traffic in the
   proxy. This proves your MITM setup works — otherwise a later "no traffic"
   result is meaningless.
5. Enable pinning, rebuild, repeat.
6. **Expected:** requests fail at the handshake. The proxy shows a failed/aborted
   connection with no decrypted contents.

Step 4 is the one people skip, and skipping it is how teams ship pinning that
does nothing.

### Test 3 — Wrong pin fails closed

Temporarily corrupt one character in each configured pin, rebuild, and confirm
requests fail. This proves the pins are being *read and enforced*, not silently
ignored due to a config typo (a wrong hostname key, for instance, fails open —
the domain simply isn't pinned).

Revert immediately after.

### Test 4 — Rotation drill

Ask backend for the staging server's *new* certificate before it goes live, and
confirm your backup pin still matches its chain. This is the rehearsal for the
real rotation.

### Test both platforms

iOS uses TrustKit, Android uses OkHttp. They have different failure modes,
different error messages, and different minimum-pin rules. Passing on one says
nothing about the other.

---

## 9. What to ask the backend / DevOps team

Send this as a written request and keep the answers on record. As the only
mobile dev, your protection here is a paper trail.

### The questions

**1. What is the exact hostname the mobile app should pin?**
The hostname on the certificate — not a URL. Confirm prod, staging, and dev
separately if they differ.

**2. Can you send the full certificate chain for that host?**
Leaf + intermediate(s), as `.pem` files. Also ask them to confirm the server
sends the complete chain (not just the leaf) — verify with `-showcerts`.

**3. Who issues the certificate, and how is it renewed?**
Public CA (Let's Encrypt, DigiCert), a managed cloud cert (AWS ACM, Google
Cloud), or an internal CA? Manual or automatic renewal? Renewal interval?
Auto-renewing 90-day certs need a very different plan from a manual annual cert.

**4. On renewal, is the same key pair reused, or is a new one generated?**
The single most important question. If the key is reused, the leaf pin survives
renewal. If a new key is generated each time — which is the default in many
automated systems — the leaf pin breaks on every renewal and you **must** rely
on an intermediate or backup pin. Ask explicitly whether key reuse can be
enabled.

**5. Can you provide a backup pin?**
Best case: they generate a second key pair now, keep the private key offline,
and give you the SHA-256 hash of its public key. Fallback: the intermediate CA's
public-key hash.

**6. Can you commit to notifying the mobile team before any certificate,
CA, or hostname change — with at least N weeks of notice?**
Ask for 4+ weeks: enough for a build, App Store review, and user adoption. Get
this in writing and ask that mobile be added to whatever change-management or
on-call process covers certificates.

**7. Is there any TLS-terminating infrastructure between the app and the API?**
CDN (Cloudflare, Akamai, Fastly), WAF, API gateway, or load balancer. Whatever
terminates TLS is what presents the certificate — that's what you pin, and its
rotation policy is the one that matters. **Cloudflare in proxy mode is a common
surprise here:** you'd be pinning Cloudflare's cert, and it rotates on their
schedule, not yours.

**8. Does the domain support pinning at all?**
Some managed/shared domains cannot be pinned. Notably, hostnames on the
[Public Suffix List](https://publicsuffix.org/) — including default cloud
endpoints like `*.execute-api.<region>.amazonaws.com` — are rejected by
TrustKit. If the API is behind such a domain, **you need a custom domain**, and
that's a backend task.

**9. Are certificates identical across environments?**
If staging uses a self-signed or internal cert, you need a separate pin config
per environment.

**10. Do we need a remote kill switch?**
Raise the option and the tradeoff (section 5). Let security decide.

**11. Which other hosts does the app talk to that you control?**
Auth service, file uploads, websockets, push. Decide pin-or-not for each.

### The one-paragraph version, if they're busy

> We're adding SSL public-key pinning to the mobile app. I need: (a) the exact
> hostname to pin, (b) the full certificate chain as .pem, (c) the SHA-256 SPKI
> hash of a backup key or the intermediate CA, (d) confirmation of whether cert
> renewal reuses the same key pair, and (e) a commitment to notify mobile at
> least 4 weeks before any certificate or hostname change. Without (e), a cert
> rotation will break the app for every installed user until an App Store
> release ships — there's no server-side fix.

That last sentence is the one that gets the meeting.

---

## 10. Rollout plan

1. **Get answers to section 9** before writing code, especially Q4 and Q7.
2. **Extract and verify pins yourself** (section 7). Don't trust a pasted hash.
3. **Implement behind a build flag**, release builds only initially.
4. **Run all four tests** on both platforms (section 8).
5. **Ship to internal/beta testers first.** A pinning bug is invisible until it
   isn't; a staged rollout limits the blast radius.
6. **Watch handshake-failure telemetry** for the first week.
7. **Document the pins, their source, and the expiry dates** in the repo, and
   set calendar reminders for both teams at expiry-minus-60-days.
8. **Do a rotation drill** on staging before the first real rotation.

---

## 11. Known gotchas

**iOS requires two pins minimum.** TrustKit refuses to initialize with one. Not
a bug — it's enforcing the backup-pin rule.

**Public Suffix List domains can't be pinned.** Default cloud API endpoints
(`*.execute-api.*.amazonaws.com` and similar) are rejected. Requires a custom
domain — a backend change with lead time. Find this out early.

**Pinning is global, not per-request.** With the native-config approach, every
HTTP client in the process is affected, including third-party SDKs. That's the
point — but it means a pinned wildcard config can break Firebase or your crash
reporter. Pin specific hosts.

**Connection pooling defeats runtime toggles.** Open HTTP/2 connections aren't
re-validated. Treat pinning as launch-time state.

**Simulator network conditions are unreliable.** iOS Simulator in particular
reports stale connectivity. Verify on a real device before believing any result.

**Pinning failures look like generic network errors.** Plan your logging
accordingly; you can't detect them from the error object alone.

**Don't pin third-party SDK domains.** Their rotation schedule is not yours.

**Metro/dev server traffic is separate.** Debug builds talking to `localhost`
over plain HTTP aren't affected by pinning; don't be confused when nothing seems
to change in dev.

**App Store review time is part of your recovery time.** Factor it into every
rotation-notice negotiation.

---

## 12. Command appendix

```bash
# Install
npm install react-native-ssl-public-key-pinning
cd ios && pod install && cd ..

# Leaf public-key pin from a live host
openssl s_client -servername HOST -connect HOST:443 </dev/null 2>/dev/null \
  | openssl x509 -pubkey -noout \
  | openssl pkey -pubin -outform der \
  | openssl dgst -sha256 -binary | openssl enc -base64

# Full chain (to identify + extract intermediates)
openssl s_client -servername HOST -connect HOST:443 -showcerts </dev/null

# Pin from a local cert file
openssl x509 -in cert.pem -pubkey -noout \
  | openssl pkey -pubin -outform der \
  | openssl dgst -sha256 -binary | openssl enc -base64

# Certificate expiry date
openssl s_client -servername HOST -connect HOST:443 </dev/null 2>/dev/null \
  | openssl x509 -noout -dates

# Issuer / subject (confirm who signed it)
openssl s_client -servername HOST -connect HOST:443 </dev/null 2>/dev/null \
  | openssl x509 -noout -subject -issuer
```

---

## References

- OWASP Mobile Application Security — Certificate Pinning
- OWASP Certificate and Public Key Pinning cheat sheet
- TrustKit (iOS) documentation — getting-started and pinning-policy
- OkHttp `CertificatePinner` documentation (Android)
- Public Suffix List — https://publicsuffix.org/
