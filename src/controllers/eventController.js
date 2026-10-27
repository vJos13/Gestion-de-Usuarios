const mongoose = require('mongoose');
const Event = require('../models/event');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Crear evento
exports.createEvent = async (req, res) => {
  const { userId, action, description } = req.body;
  if (typeof action !== 'string' || !action.trim()) {
    return res.status(400).json({ error: 'La acción es obligatoria' });
  }
  try {
    const event = await Event.create({ userId, action: action.trim(), description, source: 'manual' });
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ error: 'Error creando evento: ' + err.message });
  }
};

// Obtener eventos (opcionalmente filtrados por ?userId=)
exports.getEvents = async (req, res) => {
  try {
    const filter = typeof req.query.userId === 'string' ? { userId: req.query.userId } : {};
    res.json(await Event.find(filter).sort({ createdAt: -1 }).limit(100));
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo eventos: ' + err.message });
  }
};

// Obtener un evento por id
exports.getEventById = async (req, res) => {
  if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Id inválido' });
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Evento no encontrado' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo evento: ' + err.message });
  }
};

// Actualizar evento
exports.updateEvent = async (req, res) => {
  if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Id inválido' });
  const { action, description } = req.body;
  const changes = {};
  if (typeof action === 'string' && action.trim()) changes.action = action.trim();
  if (typeof description === 'string') changes.description = description;
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, changes, { new: true, runValidators: true });
    if (!event) return res.status(404).json({ error: 'Evento no encontrado' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: 'Error actualizando evento: ' + err.message });
  }
};

// Eliminar evento
exports.deleteEvent = async (req, res) => {
  if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Id inválido' });
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ error: 'Evento no encontrado' });
    res.json({ message: 'Evento eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error eliminando evento: ' + err.message });
  }
};
