import { groupController, memberGroupController } from '../controllers';
import GroupController from '../controllers/group-controller';
export default class GroupEvent {

    static async initialize (socket) {
        // Get all active group ID => socket.join(groupIds);
        const groupIds = await GroupController.getActiveGroupIds(socket.user.id);
        for (const groupId of groupIds) {
            console.log('----------Join to---------');
            console.log(groupId);
            socket.join(groupId);
        }
        // socket.join(socket.user.id);
        socket.on('rooms', function(requestData, callback) {
            const { groupId } = requestData.data;
            const membersGroup = memberGroupController.getListMembersGroup(
                groupId
            );
            switch (requestData.action) {
                case 'join':
                    try {
                        socket.broadcast.to(requestData.data.groupId).emit('rooms', {
                            action: 'join',
                            data: {
                                members: membersGroup
                            }
                        });
                        return callback(null, {
                            action: 'join',
                            data: {
                                members: membersGroup
                            }
                        });
                    } catch(e) {
                        return callback(e);
                    }
            }
        });
    }
}