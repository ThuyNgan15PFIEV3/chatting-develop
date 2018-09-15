'use strict';

import {messageController} from '../controllers';
import {Authentication, Validation} from '../middlewares'

module.exports = (app) => {
// message naming
	app.route('/groups/:id/messages')
		.get([Authentication.isAuth, Validation.validatePagination], messageController.getListMessage)
		.post([Authentication.isAuth], messageController.createMessage);

};
