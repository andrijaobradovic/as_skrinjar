const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateNewsletterEmail(email: string): string | undefined {
  const trimmed = email.trim();

  if (!trimmed) {
    return "Obavezno polje";
  }

  if (!EMAIL_PATTERN.test(trimmed)) {
    return "Unesite ispravnu e-mail adresu";
  }

  return undefined;
}
