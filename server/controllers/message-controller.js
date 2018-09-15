'use strict';
import {User} from '../models';
import {Response} from '../helpers';
import {messageRepository} from '../repositories';

export default class MessageController {

    getListMessage = async (req, res, next) => {
        try {
            const groupId = req.params.id;
            const {page, limit} = req.query;
            const offset = (page - 1) * limit;
            const messages = await messageRepository.getAll({
                where: {
                    groupId
                },
                include: [
                    {
                        model: User,
                        as: 'author'
                    }
                ],
                order: [
                    ['createdAt','DESC']
                ],
                limit,
                offset,
            });
            return Response.returnSuccess(res, messages);
        } catch (e) {
            return Response.returnError(res, e);
        }
    };

    createMessage = async (req, res) => {
        try {
            const userLoginId = req.user.id;
            const groupId = req.params.id;
            const {body, type} = req.body;
            const message = await messageRepository.create({
                authorId: userLoginId,
                body,
                type,
                groupId
            });
            message.dataValues.author = req.user;
            delete message.dataValues.authorId;
            if (!req.socket || !req.socket.to) {
                req.socket = __emitter;
            }
            req.socket.to(groupId).emit('messages', {
                action: 'create',
                data: message
            });
            return Response.returnSuccess(res, message);
        } catch (e) {
            return Response.returnError(res, new Error('Can not create message'));
        }
    };

}