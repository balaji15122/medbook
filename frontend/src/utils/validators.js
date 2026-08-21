export const isValidEmail = (email) => {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

export const isValidPhone = (phone) => {
  if (!phone) return false;
  const cleanPhone = phone.replace(/[\s()-]/g, '');
  return cleanPhone.length >= 10 && /^\+?[0-9]+$/.test(cleanPhone);
};

export const isStrongPassword = (password) => {
  if (!password) return false;
  return password.length >= 6;
};
