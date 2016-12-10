<?php
App::uses('Notification', 'Model');

/**
 * Notification Test Case
 *
 */
class NotificationTest extends CakeTestCase {

/**
 * Fixtures
 *
 * @var array
 */
	public $fixtures = array(
		'app.notification',
		'app.user',
		'app.comment',
		'app.head',
		'app.thread',
		'app.users_thread',
		'app.like',
		'app.message',
		'app.groupchat',
		'app.users_groupchat',
		'app.upload',
		'app.ignored_thread',
		'app.log',
		'app.users_log',
		'app.profile',
		'app.setting'
	);

/**
 * setUp method
 *
 * @return void
 */
	public function setUp() {
		parent::setUp();
		$this->Notification = ClassRegistry::init('Notification');
	}

/**
 * tearDown method
 *
 * @return void
 */
	public function tearDown() {
		unset($this->Notification);

		parent::tearDown();
	}

}
