// Fails loudly when the chatbot has no API key, instead of letting a
// deployment ship a bot that silently answers from the offline knowledge base.
//
//   node scripts/check-chat-env.mjs
//
// Exits 0 when GEMINI_API_KEY is present, 1 when it is not. Deliberately does
// not print the key, or any part of it.

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const envPath = path.join(root, ".env");

function readLocalEnv() {
  if (!fs.existsSync(envPath)) return null;
  const match = fs.readFileSync(envPath, "utf8").match(/^\s*GEMINI_API_KEY\s*=\s*(.*)$/m);
  return match ? match[1].trim().replace(/^["']|["']$/g, "") : "";
}

const local = readLocalEnv();
const fromShell = process.env.GEMINI_API_KEY;

console.log("Vegapunk environment check");
console.log("-----------------------------");

if (fromShell) {
  console.log(`  GEMINI_API_KEY   : set in this shell (${fromShell.length} chars)`);
  console.log("\nOK - a key is available to `next build` / `next start`.");
  process.exit(0);
}

if (local) {
  console.log(`  .env            : GEMINI_API_KEY present (${local.length} chars)`);
  console.log("\nOK for local development.");
  console.log("A hosted deployment still needs its own copy. Git does not carry");
  console.log(".env, so add the key on the host:");
  console.log("\n  Vercel  ->  Project > Settings > Environment Variables");
  console.log("             name: GEMINI_API_KEY   value: <the key from .env>");
  console.log("             enable it for Production, then redeploy.");
  console.log("\n  Netlify ->  Site settings > Environment variables");
  console.log("\nVerify afterwards by opening <your-domain>/api/chat and confirming");
  console.log('"aiEnabled":true.');
  process.exit(0);
}

console.log("  GEMINI_API_KEY  : NOT SET");
console.log("\nFAIL - Vegapunk will run in offline mode (portfolio answers only).");
console.log("\nAdd a free key to .env: https://aistudio.google.com/apikey");
console.log("\nUse the plain name GEMINI_API_KEY. A VITE_ prefixed variable is");
console.log("inlined into the client bundle and readable by every visitor.");
process.exit(1);
