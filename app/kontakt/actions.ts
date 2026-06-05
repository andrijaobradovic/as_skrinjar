"use server";

import { headers } from "next/headers";
import { Resend } from "resend";

import {
  checkContactRateLimit,
  recordContactSubmission,
} from "@/lib/contact-rate-limit";
import {
  hasContactErrors,
  validateContactForm,
  type ContactFieldErrors,
} from "@/lib/contact-validation";

export type ContactState =
  | { success: true }
  | { success: false; errors?: ContactFieldErrors; error?: string }
  | null;

function getClientIp(headerStore: Headers): string {
  const forwarded = headerStore.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  return headerStore.get("x-real-ip") ?? "unknown";
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function submitContactForm(
  _prevState: ContactState,
  formData: FormData
): Promise<ContactState> {
  const honeypot = String(formData.get("website") ?? "").trim();
  if (honeypot) {
    return { success: true };
  }

  const values = {
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    subject: String(formData.get("subject") ?? "").trim(),
    message: String(formData.get("message") ?? "").trim(),
  };

  const errors = validateContactForm(values);
  if (hasContactErrors(errors)) {
    return { success: false, errors };
  }

  const headerStore = await headers();
  const ip = getClientIp(headerStore);

  if (!checkContactRateLimit(ip)) {
    return {
      success: false,
      error: "Previše zahteva. Pokušajte ponovo za nekoliko minuta.",
    };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not set");
    return {
      success: false,
      error: "Slanje poruke trenutno nije moguće. Pokušajte kasnije.",
    };
  }

  const resend = new Resend(apiKey);
  const fromEmail =
    process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

  const { error } = await resend.emails.send({
    from: `AS Škrinjar <${fromEmail}>`,
    to: "info@as.skrinjar.rs",
    replyTo: values.email,
    subject: `Kontakt forma: ${values.subject}`,
    html: `
      <h2>Nova poruka sa kontakt forme</h2>
      <p><strong>Ime:</strong> ${escapeHtml(values.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(values.email)}</p>
      <p><strong>Telefon:</strong> ${escapeHtml(values.phone)}</p>
      <p><strong>Tema:</strong> ${escapeHtml(values.subject)}</p>
      <p><strong>Poruka:</strong></p>
      <p>${escapeHtml(values.message).replace(/\n/g, "<br>")}</p>
    `,
  });

  if (error) {
    console.error("Resend error:", error);
    return {
      success: false,
      error: "Slanje poruke nije uspelo. Pokušajte ponovo.",
    };
  }

  recordContactSubmission(ip);
  return { success: true };
}
