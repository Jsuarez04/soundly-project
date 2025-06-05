import cors from 'cors';
import express from 'express';
import { client, conectarCassandra } from './cassandra.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/songs', async (req, res) => {
  try {
    const result = await client.execute('SELECT * FROM musica.songs');
    res.json(result.rows); // devuelve array de objetos
  } catch (error) {
    console.error('Error al obtener canciones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/users', async(req,res) => {
    try{
        const result = await client.execute('SELECT * from musica.users')
        res.json(result.rows); // devuelve array de objetos
    }
    catch (error){
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
})

app.listen(3001, () => {
  console.log('🚀 Backend corriendo en http://localhost:3001');
});
