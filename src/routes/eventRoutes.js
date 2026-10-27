const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// Rutas del CRUD de eventos (logs) en MongoDB

// Crear evento
router.post('/', eventController.createEvent);
// Obtener eventos (filtro opcional ?userId=)
router.get('/', eventController.getEvents);
// Obtener un evento
router.get('/:id', eventController.getEventById);
// Actualizar evento
router.put('/:id', eventController.updateEvent);
// Eliminar evento
router.delete('/:id', eventController.deleteEvent);

module.exports = router;
