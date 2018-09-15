import {Response} from '../helpers';
export default class Validation {

    static validatePagination (req, res, next) {
        let { limit, page } = req.query;
        limit = parseInt(limit);
        page = parseInt(page);
        if (Number.isNaN(page) || page <= 0) {
            return Response.returnError(res, new Error('Page invalid'));
        }
        if (Number.isNaN(limit) || limit <= 0) {
            return Response.returnError(res, new Error ('Limit invalid'));
        }
        return next();
    }
}