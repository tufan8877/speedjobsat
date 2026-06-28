// Kompatibilität für alte Imports.
// Der echte Auth-Code liegt in server/auth.ts und nutzt Postgres-Sessions.
export {
  setupAuth as setupSqliteAuth,
  isAuthenticated,
  isAdmin,
} from "./auth";
