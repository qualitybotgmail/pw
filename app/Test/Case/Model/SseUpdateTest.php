<?php
App::uses('SseUpdate', 'Model');

/**
 * SseUpdate Test Case
 */
class SseUpdateTest extends CakeTestCase {

/**
 * Fixtures
 *
 * @var array
 */
	public $fixtures = array(
		'app.sse_update',
		'app.user',
		'app.comment',
		'app.head',
		'app.thread',
		'app.notification',
		'app.message',
		'app.groupchat',
		'app.log',
		'app.users_log',
		'app.like',
		'app.users_groupchat',
		'app.upload',
		'app.users_thread',
		'app.ignored_thread',
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
		$this->SseUpdate = ClassRegistry::init('SseUpdate');
	}

/**
 * tearDown method
 *
 * @return void
 */
	public function tearDown() {
		unset($this->SseUpdate);

		parent::tearDown();
	}

}
