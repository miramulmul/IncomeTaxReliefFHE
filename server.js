import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs"; // Import fs for file system operations
import { fileURLToPath } from "url";

// Define __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, ".env") });

// Read environment variables
const { PORT = "3001" } = process.env;

// Validate index.html path
const indexHtmlPath = path.join(__dirname, "frontend", "public", "index.html");
if (!fs.existsSync(indexHtmlPath)) {
  throw new Error(`index.html not found at ${indexHtmlPath}`);
}
console.log("[DEBUG] index.html found at:", indexHtmlPath);

const app = express();
app.use(cors());
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});

// Serve static files
app.use(express.static(path.join(__dirname, "frontend", "public")));

// Catch-all middleware to serve index.html
app.use((req, res) => {
  res.sendFile(indexHtmlPath);
});

app.listen(Number(PORT), () => console.log(`🚀 Server listening on http://localhost:${PORT}`));
