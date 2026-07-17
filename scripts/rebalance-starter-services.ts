import { existsSync, readFileSync } from "fs";
import path from "path";
import { asc, eq, like } from "drizzle-orm";
import { db, pool } from "../server/db";
import { profiles, users } from "../shared/schema";

const SEED_PREFIX = "starter-profile-";

// Ein Teil der Starterprofile bekommt ein Avatar-Bild (Initialen auf farbigem
// Hintergrund, keine echten oder KI-generierten Gesichter - siehe
// scripts/assets/starter-avatars/README.md), damit die Suche nicht wirkt, als
// hätte kein einziges Profil ein Bild, aber auch nicht wie 112 identische Fotos.
const AVATAR_DIR = path.join(process.cwd(), "scripts", "assets", "starter-avatars");

function loadAvatarDataUrl(emailIndex: number): string | null {
  const filePath = path.join(AVATAR_DIR, `${String(emailIndex).padStart(3, "0")}.png`);
  if (!existsSync(filePath)) return null;
  return `data:image/png;base64,${readFileSync(filePath).toString("base64")}`;
}

function emailIndexOf(email: string): number {
  const match = email.match(/starter-profile-(\d+)@/);
  if (!match) throw new Error(`Konnte Index aus E-Mail "${email}" nicht lesen.`);
  return Number(match[1]);
}

// Die Vornamen aus scripts/seed-starter-profiles.ts, aufgeteilt nach Geschlecht.
// Wird verwendet, um Dienstleistungen realistisch zu verteilen (z.B. Pflege eher
// weiblich, Bauarbeiten eher männlich besetzt), ohne starr auf 0% oder 100% zu gehen.
// Wichtig: Wenn die Namensliste im Seed-Skript geändert wird, muss diese Liste
// mitgepflegt werden - die Prüfung unten (Warteschlangenlänge) schlägt sonst fehl.
const FEMALE_FIRST_NAMES = new Set([
  "Sarah", "Miriam", "Nina", "Julia", "Selina", "Aylin", "Lea", "Sophie", "Elif", "Katharina",
  "Anna", "Melanie", "Lisa", "Zeynep", "Vanessa", "Laura", "Esra", "Jasmin", "Nicole", "Derya",
  "Sandra", "Carina", "Ebru", "Bianca", "Elena", "Nadja", "Christina", "Gizem", "Tamara", "Verena",
  "Leyla", "Daniela", "Isabella", "Fatma", "Eva", "Claudia", "Merve", "Patricia", "Viktoria", "Seda",
  "Alina", "Monika", "Denise", "Corinna", "Sabrina", "Helena", "Dilara", "Simone", "Marlene", "Nesrin",
  "Lena", "Iris", "Ayse", "Maja", "Theresa", "Klara",
]);

const MALE_FIRST_NAMES = new Set([
  "Daniel", "Emre", "Lukas", "Mehmet", "David", "Markus", "Thomas", "Kerem", "Michael", "Florian",
  "Can", "Stefan", "Yusuf", "Patrick", "Martin", "Burak", "Christian", "Alexander", "Onur", "Sebastian",
  "Philipp", "Murat", "Andreas", "Dominik", "Hakan", "Manuel", "Serkan", "Kevin", "Roman", "Ahmet",
  "Mario", "Fabian", "Cem", "Rene", "Simon", "Kaan", "Marcel", "Oliver", "Tolga", "Benjamin",
  "Johannes", "Okan", "Gregor", "Sinan", "Matthias", "Umut", "Robert", "Niklas", "Eren", "Tobias",
  "Georg", "Baris", "Samuel", "Christoph", "Deniz", "Harun",
]);

// Anzahl Profile je Dienstleistung, aufgeteilt in weiblich/männlich besetzte Plätze.
// Die Verteilung orientiert sich an typischen Geschlechteranteilen in den jeweiligen
// Berufsfeldern, bleibt aber überall gemischt (keine Kategorie ist zu 100% einem
// Geschlecht vorbehalten, außer bei sehr kleinen Stückzahlen von 1-2 Profilen).
const categoryGenderCounts: Record<string, { female: number; male: number }> = {
  Installateur: { female: 7, male: 11 },
  Elektriker: { female: 5, male: 7 },
  Reinigung: { female: 7, male: 0 },
  Umzug: { female: 2, male: 3 },
  Transport: { female: 2, male: 4 },
  Gartenpflege: { female: 2, male: 4 },
  Haushaltshilfe: { female: 5, male: 0 },
  Pflege: { female: 4, male: 0 },
  Kinderbetreuung: { female: 4, male: 0 },
  Seniorenbetreuung: { female: 3, male: 1 },
  Haustierbetreuung: { female: 2, male: 2 },
  Nachhilfe: { female: 3, male: 1 },
  "Computer & IT": { female: 2, male: 3 },
  Handwerker: { female: 0, male: 3 },
  Maler: { female: 1, male: 2 },
  Dachdecker: { female: 0, male: 2 },
  Automechaniker: { female: 1, male: 2 },
  Schlosser: { female: 0, male: 2 },
  Masseur: { female: 1, male: 1 },
  Gastronomie: { female: 1, male: 1 },
  "Koch- & Küchenhilfe": { female: 1, male: 1 },
  "Service & Kellnerarbeiten": { female: 1, male: 1 },
  Bauarbeiten: { female: 0, male: 2 },
  Fliesenlegerarbeiten: { female: 0, male: 1 },
  Bodenlegerarbeiten: { female: 0, male: 1 },
  Montagearbeiten: { female: 0, male: 1 },
  Reparaturarbeiten: { female: 1, male: 0 },
  "Design & Medien": { female: 0, male: 0 },
  "Musik & Kunst": { female: 0, male: 0 },
  "Sprachen & Übersetzung": { female: 0, male: 0 },
  "Sonstige Dienstleistungen": { female: 1, male: 0 },
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
  Haustierbetreuung: [
    "Ich übernehme Gassi-Runden, Fütterung und Gesellschaft für Hunde und Katzen, wenn es zeitlich mal eng wird.",
    "Ich biete Tierbetreuung bei Urlaub oder Arbeit an, inklusive Spaziergängen und Grundversorgung im gewohnten Zuhause.",
    "Ich bin tierlieb und zuverlässig und kümmere mich gerne stundenweise oder tageweise um Ihr Haustier.",
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

// Mindestens so viele Einträge wie die größte Kategorie (Installateur: 22 Profile),
// damit innerhalb jeder Kategorie jedes Profil einen anderen Satz bekommt und sich
// dadurch keine zwei Beschreibungen im gesamten Bestand wortgleich wiederholen.
const personalNotes = [
  "Ich mache diese Tätigkeit bereits seit einigen Jahren und kenne die typischen Abläufe gut.",
  "Rückfragen vorab sind für mich selbstverständlich, damit von Anfang an klar ist, was zu tun ist.",
  "Ich bringe eigenes Werkzeug beziehungsweise die notwendige Ausstattung mit, sofern das sinnvoll ist.",
  "Kurze Absprachen per Telefon oder Nachricht reichen mir meist, um einen Termin zu vereinbaren.",
  "Ich lege Wert auf offene Kommunikation, falls sich während der Arbeit etwas ändert.",
  "Mir ist es wichtig, den vereinbarten Zeitrahmen möglichst genau einzuhalten.",
  "Ich arbeite eigenständig, bespreche größere Entscheidungen aber immer vorher.",
  "Über die Jahre habe ich gelernt, auch bei kurzfristigen Anfragen flexibel zu bleiben.",
  "Ein realistischer Zeitplan ist mir wichtiger als überstürztes Arbeiten.",
  "Ich gebe ehrlich Rückmeldung, wenn etwas außerhalb meiner Möglichkeiten liegt.",
  "Kleinere Zusatzwünsche lassen sich meistens unkompliziert mit einplanen.",
  "Mir gefällt an dieser Tätigkeit besonders der direkte Kontakt mit den Kundinnen und Kunden.",
  "Ich halte mich an das, was vorab besprochen wurde, und vermeide unnötige Überraschungen.",
  "Bei größeren Aufgaben bespreche ich vorab, welche Schritte notwendig sind.",
  "Ich reagiere in der Regel innerhalb kurzer Zeit auf Anfragen.",
  "Auch bei mehreren Anfragen versuche ich, jede in Ruhe zu beantworten.",
  "Sauberkeit während und nach der Arbeit ist mir grundsätzlich wichtig.",
  "Ich bespreche den ungefähren Aufwand nach Möglichkeit schon vor dem ersten Termin.",
  "Mir ist es lieber, ehrlich Nein zu sagen, als eine Aufgabe zu übernehmen, die ich nicht gut erledigen kann.",
  "Ich freue mich über klare Angaben, damit ich mich gut vorbereiten kann.",
  "Nach getaner Arbeit räume ich meinen Bereich ordentlich wieder auf.",
  "Für wiederkehrende Termine finde ich meistens eine passende, regelmäßige Lösung.",
  "Ich informiere rechtzeitig, falls sich ein Termin doch einmal verschieben sollte.",
  "Erfahrungsgemäß hilft ein kurzes Vorgespräch, um Missverständnisse zu vermeiden.",
  "Ich schätze einen freundlichen und respektvollen Umgang auf beiden Seiten.",
];

function buildDescription(service: string, categoryLocalIndex: number, globalIndex: number) {
  const variants = serviceDescriptions[service];
  if (!variants?.length) {
    throw new Error(`Für die Dienstleistung "${service}" fehlt eine passende Beschreibung.`);
  }

  const intro = intros[globalIndex % intros.length];
  const serviceText = variants[categoryLocalIndex % variants.length];
  const personalNote = personalNotes[categoryLocalIndex % personalNotes.length];
  const ending = endings[(globalIndex * 3 + 2) % endings.length];
  return `${intro} ${serviceText} ${personalNote} ${ending}`;
}

function buildAssignments(femaleQueue: { id: number; email: string }[], maleQueue: { id: number; email: string }[]) {
  const assignments: { id: number; email: string; service: string; description: string; profileImage: string | null }[] = [];
  let femaleCursor = 0;
  let maleCursor = 0;
  let globalIndex = 0;

  for (const [service, counts] of Object.entries(categoryGenderCounts)) {
    let categoryLocalIndex = 0;

    for (let i = 0; i < counts.female; i += 1) {
      const user = femaleQueue[femaleCursor];
      femaleCursor += 1;
      assignments.push({
        id: user.id,
        email: user.email,
        service,
        description: buildDescription(service, categoryLocalIndex, globalIndex),
        profileImage: loadAvatarDataUrl(emailIndexOf(user.email)),
      });
      categoryLocalIndex += 1;
      globalIndex += 1;
    }

    for (let i = 0; i < counts.male; i += 1) {
      const user = maleQueue[maleCursor];
      maleCursor += 1;
      assignments.push({
        id: user.id,
        email: user.email,
        service,
        description: buildDescription(service, categoryLocalIndex, globalIndex),
        profileImage: loadAvatarDataUrl(emailIndexOf(user.email)),
      });
      categoryLocalIndex += 1;
      globalIndex += 1;
    }
  }

  if (femaleCursor !== femaleQueue.length || maleCursor !== maleQueue.length) {
    throw new Error(
      `Warteschlangen nicht vollständig verbraucht (weiblich: ${femaleCursor}/${femaleQueue.length}, männlich: ${maleCursor}/${maleQueue.length}).`,
    );
  }

  return assignments;
}

async function main() {
  const starterUsers = await db
    .select({ id: users.id, email: users.email, firstName: profiles.firstName })
    .from(users)
    .innerJoin(profiles, eq(profiles.userId, users.id))
    .where(like(users.email, `${SEED_PREFIX}%@seed.speedjob.at`))
    .orderBy(asc(users.email));

  if (starterUsers.length !== 112) {
    throw new Error(`Es wurden ${starterUsers.length} statt 112 Starter-Nutzer gefunden.`);
  }

  const femaleQueue = starterUsers.filter((user) => user.firstName && FEMALE_FIRST_NAMES.has(user.firstName));
  const maleQueue = starterUsers.filter((user) => user.firstName && MALE_FIRST_NAMES.has(user.firstName));

  if (femaleQueue.length !== 56 || maleQueue.length !== 56) {
    throw new Error(
      `Geschlechterzuordnung unvollständig (weiblich erkannt: ${femaleQueue.length}, männlich erkannt: ${maleQueue.length}, erwartet: 56/56).`,
    );
  }

  const totalDesired = Object.values(categoryGenderCounts).reduce((sum, c) => sum + c.female + c.male, 0);
  if (totalDesired !== 112) {
    throw new Error(`Dienstleistungsverteilung ergibt ${totalDesired} statt 112 Profile.`);
  }

  const assignments = buildAssignments(femaleQueue, maleQueue);
  let withAvatar = 0;

  for (const assignment of assignments) {
    const updated = await db
      .update(profiles)
      .set({
        services: [assignment.service],
        description: assignment.description,
        profileImage: assignment.profileImage,
        updatedAt: new Date(),
      })
      .where(eq(profiles.userId, assignment.id))
      .returning({ services: profiles.services, description: profiles.description, profileImage: profiles.profileImage });

    const saved = updated[0];
    if (!saved || saved.services?.length !== 1 || saved.services[0] !== assignment.service) {
      throw new Error(`Dienstleistung konnte für ${assignment.email} nicht korrekt gespeichert werden.`);
    }
    if (saved.description !== assignment.description) {
      throw new Error(`Beschreibung konnte für ${assignment.email} nicht korrekt gespeichert werden.`);
    }
    if (saved.profileImage !== assignment.profileImage) {
      throw new Error(`Profilbild konnte für ${assignment.email} nicht korrekt gespeichert werden.`);
    }
    if (assignment.profileImage) withAvatar += 1;
  }

  console.log(
    `Alle 112 Starterprofile wurden neu verteilt: Dienstleistungen orientieren sich an typischen Geschlechteranteilen, jede Beschreibung ist eindeutig, ${withAvatar} Profile haben ein Avatar-Bild.`,
  );
}

main()
  .catch((error) => {
    console.error("Neuverteilung fehlgeschlagen:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
