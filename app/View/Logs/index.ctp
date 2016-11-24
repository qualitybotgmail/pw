<div class="logs index">
	<h2><?php echo __('Logs'); ?></h2>
	<table cellpadding="0" cellspacing="0">
	<thead>
	<tr>
			<th><?php echo $this->Paginator->sort('id'); ?></th>
			<th><?php echo $this->Paginator->sort('user_id'); ?></th>
			<th><?php echo $this->Paginator->sort('thread_id'); ?></th>
			<th><?php echo $this->Paginator->sort('head_id'); ?></th>
			<th><?php echo $this->Paginator->sort('message_id'); ?></th>
			<th><?php echo $this->Paginator->sort('comment_id'); ?></th>
			<th><?php echo $this->Paginator->sort('like_id'); ?></th>
			<th><?php echo $this->Paginator->sort('type'); ?></th>
			<th><?php echo $this->Paginator->sort('created'); ?></th>
			<th><?php echo $this->Paginator->sort('modified'); ?></th>
			<th class="actions"><?php echo __('Actions'); ?></th>
	</tr>
	</thead>
	<tbody>
	<?php foreach ($logs as $log): ?>
	<tr>
		<td><?php echo h($log['Log']['id']); ?>&nbsp;</td>
		<td>
			<?php echo $this->Html->link($log['User']['id'], array('controller' => 'users', 'action' => 'view', $log['User']['id'])); ?>
		</td>
		<td>
			<?php echo $this->Html->link($log['Thread']['title'], array('controller' => 'threads', 'action' => 'view', $log['Thread']['id'])); ?>
		</td>
		<td>
			<?php echo $this->Html->link($log['Head']['id'], array('controller' => 'heads', 'action' => 'view', $log['Head']['id'])); ?>
		</td>
		<td>
			<?php echo $this->Html->link($log['Message']['id'], array('controller' => 'messages', 'action' => 'view', $log['Message']['id'])); ?>
		</td>
		<td>
			<?php echo $this->Html->link($log['Comment']['id'], array('controller' => 'comments', 'action' => 'view', $log['Comment']['id'])); ?>
		</td>
		<td>
			<?php echo $this->Html->link($log['Like']['id'], array('controller' => 'likes', 'action' => 'view', $log['Like']['id'])); ?>
		</td>
		<td><?php echo h($log['Log']['type']); ?>&nbsp;</td>
		<td><?php echo h($log['Log']['created']); ?>&nbsp;</td>
		<td><?php echo h($log['Log']['modified']); ?>&nbsp;</td>
		<td class="actions">
			<?php echo $this->Html->link(__('View'), array('action' => 'view', $log['Log']['id'])); ?>
			<?php echo $this->Html->link(__('Edit'), array('action' => 'edit', $log['Log']['id'])); ?>
			<?php echo $this->Form->postLink(__('Delete'), array('action' => 'delete', $log['Log']['id']), array(), __('Are you sure you want to delete # %s?', $log['Log']['id'])); ?>
		</td>
	</tr>
<?php endforeach; ?>
	</tbody>
	</table>
	<p>
	<?php
	echo $this->Paginator->counter(array(
	'format' => __('Page {:page} of {:pages}, showing {:current} records out of {:count} total, starting on record {:start}, ending on {:end}')
	));
	?>	</p>
	<div class="paging">
	<?php
		echo $this->Paginator->prev('< ' . __('previous'), array(), null, array('class' => 'prev disabled'));
		echo $this->Paginator->numbers(array('separator' => ''));
		echo $this->Paginator->next(__('next') . ' >', array(), null, array('class' => 'next disabled'));
	?>
	</div>
</div>
<div class="actions">
	<h3><?php echo __('Actions'); ?></h3>
	<ul>
		<li><?php echo $this->Html->link(__('New Log'), array('action' => 'add')); ?></li>
		<li><?php echo $this->Html->link(__('List Users'), array('controller' => 'users', 'action' => 'index')); ?> </li>
		<li><?php echo $this->Html->link(__('New User'), array('controller' => 'users', 'action' => 'add')); ?> </li>
		<li><?php echo $this->Html->link(__('List Threads'), array('controller' => 'threads', 'action' => 'index')); ?> </li>
		<li><?php echo $this->Html->link(__('New Thread'), array('controller' => 'threads', 'action' => 'add')); ?> </li>
		<li><?php echo $this->Html->link(__('List Heads'), array('controller' => 'heads', 'action' => 'index')); ?> </li>
		<li><?php echo $this->Html->link(__('New Head'), array('controller' => 'heads', 'action' => 'add')); ?> </li>
		<li><?php echo $this->Html->link(__('List Messages'), array('controller' => 'messages', 'action' => 'index')); ?> </li>
		<li><?php echo $this->Html->link(__('New Message'), array('controller' => 'messages', 'action' => 'add')); ?> </li>
		<li><?php echo $this->Html->link(__('List Comments'), array('controller' => 'comments', 'action' => 'index')); ?> </li>
		<li><?php echo $this->Html->link(__('New Comment'), array('controller' => 'comments', 'action' => 'add')); ?> </li>
		<li><?php echo $this->Html->link(__('List Likes'), array('controller' => 'likes', 'action' => 'index')); ?> </li>
		<li><?php echo $this->Html->link(__('New Like'), array('controller' => 'likes', 'action' => 'add')); ?> </li>
	</ul>
</div>
