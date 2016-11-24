<?php
App::uses('UsersLog', 'Model');

/**
 * UsersLog Test Case
 *
 */
class UsersLogTest extends CakeTestCase {

/**
 * Fixtures
 *
 * @var array
 */
	public $fixtures = array(
		'app.users_log',
		'app.log',
		'app.user',
		'app.like',
		'app.message',
		'app.groupchat',
		'app.users_groupchat',
		'app.upload',
		'app.comment',
		'app.head',
		'app.thread',
		'app.users_thread'
	);

/**
 * setUp method
 *
 * @return void
 */
	public function setUp() {
		parent::setUp();
		$this->UsersLog = ClassRegistry::init('UsersLog');
	}

/**
 * tearDown method
 *
 * @return void
 */
	public function tearDown() {
		unset($this->UsersLog);

		parent::tearDown();
	}

}
