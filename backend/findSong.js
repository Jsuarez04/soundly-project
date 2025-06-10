import { client } from './cassandra.js';

async function mostrarMasEscuchadasPorGeneroYMes(genero, mes) {
    console.log(`--- Las canciones más escuchadas por género: '${genero}' y mes: '${mes}' ---`);

    // 1. Primero vamos a obtener todas las filas de métricas para el género y mes dados
    const query_metricas = 'SELECT idcancion, total_escuchas FROM musica.cancion_por_genero_y_mes WHERE genero = ? AND mes = ?';
    let resultadoMetricas;

    //Bloque de gestion de errores
    try {
        resultadoMetricas = await client.execute(query_metricas, [genero, mes], { prepare: true });
    } catch (error) {
        console.error(`Error al obtener métricas para ${genero}/${mes}:`, error);
        return;
    }

    if (resultadoMetricas.rows.length === 0) {
        console.log(`No se encontraron datos de escuchas para '${genero}' en '${mes}'.`);
        return;
    }

    // 2. Ahora vamos a ordenar estas filas de métricas en el código de tu aplicación por total_escuchas
    // Convertir 'total_escuchas' del tipo Long de Cassandra a un número estándar de JavaScript para la ordenación.
    const metricasOrdenadas = resultadoMetricas.rows
        .map(row => ({
            idcancion: row.idcancion.toString(), // Convertimos el UUID a string para consistencia
            total_escuchas: row.total_escuchas.toNumber() // Convertir Long a número
        }))
        .sort((a, b) => b.total_escuchas - a.total_escuchas); // Ordenar de forma descendente (el más alto primero)

    // 3. Extraemos los IDs de las canciones ordenadas
    const idsOrdenados = metricasOrdenadas.map(m => m.idcancion);

    // 4. Obtenemos los detalles de todas las IDs de canciones ordenadas en una sola consulta (más eficiente que iterar)
    let resultadoDetalles;
    if (idsOrdenados.length > 0) {
        const query_detalle_multiple = 'SELECT id, title, author FROM musica.songs WHERE id IN ?';
        try {
            resultadoDetalles = await client.execute(query_detalle_multiple, [idsOrdenados], { prepare: true });
        } catch (error) {
            console.error('Error al obtener detalles de canciones:', error);
            return;
        }
    } else {
        console.log('No hay IDs para buscar detalles.');
        return;
    }


    // 5. Crear un mapa para una búsqueda rápida de los detalles de las canciones por ID
    const detallesMap = new Map(resultadoDetalles.rows.map(row => [row.id.toString(), row]));

    // 6. Combinar y mostrar los resultados ordenados
    for (const metrica of metricasOrdenadas) {
        const detalleCancion = detallesMap.get(metrica.idcancion);
        const title = detalleCancion ? detalleCancion.title : 'Título no encontrado';
        const author = detalleCancion ? detalleCancion.author : 'Autor no encontrado';

        console.log(`Canción ID: ${metrica.idcancion}, Total Escuchas: ${metrica.total_escuchas}, Género: ${genero}, Mes: ${mes}`);
        console.log({
            title: title,
            author: author, 
            genero: genero,
            mes: mes,
            total_escuchas: metrica.total_escuchas
        });
        console.log('---');
    }
}

// Llamar a la función
(async () => {
    try {
        await mostrarMasEscuchadasPorGeneroYMes('pop', '2023-06');

        // Puedes llamar a la función para otras combinaciones de género/mes si es necesario
        // await mostrarMasEscuchadasPorGeneroYMes('pop', '2023-06');

    } catch (e) {
        console.error("Error en la ejecución principal:", e);
    } finally {
    
        await client.shutdown(); //cerramos la sesion
    }
})();