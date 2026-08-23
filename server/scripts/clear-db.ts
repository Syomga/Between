import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const messages = await prisma.message.deleteMany();
  const participants = await prisma.dialogueParticipant.deleteMany();
  const dialogues = await prisma.dialogue.deleteMany();
  const users = await prisma.user.deleteMany();

  console.log(
    JSON.stringify({
      messages: messages.count,
      participants: participants.count,
      dialogues: dialogues.count,
      users: users.count,
    }),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
