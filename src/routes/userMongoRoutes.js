const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Rutas del CRUD de usuarios en MongoDB

// Crear usuario en MongoDB
router.post('/', userController.createUserMongo);
// Obtener usuarios desde MongoDB
router.get('/', userController.getUsersMongo);
// Obtener un usuario desde MongoDB
router.get('/:id', userController.getUserByIdMongo);
// Actualizar usuario en MongoDB
router.put('/:id', userController.updateUserMongo);
// Eliminar usuario en MongoDB
router.delete('/:id', userController.deleteUserMongo);

module.exports = router;
