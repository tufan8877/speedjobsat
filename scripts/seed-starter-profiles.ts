import { randomBytes, scrypt } from "crypto";
import { promisify } from "util";
import { eq, like } from "drizzle-orm";
import { db, pool } from "../server/db";
import { profiles, users, serviceCategories, availabilityPeriods } from "../shared/schema";

const scryptAsync = promisify(scrypt);
const CONTACT_EMAIL = "kontakt@speedjob.at";
const SEED_PREFIX = "starter-profile-";

// Feste Zeitstempel weit in der Vergangenheit, damit Starterprofile echte,
// neu erstellte Nutzerprofile nie aus der "Neueste Profile"-Sortierung verdrängen.
// Deterministisch (index-basiert), also bei jedem Lauf identisch.
const SEED_EPOCH = new Date("2024-01-01T00:00:00.000Z").getTime();
const SEED_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 Stunden Abstand pro Profil
function seedCreatedAt(index: number) {
  return new Date(SEED_EPOCH + index * SEED_INTERVAL_MS);
}

const names = [
  "Daniel K.", "Sarah M.", "Emre A.", "Miriam S.", "Lukas P.", "Nina H.", "Mehmet Y.", "Julia B.",
  "David R.", "Selina T.", "Markus G.", "Aylin D.", "Thomas W.", "Lea F.", "Kerem C.", "Sophie N.",
  "Michael E.", "Elif K.", "Florian S.", "Katharina L.", "Can B.", "Anna R.", "Stefan M.", "Melanie P.",
  "Yusuf A.", "Lisa H.", "Patrick D.", "Zeynep Y.", "Martin K.", "Vanessa S.", "Burak T.", "Laura G.",
  "Christian B.", "Esra A.", "Alexander W.", "Jasmin M.", "Onur K.", "Nicole R.", "Sebastian P.", "Derya C.",
  "Philipp H.", "Sandra F.", "Murat Y.", "Carina L.", "Andreas S.", "Ebru D.", "Dominik G.", "Bianca T.",
  "Hakan A.", "Elena M.", "Manuel K.", "Nadja R.", "Serkan B.", "Christina P.", "Kevin W.", "Gizem S.",
  "Roman H.", "Tamara L.", "Ahmet C.", "Verena G.", "Mario D.", "Leyla A.", "Fabian M.", "Daniela K.",
  "Cem T.", "Isabella R.", "Rene P.", "Fatma Y.", "Simon B.", "Eva S.", "Kaan D.", "Claudia H.",
  "Marcel G.", "Merve A.", "Oliver W.", "Patricia K.", "Tolga C.", "Viktoria M.", "Benjamin S.", "Seda R.",
  "Johannes P.", "Alina F.", "Okan Y.", "Monika B.", "Gregor H.", "Denise L.", "Sinan A.", "Corinna D.",
  "Matthias K.", "Sabrina T.", "Umut M.", "Helena G.", "Robert S.", "Dilara C.", "Niklas W.", "Simone R.",
  "Eren B.", "Marlene H.", "Tobias P.", "Nesrin A.", "Georg K.", "Lena D.", "Baris Y.", "Iris M.",
  "Samuel F.", "Ayse T.", "Christoph R.", "Maja S.", "Deniz C.", "Theresa B.", "Harun G.", "Klara W."
];

const locations = [
  "Wien 10", "Wien 22", "Wien 15", "Wien 12", "Wien 21", "Wien 3", "Wien 16", "Wien 5",
  "Wien 23", "Wien 11", "Wien 20", "Wien 2", "Wien 14", "Wien 7", "Wien 17", "Wien 9",
  "Wien 13", "Wien 6", "Wien 18", "Wien 4", "Wien 19", "Wien 8", "Wien 1", "Wien 22",
  "Wien 10", "Wien 21", "Wien 15", "Wien 12", "Wien 16", "Wien 23", "Wien 11", "Wien 20",
  "Wien 14", "Baden", "Mödling", "St. Pölten", "Wiener Neustadt", "Krems", "Klosterneuburg", "Tulln",
  "Korneuburg", "Stockerau", "Schwechat", "Gänserndorf", "Amstetten", "Melk", "Hollabrunn", "Neunkirchen",
  "Linz", "Wels", "Steyr", "Leonding", "Traun", "Braunau", "Vöcklabruck", "Gmunden",
  "Ried im Innkreis", "Freistadt", "Perg", "Enns", "Graz", "Leoben", "Kapfenberg", "Bruck an der Mur",
  "Weiz", "Hartberg", "Feldbach", "Voitsberg", "Deutschlandsberg", "Murtal", "Salzburg Stadt", "Hallein",
  "Seekirchen", "Saalfelden", "Zell am See", "Bischofshofen", "St. Johann im Pongau", "Oberndorf", "Innsbruck", "Kufstein",
  "Wörgl", "Hall in Tirol", "Schwaz", "Telfs", "Imst", "Klagenfurt", "Villach", "Wolfsberg",
  "Spittal an der Drau", "Feldkirchen", "St. Veit an der Glan", "Bregenz", "Dornbirn", "Feldkirch", "Hohenems", "Bludenz",
  "Eisenstadt", "Neusiedl am See", "Mattersburg", "Oberwart", "Wien 13", "Wien 21", "Graz", "Linz",
  "Salzburg Stadt", "Innsbruck", "Klagenfurt", "Bregenz", "Baden", "Wels", "Wien 22", "Wien 10"
];

const locationState = (place: string) => {
  if (place.startsWith("Wien")) return "Wien";
  if (["Baden", "Mödling", "St. Pölten", "Wiener Neustadt", "Krems", "Klosterneuburg", "Tulln", "Korneuburg", "Stockerau", "Schwechat", "Gänserndorf", "Amstetten", "Melk", "Hollabrunn", "Neunkirchen"].includes(place)) return "Niederösterreich";
  if (["Linz", "Wels", "Steyr", "Leonding", "Traun", "Braunau", "Vöcklabruck", "Gmunden", "Ried im Innkreis", "Freistadt", "Perg", "Enns"].includes(place)) return "Oberösterreich";
  if (["Graz", "Leoben", "Kapfenberg", "Bruck an der Mur", "Weiz", "Hartberg", "Feldbach", "Voitsberg", "Deutschlandsberg", "Murtal"].includes(place)) return "Steiermark";
  if (["Salzburg Stadt", "Hallein", "Seekirchen", "Saalfelden", "Zell am See", "Bischofshofen", "St. Johann im Pongau", "Oberndorf"].includes(place)) return "Salzburg";
  if (["Innsbruck", "Kufstein", "Wörgl", "Hall in Tirol", "Schwaz", "Telfs", "Imst"].includes(place)) return "Tirol";
  if (["Klagenfurt", "Villach", "Wolfsberg", "Spittal an der Drau", "Feldkirchen", "St. Veit an der Glan"].includes(place)) return "Kärnten";
  if (["Bregenz", "Dornbirn", "Feldkirch", "Hohenems", "Bludenz"].includes(place)) return "Vorarlberg";
  return "Burgenland";
};

const serviceTexts: Record<string, string[]> = {
  Installateur: [
    "Ich bin gelernter Installateur und helfe bei kleineren Sanitärarbeiten, Armaturentausch, Silikonfugen und einfachen Reparaturen rund um Bad und Küche.",
    "Nebenberuflich unterstütze ich bei tropfenden Armaturen, dem Tausch von Siphons und anderen überschaubaren Arbeiten im Sanitärbereich.",
    "Ich biete praktische Hilfe bei kleineren Installationsarbeiten und achte dabei auf sauberes Arbeiten und eine klare Absprache vor Ort."
  ],
  Elektriker: [
    "Ich unterstütze bei Lampenmontage, Steckdosen, Schaltern und kleineren elektrischen Arbeiten im Haushalt, soweit diese fachlich sicher durchführbar sind.",
    "Meine Schwerpunkte sind Leuchtenmontage, Fehlersuche bei einfachen Elektroproblemen und kleinere Arbeiten in Wohnung oder Haus.",
    "Ich helfe bei überschaubaren Elektroarbeiten, erkläre die einzelnen Schritte verständlich und arbeite ordentlich und zuverlässig."
  ],
  Reinigung: [
    "Ich biete gründliche Wohnungsreinigung, Fensterputzen und regelmäßige Unterstützung im Haushalt an.",
    "Sauberkeit und Zuverlässigkeit sind mir wichtig. Ich übernehme Einzeltermine ebenso wie wiederkehrende Reinigungsarbeiten.",
    "Ich helfe bei der Reinigung von Wohnungen, Büros und Stiegenhäusern und arbeite sorgfältig nach vorheriger Absprache."
  ],
  Umzug: [
    "Ich packe bei Umzügen, beim Tragen von Möbeln und beim Ein- oder Ausräumen tatkräftig mit an.",
    "Für kleinere und mittlere Umzüge biete ich zuverlässige Unterstützung beim Tragen, Sortieren und Aufbauen.",
    "Ich helfe bei Übersiedlungen, Keller- oder Wohnungsräumungen und kann flexibel mit anpacken."
  ],
  Transport: [
    "Ich übernehme kleinere Transporte, Abholungen und Zustellungen im regionalen Bereich.",
    "Für Möbel, Einkäufe oder einzelne Gegenstände biete ich flexible Transporthilfe nach Vereinbarung.",
    "Ich unterstütze bei privaten Transporten und achte auf einen sorgfältigen Umgang mit den übernommenen Sachen."
  ],
  Gartenpflege: [
    "Ich helfe beim Rasenmähen, Heckenschneiden, Laubräumen und bei allgemeinen Gartenarbeiten.",
    "Gartenarbeit macht mir Freude. Ich unterstütze bei regelmäßiger Pflege und bei einzelnen größeren Einsätzen.",
    "Ich biete Hilfe bei saisonalen Gartenarbeiten, einfachen Pflanzarbeiten und der laufenden Pflege rund ums Haus."
  ],
  Haushaltshilfe: [
    "Ich unterstütze im Alltag bei Einkäufen, Ordnung im Haushalt und kleinen Erledigungen.",
    "Als verlässliche Haushaltshilfe übernehme ich unterschiedliche Aufgaben nach individueller Absprache.",
    "Ich helfe dort, wo im Alltag Unterstützung gebraucht wird, und richte mich möglichst flexibel nach den gewünschten Zeiten."
  ],
  Pflege: [
    "Ich biete stundenweise Unterstützung im Alltag, Begleitung und Hilfe bei einfachen täglichen Aufgaben.",
    "Mir ist ein respektvoller und geduldiger Umgang wichtig. Ich unterstütze Angehörige bei der täglichen Betreuung.",
    "Ich helfe bei Alltagstätigkeiten und leiste Gesellschaft, jedoch keine medizinische Behandlung oder Hauskrankenpflege."
  ],
  Kinderbetreuung: [
    "Ich betreue Kinder stundenweise, spiele, lese vor und helfe bei kleinen Alltagsaufgaben.",
    "Ich habe Erfahrung im Umgang mit Kindern und biete zuverlässige Betreuung nach persönlichem Kennenlernen.",
    "Ich unterstütze Familien am Nachmittag oder Abend und gestalte die Betreuungszeit ruhig und abwechslungsreich."
  ],
  Seniorenbetreuung: [
    "Ich begleite ältere Menschen bei Spaziergängen, Einkäufen und Terminen und leiste gerne Gesellschaft.",
    "Geduld und Verlässlichkeit sind mir besonders wichtig. Ich biete alltagsnahe Unterstützung für Seniorinnen und Senioren.",
    "Ich helfe bei kleinen Erledigungen und verbringe Zeit mit Menschen, die sich Begleitung im Alltag wünschen."
  ],
  Haustierbetreuung: [
    "Ich übernehme Gassi-Runden, Fütterung und Gesellschaft für Hunde und Katzen, wenn es zeitlich mal eng wird.",
    "Ich biete Tierbetreuung bei Urlaub oder Arbeit an, inklusive Spaziergängen und Grundversorgung im gewohnten Zuhause.",
    "Ich bin tierlieb und zuverlässig und kümmere mich gerne stundenweise oder tageweise um Ihr Haustier."
  ],
  Nachhilfe: [
    "Ich gebe verständliche Nachhilfe und erkläre den Stoff in ruhigem Tempo mit passenden Beispielen.",
    "Ich unterstütze Schülerinnen und Schüler bei Hausübungen, Prüfungsvorbereitung und beim Schließen von Wissenslücken.",
    "Mir ist wichtig, dass Lernende den Stoff wirklich verstehen und mit mehr Sicherheit in die nächste Prüfung gehen."
  ],
  "Computer & IT": [
    "Ich helfe bei PC- und Handyproblemen, Einrichtung von Geräten, Datensicherung und einfachen Softwarefragen.",
    "Ich unterstütze bei WLAN, Drucker, E-Mail, Smartphone und alltäglichen technischen Problemen.",
    "Technik erkläre ich verständlich und ohne Fachchinesisch. Termine sind vor Ort oder nach Möglichkeit auch online möglich."
  ],
  Handwerker: [
    "Ich übernehme kleinere handwerkliche Arbeiten, Reparaturen und praktische Aufgaben in Wohnung oder Haus.",
    "Mit eigenem Werkzeug helfe ich bei verschiedenen Arbeiten, die im Alltag liegen bleiben.",
    "Ich bin handwerklich vielseitig und bespreche vorab genau, was benötigt wird und was realistisch machbar ist."
  ],
  Maler: [
    "Ich unterstütze beim Ausmalen von Zimmern, bei kleineren Ausbesserungen und beim sauberen Abkleben.",
    "Ich biete Hilfe bei Malerarbeiten in Wohnungen und achte auf eine ordentliche Vorbereitung und saubere Übergänge.",
    "Ob einzelne Wand oder ganzer Raum: Ich arbeite ruhig, sauber und nach genauer Farbabstimmung."
  ],
  Dachdecker: [
    "Ich biete Unterstützung bei kleineren Arbeiten rund um Dach, Rinne und Sichtkontrolle, sofern der Einsatz sicher möglich ist.",
    "Meine Erfahrung liegt im handwerklichen Bereich rund ums Dach. Den genauen Umfang kläre ich immer vorab.",
    "Ich helfe bei überschaubaren Dacharbeiten und kleineren Reparaturen nach Besichtigung und Sicherheitsprüfung."
  ],
  Automechaniker: [
    "Ich unterstütze privat bei einfachen Wartungsarbeiten, Reifenwechsel und kleineren Aufgaben rund ums Auto.",
    "Ich habe Erfahrung mit Fahrzeugen und helfe bei überschaubaren Arbeiten nach vorheriger Absprache.",
    "Von Reifen bis kleiner Servicearbeit: Ich schaue mir zuerst an, was benötigt wird, und sage ehrlich, was machbar ist."
  ],
  Schlosser: [
    "Ich übernehme kleinere Metallarbeiten, Reparaturen und Montagen nach vorheriger Besichtigung.",
    "Ich bin im Metallbereich erfahren und helfe bei einfachen Schlosserarbeiten und Anpassungen.",
    "Für kleinere Reparaturen an Metallteilen und Montagen biete ich praktische Unterstützung mit sauberer Ausführung."
  ],
  Masseur: [
    "Ich biete entspannende Massagen zur Lockerung und Erholung im privaten Rahmen an.",
    "Mein Schwerpunkt liegt auf wohltuender Entspannung und einem ruhigen, angenehmen Ablauf.",
    "Ich biete klassische Entspannungsmassagen nach Terminvereinbarung, jedoch keine medizinische Therapie."
  ],
  Gastronomie: [
    "Ich unterstütze bei privaten Feiern, Veranstaltungen und kurzfristigen Einsätzen in der Gastronomie.",
    "Ich habe Erfahrung im Gastrobereich und helfe flexibel bei Vorbereitung, Ausgabe und allgemeinen Abläufen.",
    "Bei Feiern und Veranstaltungen packe ich zuverlässig mit an und behalte auch bei mehr Betrieb den Überblick."
  ],
  "Koch- & Küchenhilfe": [
    "Ich helfe bei Vorbereitung, Kochen, Anrichten und Aufräumen für private Feiern oder kleinere Veranstaltungen.",
    "Ich koche gerne und unterstütze bei Küchenarbeiten, Buffets und der Vorbereitung von Speisen.",
    "Von Schneiden bis Abwasch: Ich packe in der Küche zuverlässig mit an und arbeite sauber und organisiert."
  ],
  "Service & Kellnerarbeiten": [
    "Ich biete Servicehilfe bei privaten Feiern, Geburtstagen und kleineren Veranstaltungen.",
    "Ich habe Erfahrung im Service, arbeite freundlich und behalte auch bei mehreren Gästen den Überblick.",
    "Ich unterstütze beim Servieren, Abräumen und bei der Betreuung von Gästen nach genauer Absprache."
  ],
  Bauarbeiten: [
    "Ich helfe bei einfachen Bau- und Renovierungsarbeiten, Abbruch, Tragen und Vorbereitung.",
    "Ich packe bei körperlichen Arbeiten zuverlässig mit an und halte mich an die vereinbarten Aufgaben.",
    "Für kleinere Baustellen und Renovierungen biete ich praktische Unterstützung und sorgfältige Mitarbeit."
  ],
  Fliesenlegerarbeiten: [
    "Ich unterstütze bei kleineren Fliesenarbeiten, Ausbesserungen und Silikonfugen.",
    "Ich habe Erfahrung beim Verlegen und Reparieren von Fliesen und kläre Material und Umfang vorher genau ab.",
    "Kleinere Flächen und Reparaturstellen übernehme ich nach Besichtigung mit sauberer Vorbereitung."
  ],
  Bodenlegerarbeiten: [
    "Ich helfe beim Verlegen von Laminat, Vinyl und einfachen Bodenbelägen in kleineren Räumen.",
    "Ich unterstütze beim Bodentausch, bei Sockelleisten und bei der Vorbereitung des Untergrunds.",
    "Für überschaubare Bodenarbeiten biete ich sorgfältige Hilfe und eine klare Abstimmung zum Material."
  ],
  Montagearbeiten: [
    "Ich montiere Möbel, Regale, Lampen und kleinere Einrichtungsgegenstände.",
    "Mit eigenem Werkzeug helfe ich beim Aufbau von Möbeln und bei verschiedenen Montagen in der Wohnung.",
    "Ich übernehme saubere und stabile Montagen und kläre vorher, welches Material und welche Befestigung benötigt werden."
  ],
  Reparaturarbeiten: [
    "Ich helfe bei kleineren Reparaturen im Haushalt und finde oft eine praktische Lösung, bevor etwas ersetzt werden muss.",
    "Ich übernehme überschaubare Reparaturen an Möbeln, Türen und Haushaltsgegenständen.",
    "Kleine Defekte schaue ich mir zuerst genau an und bespreche offen, ob sich eine Reparatur lohnt."
  ],
  "Sonstige Dienstleistungen": [
    "Ich bin vielseitig einsetzbar und helfe bei unterschiedlichen praktischen Aufgaben nach genauer Absprache.",
    "Ich biete flexible Unterstützung für Erledigungen, kleinere Arbeiten und Aufgaben, für die kurzfristig Hilfe gebraucht wird.",
    "Mein Angebot richtet sich nach dem konkreten Bedarf. Am besten kurz beschreiben, worum es geht, dann klären wir die Möglichkeiten."
  ]
};

const intros = [
  "Ich bin zuverlässig, pünktlich und arbeite gerne selbstständig.",
  "Mir ist wichtig, dass Absprachen eingehalten werden und das Ergebnis ordentlich ist.",
  "Ich biete meine Unterstützung nebenberuflich und mit viel praktischem Einsatz an.",
  "Ich arbeite ruhig, sorgfältig und erkläre vorab transparent, was möglich ist.",
  "Bei mir stehen ein freundlicher Umgang und eine saubere Ausführung im Vordergrund.",
  "Ich bringe praktische Erfahrung mit und freue mich über unkomplizierte Anfragen aus der Region.",
  "Zuverlässigkeit und ein respektvoller Umgang sind für mich selbstverständlich."
];

const endings = [
  "Termine sind nach Absprache am Abend oder am Wochenende möglich.",
  "Unter der Woche bin ich meist am späten Nachmittag verfügbar.",
  "Kurzfristige Termine sind je nach Auslastung ebenfalls möglich.",
  "Den genauen Umfang und benötigtes Material kläre ich gerne vorab.",
  "Ich bin im angegebenen Bezirk und in der näheren Umgebung unterwegs.",
  "Bei Interesse bitte kurz beschreiben, worum es geht und wann Unterstützung gebraucht wird.",
  "Eine faire und klare Abstimmung vor Beginn ist mir besonders wichtig.",
  "Am Wochenende kann ich meistens flexibler planen."
];

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

function buildEntries() {
  return names.map((fullName, index) => {
    const splitAt = fullName.lastIndexOf(" ");
    const firstName = fullName.slice(0, splitAt);
    const lastName = fullName.slice(splitAt + 1);
    const place = locations[index];
    const state = locationState(place);
    const service = serviceCategories[index % serviceCategories.length];
    const secondService = serviceCategories[(index * 5 + 9) % serviceCategories.length];
    const serviceVariants = serviceTexts[service] || serviceTexts["Sonstige Dienstleistungen"];
    const description = `${intros[index % intros.length]} ${serviceVariants[index % serviceVariants.length]} ${endings[(index * 3 + 1) % endings.length]}`;
    const availablePeriods = Array.from(new Set([
      availabilityPeriods[index % availabilityPeriods.length],
      availabilityPeriods[(index + 2) % availabilityPeriods.length]
    ]));

    return {
      internalEmail: `${SEED_PREFIX}${String(index + 1).padStart(3, "0")}@seed.speedjob.at`,
      firstName,
      lastName,
      description,
      services: index % 5 === 0 && secondService !== service ? [service, secondService] : [service],
      regions: place.startsWith("Wien") ? ["Wien", place] : [state, place],
      availablePeriods,
      isAvailable: index % 11 !== 0
    };
  });
}

async function main() {
  const entries = buildEntries();
  if (entries.length !== 112) throw new Error(`Es wurden ${entries.length} statt 112 Einträge erzeugt.`);

  // Bestehende Starter-Nutzer anhand ihrer (festen, index-basierten) E-Mail wiederfinden,
  // statt sie bei jedem Serverstart zu löschen und neu anzulegen. Ein Neuanlegen würde
  // jedes Mal ein frisches createdAt setzen und damit echte, neu erstellte Nutzerprofile
  // aus der "Neueste Profile"-Sortierung verdrängen.
  const existingUsers = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(like(users.email, `${SEED_PREFIX}%@seed.speedjob.at`));
  const existingIdByEmail = new Map(existingUsers.map((user) => [user.email, user.id]));

  const passwordHash = await hashPassword(randomBytes(32).toString("hex"));
  let created = 0;
  let updated = 0;

  for (const [index, entry] of entries.entries()) {
    const existingUserId = existingIdByEmail.get(entry.internalEmail);
    const createdAt = seedCreatedAt(index);

    if (existingUserId) {
      await db
        .update(profiles)
        .set({
          firstName: entry.firstName,
          lastName: entry.lastName,
          description: entry.description,
          services: entry.services,
          regions: entry.regions,
          availablePeriods: entry.availablePeriods,
          isAvailable: entry.isAvailable,
          createdAt,
          updatedAt: new Date(),
        })
        .where(eq(profiles.userId, existingUserId));
      updated += 1;
      continue;
    }

    const insertedUsers = await db.insert(users).values({
      email: entry.internalEmail,
      password: passwordHash,
      status: "active",
      isAdmin: false
    }).returning();

    await db.insert(profiles).values({
      userId: insertedUsers[0].id,
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
      createdAt,
    });
    created += 1;
  }

  console.log(`Starter-Profile abgeschlossen: ${created} neu erstellt, ${updated} aktualisiert (Erstellungsdatum unverändert).`);
}

main()
  .catch((error) => {
    console.error("Seed fehlgeschlagen:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
