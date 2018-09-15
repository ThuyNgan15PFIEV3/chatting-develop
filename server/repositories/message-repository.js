'use strict';

import BaseRepository from '../repositories/base-repository';
import {Message} from '../models/'

export default class MessageRepository extends BaseRepository {

	constructor() {
		super(Message);
	}

}
