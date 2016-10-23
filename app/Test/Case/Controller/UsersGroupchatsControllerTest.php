<?php
App::uses('UsersGroupchatsController', 'Controller');

/**
 * UsersGroupchatsController Test Case
 *
 */
class UsersGroupchatsControllerTest extends ControllerTestCase {

/**
 * Fixtures
 *
 * @var array
 */
	public $fixtures = array(
		'app.users_groupchat',
		'app.user',
		'app.groupchat',
		'app.message',
		'app.like',
		'app.thread',
		'app.comment',
		'app.users_thread'
	);

}
