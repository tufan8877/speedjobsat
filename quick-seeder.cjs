const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');

// SQLite Datenbankpfad
const dbPath = path.join(__dirname, 'data', 'speedjobs.db');
const db = new sqlite3.Database(dbPath);

// Password hashing function
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${hash}.${salt}`;
}

// Kompakte Listen für schnellere Generierung
const firstNames = ['Andreas', 'Anna', 'Christian', 'Christina', 'Daniel', 'Daniela', 'Felix', 'Franziska', 'Georg', 'Gabriele', 'Hans', 'Hannah', 'Klaus', 'Katharina', 'Martin', 'Maria', 'Oliver', 'Olivia', 'Paul', 'Petra', 'Stefan', 'Sabine', 'Thomas', 'Theresa'];

const lastNames = ['Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Wagner', 'Bauer', 'Richter', 'Klein', 'Wolf', 'Braun', 'Krüger', 'Hoffmann', 'Schäfer', 'Steiner', 'Gruber', 'Huber', 'Wimmer', 'Winkler', 'Reiter'];

const serviceCategories = ['Installateur', 'Elektriker', 'Reinigung', 'Umzug', 'Transport', 'Gartenpflege', 'Haushaltshilfe', 'Kinderbetreuung', 'Seniorenbetreuung', 'Nachhilfe', 'Computer & IT', 'Handwerker', 'Maler', 'Dachdecker', 'Automechaniker', 'Schlosser', 'Masseur'];

const federalStates = ['Wien', 'Niederösterreich', 'Oberösterreich', 'Salzburg', 'Tirol', 'Steiermark'];

const locations = ['Wien', 'Niederösterreich', 'Oberösterreich', 'Steiermark', 'Tirol', 'Kärnten', 'Salzburg', 'Vorarlberg', 'Burgenland'];

// Jobs werden jetzt kategorie-spezifisch erstellt
const jobData = {
  'Elektriker': [
    { title: 'Elektriker für Steckdosen-Installation gesucht', desc: 'Benötige professionellen Elektriker für die Installation von 3 neuen Steckdosen im Wohnzimmer.' },
    { title: 'Elektro-Reparatur dringend', desc: 'Sicherung springt immer raus. Suche Elektriker für schnelle Reparatur.' }
  ],
  'Installateur': [
    { title: 'Installateur - Wasserhahn tropft', desc: 'Wasserhahn in der Küche tropft seit Tagen. Benötige schnelle Reparatur vom Profi.' },
    { title: 'Heizung defekt - Installateur gesucht', desc: 'Heizung funktioniert nicht mehr. Suche erfahrenen Installateur für Reparatur.' }
  ],
  'Maler': [
    { title: 'Maler für Wohnzimmer benötigt', desc: 'Suche professionellen Maler für Wohnzimmer-Renovierung. Ca. 25qm zu streichen.' },
    { title: 'Fassade streichen lassen', desc: 'Hausbesitzer sucht Maler für Fassaden-Anstrich. Einfamilienhaus, gute Bezahlung.' }
  ],
  'Handwerker': [
    { title: 'Handwerker - neue Küche gewünscht', desc: 'Suche erfahrenen Handwerker für Küchenmontage. Alle Materialien vorhanden.' },
    { title: 'Handwerker für kleine Reparaturen', desc: 'Verschiedene kleinere Reparaturen im Haushalt. Suche zuverlässigen Handwerker.' }
  ],
  'Gartenpflege': [
    { title: 'Gartenpflege für Heckenschnitt', desc: 'Große Hecke muss geschnitten werden. Suche Gärtner mit professioneller Ausrüstung.' },
    { title: 'Rasen mähen und Garten pflegen', desc: 'Regelmäßige Gartenpflege gesucht. Großer Garten, faire Bezahlung.' }
  ],
  'Reinigung': [
    { title: 'Reinigung für Büro gesucht', desc: 'Büroräume benötigen wöchentliche Reinigung. 150qm, moderne Ausstattung.' },
    { title: 'Wohnung Grundreinigung', desc: 'Nach Umzug komplette Wohnungsreinigung erforderlich. 80qm Wohnung.' }
  ],
  'Umzug': [
    { title: 'Umzug am Wochenende', desc: 'Suche Umzugshelfer für Wochenend-Umzug. 3-Zimmer Wohnung, 2. Stock ohne Lift.' },
    { title: 'Umzugshilfe dringend gesucht', desc: 'Kurzfristiger Umzug, benötige erfahrene Umzugshelfer mit Transporter.' }
  ],
  'Computer & IT': [
    { title: 'Computer & IT - Hilfe dringend benötigt', desc: 'Laptop funktioniert nicht mehr. Suche IT-Experten für schnelle Reparatur.' },
    { title: 'WLAN-Setup und Computer-Hilfe', desc: 'Neues Internet, benötige Hilfe beim WLAN-Setup und Computer-Konfiguration.' }
  ],
  'Masseur': [
    { title: 'Masseur für Entspannung gesucht', desc: 'Suche professionellen Masseur für regelmäßige Entspannungsmassagen zu Hause.' },
    { title: 'Physiotherapie und Massage', desc: 'Nach Sportverletzung Massage und Physiotherapie erforderlich.' }
  ],
  'Dachdecker': [
    { title: 'Dachdecker für Reparatur gesucht', desc: 'Dachziegel sind nach Sturm beschädigt. Suche erfahrenen Dachdecker.' },
    { title: 'Dachrinne reparieren lassen', desc: 'Dachrinne undicht, benötige professionelle Reparatur vom Dachdecker.' }
  ]
};

const jobDescriptions = [
  'Suche erfahrenen Dienstleister für professionelle Arbeit. Faire Bezahlung.',
  'Dringend benötigt - schnelle und zuverlässige Hilfe erwünscht.',
  'Qualitätsarbeit gesucht. Referenzen vorhanden, gerne langfristige Zusammenarbeit.',
  'Kleiner Auftrag, aber wichtig für uns. Saubere Arbeit gewünscht.',
  'Größerer Auftrag - mehrere Termine möglich. Gute Bezahlung garantiert.'
];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements(array, count) {
  const shuffled = array.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateEmail(firstName, lastName) {
  const domains = ['gmail.com', 'hotmail.com', 'gmx.at'];
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${getRandomElement(domains)}`;
}

function generatePhoneNumber() {
  const prefixes = ['0650', '0664', '0676', '01'];
  return `${getRandomElement(prefixes)} ${Math.floor(Math.random() * 9000000) + 1000000}`;
}

function generateSocialMedia(firstName, lastName) {
  const platforms = ['Instagram: @', 'Facebook: ', 'LinkedIn: '];
  const platform = getRandomElement(platforms);
  return `${platform}${firstName.toLowerCase()}${lastName.toLowerCase()}${Math.floor(Math.random() * 99)}`;
}

function generateVariedContact(firstName, lastName, isProfile = false) {
  if (isProfile) {
    // Profile haben mehrere Kontaktmöglichkeiten - mehr Vielfalt
    const variations = [
      { phone: '', email: generateEmail(firstName, lastName), socialMedia: generateSocialMedia(firstName, lastName) }, // Nur Email + Social
      { phone: '', email: generateEmail(firstName, lastName), socialMedia: generateSocialMedia(firstName, lastName) }, // Nur Email + Social (mehr davon)
      { phone: generatePhoneNumber(), email: '', socialMedia: generateSocialMedia(firstName, lastName) }, // Nur Phone + Social
      { phone: '', email: '', socialMedia: generateSocialMedia(firstName, lastName) }, // Nur Social Media
      { phone: '', email: generateEmail(firstName, lastName), socialMedia: '' }, // Nur Email
      { phone: generatePhoneNumber(), email: generateEmail(firstName, lastName), socialMedia: '' }, // Phone + Email
      { phone: generatePhoneNumber(), email: generateEmail(firstName, lastName), socialMedia: generateSocialMedia(firstName, lastName) } // Alles
    ];
    return getRandomElement(variations);
  } else {
    // Aufträge haben nur eine Kontaktart - mehr Social Media Vielfalt
    const contactTypes = ['email', 'phone', 'instagram', 'facebook', 'linkedin'];
    const type = getRandomElement(contactTypes);
    
    switch (type) {
      case 'email':
        return generateEmail(firstName, lastName);
      case 'phone':
        return generatePhoneNumber();
      case 'instagram':
        return `Instagram: @${firstName.toLowerCase()}${lastName.toLowerCase()}${Math.floor(Math.random() * 99)}`;
      case 'facebook':
        return `Facebook: ${firstName} ${lastName}`;
      case 'linkedin':
        return `LinkedIn: ${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
      default:
        return generateEmail(firstName, lastName);
    }
  }
}

async function seedDatabase() {
  console.log('Erstelle 50 Profile und 30 Aufträge...');
  
  try {
    // Lösche alte Testdaten
    await new Promise((resolve) => {
      db.serialize(() => {
        db.run('DELETE FROM job_listings WHERE user_id > 4');
        db.run('DELETE FROM profiles WHERE user_id > 4');
        db.run('DELETE FROM users WHERE id > 4');
        resolve();
      });
    });
    
    // Erstelle Benutzer und Profile
    const userStmt = db.prepare('INSERT INTO users (email, password, status, is_admin, created_at) VALUES (?, ?, ?, ?, ?)');
    const profileStmt = db.prepare(`INSERT INTO profiles (user_id, first_name, last_name, description, services, regions, phone_number, email, social_media, available_periods, is_available, profile_image, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    
    for (let i = 0; i < 50; i++) {
      const firstName = getRandomElement(firstNames);
      const lastName = getRandomElement(lastNames);
      const email = generateEmail(firstName, lastName);
      const userId = i + 5; // Nach den ersten 4 Admin-Benutzern
      
      userStmt.run([email, hashPassword('123456'), 'active', false, new Date().toISOString()]);
      
      const services = getRandomElements(serviceCategories, Math.floor(Math.random() * 2) + 1);
      const regions = getRandomElements(federalStates, Math.floor(Math.random() * 2) + 1);
      const contact = generateVariedContact(firstName, lastName, true);
      
      // Bessere Beschreibungstexte
      const descriptions = [
        `Professioneller ${services[0]} mit über 10 Jahren Erfahrung. Schnell, zuverlässig und kundenorientiert.`,
        `Qualifizierter ${services[0]} - faire Preise und termingerechte Ausführung garantiert.`,
        `Erfahrener ${services[0]} für alle Arbeiten rund um ${services[0].toLowerCase()}. Kostenlose Beratung und Angebotserstellung.`,
        `${services[0]} mit Meisterbrief - von der Beratung bis zur Fertigstellung alles aus einer Hand.`,
        `Ihr ${services[0]} in ${regions[0]} - schnelle Terminvergabe und professionelle Ausführung.`
      ];
      
      profileStmt.run([
        userId, firstName, lastName,
        getRandomElement(descriptions),
        JSON.stringify(services),
        JSON.stringify(regions),
        contact.phone || '',
        contact.email || email,
        contact.socialMedia || '',
        JSON.stringify(['Vormittag', 'Nachmittag']),
        true,
        null,
        new Date().toISOString()
      ]);
    }
    
    userStmt.finalize();
    profileStmt.finalize();
    
    // Erstelle Aufträge
    const jobStmt = db.prepare(`INSERT INTO job_listings (user_id, title, description, location, date, contact_info, category, images, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    
    for (let i = 0; i < 30; i++) {
      const jobCategories = Object.keys(jobData);
      const category = getRandomElement(jobCategories);
      const categoryJobs = jobData[category];
      const selectedJob = getRandomElement(categoryJobs);
      
      const jobFirstName = getRandomElement(firstNames);
      const jobLastName = getRandomElement(lastNames);
      const jobContact = generateVariedContact(jobFirstName, jobLastName, false);
      
      jobStmt.run([
        Math.floor(Math.random() * 50) + 5, // Zufälliger User
        selectedJob.title,
        selectedJob.desc,
        getRandomElement(locations),
        new Date().toISOString().split('T')[0] + 'T00:00:00.000Z',
        jobContact, // Vielfältige Kontaktdaten - Email, Phone oder Social Media
        category, // Korrekte Kategorie passend zu Titel/Beschreibung
        null,
        'active',
        new Date().toISOString()
      ]);
    }
    
    jobStmt.finalize();
    
    console.log('✅ 50 Profile und 30 Aufträge erfolgreich erstellt!');
    
  } catch (error) {
    console.error('Fehler:', error);
  } finally {
    db.close();
  }
}

seedDatabase();