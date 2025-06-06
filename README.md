# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# Base de Datos Cassandra - Proyecto "Musica"

Este repositorio contiene los archivos y scripts necesarios para levantar una base de datos Cassandra usando Docker y cargar los datos del keyspace `musica`.

## 📦 Contenido

- Archivos `.csv` con los datos de las tablas:
  - `listens.csv`
  - `songs.csv`
  - `users.csv`
  - `canciones_mas_escuchadas_por_genero.csv`
  - `canciones_por_ciudad.csv`
  - `escuchas_por_genero_y_mes.csv`
- Script para levantar Cassandra en Docker
- Comandos para crear el keyspace y las tablas
- Instrucciones para importar los datos

---

## 🚀 Instrucciones

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu_usuario/nombre_repositorio.git
cd nombre_repositorio
2. Levantar Cassandra con Docker
bash
docker run --name cassandra -d -p 9042:9042 cassandra:latest
Espera unos segundos a que el contenedor inicie completamente. Puedes verificar con:

bash
docker logs -f cassandra
3. Crear el keyspace y las tablas
Abre CQLSH:

bash
docker exec -it cassandra cqlsh
Dentro de cqlsh, ejecuta lo siguiente:

sql
CREATE KEYSPACE musica WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};

USE musica;

-- Aquí van los CREATE TABLE correspondientes a cada tabla, por ejemplo:

CREATE TABLE musica.users (
    username text PRIMARY KEY,
    city text,
    name text,
    password text,
    user_id int
);

CREATE TABLE musica.songs (
    id uuid PRIMARY KEY,
    author text,
    duration int,
    genre text,
    title text,
    year int
);

CREATE TABLE musica.listens (
    username text,
    song_id uuid,
    listen_date date,
    PRIMARY KEY (username, song_id, listen_date)
) WITH CLUSTERING ORDER BY (song_id ASC, listen_date DESC);

CREATE TABLE musica.canciones_por_ciudad (
    ciudad text,
    cancion_id uuid,
    conteo counter,
    PRIMARY KEY (ciudad, cancion_id)
) WITH CLUSTERING ORDER BY (cancion_id ASC);

CREATE TABLE musica.canciones_mas_escuchadas_por_genero (
    genero text,
    cancion_id uuid,
    conteo counter,
    PRIMARY KEY (genero, cancion_id)
) WITH CLUSTERING ORDER BY (cancion_id ASC);

CREATE TABLE musica.escuchas_por_genero_y_mes (
    genero text,
    mes text,
    total_escuchas counter,
    PRIMARY KEY (genero, mes)
) WITH CLUSTERING ORDER BY (mes ASC);

-- Repite para el resto de tablas...
📌 Puedes copiar todos los CREATE TABLE desde este mismo repositorio o pedirlos en un script separado.

4. Copiar los archivos CSV al contenedor
bash
docker cp listens.csv soundly:/tmp/listens.csv
docker cp songs.csv soundly:/tmp/songs.csv
docker cp users.csv soundly:/tmp/users.csv
docker cp canciones_mas_escuchadas_por_genero.csv soundly:/tmp/canciones_mas_escuchadas_por_genero.csv
docker cp canciones_por_ciudad.csv soundly:/tmp/canciones_por_ciudad.csv
docker cp escuchas_por_genero_y_mes.csv soundly:/tmp/escuchas_por_genero_y_mes.csv
5. Importar los datos
bash
docker exec -it soundly cqlsh -e "COPY musica.listens FROM '/tmp/listens.csv' WITH HEADER = TRUE;"
docker exec -it soundly cqlsh -e "COPY musica.songs FROM '/tmp/songs.csv' WITH HEADER = TRUE;"
docker exec -it soundly cqlsh -e "COPY musica.users FROM '/tmp/users.csv' WITH HEADER = TRUE;"
docker exec -it soundly cqlsh -e "COPY musica.canciones_mas_escuchadas_por_genero FROM '/tmp/canciones_mas_escuchadas_por_genero.csv' WITH HEADER = TRUE;"
docker exec -it soundly cqlsh -e "COPY musica.canciones_por_ciudad FROM '/tmp/canciones_por_ciudad.csv' WITH HEADER = TRUE;"
docker exec -it soundly cqlsh -e "COPY musica.escuchas_por_genero_y_mes FROM '/tmp/escuchas_por_genero_y_mes.csv' WITH HEADER = TRUE;"
✅ Verificar que los datos se hayan cargado
bash
docker exec -it cassandra cqlsh
USE musica;

SELECT * FROM listens LIMIT 5;
SELECT * FROM users LIMIT 5;
-- Y así con las demás tablas...
🧠 Notas
Asegúrate de tener Docker instalado.

Este proyecto usa Cassandra sin autenticación por simplicidad.

Si tienes errores, asegúrate de que el contenedor esté corriendo y los nombres de archivo coincidan exactamente.
