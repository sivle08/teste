const { EmbedBuilder } = require('discord.js');
const User = require('../../database/models/User'); // Importa o modelo User

module.exports = {
    name: 'perfil',
    description: 'Mostra o perfil de um usuário ou o seu próprio, com informações do banco de dados.',
    aliases: ['profile', 'userinfo'],
    usage: '`!perfil [@usuário]`',
    async execute(message, args, client) { // Transformado em async para usar await
        const targetUser = message.mentions.users.first() || message.author;
        const targetMember = message.guild.members.cache.get(targetUser.id);

        if (!targetMember) {
            return message.reply('Não consegui encontrar informações desse membro no servidor.');
        }

        let userData;
        try {
            // Procura o usuário no banco de dados ou cria um novo se não existir
            userData = await User.findOneAndUpdate(
                { userId: targetUser.id, guildId: message.guild.id },
                { $setOnInsert: { userId: targetUser.id, guildId: message.guild.id } }, // Dados para inserir se não existir
                { upsert: true, new: true, setDefaultsOnInsert: true } // Opções: upsert cria se não existir, new retorna o novo doc
            );
        } catch (error) {
            console.error("Erro ao buscar ou criar usuário no perfil:", error);
            return message.reply('Ocorreu um erro ao buscar informações do perfil no banco de dados. Tente novamente mais tarde.');
        }

        // Coleta de informações básicas do Discord
        const username = targetUser.username;
        const discriminator = targetUser.discriminator;
        const avatarURL = targetUser.displayAvatarURL({ dynamic: true, size: 256 });
        const userId = targetUser.id;
        const joinedAt = targetMember.joinedAt;
        const createdAt = targetUser.createdAt;

        const formatDate = (date) => {
            if (!date) return 'Não disponível';
            return date.toLocaleDateString('pt-BR', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
        };

        const perfilEmbed = new EmbedBuilder()
            .setColor(userData.cor || '#0099ff') // Usa a cor do DB se existir, senão padrão
            .setTitle(`✨ Perfil de ${username} ✨`)
            .setThumbnail(avatarURL)
            .addFields(
                { name: '💻 Nome de Usuário', value: `${username}#${discriminator}`, inline: true },
                { name: '🆔 ID do Usuário', value: userId, inline: true },
                { name: '⭐ Nível', value: `\`${userData.level || 0}\``, inline: true },
                { name: '✨ XP', value: `\`${userData.xp || 0}\``, inline: true },
                { name: '📝 Biografia', value: userData.bio || 'Nenhuma biografia definida. Use `!biografia <texto>` para definir uma!', inline: false },
                { name: '📅 Conta Criada em', value: formatDate(createdAt), inline: false },
                { name: '👋 Entrou no Servidor em', value: formatDate(joinedAt), inline: false },
                { name: '💰 Lorinhas', value: `\`${userData.lorinhas || 0}\``, inline: true }
            )
            .setFooter({ text: `Solicitado por: ${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            .setTimestamp();

        // Se houver um campo de background no DB, poderia ser usado com .setImage(userData.backgroundURL)

        message.reply({ embeds: [perfilEmbed] });
    },
};
