// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * IncomeTaxReliefFHE
 *
 * Hidden income check for a tax benefit:
 * - Owner sets an encrypted income policy (e.g. max annual income for a tax relief).
 * - User submits their encrypted annual income.
 * - Contract evaluates the policy over encrypted values and produces a single
 *   encrypted boolean flag `eligible`.
 * - Only the `eligible` flag is made publicly decryptable; the raw income stays private
 *   (user can decrypt it via userDecrypt flow).
 *
 * Design constraints:
 * - No FHE operations inside view / pure functions (views only expose handles).
 * - Use FHE.fromExternal / FHE.allowThis / FHE.allow / FHE.makePubliclyDecryptable.
 * - Encrypted policy values themselves are NOT publicly decryptable.
 */

import {
  FHE,
  ebool,
  euint64,
  externalEuint64
} from "@fhevm/solidity/lib/FHE.sol";

import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract IncomeTaxReliefFHE is ZamaEthereumConfig {
  // ---------- Ownership ----------
  address public owner;

  modifier onlyOwner() {
    require(msg.sender == owner, "Not owner");
    _;
  }

  constructor() {
    owner = msg.sender;
  }

  function transferOwnership(address newOwner) external onlyOwner {
    require(newOwner != address(0), "zero owner");
    owner = newOwner;
  }

  // ---------- Simple reentrancy guard (for future payable flows) ----------
  uint256 private _locked = 1;

  modifier nonReentrant() {
    require(_locked == 1, "reentrancy");
    _locked = 2;
    _;
    _locked = 1;
  }

  // ---------- Encrypted income policy ----------
  //
  // Example interpretation (up to frontend/backend):
  //   - eMaxAnnualIncome: maximum annual income allowed to claim the tax relief.
  //
  // All thresholds are encrypted and never publicly decrypted.

  euint64 private eMaxAnnualIncome;
  bool public policyInitialized;

  event IncomePolicyUpdated(bytes32 maxIncomeHandle);

  /**
   * Owner sets the encrypted income policy.
   *
   * `_maxAnnualIncome` should be an external encrypted value produced off-chain
   * via the Relayer SDK and bound to this contract.
   *
   * `proof` is the attestation bundle (coprocessor signatures) for this batch
   * of external values.
   */
  function setIncomePolicy(
    externalEuint64 _maxAnnualIncome,
    bytes calldata proof
  ) external onlyOwner {
    // Ingest encrypted policy value from external handle
    eMaxAnnualIncome = FHE.fromExternal(_maxAnnualIncome, proof);

    // Allow this contract to keep using the stored ciphertext in future txs
    FHE.allowThis(eMaxAnnualIncome);

    policyInitialized = true;

    emit IncomePolicyUpdated(FHE.toBytes32(eMaxAnnualIncome));
  }

  // ---------- Applications (user incomes) ----------

  struct IncomeApplication {
    address user;

    // Encrypted user income (kept private; user can decrypt themselves)
    euint64 eAnnualIncome;

    // Encrypted decision flag: true if user qualifies for the tax relief
    ebool eEligible;

    // Plain latch to avoid reading uninitialized application
    bool decided;
  }

  mapping(address => IncomeApplication) private apps;

  event IncomeSubmitted(
    address indexed user,
    bytes32 incomeHandle,
    bytes32 decisionHandle
  );

  /**
   * User submits their encrypted income.
   *
   * Off-chain (frontend + relayer) flow:
   *  - Use Relayer SDK to:
   *      - encrypt annual income as euint64
   *      - obtain an externalEuint64 handle and proof bundle
   *  - Call `submitIncome(encIncome, proof)` with those values.
   *
   * On-chain:
   *  - Contract converts external handle -> internal encrypted value with FHE.fromExternal.
   *  - Contract evaluates eligibility against encrypted policy.
   *  - Only the final `eEligible` flag is made publicly decryptable.
   */
  function submitIncome(
    externalEuint64 encAnnualIncome,
    bytes calldata proof
  ) external nonReentrant {
    require(policyInitialized, "Policy not set");

    IncomeApplication storage A = apps[msg.sender];

    // 1. Ingest encrypted income from external handle
    euint64 eIncome = FHE.fromExternal(encAnnualIncome, proof);

    // 2. Grant access rights:
    //    - Contract uses it for comparisons and future reads.
    //    - User can later call userDecrypt via Relayer SDK to see their raw income.
    FHE.allowThis(eIncome);
    FHE.allow(eIncome, msg.sender);

    // 3. Evaluate hidden policy:
    //
    //    Example rule:
    //      eligible  := (income <= maxAnnualIncome)
    //
    //    All comparisons are done over encrypted values; no plaintext income
    //    or thresholds ever appear on-chain.
    ebool withinLimit = FHE.le(eIncome, eMaxAnnualIncome);

    // 4. Persist encrypted values in the application struct
    A.user          = msg.sender;
    A.eAnnualIncome = eIncome;
    A.eEligible     = withinLimit;
    A.decided       = true;

    // 5. Allow contract to keep using the stored ciphertexts
    FHE.allowThis(A.eAnnualIncome);
    FHE.allowThis(A.eEligible);

    // 6. Make ONLY the decision flag publicly decryptable.
    //    Frontend can use publicDecrypt via Relayer SDK to reveal the decision.
    FHE.makePubliclyDecryptable(A.eEligible);

    emit IncomeSubmitted(
      msg.sender,
      FHE.toBytes32(A.eAnnualIncome),
      FHE.toBytes32(A.eEligible)
    );
  }

  // ---------- Read-only getters (handles only, no FHE ops) ----------

  /**
   * Returns:
   *  - handle to the user's encrypted income (for userDecrypt)
   *  - handle to the publicly decryptable decision flag
   *  - decided latch to know if we actually processed this user
   */
  function getMyHandles()
    external
    view
    returns (bytes32 incomeHandle, bytes32 decisionHandle, bool decided)
  {
    IncomeApplication storage A = apps[msg.sender];
    return (
      FHE.toBytes32(A.eAnnualIncome),
      FHE.toBytes32(A.eEligible),
      A.decided
    );
  }

  /**
   * Public lookup for someone else's decision handle.
   * The handle points to a publicly decryptable boolean:
   *   - true  => income eligible for tax relief
   *   - false => not eligible (or not meeting policy conditions)
   *
   * Raw income remains private and is only decryptable by the user.
   */
  function getDecisionHandleOf(address who)
    external
    view
    returns (bytes32 decisionHandle, bool decided)
  {
    IncomeApplication storage A = apps[who];
    return (FHE.toBytes32(A.eEligible), A.decided);
  }

  /**
   * Optional: public handle to someone else's income (still private).
   * Only the address that has been granted access (the user) can actually
   * decrypt it via userDecrypt + EIP-712 flow on the Gateway.
   */
  function getIncomeHandleOf(address who)
    external
    view
    returns (bytes32 incomeHandle, bool decided)
  {
    IncomeApplication storage A = apps[who];
    return (FHE.toBytes32(A.eAnnualIncome), A.decided);
  }
}
