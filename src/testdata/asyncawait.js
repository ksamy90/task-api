// find a single task
require('../db/mongoose');
var Task = require('../models/task');

var findTask = async (id) => {
	var task = await Task.findById(id);
	return task;
}

findTask('5ef461db433ffc162c3bc168').then((task) => {
	console.log(task);
}).catch((err) => {
	console.log(err);
});
