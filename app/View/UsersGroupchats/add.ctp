<div class="usersGroupchats form">
<?php echo $this->Form->create('UsersGroupchat'); ?>
	<fieldset>
		<legend><?php echo __('Add Users Groupchat'); ?></legend>
	<?php
		echo $this->Form->input('user_id');
		echo $this->Form->input('groupchat_id');
	?>
	</fieldset>
<?php echo $this->Form->end(__('Submit')); ?>
</div>
<div class="actions">
	<h3><?php echo __('Actions'); ?></h3>
	<ul>

		<li><?php echo $this->Html->link(__('List Users Groupchats'), array('action' => 'index')); ?></li>
		<li><?php echo $this->Html->link(__('List Users'), array('controller' => 'users', 'action' => 'index')); ?> </li>
		<li><?php echo $this->Html->link(__('New User'), array('controller' => 'users', 'action' => 'add')); ?> </li>
		<li><?php echo $this->Html->link(__('List Groupchats'), array('controller' => 'groupchats', 'action' => 'index')); ?> </li>
		<li><?php echo $this->Html->link(__('New Groupchat'), array('controller' => 'groupchats', 'action' => 'add')); ?> </li>
	</ul>
</div>
