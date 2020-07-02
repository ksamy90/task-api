var jwt = require('jsonwebtoken');
var User = require('../models/user');

var auth = async (req, res, next) => {
	try {
		const token = req.header('Authorization').replace('Bearer ', '');
		const decoded = jwt.verify(token, 'nodejsapp');
		const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })

		if (!user) {
			throw new Error();
		}

		req.user = user;
		next();
	} catch (err) {
		res.status(401).send({ error: 'Please login' });
	}
}

module.exports = auth;
