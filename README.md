# Income Tax Relief — Private Income Check on Zama FHEVM

> **Short pitch**
> A privacy-preserving eligibility checker for tax relief.
> Users submit their **annual income encrypted** with Zama’s FHEVM; the contract compares it against an **encrypted income threshold** and only reveals a public flag: `eligible / not eligible`.
> The raw income stays private to the user and never appears on‑chain in clear.

---

## 1. What this project does

Traditional blockchains make all transaction data public. That’s a problem if you want to prove you qualify for a tax benefit **without doxxing your income**.

**Income Tax Relief** shows how Zama’s FHEVM can solve this:

* The **tax authority** (or protocol admin) sets a **hidden maximum income threshold**, encrypted on‑chain.
* Each **user** submits their **annual income encrypted in the browser** via the Relayer SDK.
* The smart contract computes eligibility **directly on encrypted values** with Fully Homomorphic Encryption (FHE).
* Only a single encrypted boolean `eligible` is made **publicly decryptable**.
* Users can still decrypt their own **encrypted income** privately with an EIP‑712 signature.

This pattern generalizes to any **threshold-based eligibility** check (KYC tiers, benefit programs, scholarship cutoffs, etc.).

---

## 2. How the FHE model works

### 2.1 Encrypted state on-chain

All sensitive data lives as FHEVM encrypted types:

* `euint64 eMaxAnnualIncome` — **hidden policy**: the maximum income allowed to receive tax relief.
* Per user (`Application` struct):

  * `euint64 eAnnualIncome` — encrypted user income.
  * `ebool eEligible` — encrypted result of the comparison.
  * `bool decided` — plain boolean latch that an application exists.

### 2.2 Access-control rules

The contract uses Zama’s FHE helpers for access control:

* `FHE.fromExternal(...)` to ingest ciphertexts from the Relayer.
* `FHE.allowThis(...)` so the contract can reuse ciphertexts across calls.
* `FHE.allow(..., user)` so the user can later call `userDecrypt` on their own income.
* `FHE.makePubliclyDecryptable(eEligible)` so that **only the final decision flag** can be decrypted by anyone via `publicDecrypt`.

The encrypted income and policy **are never made publicly decryptable**.

### 2.3 Eligibility model ("how winnings are computed")

The protocol uses a very simple rule:

> A user is **eligible** for tax relief if their annual income is **less than or equal** to the encrypted policy threshold.

Formally, on-chain:

```solidity
// Hidden policy threshold, set by owner via setIncomePolicy()
euint64 private eMaxAnnualIncome;

// When user submits encrypted income:
//   eligible = (income <= maxIncome)

ebool okIncome = FHE.le(eAnnualIncome, eMaxAnnualIncome);
Application.eEligible = okIncome;
FHE.makePubliclyDecryptable(Application.eEligible);
```

**Important properties:**

* Neither the contract nor validators ever see the income value in the clear.
* Only the boolean `eligible` / `not eligible` is globally decryptable.
* The user can still privately decrypt their own `eAnnualIncome` with a signed `userDecrypt` flow (Relayer SDK + EIP‑712).

This is analogous to a game where **the score and the winning threshold stay secret**, but everybody can see who won.

---

## 3. User interface & usage guide

The dApp is a single-page frontend (vanilla HTML + JS + Ethers + Relayer SDK) with two main perspectives:

1. **Applicant** — submit encrypted income and see whether you are eligible.
2. **Admin (Tax authority)** — set the encrypted income policy threshold.

### 3.1 Top bar

* **Logo & title** — branding for the Income Tax Relief demo.
* **Network pill** — shows the connected chain ID (Sepolia testnet / `11155111`).
* **Contract pill** — short contract address (`0x2de5…2261`).
* **Connect wallet button** — connects / disconnects your EOA via MetaMask (or another injected provider). The app automatically ensures you are on **Sepolia**.

### 3.2 "Your application" (left column)

#### 3.2.1 Section 1 — Enter your income

* **Annual income input** — plain numeric field. The **unit is abstract** (USD / EUR / wei); only the integer matters to the contract.
* **Encrypt & submit button**:

  1. Creates an encrypted input buffer with `createEncryptedInput(CONTRACT_ADDRESS, userAddress)`.
  2. Calls `add64(income)` to encode the number as `euint64`.
  3. Sends ciphertext + proof to the contract via `submitIncome(handles[0], inputProof)`.

If the transaction confirms successfully, the UI displays `Income submitted ✓` and the application state is refreshed.

#### 3.2.2 Section 2 — Eligibility result

* Displays a **pill** with a colored dot and message:

  * Gray: `No decision yet` (no application on-chain).
  * Green: `Eligible for tax relief`.
  * Red: `Not eligible`.
* **Refresh decision** button:

  * Reads your `decision` handle from `getDecisionHandleOf(msg.sender)`.
  * Calls Relayer `publicDecrypt(handle)` and interprets the result (0/1) as `false/true`.

#### 3.2.3 Section 3 — Handles (for advanced users)

This section is designed for developers who want to work directly with handles and Relayer flows.

* **Decision handle (public)**

  * Shows the `bytes32` handle of `eEligible`.
  * Once the contract has stored a decision, this handle is marked as **public** and can be decrypted by anyone using `publicDecrypt`.
  * The **Copy** button copies the handle to clipboard.

* **Income handle (private)**

  * Shows the `bytes32` handle of your encrypted income `eAnnualIncome`.
  * This handle is **not publicly decryptable** — only the user who submitted it can use `userDecrypt` with an EIP‑712 signature.
  * The **Decrypt with signature** button triggers:

    * Local keypair generation via `generateKeypair()` (Relayer SDK).
    * An EIP‑712 `UserDecryptRequestVerification` signing flow.
    * A `userDecrypt()` call to retrieve the clear income value just for the connected user.

> **Note:** Signed decrypt is only enabled on HTTPS (or localhost over HTTPS). On plain HTTP the button is disabled for safety.

### 3.3 "Technical panel" (right column)

#### Contract info

* **Address** — full contract address on Sepolia: `0x2de52D78041736bFA3E3f4fb589C2c0A6C7b2261`.
* **Owner** — current owner of the contract; the only account allowed to set the income policy.
* **You** — the connected wallet address (short form).

#### Application state

* **Application** — shows `decision stored` or `not submitted`.
* **Last decision** — textual version of the last decrypted eligibility (`eligible` / `not eligible` / `—`).
* **Relayer SDK** — health indicator (`ready (Sepolia)` or `not initialized`).

#### Admin • income policy

This block is only meaningful for the **contract owner**, but it is visible to everyone.

* **Max annual income** — numeric input, same abstract unit as the user income.
* **Encrypt & set policy button**:

  1. Uses Relayer `createEncryptedInput` to encode the max income as `euint64`.
  2. Calls `setIncomePolicy(handles[0], inputProof)` on the contract.
  3. Contract stores the ciphertext in `eMaxAnnualIncome` and marks `policyInitialized = true`.
* **Policy status** — human-readable status / tx hash.
* Global pill **"Policy: configured"** / **"Policy: not set"** at the top of the page reflects the boolean `policyInitialized`.

#### Quick actions

* **Reload my state** — re-reads handles and decisions from the contract. Useful after switching accounts or networks.

### 3.4 Event log

At the bottom of the page, the `EVENT LOG` console prints:

* SDK loading info.
* Encrypted handles (as arrays / hex).
* Transaction hashes and confirmation events.
* Decrypt results and any caught errors.

This makes it easier to debug Relayer interactions and follow the full FHE data flow end-to-end.

---

## 4. Protocol / computation model in detail

### 4.1 Policy setup (admin flow)

1. Owner connects wallet and ensures they are on Sepolia.
2. In the **Admin** panel, owner chooses `Max annual income` (e.g. `6000`).
3. Frontend:

   * Creates encrypted input buffer.
   * Calls `add64(maxIncome)`.
   * Sends transaction `setIncomePolicy(handle, proof)`.
4. Contract:

   * Ingests ciphertext with `FHE.fromExternal`.
   * Stores it in `eMaxAnnualIncome`.
   * Calls `FHE.allowThis(eMaxAnnualIncome)` so it can reuse the ciphertext later.
   * Sets `policyInitialized = true`.

No one can decrypt this threshold; even block explorers only see the handle.

### 4.2 Application submission (user flow)

1. User enters a number in the **Annual income** field.
2. Frontend uses the Relayer SDK to create and encrypt a single `euint64` input.
3. Transaction `submitIncome(encIncomeHandle, proof)` is sent.
4. Contract:

   * Uses `FHE.fromExternal` to import the income ciphertext.
   * Calls `FHE.allowThis(eAnnualIncome)` and `FHE.allow(eAnnualIncome, user)`.
   * Computes `eEligible = FHE.le(eAnnualIncome, eMaxAnnualIncome)`.
   * Stores `eAnnualIncome`, `eEligible`, and `decided = true`.
   * Calls `FHE.makePubliclyDecryptable(eEligible)`.

### 4.3 Reading decisions

* Anyone can call `getDecisionHandleOf(address)` and pass the returned handle into `publicDecrypt`.
* The frontend automatically does this on **Refresh decision**.
* The decrypted value is interpreted as:

  * `0` → not eligible.
  * `1` → eligible.

### 4.4 Reading your own income

* Only the user who originally submitted the income has `FHE.allow` on that ciphertext.
* The frontend calls `getMyHandles()` to get the income handle, then runs the **signed `userDecrypt` flow** with a short‑lived permission signature.

---

## 5. Project structure

A minimal repo layout for this project:

```text
income-tax-relief-fhe/
├── contracts/
│   └── IncomeTaxReliefFHE.sol   # Main fhEVM smart contract
├── frontend/
│   └── index.html               # Single-page UI (HTML + JS + CSS inline)
├── README.md                    # You are here
└── package.json (optional)      # For running a local dev server, tooling, etc.
```

**Smart contracts**

* `contracts/IncomeTaxReliefFHE.sol`

  * Imports Zama’s official Solidity library:

    * `import { FHE, ebool, euint64, externalEuint64 } from "@fhevm/solidity/lib/FHE.sol";`
  * Inherits `ZamaEthereumConfig` for fhEVM.
  * Exposes:

    * `setIncomePolicy(externalEuint64 _maxAnnualIncome, bytes proof)` — owner-only policy setter.
    * `submitIncome(externalEuint64 encAnnualIncome, bytes proof)` — main application entrypoint.
    * View helpers: `getMyHandles`, `getDecisionHandleOf`, `getIncomeHandleOf` (return **handles only**, no FHE ops in views).

**Frontend**

* `frontend/index.html`

  * Pure HTML/CSS/JS, no build step required.
  * Uses `ethers@6` for blockchain I/O.
  * Loads Relayer SDK via CDN and uses:

    * `createInstance` with `SepoliaConfig`.
    * `createEncryptedInput` for `euint64` income / policy values.
    * `publicDecrypt` for eligibility flags.
    * `userDecrypt` + EIP‑712 for private income reveal.

You can adapt the directory names (`/frontend`, `/web`, etc.) as long as the references in the README stay consistent.

---

## 6. Running the project locally

### 6.1 Prerequisites

* Node.js (recommended ≥ 18).
* A browser wallet (MetaMask) with **Sepolia** configured.
* A small amount of Sepolia ETH for gas.
* Access to Zama’s Relayer service (default public endpoint or your own instance).

### 6.2 Steps

1. **Clone the repo**

   ```bash
   git clone https://github.com/<your-username>/income-tax-relief-fhe.git
   cd income-tax-relief-fhe
   ```

2. **Serve the frontend** (any static server works):

   ```bash
   npx serve frontend
   # or
   npx http-server frontend
   ```

3. **Open the app** in your browser:

   ```text
   http://localhost:3000   # or the port your static server uses
   ```

4. **Connect wallet**

   * Click **Connect wallet** in the top bar.
   * Approve the connection in MetaMask.
   * The app will auto‑switch to **Sepolia** if needed.

5. **As owner** (first-time setup)

   * Go to **Admin • income policy**.
   * Choose `Max annual income` (e.g. 6000).
   * Click **Encrypt & set policy** and confirm the tx.

6. **As user**

   * Enter your annual income.
   * Click **Encrypt & submit**.
   * Once the tx confirms, click **Refresh decision** to decrypt the public eligibility flag.
   * Optionally click **Decrypt with signature** to privately decrypt your own income from the chain.

---

## 7. Technology stack

* **Blockchain / Crypto**

  * Zama **FHEVM** (fhEVM Solidity library + ZamaEthereumConfig).
  * Zama **Relayer SDK** for encryption, proofs, and decrypt flows.
  * Ethereum Sepolia testnet.

* **Smart contracts**

  * Solidity `^0.8.24`.
  * FHE types: `ebool`, `euint64`, `externalEuint64`.

* **Frontend**

  * Vanilla HTML + CSS (single-page layout).
  * `ethers.js@6` for contract calls.
  * Relayer SDK (ES module via CDN).

This lightweight stack keeps the focus on the **FHE data flow**, making the project easy to fork, modify and use as a reference for other threshold‑based eligibility systems.

---

## 8. Security & limitations

> ⚠️ **This is a hackathon / demo project. Do not use it in production without a full audit.**

* No guarantee of economic or game‑theoretic security.
* No rate‑limiting or Sybil resistance — a user can submit multiple times.
* The income threshold policy is controlled by a single owner.
* Privacy guarantees rely on the correctness of Zama’s FHEVM and Relayer services.

That said, the project illustrates a powerful pattern:

> **“Prove you are under (or over) a threshold, without ever revealing your underlying value.”**

You can reuse this pattern for:

* KYC / AML tiers.
* Scholarship / grant eligibility.
* Income‑gated DeFi products.
* Private scorecards or credit‑like systems.

---

## 9. Credits

* Built with ❤️ on top of **Zama FHEVM** and the **Zama Relayer SDK**.
* Inspired by previous Zama developer program winners like **PayProof**, **OBOL**, **FHERatings**, **FHE GeoGuessr**, **Zolymarket**, and **FHEdback**, which showcase different real‑world privacy applications for FHE.
