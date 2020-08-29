var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    id: String,
    username: String,
    password: String,
    email: String
});

var User = mongoose.model('User',userSchema);

module.exports=User;