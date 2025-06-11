const mongoose = require('mongoose');
const { mongodb_uri } = require('../config.json');

if (!mongodb_uri || mongodb_uri === 'SUA_MONGODB_URI_AQUI') {
    console.error('[DB] URI do MongoDB não configurada em config.json. Por favor, adicione uma URI válida.');
    // process.exit(1); // Poderia sair, mas vamos deixar o bot tentar rodar sem DB por enquanto para outros comandos.
    //                 // Funcionalidades que dependem do DB não funcionarão.
}

const connectDB = async () => {
    try {
        if (!mongodb_uri || mongodb_uri === 'SUA_MONGODB_URI_AQUI') {
            console.warn('[DB] Conexão com MongoDB não estabelecida (URI não configurada). Funcionalidades de banco de dados estarão desabilitadas.');
            return;
        }
        await mongoose.connect(mongodb_uri, {
            // useNewUrlParser: true, // Deprecated
            // useUnifiedTopology: true, // Deprecated
            // useCreateIndex: true, // Deprecated
            // useFindAndModify: false // Deprecated
            // Opções mais recentes são geralmente detectadas automaticamente ou não são mais necessárias.
        });
        console.log('[DB] MongoDB Conectado com Sucesso!');
    } catch (err) {
        console.error('[DB] Erro ao conectar com MongoDB:', err.message);
        // Em caso de falha na conexão inicial, pode ser útil tentar reconectar ou sair do processo
        // process.exit(1);
    }

    mongoose.connection.on('disconnected', () => {
        console.warn('[DB] MongoDB desconectado.');
    });

    mongoose.connection.on('error', err => {
        console.error('[DB] Erro na conexão MongoDB:', err);
    });
};

module.exports = connectDB;
