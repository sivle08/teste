// Conteúdo para utils/cooldownManager.js:
const userCooldowns = new Map(); // Armazena os cooldowns: key -> timestamp

// A chave será uma combinação de guildId, userId e uma string identificadora (nome do comando ou 'xpGain')
// Ex: 'guild123-user456-ping' ou 'guild123-user456-xpGain'

module.exports = {
    CooldownManager: {
        setOnCooldown: (guildId, userId, identifier, durationSeconds) => {
            const key = `${guildId}-${userId}-${identifier}`;
            userCooldowns.set(key, Date.now() + durationSeconds * 1000);
            // console.log(`[Cooldown] Set: ${key} for ${durationSeconds}s`);
        },
        isOnCooldown: (guildId, userId, identifier) => {
            const key = `${guildId}-${userId}-${identifier}`;
            const cooldownEnd = userCooldowns.get(key);

            if (cooldownEnd && Date.now() < cooldownEnd) {
                // console.log(`[Cooldown] Still on cooldown: ${key}`);
                return true; // Ainda em cooldown
            }
            // Remove cooldowns expirados para economizar memória (importante para Map de longa duração)
            if (cooldownEnd) {
                userCooldowns.delete(key);
                // console.log(`[Cooldown] Expired and deleted: ${key}`);
            }
            return false; // Não está em cooldown ou cooldown expirou
        },
        getRemainingCooldown: (guildId, userId, identifier) => {
            const key = `${guildId}-${userId}-${identifier}`;
            const cooldownEnd = userCooldowns.get(key);
            if (cooldownEnd && Date.now() < cooldownEnd) {
                return Math.ceil((cooldownEnd - Date.now()) / 1000); // Segundos restantes
            }
            return 0;
        }
    }
};
