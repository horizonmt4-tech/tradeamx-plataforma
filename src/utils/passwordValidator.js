export const validatePassword = (password) => {
  const errors = [];
  
  if (!password || password.length < 8) {
    errors.push("Min 8 characters");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("At least 1 uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("At least 1 lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("At least 1 number");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const getPasswordRequirements = () => [
  "Mínimo 8 caracteres",
  "Al menos 1 letra mayúscula",
  "Al menos 1 letra minúscula",
  "Al menos 1 número"
];