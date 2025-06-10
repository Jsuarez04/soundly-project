import cors from 'cors';
import express from 'express';
import { client} from './cassandra.js';
import { generateListen } from './generate_listen.js';
import { chargeListens } from './chargeListens.js';



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

app.get('/api/genero/mes', async (req, res) => {
  try {
    const { genero, mes } = req.query;
    const result = await client.execute(
      'SELECT * FROM musica.escuchas_por_genero_y_mes WHERE genero = ? AND mes = ?',
      [genero, mes],
      { prepare: true }
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener canciones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


app.get('/api/ciudad', async (req, res) => {
  try {
    const { ciudad } = req.query;
    const result = await client.execute(
      'SELECT * FROM musica.canciones_por_ciudad WHERE ciudad = ?',
      [ciudad],
      { prepare: true }
    );
    res.json(result.rows);
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
});

app.post('/api/users', async(req,res) => {
    try{
        const result = await client.execute(
            'INSERT INTO musica.users (username,city,name,password,user_id) VALUES (?, ?, ?, ?, ?)',
            [req.body.username, req.body.city, req.body.name, req.body.password, req.body.user_id], 
            { prepare: true }
        );
        res.json({ message: 'Usuario creado exitosamente' });
    } catch (error) {
        console.error('Error al crear usuarios:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

//importante, aca se generan las escuchas y se cargan a la BD
const listens = await generateListen(1000);
console.log('Generando escuchas:', listens);
await chargeListens(listens);

app.listen(3001, () => {
  console.log('🚀 Backend corriendo en http://localhost:3001');
});
