<?php
App::uses('Head', 'Model');

/**
 * Head Test Case
 *
 */
class HeadTest extends CakeTestCase {

/**
 * Fixtures
 *
 * @var array
 */
	public $fixtures = array(
		'app.head',
		'app.user',
		'app.thread',
		'app.like',
		'app.message',
		'app.groupchat',
		'app.users_groupchat',
		'app.upload',
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
		$this->Head = ClassRegistry::init('Head');
	}

/**
 * tearDown method
 *
 * @return void
 */
	public function tearDown() {
		unset($this->Head);

		parent::tearDown();
	}

}
