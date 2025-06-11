const { SlashCommandBuilder } = require('discord.js'); // Embora não estejamos usando slash commands ainda, é uma boa prática tê-lo para o futuro.

module.exports = {
    // data: new SlashCommandBuilder() // Se fosse um slash command
    //     .setName('ping')
    //     .setDescription('Responde com Pong!'),
    name: 'ping', // Nome do comando para prefix commands
    description: 'Responde com Pong!',
    aliases: ['p'], // Apelidos para o comando
    execute(message, args, client) {
        // client é passado aqui se você precisar dele dentro do comando
        message.reply('Pong!');
    },
};
