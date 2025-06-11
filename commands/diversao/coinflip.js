const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'coinflip',
    description: 'Joga uma moeda para decidir entre cara ou coroa.',
    aliases: ['caraoucoroa', 'moeda'],
    execute(message, args, client) {
        const outcomes = ['Cara', 'Coroa'];
        const result = outcomes[Math.floor(Math.random() * outcomes.length)];

        let emoji = '';
        let color = '';

        if (result === 'Cara') {
            emoji = '👑'; // Exemplo de emoji para Cara
            color = '#FFD700'; // Dourado
        } else {
            emoji = '🪙'; // Exemplo de emoji para Coroa
            color = '#C0C0C0'; // Prata
        }

        const coinflipEmbed = new EmbedBuilder()
            .setColor(color)
            .setTitle('🪙 Coinflip 🪙')
            .setDescription(`A moeda girou, girou... e caiu em **${result}**! ${emoji}`)
            .setFooter({ text: `Lançado por: ${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            .setTimestamp();

        message.reply({ embeds: [coinflipEmbed] });
    },
};
