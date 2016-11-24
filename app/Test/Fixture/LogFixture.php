<?php
/**
 * LogFixture
 *
 */
class LogFixture extends CakeTestFixture {

/**
 * Fields
 *
 * @var array
 */
	public $fields = array(
		'id' => array('type' => 'integer', 'null' => false, 'default' => null, 'unsigned' => false, 'key' => 'primary'),
		'user_id' => array('type' => 'integer', 'null' => false, 'default' => null, 'unsigned' => false),
		'thread_id' => array('type' => 'integer', 'null' => false, 'default' => null, 'unsigned' => false),
		'head_id' => array('type' => 'integer', 'null' => false, 'default' => null, 'unsigned' => false),
		'message_id' => array('type' => 'integer', 'null' => false, 'default' => null, 'unsigned' => false),
		'comment_id' => array('type' => 'integer', 'null' => false, 'default' => null, 'unsigned' => false),
		'like_id' => array('type' => 'integer', 'null' => false, 'default' => null, 'unsigned' => false),
		'type' => array('type' => 'string', 'null' => false, 'default' => null, 'length' => 30, 'collate' => 'latin1_swedish_ci', 'charset' => 'latin1'),
		'created' => array('type' => 'datetime', 'null' => false, 'default' => null),
		'modified' => array('type' => 'datetime', 'null' => false, 'default' => null),
		'indexes' => array(
			'PRIMARY' => array('column' => 'id', 'unique' => 1)
		),
		'tableParameters' => array('charset' => 'latin1', 'collate' => 'latin1_swedish_ci', 'engine' => 'InnoDB')
	);

/**
 * Records
 *
 * @var array
 */
	public $records = array(
		array(
			'id' => 1,
			'user_id' => 1,
			'thread_id' => 1,
			'head_id' => 1,
			'message_id' => 1,
			'comment_id' => 1,
			'like_id' => 1,
			'type' => 'Lorem ipsum dolor sit amet',
			'created' => '2016-11-23 09:54:12',
			'modified' => '2016-11-23 09:54:12'
		),
	);

}
