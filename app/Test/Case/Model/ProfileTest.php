<?php
App::uses('Profile', 'Model');

/**
 * Profile Test Case
 *
 */
class ProfileTest extends CakeTestCase {

/**
 * Fixtures
 *
 * @var array
 */
	public $fixtures = array(
		'app.profile',
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
		$this->Profile = ClassRegistry::init('Profile');
	}

/**
 * tearDown method
 *
 * @return void
 */
	public function tearDown() {
		unset($this->Profile);

		parent::tearDown();
	}

}
