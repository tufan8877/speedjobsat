import { federalStates, serviceCategories, availabilityPeriods } from "@shared/schema";

// App meta data
export const APP_NAME = "speedjobs.at";
export const APP_DESCRIPTION = "Lokale Dienstleister in Österreich finden";
export const ADMIN_EMAIL = "tufan777@gmx.at";

// Form validation messages
export const VALIDATION_MESSAGES = {
  REQUIRED: "Dieses Feld ist erforderlich",
  EMAIL_INVALID: "Bitte geben Sie eine gültige E-Mail-Adresse ein",
  PASSWORD_MIN: "Passwort muss mindestens 6 Zeichen lang sein",
  PASSWORD_MISMATCH: "Passwörter stimmen nicht überein",
  MIN_SERVICE: "Wählen Sie mindestens eine Dienstleistung",
  MIN_REGION: "Wählen Sie mindestens ein Bundesland",
  CONTACT_REQUIRED: "Mindestens eine Kontaktmöglichkeit ist erforderlich",
  MIN_RATING: "Bitte geben Sie eine Bewertung ab"
};

// Select options
export const SELECT_OPTIONS = {
  FEDERAL_STATES: federalStates.map(state => ({ 
    label: state, 
    value: state 
  })),
  
  SERVICE_CATEGORIES: serviceCategories.map(service => ({ 
    label: service, 
    value: service 
  })),
  
  AVAILABILITY_PERIODS: availabilityPeriods.map(period => ({ 
    label: period, 
    value: period 
  })),
  
  SORT_OPTIONS: [
    { label: "Bestbewertet", value: "rating" },
    { label: "Neueste", value: "newest" },
    { label: "Meiste Bewertungen", value: "reviews" }
  ]
};

// Avatar placeholders
export const DEFAULT_AVATAR_COLOR = "bg-primary";
export const DEFAULT_AVATAR_TEXT_COLOR = "text-white";

// Icons mapping for service categories
export const SERVICE_ICONS = {
  "Installateur": "wrench",
  "Mechaniker": "car",
  "Pflegekraft": "heart-pulse",
  "Elektriker": "zap",
  "Reinigungskraft": "spray-can",
  "Gärtner": "flower",
  "Tischler": "hammer",
  "Maler": "paint-bucket",
  "Fliesenleger": "grid",
  "Sonstiges": "briefcase"
};

// Availability formatting
export const AVAILABILITY_PERIOD_TIMES = {
  "Vormittag": "08:00 - 12:00",
  "Mittag": "12:00 - 14:00",
  "Nachmittag": "14:00 - 18:00"
};

// User status badges
export const USER_STATUS_BADGE = {
  "active": {
    variant: "success",
    label: "Aktiv"
  },
  "suspended": {
    variant: "destructive",
    label: "Gesperrt"
  },
  "deleted": {
    variant: "secondary",
    label: "Gelöscht"
  }
};

// Demo data counts for service categories (only for display)
export const SERVICE_PROVIDER_COUNTS = {
  "Installateur": 142,
  "Elektriker": 120,
  "Reinigung": 89,
  "Umzug": 64,
  "Transport": 45,
  "Gartenpflege": 76,
  "Haushaltshilfe": 53,
  "Kinderbetreuung": 32,
  "Seniorenbetreuung": 41,
  "Nachhilfe": 28,
  "Computer & IT": 67,
  "Handwerker": 98,
  "Maler": 81,
  "Dachdecker": 47,
  "Automechaniker": 55,
  "Schlosser": 39,
  "Masseur": 34
};
