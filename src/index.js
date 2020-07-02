var express = require('express');
require('./db/mongoose');
var userRouter = require('./routers/user');
var taskRouter = require('./routers/task');

var app = express();
var port = process.env.PORT || 3000;

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
	console.log(`Server is up on port ${port}`);
});

// var jwt = require('jsonwebtoken');

// var myData = async () => {
// 	var token = jwt.sign({ _id: '123'}, 'mycourse');
// 	console.log(token);

// 	var data = jwt.verify(token, 'mycourse');
// 	console.log(data);
// }

// myData();
