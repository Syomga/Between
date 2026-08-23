import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { enrichMessageForViewer } from "../src/services/messageTranslation";

const prisma = new PrismaClient();

async function main() {
  const viewer = await prisma.user.findFirst({ where: { nativeLang: "Chinese" } });
  const message = await prisma.message.findFirst({
    where: { originalText: "привет" },
    orderBy: { createdAt: "desc" },
  });

  if (!viewer || !message) {
    console.log("Missing test data");
    return;
  }

  console.log("Before:", message.originalText, "->", message.translatedText);
  const enriched = await enrichMessageForViewer(message, viewer);
  console.log("After:", enriched.originalText, "->", enriched.translatedText);
}

main().finally(async () => {
  await prisma.$disconnect();
});
