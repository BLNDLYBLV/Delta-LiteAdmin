var express = require('express');
var app = express();
var mongoose = require('mongoose');
var mongodb= require("mongodb");   
var {ensureAuthenticated}=require('../config/auth');
var async = require('async');

var User= require('../models/User');
var uri;
app.get('/', (req,res) => {
    res.redirect('/users/login');
});
app.get('/connect',(req,res)=>{
    res.render('connect.ejs');
});
app.post('/connect',(req,res)=>{
    var cstring=req.body.connectstring;
    // var dbs;
    if(cstring==undefined){
        
        res.redirect('/databases');
    } 
});
app.get('/databases',(req,res)=>{
    var dbs;
    mongodb.MongoClient.connect('mongodb://localhost/', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    },async (err,db)=>{
            if(err){
                console.log(err);
            }
            // var admindb= db.admin();
            // var cdb=await db.db('Insta');
            var admindb= db.db().admin();
            // console.log(cdb);
            // console.log(await cdb.listCollections().toArray());
            // console.log( await admindb.listDatabases());
            res.render('databases.ejs',{dbs:await admindb.listDatabases(),dbname:null});
    });
    console.log(dbs);
});
app.get('/collections/:dbname',(req,res)=>{
    var dbname=req.params.dbname;
    // console.log(dbname);
    mongodb.MongoClient.connect('mongodb://localhost/', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    },async (err,db)=>{
            if(err){
                console.log(err);
            }
            var cdb=await db.db(dbname);
            // console.log(cdb);
            // console.log(await cdb.listCollections().toArray());
            res.render('collections.ejs',{c:await cdb.listCollections().toArray(),dbname:dbname});
    });
});

app.get('/docs/:cname/:dbname',(req,res)=>{
    var cname=req.params.cname;
    var dbname=req.params.dbname;
    mongodb.MongoClient.connect('mongodb://localhost/', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    },async (err,db)=>{
            if(err){
                console.log(err);
            }
            var cdb=await db.db(dbname);
            // console.log(cdb);
            var docs= await cdb.collection(cname).find().toArray();
            var properties=[];
            for(var i=0;i<docs.length;i++){
                if(properties.length<Object.getOwnPropertyNames(docs[i]).length){
                    properties=Object.getOwnPropertyNames(docs[i]);
                }
            }
            console.log(Object.getOwnPropertyNames(docs[0]));
            res.render('docs.ejs',{c:await cdb.collection(cname).find().toArray(),dbname:dbname,properties:properties});
    });    
    // console.log(dbs);
});

module.exports =app;
