<?php
App::uses('Log', 'Model');

/**
 * Log Test Case
 *
 */
class LogTest extends CakeTestCase {

/**
 * Fixtures
 *
 * @var array
 */
	public $fixtures = array(
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
		'app.users_thread',
		'app.users_log'
	);

/**
 * setUp method
 *
 * @return void
 */
	public function setUp() {
		parent::setUp();
		$this->Log = ClassRegistry::init('Log');
	}

/**
 * tearDown method
 *
 * @return void
 */
	public function tearDown() {
		unset($this->Log);

		parent::tearDown();
	}

}
