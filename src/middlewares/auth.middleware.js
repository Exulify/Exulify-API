import jwt from 'jsonwebtoken';

export function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = (req.cookies && req.cookies.token) || (authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null) || req.query.token;

    if (!token) {
        return res.status(401).json({ success: false, message: 'Tidak memiliki Akses!' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        console.error('Token verification error:', err);
        return res.status(403).json({ success: false, message: 'Token tidak valid!' });
    }
}