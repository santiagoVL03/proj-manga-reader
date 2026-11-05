import { scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);

/**
 * Usuario de demostración, en memoria.
 * En una app real esto sale de la base de datos y el hash se genera al registrarse.
 * La contraseña es `demo1234`: aquí solo vive su hash scrypt con salt aleatorio.
 */
const DEMO_USER = {
  id: "demo-user",
  name: "Lector Demo",
  email: "demo@manga.dev",
  passwordHash:
    "3907404f4dfd836367b580ddd5b0ec73:3c37f19b7865330eec05976d7efacf4a93d8db0310b8f43a212f787f631c0a1332aa80d53cff62f92ee8e3faf146a4531832f4de0b2a456ebf2184eb552d20c0",
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

/** Compara la contraseña con el hash guardado. Devuelve el usuario o null. */
export async function verifyCredentials(
  email: string,
  password: string,
): Promise<AuthUser | null> {
  const [salt, expectedHex] = DEMO_USER.passwordHash.split(":");

  if (!salt || !expectedHex) {
    return null;
  }

  // Siempre calculamos el hash (aunque el email no exista) para no filtrar
  // por tiempo de respuesta si el usuario existe o no.
  const expected = Buffer.from(expectedHex, "hex");
  const actual = (await scrypt(password, salt, expected.length)) as Buffer;

  const passwordMatches =
    actual.length === expected.length && timingSafeEqual(actual, expected);

  if (!passwordMatches || email.trim().toLowerCase() !== DEMO_USER.email) {
    return null;
  }

  return { id: DEMO_USER.id, name: DEMO_USER.name, email: DEMO_USER.email };
}
