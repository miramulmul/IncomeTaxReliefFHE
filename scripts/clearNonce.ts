import { ethers } from "hardhat";

async function main() {
  const [signer] = await ethers.getSigners();
  const nonceToClear = 263;

  console.log("🔍 Clearing nonce:", nonceToClear, "for address:", signer.address);

  const tx = await signer.sendTransaction({
    to: signer.address,
    value: 0,
    gasLimit: 21000,
    nonce: nonceToClear,
    maxFeePerGas: ethers.parseUnits("30", "gwei"),
    maxPriorityFeePerGas: ethers.parseUnits("2", "gwei"),
  });

  console.log("🧹 Sent replacement tx to clear pending nonce:");
  console.log("🆔 tx hash:", tx.hash);

  await tx.wait();
  console.log("✅ Replacement tx confirmed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
