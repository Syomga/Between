import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, username: true, nativeLang: true, country: true },
  });
  console.log("Users:", JSON.stringify(users, null, 2));

  const messages = await prisma.message.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      originalText: true,
      translatedText: true,
      sourceLang: true,
      targetLang: true,
      senderId: true,
      culturalHighlights: true,
    },
  });

  for (const message of messages) {
    console.log("---");
    console.log(JSON.stringify(message, null, 2));
    console.log(
      "same?",
      message.translatedText === message.originalText,
      "translated null?",
      message.translatedText == null,
    );
  }
}

main().finally(async () => {
  await prisma.$disconnect();
});
