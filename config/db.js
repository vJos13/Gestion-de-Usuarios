const sql = require('mssql');
const mongoose = require('mongoose');

// Configuración de SQL Server (los valores se leen del archivo .env)
const sqlConfig = {
  user: process.env.SQL_USER || 'sa',
  password: process.env.SQL_PASSWORD || '',
  server: process.env.SQL_SERVER || 'localhost',
  port: Number(process.env.SQL_PORT) || 1433,
  database: process.env.SQL_DATABASE || 'miapp_sql',
  options: {
    encrypt: true, // Habilitar cifrado para conexiones de red
    trustServerCertificate: true, // Si no usas certificado SSL
  },
};

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/miapp';

let sqlPool = null;

// Conectar con SQL Server
async function connectSQL() {
  try {
    sqlPool = await sql.connect(sqlConfig);
    console.log('Conectado a SQL Server');
  } catch (err) {
    console.error('Error de conexión con SQL Server:', err.message);
  }
}

// Conectar con MongoDB
async function connectMongo() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Conectado a MongoDB');
  } catch (err) {
    console.error('Error de conexión con MongoDB:', err.message);
  }
}

const isSqlConnected = () => Boolean(sqlPool?.connected);

module.exports = { sql, sqlConfig, connectSQL, connectMongo, isSqlConnected };
