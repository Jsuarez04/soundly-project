import { client } from './cassandra.js';

async function getSong() {
  const songIds = await client.execute('SELECT id FROM musica.songs');
  return songIds.rows.map(row => row.id.toString());
}

async function getUser() {
  const users = await client.execute('SELECT username FROM musica.users');
  return users.rows.map(row => row.username.toString());
}

export async function generateListen(n) {
  const listens = [];
  const base_date = new Date('2023-01-01');
  const usernames = await getUser();
  const songIds = await getSong();

  for (let i = 0; i < n; i++) {
    const username = usernames[Math.floor(Math.random() * usernames.length)];
    const song = songIds[Math.floor(Math.random() * songIds.length)];
    const randomDays = Math.floor(Math.random() * 60);
    const date = new Date(base_date);
    date.setDate(date.getDate() + randomDays);

    listens.push({
      username: username,                // ✅ correcto
      song_id: song,
      listen_date: date.toISOString().split('T')[0]
    });
  }

  return listens;
}
