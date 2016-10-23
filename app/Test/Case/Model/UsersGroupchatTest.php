<?php
App::uses('UsersGroupchat', 'Model');

/**
 * UsersGroupchat Test Case
 *
 */
class UsersGroupchatTest extends CakeTestCase {

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

/**
 * setUp method
 *
 * @return void
 */
	public function setUp() {
		parent::setUp();
		$this->UsersGroupchat = ClassRegistry::init('UsersGroupchat');
	}

/**
 * tearDown method
 *
 * @return void
 */
	public function tearDown() {
		unset($this->UsersGroupchat);

		parent::tearDown();
	}

}
