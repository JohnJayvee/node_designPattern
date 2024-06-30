const bcrypt = require('bcryptjs');
const passport = require('passport');
const jwt = require('jsonwebtoken'); // Import JWT library
const User = require('../models/User');

exports.register = async (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];

    if (!name || !email || !password || !password2) {
        errors.push({ msg: 'Please enter all fields' });
    }

    if (password !== password2) {
        errors.push({ msg: 'Passwords do not match' });
    }

    if (password.length < 6) {
        errors.push({ msg: 'Password must be at least 6 characters' });
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    try {
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            errors.push({ msg: 'Email already exists' });
            return res.status(400).json({ errors });
        }

        const newUser = new User({ name, email, password });

        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(newUser.password, salt);

        await newUser.save();
        res.status(201).json({ msg: 'You are now registered and can log in' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

exports.login = async (req, res, next) => {
    passport.authenticate('local', async (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.status(400).json({ msg: 'Email or password incorrect' });

        try {
            const isMatch = await bcrypt.compare(req.body.password, user.password);

            if (!isMatch) {
                return res.status(400).json({ msg: 'Email or password incorrect' });
            }

            const token = jwt.sign({ id: user._id }, 'your_secret_key', { expiresIn: '1h' });

            req.logIn(user, err => {
                if (err) return next(err);
                return res.status(200).json({ msg: 'You are now logged in', token, user });
            });
        } catch (err) {
            console.error('Error during login process:', err);
            return next(err);
        }
    })(req, res, next);
};

exports.logout = (req, res) => {
    req.logout(err => {
        if (err) return res.status(500).json({ msg: 'Logout error', error: err });
        res.json({ msg: 'You are logged out' });
    });
};
