import GroupEvent from './group-event';
import MessageEvent from './message-event';
import { Authentication } from '../middlewares';

export default class SocketInitialization {

    static connect (io) {
        io
            .use(async (socket, next) => {
                try {
                    await Authentication.authenticateSocket(socket);
                    next();
                } catch (e) {
                    return next(e);
                }
            })
            .on('connection', function (socket) {
                console.log(`-----------Socket ${socket.id} connected------------`);
                // Init group event, message event.
                // Join your self group
                // socket.join(socket.user.id);
                // socket.id = socket.user.id;
                // socket.to(socketId).emit()
                // broadcast....
                // save socket Id of user to db.
                GroupEvent.initialize(socket);
                MessageEvent.initialize(socket);
                // Handle disconnect
                socket.on('disconnect', function () {
                    console.log('-----------Socket disconnect------------');
                });
            });
    }

}