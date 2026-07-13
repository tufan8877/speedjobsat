import { asc, eq, like } from "drizzle-orm";
import { db, pool } from "../server/db";
import { profiles, users, serviceCategories } from "../shared/schema";

const SEED_PREFIX = "starter-profile-";

const desiredCounts: Record<(typeof serviceCategories)[number], number> = {
  Installateur: 22,
  Elektriker: 12,
  Reinigung: 7,
  Umzug: 5,
  Transport: 6,
  Gartenpflege: 6,
  Haushaltshilfe: 5,
  Pflege: 4,
  Kinderbetreuung: 4,
  Seniorenbetreuung: 4,
  Nachhilfe: 4,
  "Computer & IT": 5,
  Handwerker: 3,
  Maler: 3,
  Dachdecker: 2,
  Automechaniker: 3,
  Schlosser: 2,
  Masseur: 2,
  Gastronomie: 2,
  "Koch- & Küchenhilfe": 2,
  "Service & Kellnerarbeiten": 2,
  Bauarbeiten: 2,
  Fliesenlegerarbeiten: 1,
  Bodenlegerarbeiten: 1,
  Montagearbeiten: 1,
  Reparaturarbeiten: 1,
  "Sonstige Dienstleistungen": 1,
};

function buildServicePool() {
  const pool: string[] = [];
  for (const service of serviceCategories) {
    for (let i = 0; i < desiredCounts[service]; i += 1) {
      pool.push(service);
    }
  }
  if (pool.length !== 112) {
    throw new Error(`Dienstleistungsverteilung ergibt ${pool.length} statt 112 Profile.`);
  }
  return pool;
}

async function main() {
  const starterUsers = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(like(users.email, `${SEED_PREFIX}%@seed.speedjob.at`))
    .orderBy(asc(users.email));

  if (starterUsers.length !== 112) {
    throw new Error(`Es wurden ${starterUsers.length} statt 112 Starter-Nutzer gefunden.`);
  }

  const servicePool = buildServicePool();

  for (let index = 0; index < starterUsers.length; index += 1) {
    await db
      .update(profiles)
      .set({ services: [servicePool[index]], updatedAt: new Date() })
      .where(eq(profiles.userId, starterUsers[index].id));
  }

  console.log("Dienstleistungen der 112 Starterprofile wurden korrekt verteilt.");
}

main()
  .catch((error) => {
    console.error("Neuverteilung fehlgeschlagen:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
