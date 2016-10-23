<div class="usersGroupchats index">
	<h2><?php echo __('Users Groupchats'); ?></h2>
	<table cellpadding="0" cellspacing="0">
	<thead>
	<tr>
			<th><?php echo $this->Paginator->sort('id'); ?></th>
			<th><?php echo $this->Paginator->sort('user_id'); ?></th>
			<th><?php echo $this->Paginator->sort('groupchat_id'); ?></th>
			<th><?php echo $this->Paginator->sort('created'); ?></th>
			<th><?php echo $this->Paginator->sort('modified'); ?></th>
			<th class="actions"><?php echo __('Actions'); ?></th>
	</tr>
	</thead>
	<tbody>
	<?php foreach ($usersGroupchats as $usersGroupchat): ?>
	<tr>
		<td><?php echo h($usersGroupchat['UsersGroupchat']['id']); ?>&nbsp;</td>
		<td>
			<?php echo $this->Html->link($usersGroupchat['User']['id'], array('controller' => 'users', 'action' => 'view', $usersGroupchat['User']['id'])); ?>
		</td>
		<td>
			<?php echo $this->Html->link($usersGroupchat['Groupchat']['id'], array('controller' => 'groupchats', 'action' => 'view', $usersGroupchat['Groupchat']['id'])); ?>
		</td>
		<td><?php echo h($usersGroupchat['UsersGroupchat']['created']); ?>&nbsp;</td>
		<td><?php echo h($usersGroupchat['UsersGroupchat']['modified']); ?>&nbsp;</td>
		<td class="actions">
			<?php echo $this->Html->link(__('View'), array('action' => 'view', $usersGroupchat['UsersGroupchat']['id'])); ?>
			<?php echo $this->Html->link(__('Edit'), array('action' => 'edit', $usersGroupchat['UsersGroupchat']['id'])); ?>
			<?php echo $this->Form->postLink(__('Delete'), array('action' => 'delete', $usersGroupchat['UsersGroupchat']['id']), array(), __('Are you sure you want to delete # %s?', $usersGroupchat['UsersGroupchat']['id'])); ?>
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
		<li><?php echo $this->Html->link(__('New Users Groupchat'), array('action' => 'add')); ?></li>
		<li><?php echo $this->Html->link(__('List Users'), array('controller' => 'users', 'action' => 'index')); ?> </li>
		<li><?php echo $this->Html->link(__('New User'), array('controller' => 'users', 'action' => 'add')); ?> </li>
		<li><?php echo $this->Html->link(__('List Groupchats'), array('controller' => 'groupchats', 'action' => 'index')); ?> </li>
		<li><?php echo $this->Html->link(__('New Groupchat'), array('controller' => 'groupchats', 'action' => 'add')); ?> </li>
	</ul>
</div>
