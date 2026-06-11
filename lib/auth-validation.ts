const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

const PHONE_RE = /^\+?[0-9\s()-]{10,18}$/;

const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export function validateEmail(email: string): string | null {
  const value = email.trim();
  if (!value) return "Email is required.";
  if (value.length > 254) return "Email is too long.";
  if (!EMAIL_RE.test(value)) return "Enter a valid email address.";
  return null;
}

export function validatePassword(password: string, forSignup = false): string | null {
  const value = password.trim();
  if (!value) return "Password is required.";
  if (forSignup) {
    if (!PASSWORD_RE.test(value)) {
      return "Password must be 8+ characters with upper, lower, and a number.";
    }
  } else if (value.length < 6) {
    return "Password must be at least 6 characters.";
  }
  return null;
}

export function validatePhone(phone: string): string | null {
  const value = phone.trim();
  if (!value) return "Phone number is required.";
  if (!PHONE_RE.test(value)) return "Enter a valid phone number (e.g. +234 802 000 0000).";
  return null;
}

export function validateName(name: string, label = "Name"): string | null {
  const value = name.trim();
  if (!value) return `${label} is required.`;
  if (value.length < 2) return `${label} is too short.`;
  if (value.length > 120) return `${label} is too long.`;
  return null;
}

export function sanitizeText(value: string, maxLen = 200): string {
  return value.trim().slice(0, maxLen);
}
