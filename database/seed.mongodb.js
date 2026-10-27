// Semana 11 - Datos de ejemplo para MongoDB
// Ejecutar con: npm run seed:mongo   (o: mongosh miapp database/seed.mongodb.js)

db = db.getSiblingDB('miapp');

// Limpiar datos anteriores
db.users.deleteMany({});
db.events.deleteMany({});

// Índice único de email (igual que en el modelo de Mongoose)
db.users.createIndex({ email: 1 }, { unique: true });

const now = new Date();

const { insertedIds } = db.users.insertMany([
  { name: 'Carla Mendoza', email: 'carla@example.com', createdAt: now, __v: 0 },
  { name: 'Diego Paredes', email: 'diego@example.com', createdAt: now, __v: 0 },
  { name: 'Sofía Quispe', email: 'sofia@example.com', createdAt: now, __v: 0 },
]);

const ids = Object.values(insertedIds).map(String);

// Se registran todas las operaciones CRUD de los usuarios de MongoDB
db.events.insertMany([
  { userId: ids[0], action: 'CREATE_USER', description: 'Usuario Carla Mendoza (carla@example.com) creado', source: 'mongodb', createdAt: now, __v: 0 },
  { userId: ids[1], action: 'CREATE_USER', description: 'Usuario Diego Paredes (diego@example.com) creado', source: 'mongodb', createdAt: now, __v: 0 },
  { userId: ids[2], action: 'CREATE_USER', description: 'Usuario Sofía Quispe (sofia@example.com) creado', source: 'mongodb', createdAt: now, __v: 0 },
  { action: 'READ_USERS', description: 'Consulta de la lista de usuarios (3 registros)', source: 'mongodb', createdAt: now, __v: 0 },
  { userId: ids[1], action: 'UPDATE_USER', description: 'name: "Diego Paredes R." -> "Diego Paredes"', source: 'mongodb', createdAt: now, __v: 0 },
  { userId: ids[2], action: 'UPDATE_USER', description: 'email: "sofia.q@example.com" -> "sofia@example.com"', source: 'mongodb', createdAt: now, __v: 0 },
  { userId: '6a0000000000000000000001', action: 'DELETE_USER', description: 'Usuario Pedro Rojas (pedro@example.com) eliminado', source: 'mongodb', createdAt: now, __v: 0 },
]);

print(`Usuarios: ${db.users.countDocuments()} | Eventos: ${db.events.countDocuments()}`);
