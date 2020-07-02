var express = require('express')
var Task = require('../models/task');
const auth = require('../middleware/auth');
var router = new express.Router();

// Create a post request 
// description, completed
// '/tasks'
router.post('/tasks', auth, async (req, res) => {
	var task = new Task({
		...req.body,
		owner: req.user._id
	});

	try {
		await task.save();
		res.status(201).send(task);
	} catch (err) {
		res.status(400).send(err);
	}
});

// get all tasks
// 'get request'
// '/tasks'
// '/tasks?completed=true'
// '/tasks?limit=2'
// '/tasks?skip=2'
// '/tasks?sortBy=createdAt:desc'
router.get('/tasks', auth, async (req, res) => {
	var match = {}
	var sort = {}

	if (req.query.completed) {
		match.completed = req.query.completed === 'true'
	}

	if (req.query.sortBy) {
		var parts = req.query.sortBy.split(':');
		sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
	}

	try {
		await req.user.populate({
			path: 'tasks',
			match,
			options: {
				limit: parseInt(req.query.limit),
				skip: parseInt(req.query.skip),
				sort
			}
		}).execPopulate();
		res.send(req.user.tasks);
	} catch (err) {
		res.status(500).send(err);
	}
});

// get a single task ('/tasks/:id')
router.get('/tasks/:id', auth, async (req, res) => {
	var id = req.params.id;

	try {
		var task = await Task.findOne({ id, owner: req.user._id });
		if (!task) {
			return res.status(404).send();
		}
		res.send(task);
	} catch (err) {
		res.status(500).send(err);
	}
});

// update task
router.patch('/tasks/:id', auth, async (req, res) => {
	var updates = Object.keys(req.body);
	var allowedUpdates = ['description', 'completed'];
	var isValidOperation = updates.every((update) => allowedUpdates.includes(update));

	if (!isValidOperation) {
		return res.status(400).send({ error: 'Invalid data input' });
	}

	try {
		var task = await Task.findOne({ id: req.params.id, owner: req.user._id });

		if (!task) {
			return res.status(404).send();
		}
		updates.forEach((update) => task[update] = req.body[update]);
		await task.save()
		res.send(task);
	} catch (err) {
		res.status(400).send(err);
	}
});

// delete a task (findByIdAndDelete) ('/tasks/:id')
// use async wait to do this delete path
router.delete('/tasks/:id', auth, async (req, res) => {
	try {
		var task = await Task.findOneAndDelete({ id: req.params.id, owner: req.user._id });
		if (!task) {
			return res.status(404).send();
		}
		res.send(task);
	} catch (err) {
		res.status(500).send(err);
	}
});

module.exports = router;


// data struts // notesapp

// apis // budget (front-end, backend, deployment)

// react, redux, testing(jest, enzyme), express, heroku, sass, firebase, oauth