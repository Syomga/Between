import "dotenv/config";
import { translateWithCulture } from "../src/services/aiService";

async function runCase(label: string, text: string, from: string, to: string) {
  const result = await translateWithCulture(text, from, to);
  console.log(`\n=== ${label} ===`);
  console.log(JSON.stringify(result, null, 2));
}

async function main() {
  console.log("ANYMODEL_API_KEY configured:", Boolean(process.env.ANYMODEL_API_KEY));
  await runCase("RU -> EN", "Привет, как дела?", "Russian", "English");
  await runCase("Idiom RU receiver", "бить баклуши", "Chinese", "Russian");
  await runCase("CN -> RU", "嗨，你怎么样", "Russian", "Chinese");
}

main().catch(console.error);
