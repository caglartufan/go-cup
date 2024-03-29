require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('config');
const socketio = require('socket.io');
const debug = require('debug')('go-cup:app');

const ServiceRegistry = require('./Service/ServiceRegistry');
const { NotFoundError, ErrorHandler } = require('./utils/ErrorHandler');
const { auth, forceAuth } = require('./websocket/middlewares');
const handlers = require('./websocket/handlers');

// General Routes
const indexRouter = require('./routes/index');

// REST API Routes
const authRouter = require('./routes/api/auth');
const gamesRouter = require('./routes/api/games');
const usersRouter = require('./routes/api/users');

// Check if the required configs to boot are set
if(!config.get('mongoDB.connectionString')) {
	debug('FATAL ERROR: MongoDB connection string config is not set! Terminating process...');
	process.exit(1);
}

if(!process.env.NODE_ENV === 'production' && !config.get('mongoDB.password')) {
	debug('FATAL ERROR: MongoDB password config (go-cup_mongoDBPassword) is not set! Terminating process...');
	process.exit(1);
}

if(!process.env.NODE_ENV === 'production' && !config.get('jwt.privateKey')) {
	debug('FATAL ERROR: JWT private key config (go-cup_jwtPrivateKey) is not set! Terminating process...');
	process.exit(1);
}

/*if(!config.get('session.privateKey')) {
    debug('FATAL ERROR: Session private key config (go-cup_sessionPrivateKey) is not set! Terminating process...');
    process.exit(1);
}*/

// Connect to MongoDB
let connectionString = config.get('mongoDB.connectionString');
const connectionPassword = config.get('mongoDB.password');
if(connectionPassword) {
	connectionString = connectionString.replace('<password>', connectionPassword);
}

mongoose.connect(connectionString)
	.then(() => debug('MongoDB connection established successfully!'))
	.catch(err => debug('Could not connect to MongoDB!', err));

const app = express();

// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({
	allowedHeaders: ['Content-Type', 'Authorization'],
	exposedHeaders: ['Content-Type', 'Authorization'],
	credentials: true
}));

// Listen on provided port and initialize Express HTTP server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
	debug(`Listenin on port ${port}`);
});

// Initialize websocket server
const io = socketio(server, {
	cors: {
		allow: 'http://localhost:3001'
	},
	serveClient: false
});

// Initialize App-wide ServiceRegistry object with initialized websocket server object
const services = new ServiceRegistry(io);

// Set Express server variables
app.set('services', services);
app.set('io', io);

io.use(auth.bind(null, services));

io.on('connection', socket => {
	const disallowedEvents = ['loggedOut', 'play', 'fetchQueueData', 'cancel', 'gameChatMessage', 'cancelGame', 'resignFromGame', 'requestUndo', 'rejectUndoRequest', 'acceptUndoRequest', 'pass', 'cancelFinishing', 'confirmFinishing', 'negateGroupOrEmptyGroup', 'addStone'];
	socket.use(forceAuth(disallowedEvents, socket));

	handlers.onConnection(services, socket);
	socket.on('disconnecting', handlers.onDisconnecting.bind(null, io, socket));
	socket.on('disconnect', handlers.onDisconnect.bind(null, services, socket));

	socket.on('authenticated', handlers.onAuthenticated.bind(null, services, socket));
	socket.on('loggedOut', handlers.onLoggedOut.bind(null, io, services, socket));

	socket.on('play', handlers.onPlay.bind(null, io, services, socket));
	socket.on('fetchQueueData', handlers.onFetchQueueData.bind(null, services, socket));
	socket.on('cancel', handlers.onCancel.bind(null, io, services, socket));
	socket.on('joinGameRoom', handlers.onJoinGameRoom.bind(null, io, socket));
	socket.on('leaveGameRoom', handlers.onLeaveGameRoom.bind(null, io, socket));
	socket.on('gameChatMessage', handlers.onGameChatMessage.bind(null, io, services, socket));
	socket.on('cancelGame', handlers.onCancelGame.bind(null, io, services, socket));
	socket.on('resignFromGame', handlers.onResignFromGame.bind(null, io, services, socket));
	socket.on('requestUndo', handlers.onRequestUndo.bind(null, io, services, socket));
	socket.on('rejectUndoRequest', handlers.onRejectUndoRequest.bind(null, io, services, socket));
	socket.on('acceptUndoRequest', handlers.onAcceptUndoRequest.bind(null, io, services, socket));
	socket.on('pass', handlers.onPass.bind(null, io, services, socket));
	socket.on('cancelFinishing', handlers.onCancelFinishing.bind(null, io, services, socket));
	socket.on('confirmFinishing', handlers.onConfirmFinishing.bind(null, io, services, socket));
	socket.on('negateGroupOrEmptyGroup', handlers.onNegateGroupOrEmptyGroup.bind(null, io, services, socket));
	socket.on('addStone', handlers.onAddStone.bind(null, io, services, socket));
});

// Web routes
app.use('/', indexRouter);

// REST API routes
app.use('/api', authRouter);
app.use('/api/games', gamesRouter);
app.use('/api/users', usersRouter);

// Catch 404 and forward to error handler route
app.use(function(req, res, next) {
	next(new NotFoundError());
});

// Error handler route
app.use(function(err, req, res, next) {
	// Set locals, only providing error details in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// TODO: Can add url prefix control like if the url starts with /api to return json or http error redirection in SPA
	// Render the error page or respond with error
	res.status(err.status);
	res.json({
		ok: false,
		message: err.message,
		errors: err.errors
	});
});