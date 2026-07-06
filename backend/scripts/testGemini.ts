import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";
import path from "path";

// Load .env explicitly
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function runTest() {
  console.log("=== 1. VERIFY API KEY ===");
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ GEMINI_API_KEY is missing from environment");
    return;
  }
  
  console.log(`✅ Loaded API Key: ${apiKey.substring(0, 10)}... (Length: ${apiKey.length})`);
  console.log(`Checking if old or cached: It matches the .env file if it starts with AQ.Ab8`);

  console.log("\n=== 2. VERIFY GEMINI SDK ===");
  console.log("Initializing GoogleGenAI SDK...");
  const ai = new GoogleGenAI({ apiKey });
  console.log("✅ SDK Initialized.");

  console.log("\n=== 3. ISOLATED TEST (gemini-2.0-flash) ===");
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: "Say Hello",
    });
    console.log("✅ SUCCESS. Response:");
    console.log(response.text);
  } catch (err: any) {
    console.log("❌ ERROR in isolated test.");
    logCompleteError(err);
  }

  console.log("\n=== 6. VERIFY MODEL ACCESS ===");
  const modelsToTest = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
  ];

  for (const modelName of modelsToTest) {
    try {
      console.log(`\nTesting ${modelName}...`);
      const response = await ai.models.generateContent({
        model: modelName,
        contents: "Say Hello",
      });
      console.log(`✅ ${modelName} worked! Response: ${response.text}`);
    } catch (err: any) {
      console.log(`❌ ${modelName} failed.`);
      logCompleteError(err);
    }
  }

  console.log("\n=== END OF TEST ===");
}

function logCompleteError(err: any) {
  console.log("--- Error Details ---");
  console.log(`Message: ${err.message}`);
  console.log(`Status: ${err.status}`);
  console.log(`Name: ${err.name}`);
  
  if (err.response) {
    console.log(`Response Status: ${err.response.status}`);
    console.log(`Response Headers:`, err.response.headers);
  }
  
  console.log("Raw Error JSON:", JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
}

runTest();
