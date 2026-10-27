const Event = require('../models/event');

// Registra un evento de un usuario de MongoDB sin interrumpir la operación principal si falla
async function logEvent(action, { userId, description = '', source = 'mongodb' } = {}) {
  try {
    await Event.create({ action, userId: userId != null ? String(userId) : undefined, description, source });
  } catch (err) {
    console.error('No se pudo registrar el evento:', err.message);
  }
}

module.exports = { logEvent };
