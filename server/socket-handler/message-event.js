import { messageController } from '../controllers';

export default class MessageEvent {

    static initialize (socket) {
        socket.on('messages', async function (requestData, callback) {
            const { body, type, groupId } = requestData.data;
            switch (requestData.action) {
                case 'create':
                    try {
                        const message = await messageController.createMessage(
                            {
                                params: {
                                    id: groupId
                                },
                                body: {
                                    body,
                                    type
                                },
                                user: socket.user,
                                socket
                            }
                        );
                        return callback(null, message);
                    } catch (e) {
                        return callback(e);
                    }
                    break;
                default:
                    break;
            }
        });
    }

}