const { Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`Pronto! Logado como ${client.user.tag}`);
        // Você pode adicionar mais ações aqui, como definir a atividade do bot
        client.user.setPresence({
            activities: [{ name: 'Digite !ajuda', type: 3 /* WATCHING */ }], // TYPE 3 é WATCHING. Use 0 para PLAYING, 2 para LISTENING, 5 para COMPETING.
            status: 'online', // online, idle, dnd, invisible
        });
    },
};
