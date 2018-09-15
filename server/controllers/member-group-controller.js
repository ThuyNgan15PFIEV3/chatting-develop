'use strict';

import {Group, User, Op, MemberGroup} from '../models';
import {Response} from '../helpers';
import {memberGroupRepository, groupRepository} from '../repositories';

export default class MemberGroupController {
    getListMembersGroup = async (req, res) => {
        try {
            const {id} = req.params;
            const member = await  memberGroupRepository.getAll({
                where: {
                    groupId: id
                }
            });
            if (member.length === 0) {
                return Response.returnError(res, new Error('Group is not Exist'))
            }
            return Response.returnSuccess(res, member);
        } catch (e) {
            return Response.returnSuccess(res, e);
        }
    };
    leaveGroup = async (req, res, next) => { // Check if author leave group.
        try {
            const { id } = req.params;
            const userLoginId = req.user.id;
            await memberGroupRepository.delete({
                where: {
                    userId: userLoginId,
                    groupId: id
                }
            });
            return Response.returnSuccess(res, true);
        } catch (e) {
            return Response.returnError(res, e);
        }
    };

    inviteToGroup = async (req, res, next) => {
        try {
            const userLoginId = req.user.id;
            const groupId = req.params.id;
            const invitedUserId = req.body.invitedUserId;
            // const group = await groupRepository.getOne({
            //     where: {
            //         id: groupId
            //     },
            //     include: [
            //         {
            //             model: MemberGroup,
            //             as: 'group',
            //             where: {
            //                 userId: userLoginId
            //             }
            //         }
            //     ]
            // });
            // if (!group) {
            //     return Response.returnError(res, new Error('Exception'));
            // }
            const existedMember = await memberGroupRepository.getOne({
                where: {
                    groupId,
                    userId: invitedUserId
                },
                paranoid: false
            });
            // MemberGroup.findOrCreate(): lam lai cau ni nha.
            if (!existedMember) {
                memberGroupRepository.create({
                    groupId: id,
                    userId: invitedUserId
                });
            } else {
                if (existedMember.deletedAt) {
                    memberGroupRepository.update(
                        {
                            deletedAt: null
                        },
                        {
                            where: {
                                id: existedMember.id
                            },
                            paranoid: false
                        }
                    )
                }
            }
            return Response.returnSuccess(res, true);
        } catch (e) {
            return Response.returnError(res, e);
        }
    };

}