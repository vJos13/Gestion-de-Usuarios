const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Valida los datos de un usuario; devuelve un mensaje de error o null
function validateUser({ name, email } = {}) {
  if (typeof name !== 'string' || !name.trim()) return 'El nombre es obligatorio';
  if (name.length > 100) return 'El nombre no puede superar 100 caracteres';
  if (typeof email !== 'string' || !EMAIL_REGEX.test(email)) return 'El email no es válido';
  if (email.length > 100) return 'El email no puede superar 100 caracteres';
  return null;
}

// Valida que el id de SQL Server sea un entero positivo
function parseSqlId(id) {
  const n = Number(id);
  return Number.isInteger(n) && n > 0 ? n : null;
}

module.exports = { validateUser, parseSqlId };
