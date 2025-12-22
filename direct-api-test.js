// Direkter API Test für Job-Erstellung
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Öffne die SQLite-Datenbank direkt
const dbPath = path.join(__dirname, 'data', 'speedjobs.db');
const db = new sqlite3.Database(dbPath);

// Erstelle einen Job direkt in der Datenbank
const newJob = {
  userId: 75, // User ID von musteremail@hotmail.com
  title: 'DIREKTER DATENBANK TEST',
  description: 'Dieser Job wurde direkt in die Datenbank eingefügt um zu testen ob das Problem am API liegt',
  location: 'Wien',
  category: 'Reinigung',
  contactInfo: 'test@speedjobs.at',
  date: new Date().toISOString(),
  images: null,
  status: 'active',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const insertQuery = `
  INSERT INTO job_listings (userId, title, description, location, category, contactInfo, date, images, status, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

db.run(insertQuery, [
  newJob.userId,
  newJob.title, 
  newJob.description,
  newJob.location,
  newJob.category,
  newJob.contactInfo,
  newJob.date,
  newJob.images,
  newJob.status,
  newJob.createdAt,
  newJob.updatedAt
], function(err) {
  if (err) {
    console.error('Fehler beim Einfügen:', err);
  } else {
    console.log('Job erfolgreich erstellt mit ID:', this.lastID);
  }
  db.close();
});