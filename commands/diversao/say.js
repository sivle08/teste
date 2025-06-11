module.exports = {
    name: 'say',
    description: 'Faz o bot repetir sua mensagem.',
    aliases: ['falar', 'dizer'],
    usage: '`!say <mensagem>`',
    execute(message, args, client) {
        if (!args.length) {
            return message.reply('Você precisa me dizer o que falar! Tente `!say Olá mundo`.');
        }

        const textToSay = args.join(' ');

        // Verificação básica para evitar menções @everyone e @here pelo bot
        // Pode ser expandida para verificar outras permissões ou menções de roles específicas.
        if (textToSay.includes('@everyone') || textToSay.includes('@here')) {
            return message.reply('Eu não vou mencionar `@everyone` ou `@here` por você! 😉');
        }

        message.channel.send(textToSay);
        // Opcionalmente, deletar a mensagem original do usuário para que pareça que foi o bot quem disse
        // if (message.deletable) {
        //     message.delete().catch(err => console.error('Não foi possível deletar a mensagem do usuário:', err));
        // }
    },
};
