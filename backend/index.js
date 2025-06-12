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
   const { genero, mes } = req.query;

  if (!genero || !mes) {
    return res.status(400).json({ error: "Debes proporcionar 'genero' y 'mes'" });
  }

  try {
    // 1. Obtener métricas desde cancion_por_genero_y_mes
    const queryMetricas = 'SELECT idcancion, total_escuchas FROM musica.cancion_por_genero_y_mes WHERE genero = ? AND mes = ?';
    const resultadoMetricas = await client.execute(queryMetricas, [genero, mes], { prepare: true });

    if (resultadoMetricas.rows.length === 0) {
      return res.status(404).json({ mensaje: `No hay canciones para el género '${genero}' y mes '${mes}'` });
    }

    // 2. Convertir y ordenar por escuchas
    const metricasOrdenadas = resultadoMetricas.rows
      .map(row => ({
        idcancion: row.idcancion.toString(),
        total_escuchas: row.total_escuchas.toNumber()
      }))
      .sort((a, b) => b.total_escuchas - a.total_escuchas);

    // 3. Obtener detalles de canciones
    const ids = metricasOrdenadas.map(m => m.idcancion);
    const queryDetalles = 'SELECT id, title, author FROM musica.songs WHERE id IN ?';
    const resultadoDetalles = await client.execute(queryDetalles, [ids], { prepare: true });

    // 4. Armar mapa id -> detalle
    const detallesMap = new Map(resultadoDetalles.rows.map(row => [row.id.toString(), row]));

    // 5. Combinar resultados
    const respuesta = metricasOrdenadas.map(m => {
      const detalle = detallesMap.get(m.idcancion);
      return {
        title: detalle?.title || 'Título no encontrado',
        author: detalle?.author || 'Autor no encontrado',
        genero: genero,
        mes: mes,
        total_escuchas: m.total_escuchas
      };
    });

    res.json(respuesta);
  } catch (error) {
    console.error('Error al obtener canciones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


app.get('/api/ciudad', async (req, res) => {
    const { ciudad } = req.query;

  if (!ciudad) {
    return res.status(400).json({ error: "Debes proporcionar 'ciudad'" });
  }

  try {
    // 1. Obtener métricas desde cancion_por_genero_y_mes
    const queryMetricas = 'SELECT * FROM musica.canciones_por_ciudad WHERE ciudad = ?';
    const resultadoMetricas = await client.execute(queryMetricas, [ciudad], { prepare: true });

    if (resultadoMetricas.rows.length === 0) {
      return res.status(404).json({ mensaje: `No hay canciones para la ciudad '${ciudad}'` });
    }

    // 2. Convertir y ordenar por escuchas
    const metricasOrdenadas = resultadoMetricas.rows
      .map(row => ({
        cancion_id: row.cancion_id.toString(),
        conteo: row.conteo.toNumber()
      }))
      .sort((a, b) => b.conteo - a.conteo);

    // 3. Obtener detalles de canciones
    const ids = metricasOrdenadas.map(m => m.cancion_id);
    const queryDetalles = 'SELECT id, title, author FROM musica.songs WHERE id IN ?';
    const resultadoDetalles = await client.execute(queryDetalles, [ids], { prepare: true });

    // 4. Armar mapa id -> detalle
    const detallesMap = new Map(resultadoDetalles.rows.map(row => [row.id.toString(), row]));

    // 5. Combinar resultados
    const respuesta = metricasOrdenadas.map(m => {
      const detalle = detallesMap.get(m.cancion_id);
      return {
        title: detalle?.title || 'Título no encontrado',
        author: detalle?.author || 'Autor no encontrado',
        conteo: m.conteo
      };
    });

    res.json(respuesta);
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
