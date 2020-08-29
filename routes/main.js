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
            // console.log(Object.getOwnPropertyNames(docs[0]));
            res.render('docs.ejs',{c:await cdb.collection(cname).find().toArray(),dbname:dbname,properties:properties,dbname:dbname,cname:cname});
    });    
    // console.log(dbs);
});
app.post('/dbdelete/:dbname',(req,res)=>{
    var dbname=req.params.dbname;
    mongodb.MongoClient.connect('mongodb://localhost/', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    },async (err,db)=>{
        var cdb=db.db(dbname);
        await cdb.dropDatabase();
        res.redirect('/databases');
    });
});
app.post('/cdelete/:dbname/:cname',(req,res)=>{
    var dbname=req.params.dbname;
    var cname=req.params.cname;
    mongodb.MongoClient.connect('mongodb://localhost/', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    },async (err,db)=>{
        var cdb=db.db(dbname);
        await cdb.dropCollection(cname);
        res.redirect('/collections/'+dbname);
    });
});
app.post('/adddb',(req,res)=>{
    var dbname=req.body.dbname;
    var cname=req.body.cname;
    var already=0;
    mongodb.MongoClient.connect('mongodb://localhost/', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    },async (err,db)=>{
            if(err){
                console.log(err);
            }
            var admindb= db.db().admin();
            var dbs =await admindb.listDatabases();
            for(var i=0;i<dbs.databases.length;t++){
                if(dbs[i].databases.name==dbname){
                    already=1;
                }
            }
    });
    if(already==0){
        mongodb.MongoClient.connect('mongodb://localhost/'+dbname, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        },async (err,db)=>{
            var cdb=db.db(dbname);
            await cdb.createCollection(cname);
            res.redirect('/databases');
        });
    }
    res.redirect('/databases');
});
app.post('/addelement/:dbname/:cname',(req,res)=>{
    var cname=req.params.cname;
    var dbname=req.params.dbname;
    var jsontxt=req.body.jsontxt;
    var newobj=JSON.parse(jsontxt);
    mongodb.MongoClient.connect('mongodb://localhost/', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    },async (err,db)=>{
        var cdb=db.db(dbname);
        await cdb.collection(cname).insertOne(newobj);
        res.redirect('/docs/'+cname+'/'+dbname);
    });
});
app.post('/upelement/:dbname/:cname',(req,res)=>{
    var cname=req.params.cname;
    var dbname=req.params.dbname;
    var jsontxt=req.body.jsontxt;
    var setobj=JSON.parse(jsontxt);
    var newobj=setobj;
    delete setobj._id;
    console.log(Object.getOwnPropertyNames(setobj)[0]);
    var setobjstr='{ $set:';
    // for(var i=0;i<Object.getOwnPropertyNames(setobj).length;i++){
    //     setobjstr+= Object.getOwnPropertyNames(setobj)[i]
    //     setobjstr+= ':'
    //     setobjstr+= setobj[Object.getOwnPropertyNames(setobj)[i]];
    // }
    var id=(newobj._id);
    setobjstr+=JSON.stringify(setobj)
    setobjstr+='}';
    console.log(setobjstr);
    mongodb.MongoClient.connect('mongodb://localhost/', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    },async (err,db)=>{
        var cdb=db.db(dbname);
        await cdb.collection(cname).updateOne({_id: new mongodb.ObjectID(id)},{$set: setobj},{ upsert: false });
        res.redirect('/docs/'+cname+'/'+dbname);
    });
});
app.post('/elementdelete/:dbname/:cname/:id',(req,res)=>{
    var cname=req.params.cname;
    var dbname=req.params.dbname;
    var id=req.params.id;
    console.log(id);
    mongodb.MongoClient.connect('mongodb://localhost/', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    },async (err,db)=>{
        var cdb=db.db(dbname);
        await cdb.collection(cname).deleteOne({_id: new mongodb.ObjectID(id)});
        res.redirect('/docs/'+cname+'/'+dbname);
    });
});
module.exports =app;
