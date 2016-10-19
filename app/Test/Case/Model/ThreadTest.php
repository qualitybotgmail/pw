<?php
App::uses('Thread', 'Model');

/**
 * Thread Test Case
 *
 */
class ThreadTest extends CakeTestCase {

/**
 * Fixtures
 *
 * @var array
 */
	public $fixtures = array(
		'app.thread',
		'app.user'
	);

/**
 * setUp method
 *
 * @return void
 */
	public function setUp() {
		parent::setUp();
		$this->Thread = ClassRegistry::init('Thread');
	}

/**
 * tearDown method
 *
 * @return void
 */
	public function tearDown() {
		unset($this->Thread);

		parent::tearDown();
	}

}
