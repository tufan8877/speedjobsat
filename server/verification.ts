import { randomBytes } from "crypto";

export function createVerificationData() {
  return {
    emailVerificationToken: randomBytes(32).toString("hex"),
    emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  };
}
