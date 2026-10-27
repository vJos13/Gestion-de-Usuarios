const mongoose = require('mongoose');

// Registro histórico (log) de eventos de los usuarios
const eventSchema = new mongoose.Schema({
  userId: { type: String }, // _id del usuario en MongoDB
  action: { type: String, required: true }, // CREATE_USER, READ_USERS, READ_USER, UPDATE_USER o DELETE_USER
  description: { type: String, default: '' },
  source: { type: String, enum: ['mongodb', 'manual'], default: 'manual' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Event', eventSchema);
