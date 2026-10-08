const respondWithError = (res, error) => {
    if (error.name === 'ValidationError' || error.name === 'CastError') {
        return res.status(400).json({ message: error.message });
    }
    if (error.code === 11000) {
        return res.status(409).json({ message: 'A record with these details already exists.' });
    }

    console.error('[API Error]', error);
    return res.status(500).json({ message: 'Internal server error.' });
};

const getPagination = (req) => {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
    return { page, limit, skip: (page - 1) * limit };
};

const pickFields = (source, fields) => Object.fromEntries(
    fields.filter((field) => source[field] !== undefined).map((field) => [field, source[field]])
);

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const canManage = (owner, user) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    const ownerId = (owner && owner._id) ? owner._id : owner;
    return Boolean(ownerId && ownerId.toString() === (user.id || user._id).toString());
};

module.exports = { respondWithError, getPagination, pickFields, escapeRegex, canManage };