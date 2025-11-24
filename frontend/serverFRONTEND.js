const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const { JsonRpcProvider, Wallet, Contract } = require("ethers");
const { createInstance, SepoliaConfig } = require("@zama-fhe/relayer-sdk/node");
const adderAbi = require("./artifacts/contracts/EncryptedAdder.sol/EncryptedAdder.json");

dotenv.config({ path: path.resolve(__dirname, ".env") });

const {
  PRIVATE_KEY,
  SEPOLIA_RPC_URL,
  CONTRACT_ADDRESS = "0xc51cE2fCBD57b585CffdF35958402aab6e469e32",
  PORT = "3001",
} = process.env;

if (!PRIVATE_KEY?.startsWith("0x") || PRIVATE_KEY.length !== 66)
  throw new Error("PRIVATE_KEY must be 0x + 64-hex chars");
if (!SEPOLIA_RPC_URL) throw new Error("SEPOLIA_RPC_URL is missing");

const app = express();
app.use(cors());
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let relayer;
let adder;
let user;

let step = 0;
function log(msg) {
  console.log(`[${++step}] ${msg}`);
}

async function boot() {
  const publicKeyPath = path.resolve(__dirname, "./relayer-sdk-local/src/test/keys/publicKey.bin");
  const privateKeyPath = path.resolve(__dirname, "./relayer-sdk-local/src/test/keys/privateKey.bin");
  const publicKey = fs.readFileSync(publicKeyPath);
  const privateKey = fs.readFileSync(privateKeyPath);

  log("createInstance(SepoliaConfig + YOUR KEYS) …");
  relayer = await createInstance({
    ...SepoliaConfig,
    user: {
      publicKey: Buffer.from(publicKey).toString("hex"),
      privateKey: Buffer.from(privateKey).toString("hex"),
    },
  });
  log("Relayer ready ✅");

  const provider = new JsonRpcProvider(SEPOLIA_RPC_URL);
  const signer = new Wallet(PRIVATE_KEY, provider);
  user = await signer.getAddress();
  log(`Signer: ${user}`);

  adder = new Contract(CONTRACT_ADDRESS, adderAbi.abi, signer);
  log(`Contract: ${CONTRACT_ADDRESS}`);

  log("relayer.userDecrypt:", typeof relayer.userDecrypt);

  app.listen(Number(PORT), () => console.log(`🚀 backend listening http://localhost:${PORT}`));
}

app.post("/add", async (req, res) => {
  try {
    const { a, b } = req.body;
    if (typeof a !== "number" || typeof b !== "number" || a < 0 || a > 255 || b < 0 || b > 255) {
      return res.status(400).json({ error: "a and b must be numbers in 0..255" });
    }

    console.log("\n============================");
    step = 0;
    log(`input a=${a}, b=${b}`);

    const buf = relayer.createEncryptedInput(CONTRACT_ADDRESS, user);
    buf.add8(Number(a));
    buf.add8(Number(b));
    const { handles, inputProof } = await buf.encrypt();

    const hA = "0x" + Buffer.from(handles[0]).toString("hex");
    const hB = "0x" + Buffer.from(handles[1]).toString("hex");
    const proof = "0x" + Buffer.from(inputProof).toString("hex");

    log(`handleA: ${hA}`);
    log(`handleB: ${hB}`);
    log(`proof: ${proof.slice(0, 62)}…`);

    const tx = await adder.add(hA, hB, proof, { gasLimit: 3000000 });
    log(`txHash: ${tx.hash}`);
    await tx.wait();

    const encHex = await adder.getLastResult();
    log(`encSum (getLastResult): ${encHex}`);

    let decrypted = null;
    if (typeof relayer.userDecrypt === "function") {
      decrypted = await relayer.userDecrypt("euint8", encHex, CONTRACT_ADDRESS, user);
    }
    log(`decrypted: ${decrypted}`);

    log(`ФИНАЛ`);
    res.json({ txHash: tx.hash, encHex, decrypted });
  } catch (e) {
    console.error("[ADD] error:", e);
    res.status(500).json({ error: e.message ?? "internal error" });
  }
});

app.get("/getLastResult", async (req, res) => {
  try {
    console.log("\n============================");
    step = 0;
    log("Fetching last result...");

    const encHex = await adder.getLastResult();
    log(`encSum (getLastResult): ${encHex}`);

    let decrypted = null;
    if (typeof relayer.userDecrypt === "function") {
      decrypted = await relayer.userDecrypt("euint8", encHex, CONTRACT_ADDRESS, user);
    }
    log(`decrypted: ${decrypted}`);

    res.json({ decrypted });
  } catch (e) {
    console.error("[GETLASTRESULT] error:", e);
    res.status(500).json({ error: e.message ?? "internal error" });
  }
});

boot().catch((err) => {
  console.error("BOOT ERROR:", err);
  process.exit(1);
});
