const path = require('path');
const fs = require('fs');

// Cargar variables de entorno desde .env (si existe)
if (fs.existsSync(path.join(__dirname, '.env'))) {
  process.loadEnvFile(path.join(__dirname, '.env'));
}

const express = require('express');
const mongoose = require('mongoose');
const { connectSQL, connectMongo, isSqlConnected } = require('./config/db');

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Definir rutas
const userRoutes = require('./src/routes/userRoutes');
const userMongoRoutes = require('./src/routes/userMongoRoutes');
const eventRoutes = require('./src/routes/eventRoutes');

app.use('/api/users', userRoutes); // CRUD de usuarios en SQL Server
app.use('/api/mongo/users', userMongoRoutes); // CRUD de usuarios en MongoDB
app.use('/api/events', eventRoutes); // CRUD de eventos (logs) en MongoDB

// Estado de las conexiones
app.get('/api/health', (req, res) => {
  res.json({
    sqlServer: isSqlConnected(),
    mongoDB: mongoose.connection.readyState === 1,
  });
});

// Ruta no encontrada
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar servidor
async function start() {
  await Promise.all([connectSQL(), connectMongo()]);
  app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
  });
}

start();
