<?php
/**
 * NotificationFixture
 *
 */
class NotificationFixture extends CakeTestFixture {

/**
 * Fields
 *
 * @var array
 */
	public $fields = array(
		'id' => array('type' => 'integer', 'null' => false, 'default' => null, 'unsigned' => false, 'key' => 'primary'),
		'user_id' => array('type' => 'integer', 'null' => false, 'default' => null, 'unsigned' => false),
		'thread_id' => array('type' => 'integer', 'null' => true, 'default' => null, 'unsigned' => false),
		'head_id' => array('type' => 'integer', 'null' => true, 'default' => null, 'unsigned' => false),
		'message_id' => array('type' => 'integer', 'null' => true, 'default' => null, 'unsigned' => false),
		'groupchat_id' => array('type' => 'integer', 'null' => true, 'default' => null, 'unsigned' => false),
		'comment_id' => array('type' => 'integer', 'null' => true, 'default' => null, 'unsigned' => false),
		'like_id' => array('type' => 'integer', 'null' => true, 'default' => null, 'unsigned' => false),
		'message' => array('type' => 'text', 'null' => true, 'default' => null, 'collate' => 'latin1_swedish_ci', 'charset' => 'latin1'),
		'created' => array('type' => 'datetime', 'null' => false, 'default' => null),
		'modified' => array('type' => 'datetime', 'null' => false, 'default' => null),
		'indexes' => array(
			
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
			'groupchat_id' => 1,
			'comment_id' => 1,
			'like_id' => 1,
			'message' => 'Lorem ipsum dolor sit amet, aliquet feugiat. Convallis morbi fringilla gravida, phasellus feugiat dapibus velit nunc, pulvinar eget sollicitudin venenatis cum nullam, vivamus ut a sed, mollitia lectus. Nulla vestibulum massa neque ut et, id hendrerit sit, feugiat in taciti enim proin nibh, tempor dignissim, rhoncus duis vestibulum nunc mattis convallis.',
			'created' => '2016-12-09 04:49:00',
			'modified' => '2016-12-09 04:49:00'
		),
	);

}
