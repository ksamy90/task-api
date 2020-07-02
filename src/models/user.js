var mongoose = require('mongoose');
var validator = require('validator');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var Task = require('./task');

var userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true
	}, 
	email: {
		type: String,
		required: true,
		trim: true,
		lowercase: true,
		validate(value) {
			if(!validator.isEmail(value)) {
				throw new Error('Email is invalid')
			}
		}
	},
	password: {
		type: String,
		required: true,
		minLength: 8,
		trim: true,
		validate(value) {
			if (value.toLowerCase().includes('password')) {
				throw new Error('Password cannot contain "password"')
			}
		}
	},
	age: {
		type: Number,
		default: 0,
		validate(value) {
			if (value < 0) {
				throw new Error('Age must be a positive number')
			}
		}
	},
	tokens: [{
		token: {
			type: String,
			required: true
		}
	}]
}, {
	timestamps: true
});

userSchema.virtual('tasks', {
	ref: 'Task',
	localField: '_id',
	foreignField: 'owner'
});

// middleware
userSchema.pre('save', async function (next) {
	var user = this;

	if (user.isModified('password')) {
		user.password = await bcrypt.hash(user.password, 8)
	}

	next();
});

// delete user tasks when user is removed
userSchema.pre('remove', async function (next) {
	const user = this;
	await Task.deleteMany({ owner: user._id })
	next();
});

// helpful guidance for using resource when logged in
userSchema.methods.generateToken = async function () {
	var user = this;
	var token = jwt.sign({ _id: user._id.toString() }, 'nodejsapp');
	user.tokens = user.tokens.concat({ token });
	await user.save();
	return token;
}

// edit the userschema
userSchema.methods.toJSON = function () {
	var user = this;
	var userObject = user.toObject();

	delete userObject.password;
	delete userObject.tokens;

	return userObject;
}

// middleware for data resource in database
userSchema.statics.findByCredentials = async (email, password) => {
	var user = await User.findOne({ email });

	if (!user) {
		throw new Error('Unable to login');
	}

	var isMatch = await bcrypt.compare(password, user.password);

	if (!isMatch) {
		throw new Error('Wrong password in use')
	}

	return user;
}

// Create the user model structure
var User = mongoose.model('User', userSchema);

module.exports = User;
