export const CONTACT_LIMITS = {
  subjectMax: 30,
  messageMax: 500,
} as const;

export type ContactFieldErrors = {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
};

export type ContactFormValues = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim());
}

export function isValidSerbianPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 9) return false;

  if (digits.startsWith("381")) {
    const local = digits.slice(3);
    return local.length >= 8 && local.length <= 10;
  }

  if (digits.startsWith("0")) {
    return digits.length >= 9 && digits.length <= 11;
  }

  return digits.length >= 9 && digits.length <= 10;
}

export function validateContactForm(
  values: ContactFormValues
): ContactFieldErrors {
  const errors: ContactFieldErrors = {};

  if (!values.name.trim()) {
    errors.name = "Obavezno polje";
  }

  if (!values.email.trim()) {
    errors.email = "Obavezno polje";
  } else if (!isValidEmail(values.email)) {
    errors.email = "Unesite ispravnu mejl adresu";
  }

  if (!values.phone.trim()) {
    errors.phone = "Obavezno polje";
  } else if (!isValidSerbianPhone(values.phone)) {
    errors.phone = "Unesite ispravan broj telefona";
  }

  if (!values.subject.trim()) {
    errors.subject = "Obavezno polje";
  } else if (values.subject.trim().length > CONTACT_LIMITS.subjectMax) {
    errors.subject = `Tema može imati najviše ${CONTACT_LIMITS.subjectMax} karaktera`;
  }

  if (!values.message.trim()) {
    errors.message = "Obavezno polje";
  } else if (values.message.length > CONTACT_LIMITS.messageMax) {
    errors.message = `Poruka može imati najviše ${CONTACT_LIMITS.messageMax} znakova`;
  }

  return errors;
}

export function hasContactErrors(errors: ContactFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}
