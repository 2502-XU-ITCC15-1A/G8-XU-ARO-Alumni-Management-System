const SystemLog = require('../models/SystemLog');

const logAction = async ({
    action,
    user,
    target = '',
    details = '',
}) => {
    try {
        if (!action || !user) return;

        await SystemLog.create({
            action: action.trim(),

            performedBy: {
                userId: user._id,
                name: user.name || 'Unknown User',
                role: user.role || 'Unknown Role',
            },

            target: target || '—',

            details: details || '—',
        });

    } catch (err) {
        console.error('SYSTEM LOG ERROR:', err);
    }
};

module.exports = logAction;