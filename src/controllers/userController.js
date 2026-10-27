const mongoose = require('mongoose');
const User = require('../models/user');
const userService = require('../services/userService');
const { logEvent } = require('../services/eventService');
const { validateUser, parseSqlId } = require('../utils/validators');

// SQL Server: código de error por clave única duplicada (email)
const isSqlDuplicate = (err) => err.number === 2627 || err.number === 2601;

/* ======================== CRUD en SQL Server ======================== */

// Crear usuario en SQL Server
exports.createUser = async (req, res) => {
  const error = validateUser(req.body);
  if (error) return res.status(400).json({ error });
  try {
    const { name, email } = req.body;
    const user = await userService.create({ name: name.trim(), email: email.trim() });
    res.status(201).json(user);
  } catch (err) {
    if (isSqlDuplicate(err)) return res.status(409).json({ error: 'El email ya está registrado' });
    res.status(500).json({ error: 'Error creando usuario: ' + err.message });
  }
};

// Obtener usuarios desde SQL Server
exports.getUsers = async (req, res) => {
  try {
    res.json(await userService.getAll());
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo usuarios: ' + err.message });
  }
};

// Obtener un usuario por id desde SQL Server
exports.getUserById = async (req, res) => {
  const id = parseSqlId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Id inválido' });
  try {
    const user = await userService.getById(id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo usuario: ' + err.message });
  }
};

// Actualizar usuario en SQL Server
exports.updateUser = async (req, res) => {
  const id = parseSqlId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Id inválido' });
  const error = validateUser(req.body);
  if (error) return res.status(400).json({ error });
  try {
    const { name, email } = req.body;
    const user = await userService.update(id, { name: name.trim(), email: email.trim() });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) {
    if (isSqlDuplicate(err)) return res.status(409).json({ error: 'El email ya está registrado' });
    res.status(500).json({ error: 'Error actualizando usuario: ' + err.message });
  }
};

// Eliminar usuario en SQL Server
exports.deleteUser = async (req, res) => {
  const id = parseSqlId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Id inválido' });
  try {
    const deleted = await userService.remove(id);
    if (!deleted) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ message: 'Usuario eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error eliminando usuario: ' + err.message });
  }
};

/* ========================= CRUD en MongoDB ========================= */
// Todas las operaciones CRUD de usuarios de MongoDB generan un evento (log). SQL Server no registra eventos.

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Crear usuario en MongoDB
exports.createUserMongo = async (req, res) => {
  const error = validateUser(req.body);
  if (error) return res.status(400).json({ error });
  try {
    const { name, email } = req.body;
    const newUser = await new User({ name: name.trim(), email: email.trim() }).save();
    await logEvent('CREATE_USER', { userId: newUser._id, description: `Usuario ${newUser.name} (${newUser.email}) creado` });
    res.status(201).json(newUser);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'El email ya está registrado' });
    res.status(500).json({ error: 'Error creando usuario en MongoDB: ' + err.message });
  }
};

// Obtener usuarios de MongoDB
exports.getUsersMongo = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: 1 });
    await logEvent('READ_USERS', { description: `Consulta de la lista de usuarios (${users.length} registros)` });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo usuarios desde MongoDB: ' + err.message });
  }
};

// Obtener un usuario por id de MongoDB
exports.getUserByIdMongo = async (req, res) => {
  if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Id inválido' });
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    await logEvent('READ_USER', { userId: user._id, description: `Consulta del usuario ${user.name} (${user.email})` });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo usuario desde MongoDB: ' + err.message });
  }
};

// Actualizar usuario en MongoDB
exports.updateUserMongo = async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) return res.status(400).json({ error: 'Id inválido' });
  const error = validateUser(req.body);
  if (error) return res.status(400).json({ error });
  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Registrar qué campos cambiaron (valor anterior -> valor nuevo)
    const changes = [];
    for (const field of ['name', 'email']) {
      const value = req.body[field].trim();
      if (user[field] !== value) {
        changes.push(`${field}: "${user[field]}" -> "${value}"`);
        user[field] = value;
      }
    }

    await user.save();
    if (changes.length) {
      await logEvent('UPDATE_USER', { userId: id, description: changes.join(', ') });
    }
    res.json(user);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'El email ya está registrado' });
    res.status(500).json({ error: 'Error actualizando usuario en MongoDB: ' + err.message });
  }
};

// Eliminar usuario en MongoDB
exports.deleteUserMongo = async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) return res.status(400).json({ error: 'Id inválido' });
  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    await logEvent('DELETE_USER', { userId: id, description: `Usuario ${user.name} (${user.email}) eliminado` });
    res.json({ message: 'Usuario eliminado de MongoDB' });
  } catch (err) {
    res.status(500).json({ error: 'Error eliminando usuario en MongoDB: ' + err.message });
  }
};
