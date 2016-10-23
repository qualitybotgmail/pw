<div class="usersGroupchats view">
<h2><?php echo __('Users Groupchat'); ?></h2>
	<dl>
		<dt><?php echo __('Id'); ?></dt>
		<dd>
			<?php echo h($usersGroupchat['UsersGroupchat']['id']); ?>
			&nbsp;
		</dd>
		<dt><?php echo __('User'); ?></dt>
		<dd>
			<?php echo $this->Html->link($usersGroupchat['User']['id'], array('controller' => 'users', 'action' => 'view', $usersGroupchat['User']['id'])); ?>
			&nbsp;
		</dd>
		<dt><?php echo __('Groupchat'); ?></dt>
		<dd>
			<?php echo $this->Html->link($usersGroupchat['Groupchat']['id'], array('controller' => 'groupchats', 'action' => 'view', $usersGroupchat['Groupchat']['id'])); ?>
			&nbsp;
		</dd>
		<dt><?php echo __('Created'); ?></dt>
		<dd>
			<?php echo h($usersGroupchat['UsersGroupchat']['created']); ?>
			&nbsp;
		</dd>
		<dt><?php echo __('Modified'); ?></dt>
		<dd>
			<?php echo h($usersGroupchat['UsersGroupchat']['modified']); ?>
			&nbsp;
		</dd>
	</dl>
</div>
<div class="actions">
	<h3><?php echo __('Actions'); ?></h3>
	<ul>
		<li><?php echo $this->Html->link(__('Edit Users Groupchat'), array('action' => 'edit', $usersGroupchat['UsersGroupchat']['id'])); ?> </li>
		<li><?php echo $this->Form->postLink(__('Delete Users Groupchat'), array('action' => 'delete', $usersGroupchat['UsersGroupchat']['id']), array(), __('Are you sure you want to delete # %s?', $usersGroupchat['UsersGroupchat']['id'])); ?> </li>
		<li><?php echo $this->Html->link(__('List Users Groupchats'), array('action' => 'index')); ?> </li>
		<li><?php echo $this->Html->link(__('New Users Groupchat'), array('action' => 'add')); ?> </li>
		<li><?php echo $this->Html->link(__('List Users'), array('controller' => 'users', 'action' => 'index')); ?> </li>
		<li><?php echo $this->Html->link(__('New User'), array('controller' => 'users', 'action' => 'add')); ?> </li>
		<li><?php echo $this->Html->link(__('List Groupchats'), array('controller' => 'groupchats', 'action' => 'index')); ?> </li>
		<li><?php echo $this->Html->link(__('New Groupchat'), array('controller' => 'groupchats', 'action' => 'add')); ?> </li>
	</ul>
</div>
