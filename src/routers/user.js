var express = require('express')
var User = require('../models/user');
var auth = require('../middleware/auth');
var router = new express.Router();

router.post('/users', async (req, res) => {
	var user = new User(req.body);

	try {
		await user.save();
		var token = await user.generateToken();
		res.status(201).send({ user, token });
	} catch (err) {
		res.status(400).send(err);
	}
});

router.post('/users/login', async (req, res) => {
	try {
		var user = await User.findByCredentials(req.body.email, req.body.password);
		var token = await user.generateToken()
		res.send({ user, token });
	} catch (err) {
		res.status(400).send(err);
	}
});

router.post('/users/logout', auth, async (req, res) => {
	try {
		req.user.tokens = req.user.tokens.filter((token) => {
			return token.token !== req.token;
		});
		await req.user.save();

		res.send();
	} catch (err) {
		res.status(500).send(err);
	}
});

router.post('/users/logoutAll', auth, async (req, res) => {
	try {
		req.user.tokens = []
		await req.user.save();

		res.send();
	} catch (err) {
		res.status(500).send(err);
	}
});

router.get('/users/me', auth, async (req, res) => {
	res.send(req.user);
});

// update a user
router.patch('/users/me', auth, async (req, res) => {
	var updates = Object.keys(req.body);
	var allowedUpdates = ['name', 'email', 'password', 'age'];
	var isValidOperation = updates.every((update) => allowedUpdates.includes(update));

	if (!isValidOperation) {
		return res.status(400).send({ error: 'Invalid updates' });
	}

	try {
		updates.forEach((update) => req.user[update] = req.body[update]);
		await req.user.save();
		res.send(req.user);
	} catch (err) {
		res.status(400).send(err);
	}
});

// delete a user
router.delete('/users/me', auth, async (req, res) => {
	try {
		await req.user.remove()
		res.send(req.user);
	} catch (err) {
		res.status(500).send(err);
	}
});

module.exports = router;
