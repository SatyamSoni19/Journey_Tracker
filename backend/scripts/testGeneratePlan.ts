import { generateTripPlan } from "../src/services/aiPlanner.service.js";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function run() {
  console.log("Testing generateTripPlan...");
  try {
    const plan = await generateTripPlan({
      prompt: "I want to plan a 4-day trip to Jaipur with a budget of 20000 INR."
    });
    console.log("SUCCESS");
  } catch (err: any) {
    console.error("FAILED");
    console.error(err);
  }
}

run();
