import { prisma } from "../lib/prisma";
import { parsePreferredCountries } from "./preferences";

function pickRandom<T>(items: T[]): T | null {
  if (items.length === 0) {
    return null;
  }
  return items[Math.floor(Math.random() * items.length)] ?? null;
}

export async function findRandomMatchCandidate(
  userId: string,
  me: { nativeLang: string; preferredCountries: unknown },
) {
  const preferredCountries = parsePreferredCountries(me.preferredCountries);
  const notSelf = { id: { not: userId } };

  const tiers: Array<Record<string, unknown>> = [
    {
      ...notSelf,
      nativeLang: { not: me.nativeLang },
      ...(preferredCountries ? { country: { in: preferredCountries } } : {}),
    },
    {
      ...notSelf,
      nativeLang: { not: me.nativeLang },
    },
    notSelf,
  ];

  for (const where of tiers) {
    const candidates = await prisma.user.findMany({ where });
    const picked = pickRandom(candidates);
    if (picked) {
      return picked;
    }
  }

  return null;
}
