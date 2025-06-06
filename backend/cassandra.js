
import cassandra from  'cassandra-driver';

const client = new cassandra.Client({
  contactPoints: ['localhost'], // o IP de tu servidor
  localDataCenter: 'datacenter1',
  keyspace: 'musica',
});

async function conectarCassandra() {
  try {
    await client.connect();
    console.log('✅ Conectado a Cassandra');
  } catch (err) {
    console.error('❌ Error al conectar:', err);
  }
}

export { client, conectarCassandra };
