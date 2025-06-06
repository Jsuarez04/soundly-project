import { client } from './cassandra.js';

export async function chargeListens(listens) {
    for (const listen of listens) {
        try {
            await client.execute(
                'INSERT INTO musica.listens (username, song_id, listen_date) VALUES (?, ?, ?)',
                [listen.username, listen.song_id, new Date(listen.listen_date)],
                { prepare: true }
            );

            const songRes = await client.execute(
                'SELECT genre FROM songs WHERE id = ?',
                [listen.song_id],
                { prepare: true }
            );
            const userRes = await client.execute(
                'SELECT city FROM users WHERE username = ?',
                [listen.username],
                { prepare: true }
            );

            if (songRes.rowLength > 0 && userRes.rowLength > 0) {
                const genero = songRes.rows[0].genre;
                const ciudad = userRes.rows[0].city;
                const mes = listen.listen_date.slice(0, 7); // yyyy-mm

                // Incrementar conteo por género
                await client.execute(
                    `UPDATE musica.canciones_mas_escuchadas_por_genero
                     SET conteo = conteo + 1
                     WHERE genero = ? AND cancion_id = ?`,
                    [genero, listen.song_id],
                    { prepare: true }
                );

                // Incrementar conteo por ciudad
                await client.execute(
                    `UPDATE musica.canciones_por_ciudad
                     SET conteo = conteo + 1
                     WHERE ciudad = ? AND cancion_id = ?;`,
                    [ciudad, listen.song_id],
                    { prepare: true }
                );

                // Incrementar conteo mensual
                await client.execute(
                    `UPDATE escuchas_por_genero_y_mes
                     SET total_escuchas = total_escuchas + 1
                     WHERE genero = ? AND mes = ?`,
                    [genero, mes],
                    { prepare: true }
                );
            }

            console.log(
                `✔ Escucha insertada: user ${listen.username}, song ${listen.song_id}, date ${listen.listen_date}`
            );
        } catch (error) {
            console.error('❌ Error al insertar listen:', error);
        }
    }
}
