'use strict';
import {Group, User, Op, MemberGroup} from '../models';
import {Response} from '../helpers';
import {groupRepository, memberGroupRepository} from '../repositories';

export default class GroupController {

    static getActiveGroupIds = async (userId) => {
        const memberGroups = await memberGroupRepository.getAll({
            where: {
                userId
            },
            attributes: ['groupId']
        });
        return memberGroups.map(item => item.groupId);
    };

    getListActiveGroup = async (req, res, next) => {
        try {
            const groupIds = await GroupController.getActiveGroupIds(req.user.id);
            const groups = await groupRepository
                .getAll(
                    {
                        where: {
                            id: groupIds
                        },
                        attributes: {
                            exclude: ['authorId']
                        },
                        order: [
                            ['createdAt', 'DESC']
                        ]
                    }
                );
            return Response.returnSuccess(res, groups);
        } catch (e) {
            return Response.returnError(res, e);
        }
    };

    createGroup = async (req, res, next) => {
        let newGroup = null;
        try {
            const userLoginId = req.user.id;
            const { name, type, memberIds, partnerId } = req.body;
            let memberGroupIds = [];
            switch (type) {
                case 'private':
                    if (partnerId === undefined) {
                        return Response.returnError(res, new Error('partnerId is required field'));
                    }
                    const existingGroup = await Group.findOne({
                        where: {
                            [Op.or]: [
                                {
                                    authorId: userLoginId,
                                    partnerId: partnerId
                                },
                                {
                                    partnerId: userLoginId,
                                    authorId: partnerId
                                }
                            ]
                        }
                    });
                    if (existingGroup) {
                        return Response.returnSuccess(res, existingGroup);
                    }
                    memberGroupIds = [userLoginId, partnerId];
                    break;
                case 'group':
                    if (name === undefined) {
                        return Response.returnError(res, new Error('Name group is required field'));
                    }
                    if (memberIds === undefined || !Array.isArray(memberIds) || memberIds.length === 0) {
                        return Response.returnError(res, new Error('Member group is invalid'));
                    }
                    if (!memberIds.includes(userLoginId)) {
                        memberIds[memberIds.length] = userLoginId;
                    }
                    memberGroupIds = memberIds;
                    break;
                default:
                    return Response.returnError(res, new Error('Invalid type group'));
            }
            newGroup = await Group.create({
                name,
                authorId: userLoginId,
                type,
                partnerId
            });
            const memberGroups = memberGroupIds.map(item => {
                return {
                    userId: item,
                    groupId: newGroup.id
                }
            });
            await MemberGroup.bulkCreate(memberGroups);
            if (res !== undefined) {
                return Response.returnSuccess(res, newGroup);
            } else {
                newGroup.memberGroupIds = memberGroupIds;
                return newGroup;
            }
            return Response.returnSuccess(res, newGroup);
        } catch (e) {
            if (newGroup) {
                Group.destroy({
                    force: true,
                    where: {
                        id: newGroup.id
                    }
                });
            }
            return Response.returnError(res, e);
        }
    };
    deleteGroup = async (req, res, next) => {
        try {
            const userLoginId = req.user.id;
            const {id} = req.params;
            const data = await Group.destroy({
                where: {
                    id,
                    userLoginId
                }
            });
            return Response.returnSuccess(res, data);
        } catch (e) {
            return Response.returnError(res, e);
        }

    };
    updateGroup = async (req, res, next) => {
        try {
            const userLoginId = req.user.id;
            const {id} = req.params;
            const {name, avatar, type} = req.body;
            const groups = await  Group.update(
                {
                    name,
                    avatar,
                    type,
                    authorId: userLoginId
                },
                {
                    where: {
                        id
                    }
                }
            );
            if (groups[0] === 0) {
                return Response.returnError(res, new Error('update group error'));
            }
            return Response.returnSuccess(res, groups[1]);
        } catch (e) {
            return Response.returnError(res, e);
        }
    };
    getOneGroup = async (req, res, next) => {
        try {
            const {id} = req.params;
            const group = await  Group.find({
                where: {
                    id
                },
                include: [
                    {
                        model: MemberGroup,
                        as: 'members',

                    }
                ]
            });
            return Response.returnSuccess(res, group);
        } catch (e) {
            return Response.returnError(res, e);
        }
    };
}