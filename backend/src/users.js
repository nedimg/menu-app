const User = require('./models/user');

const setPassword = (req, res) => {
    req.user.setPassword(req.body.password, () => {
        res.status(200).send({
            success: true,
            message: 'password is set',
        });
    });
};


const getAll = (req, res) => {
    User
        .find({})
        .then(users => res.json(users));
};

const getOne = (req, res) => {
    User
        .findOne({ id: req.params.id })
        .then(user => res.json(user));
};

module.exports = {
    getOne,
    getAll,
    setPassword,
};
