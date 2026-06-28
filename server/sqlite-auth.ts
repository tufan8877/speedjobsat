// Kompatibilität für alte Imports.
// Der echte Auth-Code soll in server/auth.ts liegen und Postgres-Sessions nutzen.
export {
  setupAuth as setupSqliteAuth,
  isAuthenticated,
  isAdmin,
  hashPassword,
  comparePasswords,
} from "./auth";
