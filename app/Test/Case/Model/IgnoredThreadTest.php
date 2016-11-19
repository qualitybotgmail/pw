<?php
App::uses('IgnoredThread', 'Model');

/**
 * IgnoredThread Test Case
 *
 */
class IgnoredThreadTest extends CakeTestCase {

/**
 * Fixtures
 *
 * @var array
 */
	public $fixtures = array(
		'app.ignored_thread',
		'app.user',
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
		$this->IgnoredThread = ClassRegistry::init('IgnoredThread');
	}

/**
 * tearDown method
 *
 * @return void
 */
	public function tearDown() {
		unset($this->IgnoredThread);

		parent::tearDown();
	}

}
