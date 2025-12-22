import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Stelle sicher, dass das Upload-Verzeichnis existiert
const uploadDir = path.join(process.cwd(), 'uploads', 'jobs');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Konfiguration für Datei-Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Eindeutiger Dateiname mit Zeitstempel
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Dateifilter für Bilder
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Nur Bilddateien sind erlaubt (JPEG, PNG, GIF, WebP)'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB pro Datei
    files: 5 // Maximal 5 Dateien
  }
});