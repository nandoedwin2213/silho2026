import bcrypt from "bcryptjs";
import { createHash, randomInt } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";
import { generateReferralCode } from "./rewards";
import { rateLimit } from "./rate-limit";
import { accountLoginSchema, accountRegistrationSchema } from "./validation/account";
import { getAuthSecret } from "./auth-secret";
import { canClaimPatient } from "./patient-claim";
import { sendEmail } from "./notifications";

export const patientCookieName = "silho-patient-session";
const sessionDuration = 60 * 60 * 24 * 30;
const secret = () => new TextEncoder().encode(getAuthSecret());

type RegistrationInput = {
  firstName: string;
  lastName: string;
  documentId: string;
  email: string;
  phone: string;
  city?: string;
  password: string;
  referralCode?: string;
  claimCode?: string;
};

const claimCookieName = "silho-claim";
const claimError = "Debe verificar su correo para vincular su historial.";
const unavailableEmailError = "La verificación por correo no está disponible; escríbanos por WhatsApp para vincular su cuenta.";

export async function requestClaimCode({ documentId, email, phone = "" }: { documentId: string; email: string; phone?: string }) {
  const parsedEmail = email.trim().toLowerCase();
  const limited = rateLimit(`patient-claim:${documentId.trim()}`, 5);
  if (!limited.success) throw new Error("Demasiadas solicitudes. Inténtelo nuevamente más tarde.");
  const patient = await db.patient.findUnique({ where: { documentId: documentId.trim() } });
  if (!patient || !canClaimPatient(patient, { email: parsedEmail, phone })) {
    throw new Error("Ya existe un registro con este documento. Escríbanos por WhatsApp para vincular su cuenta.");
  }
  const code = String(randomInt(100000, 1000000));
  const codeHash = createHash("sha256").update(code).digest("hex");
  const token = await new SignJWT({ documentId: documentId.trim(), email: parsedEmail, codeHash })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(secret());
  const delivery = await sendEmail({ to: parsedEmail, subject: "Código de verificación SILHO", html: `<p>Su código de verificación SILHO es <strong>${code}</strong>. Vence en 15 minutos.</p>` });
  if (!delivery.sent) throw new Error(unavailableEmailError);
  (await cookies()).set(claimCookieName, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 900, path: "/" });
}

export async function registerPatient(input: RegistrationInput) {
  const parsed = accountRegistrationSchema.parse(input);
  const normalizedEmail = parsed.email.toLowerCase();
  const limited = rateLimit(`patient-register:${normalizedEmail}`, 5);
  if (!limited.success) throw new Error("Demasiadas solicitudes. Inténtelo nuevamente más tarde.");
  const existingAccount = await db.patientAccount.findUnique({ where: { email: normalizedEmail } });
  if (existingAccount) throw new Error("Ya existe una cuenta con este correo.");

  const result = await db.$transaction(async (tx) => {
    let patient = await tx.patient.findUnique({ where: { documentId: parsed.documentId } });
    if (!patient) {
      patient = await tx.patient.create({
        data: {
          firstName: parsed.firstName,
          lastName: parsed.lastName,
          documentId: parsed.documentId,
          email: normalizedEmail,
          phone: parsed.phone,
          city: parsed.city || null,
        },
      });
    } else {
      if (!canClaimPatient(patient, { email: normalizedEmail, phone: parsed.phone })) {
        throw new Error("Ya existe un registro con este documento. Escríbanos por WhatsApp para vincular su cuenta.");
      }
      const claimToken = (await cookies()).get(claimCookieName)?.value;
      let verified = false;
      if (claimToken && parsed.claimCode) {
        try {
          const { payload } = await jwtVerify(claimToken, secret());
          verified = payload.documentId === parsed.documentId && payload.email === normalizedEmail && payload.codeHash === createHash("sha256").update(parsed.claimCode).digest("hex");
        } catch {
          verified = false;
        }
      }
      if (!verified) throw new Error(claimError);
      const updates: { email?: string; phone?: string; city?: string } = {};
      if (!patient.email) updates.email = normalizedEmail;
      if (!patient.phone) updates.phone = parsed.phone;
      if (!patient.city && parsed.city) updates.city = parsed.city;
      if (Object.keys(updates).length > 0) patient = await tx.patient.update({ where: { id: patient.id }, data: updates });
      if (await tx.patientAccount.findUnique({ where: { patientId: patient.id } })) throw new Error("Este paciente ya tiene una cuenta.");
    }

    let referredById: string | undefined;
    if (parsed.referralCode) {
      const referrer = await tx.patientAccount.findUnique({ where: { referralCode: parsed.referralCode.toUpperCase() } });
      if (!referrer) throw new Error("El código de referido no es válido.");
      if (referrer.patientId === patient.id) throw new Error("No puede usar su propio código de referido.");
      referredById = referrer.id;
    }

    const account = await tx.patientAccount.create({
      data: {
        patientId: patient.id,
        email: normalizedEmail,
        passwordHash: await bcrypt.hash(parsed.password, 12),
        referralCode: generateReferralCode(parsed.firstName),
        referredById,
      },
    });
    return { account, patient };
  });

  await setPatientSession({ accountId: result.account.id, patientId: result.patient.id, email: result.account.email });
  (await cookies()).set(claimCookieName, "", { maxAge: 0, path: "/" });
  return result;
}

export async function loginPatient(email: string, password: string) {
  const parsed = accountLoginSchema.parse({ email, password });
  const limited = rateLimit(`patient-login:${parsed.email.toLowerCase()}`, 8);
  if (!limited.success) throw new Error("Demasiados intentos. Inténtelo nuevamente más tarde.");
  const account = await db.patientAccount.findUnique({ where: { email: parsed.email.toLowerCase() } });
  if (!account || !(await bcrypt.compare(parsed.password, account.passwordHash))) throw new Error("Correo o contraseña incorrectos.");
  await setPatientSession({ accountId: account.id, patientId: account.patientId, email: account.email });
  return account;
}

async function setPatientSession(payload: { accountId: string; patientId: string; email: string }) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret());
  (await cookies()).set(patientCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: sessionDuration,
    path: "/",
  });
}

export async function getPatientSession() {
  const token = (await cookies()).get(patientCookieName)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (typeof payload.patientId !== "string" || typeof payload.accountId !== "string") return null;
    return { patientId: payload.patientId, accountId: payload.accountId, email: typeof payload.email === "string" ? payload.email : "" };
  } catch {
    return null;
  }
}

export async function requirePatient(next?: string) {
  const session = await getPatientSession();
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "";
  if (!session) redirect(safeNext ? `/cuenta/ingresar?next=${encodeURIComponent(safeNext)}` : "/cuenta/ingresar");
  return session;
}

export async function logoutPatient() {
  (await cookies()).delete(patientCookieName);
  redirect("/cuenta/ingresar");
}
