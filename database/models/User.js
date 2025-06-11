const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // ID do usuário do Discord
    guildId: { type: String, required: true }, // ID do servidor
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 0 },
    bio: { type: String, default: null, maxLength: 200 },
    lorinhas: { type: Number, default: 0 }, // Moeda do bot
    lastDaily: { type: Date, default: null }, // Para o comando !diario
    // Adicionar mais campos conforme necessário (cor, background, etc.)
}, { timestamps: true }); // Adiciona createdAt e updatedAt automaticamente

// Cria um índice composto para garantir que cada usuário seja único por servidor
userSchema.index({ userId: 1, guildId: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);
