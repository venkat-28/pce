// middleware/auth.js
const authMiddleware = (req, res, next) => {
    if (req.session && req.session.user) {
        next();
    } else {
        res.redirect('/login.html');
    }
};

module.exports = authMiddleware;