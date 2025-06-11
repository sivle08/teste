const User = require('../../database/models/User'); // Importa o modelo User
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'biografia',
    description: 'Define ou limpa sua biografia no perfil.',
    aliases: ['bio', 'setbio'],
    usage: '`!biografia <texto da sua biografia>` ou `!biografia limpar`',
    async execute(message, args, client) {
        const newBio = args.join(' ').trim();
        const userId = message.author.id;
        const guildId = message.guild.id;

        let responseEmbed = new EmbedBuilder()
            .setColor('#0099ff') // Cor padrão
            .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) });

        if (!newBio) {
            // Mostra a bio atual se nenhum argumento for fornecido
            try {
                const userData = await User.findOne({ userId, guildId });
                const currentBio = userData && userData.bio ? userData.bio : 'Você ainda não definiu uma biografia. Use `!biografia <texto>` para definir uma!';
                responseEmbed
                    .setTitle('📝 Sua Biografia Atual')
                    .setDescription(currentBio)
                    .setFooter({text: "Para alterar, use !biografia <novo texto> ou !biografia limpar"});
                return message.reply({ embeds: [responseEmbed] });
            } catch (error) {
                console.error("Erro ao buscar biografia:", error);
                responseEmbed
                    .setColor('#FF0000')
                    .setTitle('❌ Erro')
                    .setDescription('Ocorreu um erro ao buscar sua biografia.');
                return message.reply({ embeds: [responseEmbed] });
            }
        }

        if (newBio.toLowerCase() === 'limpar' || newBio.toLowerCase() === 'remover') {
            try {
                await User.findOneAndUpdate(
                    { userId, guildId },
                    { $set: { bio: null } },
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                );
                responseEmbed
                    .setColor('#00FF00') // Verde para sucesso
                    .setTitle('🗑️ Biografia Limpa!')
                    .setDescription('Sua biografia foi removida com sucesso.');
                return message.reply({ embeds: [responseEmbed] });
            } catch (error) {
                console.error("Erro ao limpar biografia:", error);
                responseEmbed
                    .setColor('#FF0000')
                    .setTitle('❌ Erro')
                    .setDescription('Ocorreu um erro ao tentar limpar sua biografia.');
                return message.reply({ embeds: [responseEmbed] });
            }
        }

        // O schema User.js tem maxLength: 200 para bio
        if (newBio.length > 200) {
            responseEmbed
                .setColor('#FFA500') // Laranja para aviso
                .setTitle('⚠️ Biografia Muito Longa!')
                .setDescription(`Sua biografia não pode ter mais de 200 caracteres. A sua tem ${newBio.length} caracteres.`);
            return message.reply({ embeds: [responseEmbed] });
        }

        try {
            await User.findOneAndUpdate(
                { userId, guildId },
                { $set: { bio: newBio } },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            responseEmbed
                .setColor('#00FF00')
                .setTitle('✅ Biografia Atualizada!')
                .setDescription(`Sua nova biografia é:
>>> ${newBio}`);
            message.reply({ embeds: [responseEmbed] });
        } catch (error) {
            console.error("Erro ao atualizar biografia:", error);
            responseEmbed
                .setColor('#FF0000')
                .setTitle('❌ Erro')
                .setDescription('Ocorreu um erro ao tentar atualizar sua biografia.');
            message.reply({ embeds: [responseEmbed] });
        }
    },
};
