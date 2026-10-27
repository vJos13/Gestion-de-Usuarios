const { sql } = require('../../config/db');

// Lógica de acceso a SQL Server.
// Se usan consultas parametrizadas (input) para evitar inyección SQL.

async function getAll() {
  const result = await new sql.Request().query('SELECT id, name, email FROM Users ORDER BY id');
  return result.recordset;
}

async function getById(id) {
  const result = await new sql.Request()
    .input('id', sql.Int, id)
    .query('SELECT id, name, email FROM Users WHERE id = @id');
  return result.recordset[0] || null;
}

async function create({ name, email }) {
  const result = await new sql.Request()
    .input('name', sql.VarChar(100), name)
    .input('email', sql.VarChar(100), email)
    .query('INSERT INTO Users (name, email) OUTPUT INSERTED.* VALUES (@name, @email)');
  return result.recordset[0];
}

async function update(id, { name, email }) {
  const result = await new sql.Request()
    .input('id', sql.Int, id)
    .input('name', sql.VarChar(100), name)
    .input('email', sql.VarChar(100), email)
    .query('UPDATE Users SET name = @name, email = @email OUTPUT INSERTED.* WHERE id = @id');
  return result.recordset[0] || null;
}

async function remove(id) {
  const result = await new sql.Request()
    .input('id', sql.Int, id)
    .query('DELETE FROM Users WHERE id = @id');
  return result.rowsAffected[0] > 0;
}

module.exports = { getAll, getById, create, update, remove };
