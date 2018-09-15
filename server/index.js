'use strict';

import Express from 'express';
import BodyParser from 'body-parser';
import Cors from 'cors';
import FS from 'fs-extra';
import Http from 'http';
import Path from 'path';
import { SocketInitialization } from './socket-handler';
import RedisAdapter from 'socket.io-redis';

const app = Express();
global.__rootDir = __dirname.replace('/server', '');

app
    .use(Cors())
    .use(BodyParser.json())
    .use(BodyParser.urlencoded({extended: true}))
    .use(Express.static(Path.resolve(__dirname, '..', 'public'), {maxAge: 31557600000}))
	.set('views', Path.join(__dirname, '..', 'public', 'views'))
	.set('view engine', 'ejs');

const routePath = `${__dirname}/routes/`;
FS.readdirSync(routePath).forEach((file) => {
    require(`${routePath}${file}`)(app);
});

const server = Http.createServer(app).listen(3030, () => {
    console.log(`App listening on 3030!`);
});

// Integrate socket to server.
const io = require('socket.io')(server);
// Connect io to redis.
io.adapter(RedisAdapter({ host: '127.0.0.1', port: 6379 }));
// Emitter
const emitter = require('socket.io-emitter')({ host: '127.0.0.1', port: 6379 });
global.__emitter = emitter;

SocketInitialization.connect(io);