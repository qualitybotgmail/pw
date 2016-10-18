<?php
App::uses('Url', 'Model');

/**
 * Url Test Case
 *
 */
class UrlTest extends CakeTestCase {

/**
 * Fixtures
 *
 * @var array
 */
	public $fixtures = array(
		'app.url',
		'app.category',
		'app.comment'
	);

/**
 * setUp method
 *
 * @return void
 */
	public function setUp() {
		parent::setUp();
		$this->Url = ClassRegistry::init('Url');
	}

/**
 * tearDown method
 *
 * @return void
 */
	public function tearDown() {
		unset($this->Url);

		parent::tearDown();
	}

}
