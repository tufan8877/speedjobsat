import { randomBytes, scrypt } from "crypto";
import { promisify } from "util";
import { eq } from "drizzle-orm";
import { db, pool } from "../server/db";
import { profiles, users, serviceCategories, availabilityPeriods } from "../shared/schema";

const scryptAsync = promisify(scrypt);
const CONTACT_EMAIL = "kontakt@speedjob.at";
const SEED_PREFIX = "starter-profile-";

const locationsByState: Record<string, string[]> = {
  Wien: ["Wien 1", "Wien 2", "Wien 3", "Wien 4", "Wien 5", "Wien 6", "Wien 7", "Wien 8", "Wien 9", "Wien 10", "Wien 11", "Wien 12", "Wien 13", "Wien 14", "Wien 15", "Wien 16", "Wien 17", "Wien 18", "Wien 19", "Wien 20", "Wien 21", "Wien 22", "Wien 23"],
  Niederösterreich: ["St. Pölten", "Wiener Neustadt", "Baden", "Mödling", "Krems", "Klosterneuburg", "Tulln", "Korneuburg", "Stockerau", "Schwechat", "Gänserndorf", "Neunkirchen", "Amstetten", "Melk", "Hollabrunn"],
  Oberösterreich: ["Linz", "Wels", "Steyr", "Leonding", "Traun", "Braunau", "Vöcklabruck", "Gmunden", "Ried im Innkreis", "Freistadt", "Perg", "Enns"],
  Steiermark: ["Graz", "Leoben", "Kapfenberg", "Bruck an der Mur", "Weiz", "Hartberg", "Feldbach", "Voitsberg", "Deutschlandsberg", "Murtal"],
  Salzburg: ["Salzburg Stadt", "Hallein", "Seekirchen", "Saalfelden", "Zell am See", "Bischofshofen", "St. Johann im Pongau", "Oberndorf"],
  Tirol: ["Innsbruck", "Kufstein", "Wörgl", "Hall in Tirol", "Schwaz", "Telfs", "Imst"],
  Kärnten: ["Klagenfurt", "Villach", "Wolfsberg", "Spittal an der Drau", "Feldkirchen", "St. Veit an der Glan"],
  Vorarlberg: ["Bregenz", "Dornbirn", "Feldkirch", "Hohenems", "Bludenz"],
  Burgenland: ["Eisenstadt", "Neusiedl am See", "Mattersburg", "Oberwart"],
};

const stateCounts: Record<string, number> = {
  Wien: 33,
  Niederösterreich: 15,
  Oberösterreich: 12,
  Steiermark: 10,
  Salzburg: 8,
  Tirol: 7,
  Kärnten: 6,
  Vorarlberg: 5,
  Burgenland: 4,
};

const titleByService: Record<string, string> = {
  Installateur: "Installateurservice",
  Elektriker: "Elektroservice",
  Reinigung: "Reinigungsservice",
  Umzug: "Umzugshilfe",
  Transport: "Transportservice",
  Gartenpflege: "Gartenservice",
  Haushaltshilfe: "Haushaltshilfe",
  Pflege: "Pflegeunterstützung",
  Kinderbetreuung: "Kinderbetreuung",
  Seniorenbetreuung: "Seniorenbegleitung",
  Nachhilfe: "Nachhilfeangebot",
  "Computer & IT": "IT-Service",
  Handwerker: "Handwerksservice",
  Maler: "Malerarbeiten",
  Dachdecker: "Dachservice",
  Automechaniker: "KFZ-Service",
  Schlosser: "Schlosserarbeiten",
  Masseur: "Massageangebot",
  Gastronomie: "Gastrohilfe",
  "Koch- & Küchenhilfe": "Küchenhilfe",
  "Service & Kellnerarbeiten": "Servicehilfe",
  Bauarbeiten: "Bauhilfe",
  Fliesenlegerarbeiten: "Fliesenarbeiten",
  Bodenlegerarbeiten: "Bodenarbeiten",
  Montagearbeiten: "Montageservice",
  Reparaturarbeiten: "Reparaturservice",
  "Sonstige Dienstleistungen": "Allround-Service",
};

const descriptionOpeners = [
  "Zuverlässige Unterstützung für private Haushalte und kleinere Betriebe.",
  "Flexible Hilfe für planbare Aufträge und kurzfristige Einsätze.",
  "Saubere, sorgfältige und lösungsorientierte Arbeitsweise.",
  "Praktische Unterstützung mit Schwerpunkt auf verlässlicher Terminabstimmung.",
  "Regional verfügbares Angebot für unterschiedliche Aufgaben im Alltag und Betrieb.",
];

const descriptionDetails = [
  "Anfragen werden rasch beantwortet und der Umfang wird vorab klar besprochen.",
  "Termine sind je nach Auslastung vormittags, nachmittags oder am Wochenende möglich.",
  "Der Einsatzbereich umfasst die angegebene Region und nahe gelegene Orte.",
  "Geeignet für einzelne Arbeiten, laufende Unterstützung und wiederkehrende Termine.",
  "Besonderer Wert wird auf Pünktlichkeit, Übersicht und eine verständliche Abstimmung gelegt.",
];

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

function buildEntries() {
  const entries: Array<{
    internalEmail: string;
    firstName: string;
    lastName: string;
    description: string;
    services: string[];
    regions: string[];
    availablePeriods: string[];
    isAvailable: boolean;
  }> = [];

  let index = 0;
  for (const [state, count] of Object.entries(stateCounts)) {
    const places = locationsByState[state];
    for (let i = 0; i < count; i += 1) {
      const service = serviceCategories[index % serviceCategories.length];
      const secondService = serviceCategories[(index + 7) % serviceCategories.length];
      const place = places[i % places.length];
      const periods = [
        availabilityPeriods[index % availabilityPeriods.length],
        availabilityPeriods[(index + 2) % availabilityPeriods.length],
      ];

      entries.push({
        internalEmail: `${SEED_PREFIX}${String(index + 1).padStart(3, "0")}@seed.speedjob.at`,
        firstName: titleByService[service] || "Dienstleistungsangebot",
        lastName: place,
        description: `${descriptionOpeners[index % descriptionOpeners.length]} ${descriptionDetails[(index + i) % descriptionDetails.length]} Schwerpunkt: ${titleByService[service] || service} in ${place}.`,
        services: index % 4 === 0 ? [service, secondService] : [service],
        regions: [state, place],
        availablePeriods: Array.from(new Set(periods)),
        isAvailable: index % 9 !== 0,
      });
      index += 1;
    }
  }

  return entries;
}

async function main() {
  const entries = buildEntries();
  if (entries.length !== 100) throw new Error(`Es wurden ${entries.length} statt 100 Einträge erzeugt.`);

  const passwordHash = await hashPassword(randomBytes(32).toString("hex"));
  let created = 0;
  let skipped = 0;

  for (const entry of entries) {
    const existingUsers = await db.select().from(users).where(eq(users.email, entry.internalEmail)).limit(1);
    let user = existingUsers[0];

    if (!user) {
      const inserted = await db.insert(users).values({
        email: entry.internalEmail,
        password: passwordHash,
        status: "active",
        isAdmin: false,
      }).returning();
      user = inserted[0];
    }

    const existingProfiles = await db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1);
    if (existingProfiles.length > 0) {
      skipped += 1;
      continue;
    }

    await db.insert(profiles).values({
      userId: user.id,
      firstName: entry.firstName,
      lastName: entry.lastName,
      description: entry.description,
      services: entry.services,
      customServices: null,
      regions: entry.regions,
      phoneNumber: null,
      email: CONTACT_EMAIL,
      socialMedia: null,
      availablePeriods: entry.availablePeriods,
      isAvailable: entry.isAvailable,
      profileImage: null,
    });
    created += 1;
  }

  console.log(`Starter-Profile abgeschlossen: ${created} erstellt, ${skipped} bereits vorhanden.`);
}

main()
  .catch((error) => {
    console.error("Seed fehlgeschlagen:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
