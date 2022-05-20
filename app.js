const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const config = require('config');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const debug = require('debug')('go-cup:app');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

// Check if the required configs to boot are set
if(!config.get('mongoDB.connectionString')) {
    debug('FATAL ERROR: MongoDB connection string config is not set! Terminating process...');
    process.exit(1);
}

if(process.env.NODE_ENV === 'production' && !config.get('mongoDB.password')) {
    debug('FATAL ERROR: MongoDB password config (go-cup_mongoDBPassword) is not set! Terminating process...');
    process.exit(1);
}

if(!config.get('jwt.privateKey')) {
    debug('FATAL ERROR: JWT private key config (go-cup_jwtPrivateKey) is not set! Terminating process...');
    process.exit(1);
}

/*if(!config.get('session.privateKey')) {
    debug('FATAL ERROR: Session private key config (go-cup_sessionPrivateKey) is not set! Terminating process...');
    process.exit(1);
}*/

// Connect to MongoDB
let connectionString = config.get('mongoDB.connectionString');
if(process.env.NODE_ENV === 'production') {
    connectionString = connectionString.replace('<password>', config.get('mongoDB.password'));
}

mongoose.connect(connectionString, { autoIndex: true })
    .then(() => debug('MongoDB connection established successfully!'))
    .catch(err => debug('Could not connect to MongoDB!', err));

const app = express();

/*app.use(session({
    secret: config.get('session.privateKey'),
    store: MongoStore.create({
        client: mongoose.connection.getClient(),
        dbName: 'go-cup'
    }),
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
    resave: false,
}));*/

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;