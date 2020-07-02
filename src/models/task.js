const mongoose = require('mongoose')

// Create the task model structure
var taskSchema = new mongoose.Schema({
	description: {
		type: String,
		required: true,
		trim: true
	},
	completed: {
		type: Boolean,
		default: false
	},
	owner: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'User'
	}
}, {
	timestamps: true
});

var Task = mongoose.model('Task', taskSchema);

module.exports = Task;
