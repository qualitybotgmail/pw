<?php
App::uses('Attachement', 'Model');

/**
 * Attachement Test Case
 *
 */
class AttachementTest extends CakeTestCase {

/**
 * Fixtures
 *
 * @var array
 */
	public $fixtures = array(
		'app.attachement',
		'app.user',
		'app.comment',
		'app.thread',
		'app.like',
		'app.message',
		'app.groupchat',
		'app.users_groupchat',
		'app.users_thread'
	);

/**
 * setUp method
 *
 * @return void
 */
	public function setUp() {
		parent::setUp();
		$this->Attachement = ClassRegistry::init('Attachement');
	}

/**
 * tearDown method
 *
 * @return void
 */
	public function tearDown() {
		unset($this->Attachement);

		parent::tearDown();
	}

}
