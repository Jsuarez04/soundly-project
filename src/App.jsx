import { useEffect, useState } from 'react';

function App() {
  const [songs, setSongs] = useState([]);

useEffect(() => {
  fetch('http://localhost:3001/api/songs')
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) {
        setSongs(data);
      } else {
        console.error('Respuesta no es un array:', data);
      }
    })
    .catch(err => console.error('Error al obtener canciones:', err));
}, []);
  return (
    <div>
      <h1>🎵 Lista de Canciones</h1>
      <ul>
        {songs.map(song => (
          <li key={song.id}>
            <strong>{song.title}</strong> - {song.author} - {song.genre}- {song.year}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;