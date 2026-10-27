const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isSqlConnected } = require('../../config/db');

// Rutas del CRUD de usuarios en SQL Server

// Responder 503 si no hay conexión con SQL Server
router.use((req, res, next) => {
  if (!isSqlConnected()) return res.status(503).json({ error: 'SQL Server no está conectado (revisa el archivo .env)' });
  next();
});

// Crear usuario
router.post('/', userController.createUser);
// Obtener usuarios
router.get('/', userController.getUsers);
// Obtener un usuario
router.get('/:id', userController.getUserById);
// Actualizar usuario
router.put('/:id', userController.updateUser);
// Eliminar usuario
router.delete('/:id', userController.deleteUser);

module.exports = router;
