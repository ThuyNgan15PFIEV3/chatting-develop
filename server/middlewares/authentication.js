'use strict';
import {JWTHelper, Response} from '../helpers';
import {userRepository} from '../repositories';

export default class Authentication {

    static isAuth = async (req, res, next) => {
        try {
            let token = null;
            if (req.query.token !== undefined) {
                token = req.query.token;

            } else if (req.headers.authorization !== undefined) {
                token = req.headers.authorization;
            } else if (req.body.token !== undefined) {
                token = req.body.token;
            }
            if (token !== null && token.includes('Bearer')) {
                const tokens = token.split('Bearer ');
                if (tokens.length === 2) {
                    token = token.split('Bearer ')[1];
                }
            }
            if (token === null) {
                return Response.returnError(res, new Error('Token is not provided'));
            }
            const jwtData = await JWTHelper.verify(token);
            // Check db.
            const userLogin = await userRepository.getOne({
                where: {
                    id: jwtData.id
                }
            });
            if (!userLogin) {
                return Response.returnError(res, new Error ('User not found'));
            }
            req.user = userLogin;
            // return Response.returnSuccess(res, decoded);
            return next();
        } catch (e) {
            return Response.returnError(res, e);
        }
    };

    static authenticateSocket = async (socket) => {
        const token = socket.handshake.query.token;
        if (token === undefined) {
            return Promise.reject(new Error ('Cannot authenticate your connection'));
        }
        const jwtData = await JWTHelper.verify(token);
        const userLogin = await userRepository.getOne({
            where: {
                id: jwtData.id
            }
        });
        if (!userLogin) {
            return Response.returnError(res, new Error ('User not found'));
        }
        socket.user = userLogin;
    }

}