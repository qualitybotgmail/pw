<?php
App::uses('Groupchat', 'Model');

/**
 * Groupchat Test Case
 *
 */
class GroupchatTest extends CakeTestCase {

/**
 * Fixtures
 *
 * @var array
 */
	public $fixtures = array(
		'app.groupchat',
		'app.message',
		'app.user',
		'app.like',
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
		$this->Groupchat = ClassRegistry::init('Groupchat');
	}

/**
 * tearDown method
 *
 * @return void
 */
	public function tearDown() {
		unset($this->Groupchat);

		parent::tearDown();
	}

}
