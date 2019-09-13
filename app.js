const mongoose = require('mongoose');
const express = require("express");
const bodyparser = require('body-parser');
const morgan = require('morgan');
const mongodb = require("mongodb");

const url = "mongodb://localhost:27017/taskDB";
const MongoClient = mongodb.MongoClient;
const app = express();

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(express.static('public'));
app.use(express.static('css'));
app.use(express.static('images'));
app.use(bodyparser.urlencoded({ extended: false }));
app.use(morgan('common'));
app.listen(8080);

const Developer = require('./models/developer');
const Task = require('./models/tasks');

MongoClient.connect(url , {useNewUrlParser: true },
    function (err, client) {
        if(err){
            console.log("Err ", err);
        } 
        else {
            console.log("Connection successfully to Mongo server");
            db = client.db("labDB"); //DB Name
        }
    });

mongoose.connect(url, function (err) {
    if(err){
        console.log('Error in Mongoose connection');
        throw err;
    }
    console.log('Successfully connected to Mongoose');
});

    var taskDb = mongoose.connection;
    app.get('/', function (req, res){
    res.render('index.html');
    });

    app.get('/listTask', function (req, res){
    Task.find( {}, function (err, docs){
        res.render('listTask', {labDB: docs});
        });
    });

    app.get('/newTask', function (req, res){
    res.sendFile(__dirname + '/views/newTask.html');
    });

    app.get('/updateTask', function (req, res){
    res.sendFile(__dirname + '/views/updateTask.html' , {labDB:db});
    });

    app.get('/deleteTask', function (req, res){
    res.sendFile(__dirname + '/views/deleteTask.html' , {labDB:db});
    });

    app.get('/newDeveloper', function( req, res){
    res.sendFile(__dirname + '/views/newDeveloper.html');
    });

    app.get('/getDevelopers', function( req, res){
    Developer.find({},function (err, docs){
        if (err)throw err;
        res.render('getDevelopers', {labDB: docs});
    });
    });

    app.post('/newTask', function (req, res){
        let taskDetails = req.body;
        var task1 = new Task({
            _id: new mongoose.Types.ObjectId(),
            name: taskDetails.tname,
            assign: taskDetails.assto,
            dueDate: taskDetails.due,
            status: taskDetails.stat,
            description: taskDetails.desc
        });
        task1.save(function (err){
            if(err) throw err;
            console.log('Task successfully added to DB');
        });
        res.redirect('/listTask');
    });

    app.post('/updateTask', function (req, res){
    let taskdetails = req.body;
    Task.updateOne({'_id': taskdetails.id }, { $set: {
            //name: taskdetails.tname,
            //assign: taskdetails.assto,
            //dueDate: taskdetails.due,
            status: taskdetails.newStatus,
            //description: taskdetails.desc
            }
        },
        function (err, doc) {
            console.log("Task successfully deleted");     
        });
    res.redirect('/listTask');
    });

    app.post('/deleteTask', function (req, res){
    let taskdetails = req.body;
    Task.deleteOne({ '_id': taskdetails.id }, function(err, doc){
        console.log("Task deleted");
    });
    res.redirect('/listTask');
    });

    app.post('/deleteAll', function (req, res){
    let taskdetails = req.body;
    Task.deleteMany( {'status':'Complete'}, function(err, doc){
        console.log("All tasks deleted");
    });
    res.redirect('/listTask');
    });

    app.post('/newDeveloper', function (req, res){
    let devdetails = req.body;
    var developer1 = new Developer({
        _id: new mongoose.Types.ObjectId(),
        name:{
            firstName: devdetails.fname,
            lastName: devdetails.lname
        },
        level: devdetails.level,
        address: {
            State: devdetails.state,
            Suburb: devdetails.suburb,
            Street: devdetails.street,
            Unit: devdetails.unit
        }
    });
    developer1.save(function (err){
        if(err) throw err;
        console.log('Developer successfully added to DB');
    });
    res.redirect('/getDevelopers');
});
