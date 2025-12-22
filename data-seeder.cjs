const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');

// SQLite Datenbankpfad
const dbPath = path.join(__dirname, 'data', 'speedjobs.db');
const db = new sqlite3.Database(dbPath);

// Password hashing function (gleich wie im Server)
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${hash}.${salt}`;
}

// Österreichische Namen und Daten
const firstNames = [
  'Andreas', 'Anna', 'Alexander', 'Andrea', 'Anton', 'Astrid',
  'Bernhard', 'Barbara', 'Benjamin', 'Birgit', 'Bruno', 'Bettina',
  'Christian', 'Christina', 'Christoph', 'Claudia', 'Cornelius', 'Carmen',
  'Daniel', 'Daniela', 'David', 'Diana', 'Dominik', 'Doris',
  'Erik', 'Elisabeth', 'Emanuel', 'Eva', 'Erwin', 'Evelyn',
  'Felix', 'Franziska', 'Florian', 'Friederike', 'Friedrich', 'Felicia',
  'Georg', 'Gabriele', 'Günther', 'Gisela', 'Gustav', 'Gertrude',
  'Hans', 'Hannah', 'Heinrich', 'Helga', 'Herbert', 'Herta',
  'Ingrid', 'Iris', 'Isabella', 'Ilse', 'Ignaz', 'Irmgard',
  'Jakob', 'Julia', 'Johannes', 'Johanna', 'Josef', 'Jasmin',
  'Klaus', 'Katharina', 'Karl', 'Karoline', 'Konrad', 'Karin',
  'Ludwig', 'Lisa', 'Lukas', 'Laura', 'Leopold', 'Lucia',
  'Martin', 'Maria', 'Matthias', 'Monika', 'Michael', 'Marlene',
  'Nikolaus', 'Natalie', 'Norbert', 'Nicole', 'Niklaus', 'Nina',
  'Oliver', 'Olivia', 'Oskar', 'Ottilie', 'Otto', 'Ophelia',
  'Paul', 'Petra', 'Peter', 'Patricia', 'Philipp', 'Pauline',
  'Raphael', 'Regina', 'Robert', 'Renate', 'Rudolf', 'Ruth',
  'Stefan', 'Sabine', 'Simon', 'Susanne', 'Sebastian', 'Silvia',
  'Thomas', 'Theresa', 'Tobias', 'Tanja', 'Theodor', 'Tamara',
  'Ulrich', 'Ursula', 'Uwe', 'Ute', 'Urban', 'Ulrike',
  'Viktor', 'Veronica', 'Valentin', 'Vanessa', 'Vincent', 'Victoria',
  'Wolfgang', 'Waltraud', 'Walter', 'Wilhelmine', 'Wilhelm', 'Wanda'
];

const lastNames = [
  'Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer',
  'Wagner', 'Becker', 'Schulz', 'Hoffmann', 'Schäfer', 'Koch',
  'Bauer', 'Richter', 'Klein', 'Wolf', 'Schröder', 'Neumann',
  'Schwarz', 'Zimmermann', 'Braun', 'Krüger', 'Hofmann', 'Hartmann',
  'Lange', 'Schmitt', 'Werner', 'Schmitz', 'Krause', 'Meier',
  'Lehmann', 'Schmid', 'Schulze', 'Maier', 'Köhler', 'Herrmann',
  'König', 'Walter', 'Mayer', 'Huber', 'Kaiser', 'Fuchs',
  'Peters', 'Lang', 'Scholz', 'Möller', 'Weiß', 'Jung',
  'Hahn', 'Schubert', 'Schuster', 'Winkler', 'Berger', 'Frank',
  'Lorenz', 'Albrecht', 'Herman', 'Gross', 'Ludwig', 'Roth',
  'Maurer', 'Pichler', 'Steiner', 'Gruber', 'Brunner', 'Egger',
  'Bauer', 'Hofer', 'Leitner', 'Moser', 'Auer', 'Fuchs',
  'Wimmer', 'Winkler', 'Wagner', 'Schmid', 'Reiter', 'Berger'
];

const serviceCategories = [
  'Elektriker', 'Klempner', 'Maler', 'Tischler', 'Gartenpflege',
  'Reinigungsdienst', 'Handyman', 'Umzugshelfer', 'IT-Support',
  'Fotograf', 'Friseur', 'Kosmetik', 'Massage', 'Nachhilfe',
  'Babysitter', 'Tierbetreuung', 'Dachdecker', 'Automechaniker',
  'Schlosser', 'Masseur'
];

const federalStates = [
  'Wien', 'Niederösterreich', 'Oberösterreich', 'Salzburg',
  'Tirol', 'Vorarlberg', 'Kärnten', 'Steiermark', 'Burgenland'
];

const descriptions = {
  'Elektriker': [
    'Erfahrener Elektriker mit 15 Jahren Berufserfahrung. Spezialisiert auf Hausinstallationen, Reparaturen und Neuverkabelungen.',
    'Zertifizierter Elektrotechniker für alle elektrischen Arbeiten im Haushalt. Schnell, zuverlässig und fair.',
    'Meister-Elektriker mit eigenem Betrieb. Von der Steckdose bis zur kompletten Hausverkabelung - alles aus einer Hand.',
    'Junger, motivierter Elektriker mit Fokus auf moderne Smart-Home-Lösungen und LED-Beleuchtung.',
    'Familienbetrieb seit 3 Generationen. Elektrische Installationen, Reparaturen und 24h-Notdienst.'
  ],
  'Klempner': [
    'Sanitärprofi mit 20 Jahren Erfahrung. Rohrverstopfungen, Wasserschäden und Badmodernisierungen.',
    'Schneller Installateur für alle Wasserleitungsarbeiten. Notdienst auch am Wochenende verfügbar.',
    'Meisterbetrieb für Sanitär und Heizung. Komplette Badsanierung und Heizungsreparaturen.',
    'Junger Klempner mit fairen Preisen. Spezialisiert auf Reparaturen und kleinere Installationen.',
    'Erfahrener Sanitärinstallateur. Von der tropfenden Armatur bis zur neuen Heizungsanlage.'
  ],
  'Maler': [
    'Malermeister mit Fokus auf hochwertige Wohnraumgestaltung. Innen- und Außenanstriche in Perfektion.',
    'Kreativer Maler für individuelle Farbkonzepte. Wände, Decken, Fassaden - alles möglich.',
    'Familienbetrieb für Malerarbeiten aller Art. Günstig, schnell und sauber.',
    'Kunstmaler und Handwerker. Besondere Techniken wie Spachteltechnik und Wandmalerei.',
    'Erfahrener Maler mit eigenem Team. Große und kleine Projekte gleichermaßen willkommen.'
  ],
  'Tischler': [
    'Tischlermeister für individuelle Möbel nach Maß. Küchen, Schränke, Regale - alles aus Massivholz.',
    'Kreativer Schreiner mit Liebe zum Detail. Restaurierungen und Neuanfertigungen.',
    'Junger Tischler mit modernen Ideen. Nachhaltige Möbel aus heimischen Hölzern.',
    'Traditioneller Handwerksbetrieb. Türen, Fenster, Möbel - seit 30 Jahren in der Region.',
    'Möbeltischler mit eigener Werkstatt. Von der Planung bis zur Montage alles aus einer Hand.'
  ],
  'Gartenpflege': [
    'Gärtner mit grünem Daumen. Rasenpflege, Heckenschnitt und Gartengestaltung das ganze Jahr.',
    'Landschaftsgärtner für alle Gartenarbeiten. Neuanlagen, Pflege und Baumschnitt.',
    'Erfahrener Gartenpfleger mit eigenem Equipment. Zuverlässig und termingerecht.',
    'Biologischer Gartenbau ohne Chemie. Natürliche Pflege für gesunde Gärten.',
    'Garten- und Landschaftsbau. Von der kleinen Reparatur bis zur kompletten Neugestaltung.'
  ],
  'Reinigungsdienst': [
    'Professionelle Reinigungskraft für Haushalte und Büros. Gründlich, zuverlässig und diskret.',
    'Reinigungsservice mit 10 Jahren Erfahrung. Wohnung, Haus, Büro - alles blitzsauber.',
    'Ökologische Reinigung mit umweltfreundlichen Produkten. Für ein gesundes Wohnklima.',
    'Schnelle Reinigungshilfe für den Privathaushalt. Flexibel und zu fairen Preisen.',
    'Reinigungsteam für größere Objekte. Büros, Praxen, Geschäfte - professionell gereinigt.'
  ],
  'Handyman': [
    'Allround-Handwerker für alle kleinen Reparaturen. Was kaputt ist, wird wieder repariert.',
    'Erfahrener Handyman mit vollem Werkzeugkoffer. Montagen, Reparaturen, kleine Umbauten.',
    'Hilfsarbeiter für Haus und Garten. Zuverlässig und zu fairen Stundensätzen.',
    'Pensionierter Handwerker hilft gerne weiter. Über 40 Jahre Berufserfahrung.',
    'Junger Handwerker lernt noch dazu. Günstige Preise für einfache Arbeiten.'
  ],
  'Umzugshelfer': [
    'Kräftiger Umzugshelfer mit eigenem Transporter. Schnell und schonend für Ihr Hab und Gut.',
    'Umzugsteam mit Erfahrung. Verpacken, transportieren, aufbauen - alles möglich.',
    'Student hilft beim Umzug. Günstig und flexibel, besonders an Wochenenden.',
    'Professionelle Umzugshilfe mit Möbelmontage. Ihr Umzug in sicheren Händen.',
    'Starke Helfer für schwere Lasten. Klaviere, Safes, große Möbel - kein Problem.'
  ],
  'IT-Support': [
    'Computer-Spezialist für alle IT-Probleme. Reparaturen, Installationen, Beratung.',
    'Erfahrener IT-Techniker. Hardware-Reparaturen und Software-Installation für Privatkunden.',
    'Junger Informatiker hilft bei Computer-Problemen. Günstige Hilfe für Senioren.',
    'System-Administrator mit 15 Jahren Erfahrung. Netzwerke, Server, Sicherheit.',
    'PC-Doktor für Haus und Büro. Schnelle Hilfe bei Viren, Abstürzen und langsamen Computern.'
  ],
  'Fotograf': [
    'Hochzeitsfotograf mit künstlerischem Anspruch. Ihre schönsten Momente professionell festgehalten.',
    'Portrait-Fotograf für Business und Privat. Natürliche Fotos mit Charakter.',
    'Event-Fotograf für alle Anlässe. Geburtstage, Firmenfeiern, Familienfeste.',
    'Landschaftsfotograf bietet auch Portraits an. Kreative Bilder in natürlicher Umgebung.',
    'Günstige Fotografie für jedermann. Bewerbungsfotos, Familienbilder, kleine Events.'
  ]
};

const jobDescriptions = [
  // Elektriker Aufträge
  'Suche Elektriker für Steckdosen-Installation im Wohnzimmer. 3 neue Steckdosen benötigt.',
  'Sicherungskasten ist defekt und springt ständig raus. Brauche schnelle Hilfe.',
  'LED-Beleuchtung in der Küche installieren. Spots unter den Hängeschränken.',
  'Alte Verkabelung im Keller erneuern. Feuchtigkeitsschäden vorhanden.',
  'Smart Home System installieren. Schalter und Dimmer sollen vernetzt werden.',
  'Außensteckdose für Garten benötigt. Erdkabel muss verlegt werden.',
  'Deckenventilator im Schlafzimmer montieren und anschließen.',
  'Elektroheizung in der Garage installieren. Starkstrom vorhanden.',
  'Lichtschalter in der Wohnung austauschen. 8 Schalter betroffen.',
  'Bewegungsmelder für Hauseingang installieren. Sicherheitsbeleuchtung gewünscht.',

  // Klempner Aufträge
  'Wasserhahn in der Küche tropft seit Tagen. Reparatur oder Austausch nötig.',
  'Toilettenspülung läuft ständig durch. Spülkasten muss repariert werden.',
  'Duschkopf verstopft und Wasserdruck sehr schwach. Reinigung erforderlich.',
  'Heizung wird nicht warm. Thermostat oder Pumpe defekt?',
  'Neue Armatur im Badezimmer montieren. Moderne Einhebelmischbatterie.',
  'Rohrbruch im Keller! Notfall - brauche sofortige Hilfe.',
  'Waschmaschinenanschluss in der Küche installieren. Wasser und Abfluss.',
  'Badewanne gegen ebenerdige Dusche tauschen. Kompletter Umbau.',
  'Gartenwasserhahn winterfest machen. Frostschutz für Außenleitung.',
  'Verstopfter Abfluss in der Küche. Rohrreinigung dringend nötig.',

  // Maler Aufträge
  'Wohnzimmer streichen lassen. Ca. 25m² Wandfläche, weiße Farbe gewünscht.',
  'Kinderzimmer in bunten Farben gestalten. Kreative Wandmalerei erwünscht.',
  'Fassade des Einfamilienhauses streichen. Gerüst ist vorhanden.',
  'Altbau-Wohnung renovieren. Wände spachteln und tapezieren.',
  'Garage von innen streichen. Betonwände, ca. 30m² Fläche.',
  'Treppenhaus im Mehrfamilienhaus erneuern. 3 Stockwerke.',
  'Decke im Badezimmer streichen. Feuchtigkeitsresistente Farbe nötig.',
  'Holzzaun im Garten lasieren. Wetterschutz für 20 Meter Zaun.',
  'Kellerräume weißeln. Sauberer Anstrich für Lagerräume.',
  'Büroräume in Firmenfarben gestalten. Professioneller Look gewünscht.',

  // Tischler Aufträge
  'Neue Küche nach Maß planen und bauen. Moderner Stil, viel Stauraum.',
  'Schiebetüren für begehbaren Kleiderschrank. 2,5m breit, Massivholz.',
  'Regal für Wohnzimmer anfertigen. Bücher und Dekoration, 3m lang.',
  'Tisch und Stühle für Esszimmer. 6 Personen, Eiche massiv.',
  'Kinderbett mitwachsend bauen. Soll vom Baby- bis zum Jugendalter halten.',
  'Einbauschrank unter der Dachschräge. Optimale Raumnutzung gewünscht.',
  'Fenster im Altbau erneuern. Doppelverglasung, Holzrahmen passend zum Stil.',
  'Türzarge reparieren. Scharnier ausgerissen, Holz muss ergänzt werden.',
  'Gartenbank aus wetterbeständigem Holz. Für 4 Personen, stabil.',
  'Arbeitsplatte in der Küche austauschen. Granit oder Holz möglich.',

  // Gartenpflege Aufträge
  'Rasen mähen und Hecke schneiden. 200m² Garten, einmalig.',
  'Obstbäume beschneiden. 3 Apfelbäume und 2 Kirschbäume.',
  'Garten winterfest machen. Pflanzen abdecken, Laub entfernen.',
  'Neue Blumenbeete anlegen. Stauden pflanzen, Erde aufbereiten.',
  'Bambushecke entfernen. Wurzeln müssen komplett raus.',
  'Rollrasen verlegen. 150m² Fläche vorbereitet, Rasen bestellt.',
  'Gartenteich reinigen. Schlamm entfernen, Pflanzen zurückschneiden.',
  'Terrasse bepflanzen. Kübelpflanzen arrangieren, Bewässerung einrichten.',
  'Gemüsegarten anlegen. Hochbeete bauen, Erde einfüllen.',
  'Sträucher und Büsche zurückschneiden. Frühjahrsschnitt erforderlich.',

  // Reinigung Aufträge
  'Wohnungsreinigung nach Renovierung. Feinstaub überall, gründlich putzen.',
  'Regelmäßige Haushaltsreinigung. 2x monatlich, 80m² Wohnung.',
  'Büroreinigung am Wochenende. 200m² Bürofläche, Sanitäranlagen.',
  'Fenster putzen am Einfamilienhaus. Innen und außen, 2 Stockwerke.',
  'Teppichreinigung im Wohnzimmer. Großer Perserteppich, Flecken entfernen.',
  'Grundreinigung vor Umzug. Leere Wohnung komplett reinigen.',
  'Garagenreinigung nach Umbau. Staub und Schmutz entfernen.',
  'Balkon und Terrasse reinigen. Hochdruckreiniger gewünscht.',
  'Küchenreinigung nach Party. Fett und Gerüche entfernen.',
  'Wintergarten putzen. Viele Glasflächen, Rahmen reinigen.',

  // Handyman Aufträge
  'Bilder aufhängen und Regale montieren. 10 Bilder verschiedene Größen.',
  'Waschmaschine anschließen. Wasserzulauf und Abfluss vorhanden.',
  'Lampe in der Küche austauschen. Anschluss ist vorhanden.',
  'Türklinke reparieren. Griff wackelt, Schraube ausgeleiert.',
  'Rolladen justieren. Lässt sich schwer bewegen, hängt schief.',
  'Gartentor reparieren. Scharnier kaputt, neue Beschläge nötig.',
  'Fliesen im Bad austauschen. 5 Fliesen sind gesprungen.',
  'Wanddurchbruch verschließen. Kleine Öffnung, sauber verputzen.',
  'Terrasse fegen und reinigen. Moos zwischen den Fugen entfernen.',
  'Kleinen Zaun reparieren. 2 Latten sind gebrochen.',

  // Umzug Aufträge
  'Umzug von 3-Zimmer Wohnung. 2. Stock ohne Lift, nur wenige Möbel.',
  'Klaviertransport in den 4. Stock. Schwerer Flügel, Treppenhaus eng.',
  'Studentenumzug. Nur Kisten und kleine Möbel, günstiger Transporter.',
  'Büroumzug am Wochenende. Computer, Schreibtische, Aktenschränke.',
  'Nur schwere Möbel transportieren. Schrank, Sofa, Waschmaschine.',
  'Fernumzug nach Deutschland. Professionelle Verpackung nötig.',
  'Keller ausräumen. Viele alte Sachen, Entsorgung erwünscht.',
  'Ein-Zimmer Apartment räumen. Wenig Zeug, schnell erledigen.',
  'Gartenhaus transportieren. Vorgefertigt, nur aufstellen nötig.',
  'Seniorenumzug ins Pflegeheim. Einfühlsam und geduldig.',

  // IT Support Aufträge
  'Computer ist langsam geworden. Windows neu installieren oder reinigen?',
  'Internet funktioniert nicht. WLAN-Probleme seit gestern.',
  'Handy mit Computer verbinden. Fotos übertragen und sichern.',
  'Neuen Drucker installieren. WLAN-Drucker einrichten.',
  'Virus auf dem Computer. Antivirus-Programm installieren.',
  'Laptop-Bildschirm ist schwarz. Hardware-Problem oder Software?',
  'E-Mail einrichten. Neue Adresse auf Handy und Computer.',
  'Backup erstellen. Wichtige Daten sichern, System aufräumen.',
  'Neuen Computer kaufen. Beratung und Installation gewünscht.',
  'Smart-TV mit Internet verbinden. Streaming-Dienste einrichten.',

  // Fotografie Aufträge
  'Bewerbungsfotos für Job. Professionell und seriös, indoor shooting.',
  'Kindergeburtstag fotografieren. 8 Kinder, lebendige Bilder gewünscht.',
  'Familienfotos im Park. Großfamilie mit 3 Generationen.',
  'Produktfotos für Online-Shop. Schmuck fotografieren, weißer Hintergrund.',
  'Hochzeit dokumentieren. Ganzer Tag, Kirche und Feier.',
  'Babyfotos nach der Geburt. Neugeborenen-Shooting zuhause.',
  'Firmenevent fotografieren. Präsentation und Networking dokumentieren.',
  'Verlobungsfotos im Freien. Romantische Bilder vor Sonnenuntergang.',
  'Haustierfotografie. Hund und Katze zusammen ablichten.',
  'Renovierung dokumentieren. Vorher-Nachher Bilder für Versicherung.'
];

const locations = [
  'Wien 1010', 'Wien 1020', 'Wien 1030', 'Wien 1040', 'Wien 1050',
  'Wien 1060', 'Wien 1070', 'Wien 1080', 'Wien 1090', 'Wien 1100',
  'Wien 1110', 'Wien 1120', 'Wien 1130', 'Wien 1140', 'Wien 1150',
  'Wien 1160', 'Wien 1170', 'Wien 1180', 'Wien 1190', 'Wien 1200',
  'Wien 1210', 'Wien 1220', 'Wien 1230',
  'Graz', 'Linz', 'Salzburg', 'Innsbruck', 'Klagenfurt',
  'Villach', 'Wels', 'Sankt Pölten', 'Dornbirn', 'Steyr',
  'Wiener Neustadt', 'Feldkirch', 'Bregenz', 'Leonding', 'Klosterneuburg',
  'Baden bei Wien', 'Wolfsberg', 'Leoben', 'Krems', 'Traun',
  'Amstetten', 'Kapfenberg', 'Mödling', 'Hallein', 'Kufstein',
  'Traiskirchen', 'Schwechat', 'Braunau am Inn', 'Stockerau', 'Saalfelden',
  'Ansfelden', 'Tulln', 'Hohenems', 'Spittal an der Drau', 'Telfs',
  'Ternitz', 'Perchtoldsdorf', 'Feldkirchen', 'Bludenz', 'Bad Ischl',
  'Eisenstadt', 'Rankweil', 'Hollabrunn', 'Enns', 'Lustenau',
  'Mistelbach', 'Schwaz', 'Kitzbühel', 'Gmunden', 'Wörgl'
];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements(array, count) {
  const shuffled = array.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateEmail(firstName, lastName) {
  const domains = ['gmail.com', 'hotmail.com', 'yahoo.com', 'gmx.at', 'web.de', 'aon.at'];
  const variations = [
    `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}${Math.floor(Math.random() * 99)}`,
    `${lastName.toLowerCase()}${firstName.charAt(0).toLowerCase()}`,
  ];
  return `${getRandomElement(variations)}@${getRandomElement(domains)}`;
}

function generatePhoneNumber() {
  const prefixes = ['0650', '0660', '0664', '0676', '0680', '0699', '01', '0316', '0732'];
  const prefix = getRandomElement(prefixes);
  const number = Math.floor(Math.random() * 9000000) + 1000000;
  return `${prefix} ${number.toString().replace(/(\d{3})(\d{4})/, '$1 $2')}`;
}

function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Benutzer und Profile erstellen
function createUsers() {
  return new Promise((resolve, reject) => {
    const users = [];
    const profiles = [];
    
    for (let i = 0; i < 500; i++) {
      const firstName = getRandomElement(firstNames);
      const lastName = getRandomElement(lastNames);
      const email = generateEmail(firstName, lastName);
      const password = hashPassword('123456'); // Einfaches Passwort für alle
      
      const user = {
        email,
        password,
        status: 'active',
        isAdmin: false,
        createdAt: new Date().toISOString()
      };
      
      users.push(user);
      
      // Profile für 90% der Benutzer erstellen
      if (Math.random() < 0.9) {
        const services = getRandomElements(serviceCategories, Math.floor(Math.random() * 3) + 1);
        const regions = getRandomElements(federalStates, Math.floor(Math.random() * 2) + 1);
        const availablePeriods = getRandomElements(['Vormittag', 'Nachmittag', 'Abend', 'Wochenende'], Math.floor(Math.random() * 3) + 1);
        
        const primaryService = services[0];
        const serviceDescriptions = descriptions[primaryService] || ['Erfahrener Dienstleister mit langjähriger Berufserfahrung.'];
        
        const profile = {
          userId: i + 1, // User IDs starten bei 1
          firstName,
          lastName,
          description: getRandomElement(serviceDescriptions),
          services: JSON.stringify(services),
          regions: JSON.stringify(regions),
          phoneNumber: generatePhoneNumber(),
          email,
          socialMedia: Math.random() < 0.3 ? `https://instagram.com/${firstName.toLowerCase()}${lastName.toLowerCase()}` : '',
          availablePeriods: JSON.stringify(availablePeriods),
          isAvailable: Math.random() < 0.8, // 80% sind verfügbar
          profileImage: null,
          createdAt: new Date().toISOString()
        };
        
        profiles.push(profile);
      }
    }
    
    // Benutzer in Datenbank einfügen
    const userStmt = db.prepare(`
      INSERT INTO users (email, password, status, isAdmin, createdAt)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const profileStmt = db.prepare(`
      INSERT INTO profiles (userId, firstName, lastName, description, services, regions, phoneNumber, email, socialMedia, availablePeriods, isAvailable, profileImage, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    db.serialize(() => {
      users.forEach(user => {
        userStmt.run([user.email, user.password, user.status, user.isAdmin, user.createdAt]);
      });
      
      profiles.forEach(profile => {
        profileStmt.run([
          profile.userId, profile.firstName, profile.lastName, profile.description,
          profile.services, profile.regions, profile.phoneNumber, profile.email,
          profile.socialMedia, profile.availablePeriods, profile.isAvailable,
          profile.profileImage, profile.createdAt
        ]);
      });
      
      userStmt.finalize();
      profileStmt.finalize();
      
      console.log(`${users.length} Benutzer und ${profiles.length} Profile erstellt.`);
      resolve();
    });
  });
}

// Aufträge erstellen
function createJobs() {
  return new Promise((resolve, reject) => {
    const jobs = [];
    
    for (let i = 0; i < 300; i++) {
      const category = getRandomElement(serviceCategories);
      const title = getRandomElement([
        `${category} gesucht in ${getRandomElement(locations)}`,
        `Schnelle Hilfe: ${category} benötigt`,
        `${category} für heute noch gesucht`,
        `Dringend: ${category} in ${getRandomElement(locations)}`,
        `${category} - faire Preise erwünscht`
      ]);
      
      const description = getRandomElement(jobDescriptions);
      const location = getRandomElement(locations);
      
      // Zufälliges Datum zwischen vor 30 Tagen und in 30 Tagen
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);
      const date = getRandomDate(startDate, endDate);
      
      const contactInfo = generateEmail(getRandomElement(firstNames), getRandomElement(lastNames));
      
      const job = {
        userId: Math.floor(Math.random() * 500) + 1, // Zufälliger Benutzer
        title,
        description,
        location,
        date: date.toISOString().split('T')[0] + 'T00:00:00.000Z',
        contactInfo,
        category,
        images: null,
        status: 'active',
        createdAt: new Date().toISOString()
      };
      
      jobs.push(job);
    }
    
    // Aufträge in Datenbank einfügen
    const jobStmt = db.prepare(`
      INSERT INTO job_listings (userId, title, description, location, date, contactInfo, category, images, status, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    db.serialize(() => {
      jobs.forEach(job => {
        jobStmt.run([
          job.userId, job.title, job.description, job.location,
          job.date, job.contactInfo, job.category, job.images,
          job.status, job.createdAt
        ]);
      });
      
      jobStmt.finalize();
      console.log(`${jobs.length} Aufträge erstellt.`);
      resolve();
    });
  });
}

// Haupt-Funktion
async function seedDatabase() {
  try {
    console.log('Beginne mit der Erstellung von Testdaten...');
    
    // Prüfe ob bereits Daten vorhanden sind
    db.get('SELECT COUNT(*) as count FROM users WHERE id > 4', async (err, row) => {
      if (err) {
        console.error('Fehler beim Prüfen der Datenbank:', err);
        return;
      }
      
      if (row.count > 0) {
        console.log('Datenbank enthält bereits Testdaten. Lösche vorhandene Daten...');
        
        // Lösche vorhandene Testdaten (aber nicht die ersten 4 Admin-Benutzer)
        db.serialize(() => {
          db.run('DELETE FROM job_listings WHERE userId > 4');
          db.run('DELETE FROM profiles WHERE userId > 4'); 
          db.run('DELETE FROM users WHERE id > 4');
          
          console.log('Vorhandene Testdaten gelöscht.');
        });
      }
      
      // Erstelle neue Testdaten
      await createUsers();
      await createJobs();
      
      console.log('\n✅ Testdaten erfolgreich erstellt!');
      console.log('📊 500 realistische Profile');
      console.log('📝 300 realistische Aufträge');
      console.log('🎯 Alle Kategorien abgedeckt');
      console.log('🇦🇹 Österreichische Namen und Orte');
      
      db.close();
    });
    
  } catch (error) {
    console.error('Fehler beim Erstellen der Testdaten:', error);
    db.close();
  }
}

// Starte den Seeding-Prozess
seedDatabase();