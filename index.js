const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Collection, Events, EmbedBuilder } = require('discord.js'); // Events e EmbedBuilder adicionado
const { token, prefix } = require('./config.json'); // prefix adicionado
const connectDB = require('./database/connect'); // Importa a função de conexão
const User = require('./database/models/User'); // Importa o modelo User
const { CooldownManager } = require('./utils/cooldownManager'); // Importa o CooldownManager

// Conecta ao MongoDB
connectDB(); // Chama a função para conectar

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// Carregador de Comandos
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');

// Função recursiva para ler comandos em subpastas
function loadCommands(directory) {
    const commandFiles = fs.readdirSync(directory, { withFileTypes: true });
    for (const file of commandFiles) {
        const filePath = path.join(directory, file.name);
        if (file.isDirectory()) {
            loadCommands(filePath); // Entra na subpasta
        } else if (file.name.endsWith('.js')) {
            const command = require(filePath);
            // Define um novo item na Collection com a chave sendo o nome do comando e o valor sendo o módulo exportado
            if ('name' in command && 'execute' in command) {
                client.commands.set(command.name, command);
                console.log(`Comando ${command.name} carregado de ${file.name}`);
                if (command.aliases && Array.isArray(command.aliases)) {
                    command.aliases.forEach(alias => {
                        client.commands.set(alias, command); // Adiciona apelidos também
                        console.log(`  Apelido ${alias} para ${command.name} carregado.`);
                    });
                }
            } else {
                console.log(`[AVISO] O comando em ${filePath} está faltando uma propriedade "name" ou "execute".`);
            }
        }
    }
}

loadCommands(commandsPath); // Inicia o carregamento de comandos

// Carregador de Eventos
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
    console.log(`Evento ${event.name} carregado de ${file}`);
}

// Listener de Mensagens para Comandos E SISTEMA DE XP
client.on(Events.MessageCreate, async message => {
    if (message.author.bot) return;
    if (!message.guild) return;

    const guildId = message.guild.id;
    const userId = message.author.id;

    // --- INÍCIO DO SISTEMA DE XP ---
    if (!message.content.startsWith(prefix)) { // Só dá XP se não for um comando
        const xpCooldownKey = 'xpGain';
        const xpGainCooldownSeconds = 60; // 1 minuto de cooldown para ganhar XP

        if (!CooldownManager.isOnCooldown(guildId, userId, xpCooldownKey)) {
            try {
                const xpToAdd = Math.floor(Math.random() * 11) + 5; // Entre 5 e 15 XP

                const user = await User.findOneAndUpdate(
                    { userId, guildId },
                    { $inc: { xp: xpToAdd } },
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                );

                // Fórmula para calcular o XP necessário para o próximo nível
                const xpToNextLevel = (level) => 5 * Math.pow(level, 2) + 50 * level + 100;

                let currentLevel = user.level || 0;
                let xpNeededForNext = xpToNextLevel(currentLevel);

                if (user.xp >= xpNeededForNext) {
                    currentLevel++;
                    // Ao subir de nível, subtraímos o XP necessário para o nível anterior do XP atual
                    // e definimos o novo nível. Isso mantém o XP "excedente" para o próximo nível.
                    // Esta é uma abordagem. Outra seria resetar user.xp para user.xp - xpNeededForNext.
                    // Por simplicidade e para evitar XP negativo se algo der errado, vamos apenas setar o nível.
                    // O XP continua acumulando. O cálculo no perfil precisará ser:
                    // XP no nível atual = user.xp - xpAcumuladoAteNivelAnterior
                    // XP para prox nivel = xpToNextLevel(currentLevel) - (user.xp - xpTotalDoNivelAnterior)
                    // Vamos ajustar para uma forma mais simples: resetar o XP do nível para 0, mas manter o XP total.
                    // Para isso, o ideal é ter dois campos de XP: xpTotal e xpNivelAtual.
                    // Como só temos user.xp (total), a lógica de "XP para o próximo nível" no perfil.js precisará ser ajustada.
                    // Por ora, a mensagem de level up é o principal.

                    // Vamos usar uma abordagem onde o XP é o total acumulado, e o nível é derivado dele.
                    // Ao subir de nível, o XP não é resetado, apenas o nível é incrementado.
                    // O perfil terá que calcular o XP para o próximo nível com base no XP total e no nível atual.
                    await User.updateOne(
                        { userId, guildId },
                        { $set: { level: currentLevel } }
                    );

                    user.level = currentLevel; // Atualiza localmente

                    const levelUpChannel = message.channel;
                    try {
                        const levelUpEmbed = new EmbedBuilder()
                            .setColor('#FFD700')
                            .setTitle('🎉 Subiu de Nível! 🎉')
                            .setDescription(`Parabéns, ${message.author}! Você alcançou o **Nível ${user.level}**!`)
                            .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
                            .setFooter({ text: `Continue assim! ✨`});
                        await levelUpChannel.send({ embeds: [levelUpEmbed], reply: { messageReference: message, failIfNotExists: false } });
                    } catch (e) {
                        console.warn("Não foi possível enviar mensagem de level up:", e.message);
                    }
                }
                CooldownManager.setOnCooldown(guildId, userId, xpCooldownKey, xpGainCooldownSeconds);

            } catch (error) {
                console.error("Erro no sistema de XP:", error);
            }
        }
    }
    // --- FIM DO SISTEMA DE XP ---

    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName);

    if (!command) return;

    const commandCooldownKey = `cmd_${command.name}`;
    const commandCooldownSeconds = command.cooldown || 3;

    if (CooldownManager.isOnCooldown(guildId, userId, commandCooldownKey)) {
        const remaining = CooldownManager.getRemainingCooldown(guildId, userId, commandCooldownKey);
        if (remaining > 0) { // Verifica se realmente há tempo restante
            try {
                const replyMsg = await message.reply(`Calma aí, apressadinho! Espere ${remaining} segundo(s) para usar o comando \`${command.name}\` novamente. 😥`);
                setTimeout(() => replyMsg.delete().catch(console.error), 5000);
            } catch (e) {
                console.warn("Não foi possível responder sobre cooldown ou deletar mensagem:", e.message);
            }
            return;
        }
    }

    try {
        command.execute(message, args, client);
        if (commandCooldownSeconds > 0) {
            CooldownManager.setOnCooldown(guildId, userId, commandCooldownKey, commandCooldownSeconds);
        }
    } catch (error) {
        console.error(`Erro ao executar o comando ${commandName}:`, error);
        try {
            await message.reply({ content: 'Houve um erro ao tentar executar esse comando!', ephemeral: true });
        } catch (e) {
            console.error("Não foi possível responder sobre erro de comando:", e.message)
        }
    }
});

// Login do bot no Discord
client.login(token);

console.log("Tentando iniciar o bot com carregador de comandos e eventos...");
