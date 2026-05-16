const mongoose = require('mongoose');

const systemLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
    },

    performedBy: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },

        name: String,

        role: String,
    },

    target: {
        type: String,
        default: '',
    },

    details: {
        type: String,
        default: '',
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('SystemLog', systemLogSchema);