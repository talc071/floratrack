const users = [
  {
    userId: 1,
    firstName: 'Alice',
    lastName: 'Green',
    email: 'alice@floratrack.com',
    password: 'admin123',
    createDate: '2024-01-10T09:00:00.000Z',
    updateDate: '2024-01-10T09:00:00.000Z',
    userRole: 'admin'
  },
  {
    userId: 2,
    firstName: 'Bob',
    lastName: 'Bloom',
    email: 'bob@floratrack.com',
    password: 'manager123',
    createDate: '2024-02-15T11:30:00.000Z',
    updateDate: '2024-02-15T11:30:00.000Z',
    userRole: 'manager'
  },
  {
    userId: 3,
    firstName: 'Carol',
    lastName: 'Rose',
    email: 'carol@floratrack.com',
    password: 'user123',
    createDate: '2024-03-20T14:45:00.000Z',
    updateDate: '2024-03-20T14:45:00.000Z',
    userRole: 'user'
  },
  {
    userId: 4,
    firstName: 'David',
    lastName: 'Fern',
    email: 'david@floratrack.com',
    password: 'user123',
    createDate: '2024-04-05T08:00:00.000Z',
    updateDate: '2024-04-05T08:00:00.000Z',
    userRole: 'user'
  },
  {
    userId: 5,
    firstName: 'Eva',
    lastName: 'Sprout',
    email: 'eva@floratrack.com',
    password: 'user123',
    createDate: '2024-04-18T10:15:00.000Z',
    updateDate: '2024-04-18T10:15:00.000Z',
    userRole: 'user'
  }
];

const settingsByUserId = {
  1: { displayName: 'Alice Green', email: 'alice@floratrack.com', theme: 'light', language: 'English', notificationsEnabled: true },
  2: { displayName: 'Bob Bloom', email: 'bob@floratrack.com', theme: 'light', language: 'English', notificationsEnabled: true },
  3: { displayName: 'Carol Rose', email: 'carol@floratrack.com', theme: 'light', language: 'English', notificationsEnabled: true },
  4: { displayName: 'David Fern', email: 'david@floratrack.com', theme: 'light', language: 'English', notificationsEnabled: false },
  5: { displayName: 'Eva Sprout', email: 'eva@floratrack.com', theme: 'dark', language: 'English', notificationsEnabled: true }
};

let nextUserId = 6;

const toPublicUser = ({ password, ...user }) => user;

const getAll = () => users.map(toPublicUser);

const getById = (id) => {
  const user = users.find((u) => u.userId === id);
  return user ? toPublicUser(user) : null;
};

const getByEmail = (email) =>
  users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;

const getSettings = (userId) => {
  const user = users.find((u) => u.userId === userId);
  if (!user) return null;
  if (!settingsByUserId[userId]) {
    settingsByUserId[userId] = {
      displayName: `${user.firstName} ${user.lastName}`,
      email: user.email,
      theme: 'light',
      language: 'English',
      notificationsEnabled: true
    };
  }
  return { ...settingsByUserId[userId] };
};

const updateSettings = (userId, settings) => {
  if (!users.find((u) => u.userId === userId)) return null;
  settingsByUserId[userId] = { ...settingsByUserId[userId], ...settings };
  return getSettings(userId);
};

const create = ({ firstName, lastName, userRole }) => {
  const now = new Date().toISOString();
  const newUser = {
    userId: nextUserId++,
    firstName,
    lastName,
    email: `${firstName.toLowerCase()}@floratrack.com`,
    password: 'changeme',
    createDate: now,
    updateDate: now,
    userRole
  };
  users.push(newUser);
  return toPublicUser(newUser);
};

const update = (id, { firstName, lastName, userRole }) => {
  const idx = users.findIndex((u) => u.userId === id);
  if (idx === -1) return null;
  users[idx] = {
    ...users[idx],
    firstName,
    lastName,
    userRole,
    updateDate: new Date().toISOString()
  };
  return toPublicUser(users[idx]);
};

const remove = (id) => {
  const idx = users.findIndex((u) => u.userId === id);
  if (idx === -1) return null;
  const [removed] = users.splice(idx, 1);
  delete settingsByUserId[id];
  return toPublicUser(removed);
};

module.exports = { getAll, getById, getByEmail, getSettings, updateSettings, create, update, remove };
