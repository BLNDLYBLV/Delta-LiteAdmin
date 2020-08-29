var express      = require("express");
var app          = express();
var bodyParser   = require("body-parser");
var mongoose     = require("mongoose");
var session      = require("express-session");
var passport     = require("passport"); 
var http         = require("http");
var flash        = require("connect-flash");
var mongodb      = require("mongodb");   
var server       = http.createServer(app);

var port          = process.env.PORT || 3000 ; 

mongoose.connect("mongodb://localhost/DBviewer", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// mongodb.connect("mongodb://localhost:27107",{
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// })

mongodb.MongoClient.connect('mongodb://localhost/', {
    useNewUrlParser: true,
    useUnifiedTopology: true
    },async (err,db)=>{
        if(err){
            console.log(err);
        }
        // var admindb= db.admin();
        var cdb=await db.db('Insta');
        // var admindb= db.db().admin();
        // console.log(cdb);
        // console.log(await cdb.listCollections().toArray());
        // console.log( await admindb.listDatabases());
});

// var collections;
// mongoose.connection.on('open',async function (ref){
//     mongoose.connection.db.listCollections().toArray((err,names)=>{
//         collections=names;
//         // console.log(names);
//     });
//     // console.log(mongoose.connection.db);    
// })
// mongoose.connection.db.listCollections().toArray((err,names)=>{
//     collections=names;
// });
// console.log(mongoose.connection.db);

// console.log(collections);

var User = require('./models/User');
// console.log(mongoose.model('User').schema);



var {ensureAuthenticated}=require('./config/auth');
require('./config/passport')(passport);

app.use(express.static('public'));

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(session({
    secret: 'Hail Hydra',
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());


app.use(flash());

app.use((req,res,next)=>{
    res.locals.error =req.flash('error');
    next();
});


app.use('/',require('./routes/main.js'));
app.use('/users',require('./routes/users.js'));


server.listen(port);