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

const serviceDescriptions: Record<string, string[]> = {
  Installateur: [
    "Ich helfe bei kleineren Sanitärarbeiten, dem Tausch von Armaturen und Siphons sowie bei einfachen Reparaturen in Bad und Küche.",
    "Ich bringe Erfahrung im Sanitärbereich mit und unterstütze bei tropfenden Armaturen, Silikonfugen und überschaubaren Installationsarbeiten.",
    "Mein Schwerpunkt liegt auf kleineren Arbeiten rund um Wasseranschlüsse, Armaturen und Sanitärbereiche im Haushalt.",
  ],
  Elektriker: [
    "Ich unterstütze bei Lampenmontage, Schaltern, Steckdosen und kleineren Elektroarbeiten im Haushalt.",
    "Meine Schwerpunkte sind Leuchtenmontage, einfache Fehlersuche und überschaubare elektrische Arbeiten in Wohnung oder Haus.",
    "Ich helfe bei kleineren Elektroarbeiten und achte dabei besonders auf eine sichere und saubere Ausführung.",
  ],
  Reinigung: [
    "Ich biete gründliche Wohnungsreinigung, Fensterputzen und regelmäßige Unterstützung im Haushalt an.",
    "Ich übernehme einmalige oder wiederkehrende Reinigungsarbeiten in Wohnungen, Büros und Stiegenhäusern.",
    "Sauberkeit und Verlässlichkeit sind mir wichtig. Ich helfe bei Grundreinigung, Haushalt und Fensterpflege.",
  ],
  Umzug: [
    "Ich unterstütze bei Umzügen, beim Tragen von Möbeln sowie beim Ein- und Ausräumen.",
    "Bei kleineren und mittleren Übersiedlungen packe ich zuverlässig beim Tragen, Sortieren und Aufbauen mit an.",
    "Ich helfe bei Wohnungswechseln, Räumungen und beim Transportieren schwerer Gegenstände innerhalb des Hauses.",
  ],
  Transport: [
    "Ich übernehme kleinere Transporte, Abholungen und Zustellungen im regionalen Bereich.",
    "Ich biete flexible Transporthilfe für Möbel, Einkäufe und einzelne Gegenstände nach Vereinbarung.",
    "Bei privaten Transporten achte ich auf einen sorgfältigen Umgang und eine verlässliche Terminabsprache.",
  ],
  Gartenpflege: [
    "Ich helfe beim Rasenmähen, Heckenschneiden, Laubräumen und bei allgemeinen Gartenarbeiten.",
    "Ich unterstütze bei regelmäßiger Gartenpflege, saisonalen Arbeiten und einfachen Pflanzarbeiten.",
    "Mein Angebot umfasst laufende Pflege rund um Garten, Terrasse und Außenbereich.",
  ],
  Haushaltshilfe: [
    "Ich unterstütze im Alltag bei Einkäufen, Ordnung im Haushalt und kleinen Erledigungen.",
    "Als Haushaltshilfe übernehme ich unterschiedliche Aufgaben nach persönlicher Absprache.",
    "Ich helfe dort, wo im Alltag Unterstützung gebraucht wird, und richte mich möglichst flexibel nach den gewünschten Zeiten.",
  ],
  Pflege: [
    "Ich biete stundenweise Unterstützung im Alltag, Begleitung und Hilfe bei einfachen täglichen Aufgaben.",
    "Ich unterstütze Angehörige bei der täglichen Betreuung und lege Wert auf einen respektvollen Umgang.",
    "Ich helfe bei Alltagstätigkeiten und leiste Gesellschaft, jedoch ohne medizinische Behandlung oder Hauskrankenpflege.",
  ],
  Kinderbetreuung: [
    "Ich betreue Kinder stundenweise, spiele, lese vor und helfe bei kleinen Alltagsaufgaben.",
    "Ich biete zuverlässige Kinderbetreuung nach persönlichem Kennenlernen und genauer Absprache.",
    "Ich unterstütze Familien am Nachmittag oder Abend und gestalte die Betreuungszeit ruhig und abwechslungsreich.",
  ],
  Seniorenbetreuung: [
    "Ich begleite ältere Menschen bei Spaziergängen, Einkäufen und Terminen und leiste gerne Gesellschaft.",
    "Ich biete geduldige und verlässliche Unterstützung für Seniorinnen und Senioren im Alltag.",
    "Ich helfe bei kleinen Erledigungen und begleite Menschen, die sich Unterstützung und Gesellschaft wünschen.",
  ],
  Nachhilfe: [
    "Ich gebe verständliche Nachhilfe und erkläre den Stoff in ruhigem Tempo mit passenden Beispielen.",
    "Ich unterstütze bei Hausübungen, Prüfungsvorbereitung und beim Schließen von Wissenslücken.",
    "Mir ist wichtig, dass Lernende den Stoff wirklich verstehen und mehr Sicherheit gewinnen.",
  ],
  "Computer & IT": [
    "Ich helfe bei PC- und Handyproblemen, Geräteeinrichtung, Datensicherung und einfachen Softwarefragen.",
    "Ich unterstütze bei WLAN, Drucker, E-Mail, Smartphone und alltäglichen technischen Problemen.",
    "Technik erkläre ich verständlich und helfe bei Einrichtung, Fehlerbehebung und digitalem Alltag.",
  ],
  Handwerker: [
    "Ich übernehme kleinere handwerkliche Arbeiten, Reparaturen und praktische Aufgaben in Wohnung oder Haus.",
    "Mit eigenem Werkzeug helfe ich bei verschiedenen Arbeiten, die im Alltag liegen bleiben.",
    "Ich bin handwerklich vielseitig und bespreche vorab genau, was benötigt wird und machbar ist.",
  ],
  Maler: [
    "Ich unterstütze beim Ausmalen von Zimmern, bei Ausbesserungen und beim sauberen Abkleben.",
    "Ich biete Hilfe bei Malerarbeiten in Wohnungen und achte auf eine ordentliche Vorbereitung.",
    "Ob einzelne Wand oder ganzer Raum: Ich arbeite sauber und nach genauer Farbabstimmung.",
  ],
  Dachdecker: [
    "Ich unterstütze bei kleineren Arbeiten rund um Dach, Dachrinne und Sichtkontrolle, sofern der Einsatz sicher möglich ist.",
    "Meine Erfahrung liegt im handwerklichen Bereich rund ums Dach. Den Umfang kläre ich immer vorab.",
    "Ich helfe bei überschaubaren Dacharbeiten und kleineren Reparaturen nach vorheriger Besichtigung.",
  ],
  Automechaniker: [
    "Ich unterstütze bei einfachen Wartungsarbeiten, Reifenwechsel und kleineren Aufgaben rund ums Auto.",
    "Ich habe Erfahrung mit Fahrzeugen und helfe bei überschaubaren Arbeiten nach vorheriger Absprache.",
    "Von Reifen bis kleiner Servicearbeit schaue ich zuerst, was benötigt wird und realistisch machbar ist.",
  ],
  Schlosser: [
    "Ich übernehme kleinere Metallarbeiten, Reparaturen und Montagen nach vorheriger Besichtigung.",
    "Ich helfe bei einfachen Schlosserarbeiten, Anpassungen und kleineren Reparaturen an Metallteilen.",
    "Für Metallreparaturen und Montagen biete ich praktische Unterstützung mit sauberer Ausführung.",
  ],
  Masseur: [
    "Ich biete entspannende Massagen zur Lockerung und Erholung im privaten Rahmen an.",
    "Mein Schwerpunkt liegt auf wohltuender Entspannung und einem ruhigen, angenehmen Ablauf.",
    "Ich biete klassische Entspannungsmassagen nach Terminvereinbarung, jedoch keine medizinische Therapie.",
  ],
  Gastronomie: [
    "Ich unterstütze bei privaten Feiern, Veranstaltungen und kurzfristigen Einsätzen in der Gastronomie.",
    "Ich habe Erfahrung im Gastrobereich und helfe bei Vorbereitung, Ausgabe und allgemeinen Abläufen.",
    "Bei Feiern und Veranstaltungen packe ich zuverlässig mit an und behalte den Überblick.",
  ],
  "Koch- & Küchenhilfe": [
    "Ich helfe bei Vorbereitung, Kochen, Anrichten und Aufräumen für private Feiern oder kleinere Veranstaltungen.",
    "Ich unterstütze bei Küchenarbeiten, Buffets und der Vorbereitung von Speisen.",
    "Von Schneiden bis Abwasch packe ich in der Küche zuverlässig mit an.",
  ],
  "Service & Kellnerarbeiten": [
    "Ich biete Servicehilfe bei privaten Feiern, Geburtstagen und kleineren Veranstaltungen.",
    "Ich habe Erfahrung im Service, arbeite freundlich und behalte auch bei mehreren Gästen den Überblick.",
    "Ich unterstütze beim Servieren, Abräumen und bei der Betreuung von Gästen.",
  ],
  Bauarbeiten: [
    "Ich helfe bei einfachen Bau- und Renovierungsarbeiten, Abbruch, Tragen und Vorbereitung.",
    "Ich packe bei körperlichen Arbeiten zuverlässig mit an und halte mich an die vereinbarten Aufgaben.",
    "Für kleinere Baustellen und Renovierungen biete ich praktische Unterstützung.",
  ],
  Fliesenlegerarbeiten: [
    "Ich unterstütze bei kleineren Fliesenarbeiten, Ausbesserungen und Silikonfugen.",
    "Ich habe Erfahrung beim Verlegen und Reparieren von Fliesen und kläre Material und Umfang vorher ab.",
    "Kleinere Flächen und Reparaturstellen übernehme ich nach Besichtigung.",
  ],
  Bodenlegerarbeiten: [
    "Ich helfe beim Verlegen von Laminat, Vinyl und einfachen Bodenbelägen in kleineren Räumen.",
    "Ich unterstütze beim Bodentausch, bei Sockelleisten und bei der Vorbereitung des Untergrunds.",
    "Für überschaubare Bodenarbeiten biete ich sorgfältige Hilfe.",
  ],
  Montagearbeiten: [
    "Ich montiere Möbel, Regale, Lampen und kleinere Einrichtungsgegenstände.",
    "Mit eigenem Werkzeug helfe ich beim Aufbau von Möbeln und bei Montagen in der Wohnung.",
    "Ich übernehme saubere und stabile Montagen nach vorheriger Absprache.",
  ],
  Reparaturarbeiten: [
    "Ich helfe bei kleineren Reparaturen im Haushalt und finde praktische Lösungen für alltägliche Defekte.",
    "Ich übernehme überschaubare Reparaturen an Möbeln, Türen und Haushaltsgegenständen.",
    "Kleine Defekte schaue ich mir genau an und bespreche offen, ob sich eine Reparatur lohnt.",
  ],
  "Sonstige Dienstleistungen": [
    "Ich bin vielseitig einsetzbar und helfe bei unterschiedlichen praktischen Aufgaben nach genauer Absprache.",
    "Ich biete flexible Unterstützung für Erledigungen und kleinere Arbeiten.",
    "Mein Angebot richtet sich nach dem konkreten Bedarf. Am besten kurz beschreiben, worum es geht.",
  ],
};

const intros = [
  "Ich bin zuverlässig, pünktlich und arbeite gerne selbstständig.",
  "Mir ist wichtig, dass Absprachen eingehalten werden und das Ergebnis ordentlich ist.",
  "Ich biete meine Unterstützung nebenberuflich und mit viel praktischem Einsatz an.",
  "Ich arbeite ruhig, sorgfältig und erkläre vorab transparent, was möglich ist.",
  "Bei mir stehen ein freundlicher Umgang und eine saubere Ausführung im Vordergrund.",
];

const endings = [
  "Termine sind nach Absprache am Abend oder am Wochenende möglich.",
  "Unter der Woche bin ich meist am späten Nachmittag verfügbar.",
  "Kurzfristige Termine sind je nach Auslastung ebenfalls möglich.",
  "Den genauen Umfang und benötigtes Material kläre ich gerne vorab.",
  "Ich bin in der angegebenen Region und in der näheren Umgebung unterwegs.",
];

function buildServicePool() {
  const servicePool: string[] = [];
  for (const service of serviceCategories) {
    for (let i = 0; i < desiredCounts[service]; i += 1) {
      servicePool.push(service);
    }
  }
  if (servicePool.length !== 112) {
    throw new Error(`Dienstleistungsverteilung ergibt ${servicePool.length} statt 112 Profile.`);
  }
  return servicePool;
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
    const service = servicePool[index];
    const variants = serviceDescriptions[service] || serviceDescriptions["Sonstige Dienstleistungen"];
    const description = `${intros[index % intros.length]} ${variants[index % variants.length]} ${endings[(index * 2 + 1) % endings.length]}`;

    await db
      .update(profiles)
      .set({
        services: [service],
        description,
        updatedAt: new Date(),
      })
      .where(eq(profiles.userId, starterUsers[index].id));
  }

  console.log("Dienstleistungen und Beschreibungen der 112 Starterprofile wurden korrekt aufeinander abgestimmt.");
}

main()
  .catch((error) => {
    console.error("Neuverteilung fehlgeschlagen:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });