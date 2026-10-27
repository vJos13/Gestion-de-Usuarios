const API = {
  sql: '/api/users',
  mongo: '/api/mongo/users',
  events: '/api/events',
};

const form = document.getElementById('user-form');
const dbSelect = document.getElementById('db-select');
const idInput = document.getElementById('user-id');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const message = document.getElementById('message');
const usersBody = document.getElementById('users-body');
const eventsBody = document.getElementById('events-body');

// Petición a la API que devuelve JSON o lanza el mensaje de error del servidor
async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
  return data;
}

function showMessage(text, type = 'success') {
  message.textContent = text;
  message.className = `message ${type}`;
}

// Crea una celda de texto (textContent evita XSS)
function cell(text) {
  const td = document.createElement('td');
  td.textContent = text ?? '';
  return td;
}

function emptyRow(tbody, cols, text) {
  tbody.innerHTML = `<tr><td colspan="${cols}" class="empty"></td></tr>`;
  tbody.querySelector('td').textContent = text;
}

async function loadStatus() {
  try {
    const status = await request('/api/health');
    setBadge('status-sql', 'SQL Server', status.sqlServer);
    setBadge('status-mongo', 'MongoDB', status.mongoDB);
  } catch {
    setBadge('status-sql', 'SQL Server', false);
    setBadge('status-mongo', 'MongoDB', false);
  }
}

function setBadge(id, label, ok) {
  const el = document.getElementById(id);
  el.textContent = `${label}: ${ok ? 'conectado' : 'desconectado'}`;
  el.className = `badge ${ok ? 'ok' : 'fail'}`;
}

async function loadUsers() {
  const db = dbSelect.value;
  document.getElementById('db-label').textContent = db === 'sql' ? '(SQL Server)' : '(MongoDB)';
  try {
    const users = await request(API[db]);
    if (!users.length) return emptyRow(usersBody, 4, 'No hay usuarios registrados');
    usersBody.innerHTML = '';
    users.forEach((user) => {
      const id = user.id ?? user._id;
      const tr = document.createElement('tr');
      tr.append(cell(id), cell(user.name), cell(user.email));

      const actions = document.createElement('td');
      const wrap = document.createElement('div');
      wrap.className = 'actions';
      const editBtn = document.createElement('button');
      editBtn.textContent = 'Editar';
      editBtn.onclick = () => startEdit(id, user);
      const delBtn = document.createElement('button');
      delBtn.textContent = 'Eliminar';
      delBtn.className = 'danger';
      delBtn.onclick = () => deleteUser(id);
      wrap.append(editBtn, delBtn);
      actions.append(wrap);
      tr.append(actions);
      usersBody.append(tr);
    });
  } catch (err) {
    emptyRow(usersBody, 4, err.message);
  }
}

async function loadEvents() {
  try {
    const events = await request(API.events);
    if (!events.length) return emptyRow(eventsBody, 6, 'No hay eventos registrados');
    eventsBody.innerHTML = '';
    events.forEach((ev) => {
      const tr = document.createElement('tr');
      tr.append(
        cell(new Date(ev.createdAt).toLocaleString()),
        cell(ev.action),
        cell(ev.source),
        cell(ev.userId),
        cell(ev.description)
      );
      const td = document.createElement('td');
      const delBtn = document.createElement('button');
      delBtn.textContent = 'Eliminar';
      delBtn.className = 'danger';
      delBtn.onclick = async () => {
        await request(`${API.events}/${ev._id}`, { method: 'DELETE' }).catch((e) => showMessage(e.message, 'error'));
        loadEvents();
      };
      td.append(delBtn);
      tr.append(td);
      eventsBody.append(tr);
    });
  } catch (err) {
    emptyRow(eventsBody, 6, err.message);
  }
}

function startEdit(id, user) {
  idInput.value = id;
  nameInput.value = user.name;
  emailInput.value = user.email;
  submitBtn.textContent = 'Actualizar';
  cancelBtn.hidden = false;
  dbSelect.disabled = true;
}

function resetForm() {
  form.reset();
  idInput.value = '';
  submitBtn.textContent = 'Crear';
  cancelBtn.hidden = true;
  dbSelect.disabled = false;
}

async function deleteUser(id) {
  if (!confirm('¿Eliminar este usuario?')) return;
  try {
    await request(`${API[dbSelect.value]}/${id}`, { method: 'DELETE' });
    showMessage('Usuario eliminado');
    refresh();
  } catch (err) {
    showMessage(err.message, 'error');
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = JSON.stringify({ name: nameInput.value, email: emailInput.value });
  const base = API[dbSelect.value];
  try {
    if (idInput.value) {
      await request(`${base}/${idInput.value}`, { method: 'PUT', body });
      showMessage('Usuario actualizado');
    } else {
      await request(base, { method: 'POST', body });
      showMessage('Usuario creado');
    }
    resetForm();
    refresh();
  } catch (err) {
    showMessage(err.message, 'error');
  }
});

cancelBtn.addEventListener('click', resetForm);
dbSelect.addEventListener('change', loadUsers);

function refresh() {
  loadUsers();
  loadEvents();
}

loadStatus();
refresh();
