# Biometric Authentication — End-to-End Reference

How biometric login works across the React Native app (**frontend**) and the
Express/MongoDB API on Lambda (**backend**), what security properties it gives
us, and what every stored value is for.

---

## 1. The idea in one paragraph

Biometrics here do **not** send a fingerprint/face to the server. Instead, the
device holds a **private key inside the Secure Enclave / Android Keystore** that
can only be used after a successful biometric prompt. The server holds the
matching **public key**. To log in, the server issues a one-time random
**challenge**; the device signs it with the biometric-protected private key; the
server verifies the signature against the stored public key. This is the same
shape as **FIDO2 / WebAuthn** — proof of possession of a hardware-bound key,
unlocked by biometrics, with replay prevented by a fresh challenge each time.

```
Biometric prompt ─unlocks→ Private key (Secure Enclave) ─signs→ Challenge
                                                                    │
Server ──verifies signature with── Public key ←─────────────────────┘
```

---

## 2. Where things are stored

### Frontend — device Keychain (`react-native-keychain`)

| Service (namespace)     | Holds                                                        | Accessibility |
|-------------------------|-------------------------------------------------------------|---------------|
| `auth-credentials`      | `userId`, `accessToken`, `refreshToken`, `guid`, `email`    | `WHEN_UNLOCKED_THIS_DEVICE_ONLY`, hardware-backed (fallback to software) |
| `biometric_credentials` | `userId`, `publicKey`, `credentialId`, `email`              | `WHEN_UNLOCKED_THIS_DEVICE_ONLY`, hardware-backed (fallback to software) |
| `device_id`             | A persisted random UUID identifying this device+install     | `AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY` |

The biometric **private key** itself is **not** in any of these — it lives in the
Secure Enclave / Keystore, managed by `react-native-biometrics`, and never leaves
the device.

### Backend — MongoDB

**`BiometricChallenge`** — short-lived, single-use nonces.

| Field       | Purpose |
|-------------|---------|
| `userId`    | Who the challenge was issued to. |
| `challenge` | The 32-byte random nonce (`select: false` — never returned by default). |
| `type`      | `"registration"` or `"authentication"` — keeps the two flows separate. |
| `expiresAt` | Hard expiry (60s). Also a TTL index so Mongo auto-deletes stragglers. |

**`BiometricCredential`** — the permanent record of one enrolled device.

| Field          | Purpose |
|----------------|---------|
| `userId`       | Owner. Every lookup is scoped by it. |
| `credentialId` | Public, non-secret handle for this device's key (UUID). Sent on login so the server knows which public key to verify against; also the target for disable. |
| `deviceId`     | Stable client-generated device identifier. Survives re-enrollment, so it's the **dedupe key**: `(userId, deviceId)` is unique. |
| `publicKey`    | The device's public key (`select: false`). Used to verify signatures. |
| `counter`      | Legacy field, default 0. **No longer used** (see §7). |
| `deviceName`   | Human label ("My Phone") for a future "manage devices" UI. |
| `transports`   | WebAuthn carryover; unused in this mobile-only flow. |
| `lastUsedAt`   | Timestamp of last successful biometric login. |
| `isActive`     | Soft-enable flag; only active credentials can authenticate. |
| `createdAt`    | Enrollment time. |

---

## 3. Enrollment flow (enable biometrics)

User must already be **logged in** (the register endpoints require a valid JWT).

```
FRONTEND (BiometricScreen.tsx)                BACKEND (biometric.controller.ts)
──────────────────────────────                ─────────────────────────────────
handleEnableBiometric()
  │
  ├─ dispatch biometricRegisterStart() ──────► POST /biometric/register/start  [auth]
  │                                              • challenge = randomBytes(32)
  │                                              • store {userId, challenge, type:"registration", expiresAt:+60s}
  │  ◄──────────────────────── { challenge } ──┘
  │
  ├─ rnBiometrics.createKeys()  → keypair in Secure Enclave, returns publicKey
  │
  ├─ rnBiometrics.createSignature({ payload: challenge })
  │     → biometric prompt → signs challenge with private key
  │
  ├─ getDeviceId()  → reads/creates persisted device UUID
  │
  ├─ dispatch biometricRegisterVerify(
  │     { publicKey, signature, deviceName, deviceId }) ─► POST /biometric/register/verify [auth]
  │                                              • load registration challenge for userId
  │                                              • reject if missing/expired
  │                                              • verify(publicKey, signature, challenge)
  │                                              • UPSERT credential on (userId, deviceId):
  │                                                  same device → update in place
  │                                                  new device  → new row
  │                                              • user.biometricEnabled = true
  │                                              • delete challenge
  │  ◄──────────────────── { credentialId } ────┘
  │
  └─ saveBiometricCredentials(userId, publicKey, credentialId, email)
        → store in `biometric_credentials` keychain
```

Key points:
- The signature over the challenge **proves the device holds the private key**
  matching `publicKey` — that's the trust anchor for the registration.
- Re-enabling from the same device **replaces** that device's credential (upsert
  on `deviceId`) instead of stacking duplicate rows.

---

## 4. Login flow (biometric sign-in)

Runs automatically on `LoginScreen` mount if a biometric credential is stored
locally. The login endpoints are **public** (no JWT — that's the whole point).

```
FRONTEND (LoginScreen.tsx)                    BACKEND (biometric.controller.ts)
──────────────────────────                    ─────────────────────────────────
tryBiometricLogin()
  │
  ├─ getBiometricCredentials() → { email, credentialId, publicKey, userId }
  │     (bail silently if nothing stored)
  │
  ├─ dispatch biometricLoginStart({ email }) ─► POST /biometric/login/start
  │                                              • find user + active credential
  │                                              • GENERIC error if user unknown /
  │                                                biometrics off / no device
  │                                                (no account enumeration)
  │                                              • challenge = randomBytes(32)
  │                                              • store {type:"authentication", expiresAt:+60s}
  │  ◄──────────────────────── { challenge } ──┘   (device list is NOT returned)
  │
  ├─ rnBiometrics.createSignature({ payload: challenge })
  │     → biometric prompt → signature
  │
  ├─ dispatch biometricLoginVerify(
  │     { email, signature, credentialId }) ───► POST /biometric/login/verify
  │                                              • load authentication challenge
  │                                              • reject if missing/expired
  │                                              • load credential by (userId, credentialId, isActive)
  │                                              • verify(publicKey, signature, challenge)
  │                                              • UNIFORM failure message on any mismatch
  │                                              • update lastUsedAt; delete challenge
  │                                              • issue access + refresh tokens
  │  ◄──── { id, token, refreshToken, guid } ───┘
  │
  └─ saveAuthCredentials(...) → store session in `auth-credentials` keychain
       → navigate into the app
```

From here the axios client attaches the access token (and `x-guid`) to every
authenticated request, and refreshes it on 401.

---

## 5. Disable flow (turn biometrics off for this device)

```
FRONTEND (BiometricScreen.tsx)                BACKEND (biometric.controller.ts)
──────────────────────────────                ─────────────────────────────────
handleDisableBiometric()
  ├─ getBiometricCredentials() → credentialId
  ├─ dispatch biometricDisable({ credentialId }) ─► POST /biometric/disable [auth]
  │                                                 • delete THIS credential only
  │                                                 • if it was the last one →
  │                                                   user.biometricEnabled = false
  ├─ rnBiometrics.deleteKeys()        → wipe the Secure Enclave key
  └─ Keychain.resetGenericPassword()  → clear local `biometric_credentials`
```

Per-device revocation: disabling one device never affects the user's other
enrolled devices.

---

## 6. What we achieved

**Security properties:**
- **No biometric data leaves the device** — only public keys and signatures.
- **Private key is hardware-bound** — non-extractable, biometric-gated.
- **Replay-proof** — every challenge is 32 bytes of CSPRNG randomness,
  single-use (deleted after verify), 60s expiry, with a TTL index backstop, and
  bound to one user + flow type.
- **Multi-device** — a user can enrol any number of devices, each with its own
  keypair, credential, and `credentialId`. (A max-device cap is deferred.)
- **Per-device revocation** — disabling/deleting one device leaves the rest
  working.
- **No account enumeration** — `login/start` returns one generic failure for
  unknown user / biometrics-off / no-device, and never discloses the account's
  device list to an unauthenticated caller.
- **Defense-in-depth storage** — secrets use `THIS_DEVICE_ONLY` (no iCloud
  sync) and prefer hardware-backed storage, with a graceful fallback so
  enrollment doesn't crash on devices without a hardware keystore.

**Hardening applied during this work:**
1. Stripped all sensitive `console.log`s (challenge, public key, signature,
   credentialId, token blobs).
2. Removed the client-driven `counter` (it provided no real clone-detection and
   risked permanently locking users out on desync — see §7).
3. Added a stable, privacy-correct `deviceId` and per-device upsert/dedupe.
4. Closed account-enumeration and device-list disclosure on `login/start`;
   made `login/verify` failures uniform.
5. Fixed the stale `biometricEnabled` flag when the last device is removed.
6. Added a hardware-keystore fallback to both keychain writers.

---

## 7. Notable design decisions

**Why the `counter` was removed.** In real FIDO the authenticator *signs* a
counter, and the server uses it to detect cloned keys. In this implementation
only the challenge was signed; the counter was plain JSON the client
incremented itself — so it provided **zero** clone-detection while creating a
real risk: if the client and server counters ever drifted (failed local save,
reinstall, keychain wipe), every future login failed with "Replay attack
detected" and the user was locked out until re-enrollment. Since the single-use
60s challenge already prevents replay, the counter was pure liability and was
removed. The DB field remains (default 0) for backward compatibility but is
unused.

**Why `deviceId` is a self-generated UUID, not a hardware ID.** The value
itself carries no device information — it's random. It becomes device-specific
because it is generated **once** and pinned to this device's Keychain with
`THIS_DEVICE_ONLY` (never synced to the user's other devices). This is the
privacy-recommended pattern; both iOS and Android block reliable immutable
hardware identifiers. Its lifecycle also matches the biometric key: on Android,
uninstalling wipes both the Keystore key and the keychain `deviceId`, so a
reinstall correctly looks like a new authenticator.

---

## 8. Known limitations / future work

| Item | Status |
|------|--------|
| **Max device limit** | Not implemented (deferred). Users can enrol unlimited devices. |
| **Rate limiting** | Not in app code. Runs on Lambda, where an in-memory limiter is ineffective — should be done at **API Gateway / WAF**, or with a Mongo/Redis-backed throttle. |
| **Key attestation** | None. Signing proves key possession but not that the key is hardware-backed or the app genuine (Play Integrity / App Attest would add this). |
| **Root / jailbreak detection** | None. |
| **Step-up / transaction signing** | Biometrics gate login only; no re-auth for sensitive actions. |
| **Orphaned credentials** | Stale rows from old installs aren't pruned (ties into the device-limit work). |
| **Production log stripping** | Remaining non-sensitive `console.log`s still ship in release builds; consider `babel-plugin-transform-remove-console`. |

---

## 9. File map

**Frontend (`PortfolioApp`)**
- `src/screens/features/biometrics/BiometricScreen.tsx` — enable/disable UI + flow
- `src/screens/login/LoginScreen.tsx` — auto biometric login on mount
- `src/utils/helper-functions.ts` — `getDeviceId`, credential storage, sensor checks
- `src/api/authStorage.ts` — session credential storage
- `src/store/slices/authSlice.ts` — thunks for all biometric endpoints
- `src/constants/end-points.ts` — endpoint paths

**Backend (`portfolio-backend`)**
- `src/routes/auth/biometric.controller.ts` — register/login/disable handlers
- `src/routes/auth/auth.router.ts` — route wiring + auth middleware
- `src/models/biometricChallenge.mongo.ts` — challenge schema + TTL index
- `src/models/biometricCredential.mongo.ts` — credential schema + `(userId, deviceId)` unique index
