<div class="messages view">
	<div class="row">
		<div class="col-md-12">
			<div class="page-header">
				<h1><?php echo __('Message'); ?></h1>
			</div>
		</div>
	</div>

	<div class="row">

		<div class="col-md-3">
			<div class="actions">
				<div class="panel panel-default">
					<div class="panel-heading">Actions</div>
						<div class="panel-body">
							<ul class="nav nav-pills nav-stacked">
									<li><?php echo $this->Html->link(__('<span class="glyphicon glyphicon-edit"></span>&nbsp&nbsp;Edit Message'), array('action' => 'edit', $message['Message']['id']), array('escape' => false)); ?> </li>
		<li><?php echo $this->Form->postLink(__('<span class="glyphicon glyphicon-remove"></span>&nbsp;&nbsp;Delete Message'), array('action' => 'delete', $message['Message']['id']), array('escape' => false), __('Are you sure you want to delete # %s?', $message['Message']['id'])); ?> </li>
		<li><?php echo $this->Html->link(__('<span class="glyphicon glyphicon-list"></span>&nbsp&nbsp;List Messages'), array('action' => 'index'), array('escape' => false)); ?> </li>
		<li><?php echo $this->Html->link(__('<span class="glyphicon glyphicon-plus"></span>&nbsp&nbsp;New Message'), array('action' => 'add'), array('escape' => false)); ?> </li>
		<li><?php echo $this->Html->link(__('<span class="glyphicon glyphicon-list"></span>&nbsp&nbsp;List Users'), array('controller' => 'users', 'action' => 'index'), array('escape' => false)); ?> </li>
		<li><?php echo $this->Html->link(__('<span class="glyphicon glyphicon-plus"></span>&nbsp&nbsp;New User'), array('controller' => 'users', 'action' => 'add'), array('escape' => false)); ?> </li>
		<li><?php echo $this->Html->link(__('<span class="glyphicon glyphicon-list"></span>&nbsp&nbsp;List Groupchats'), array('controller' => 'groupchats', 'action' => 'index'), array('escape' => false)); ?> </li>
		<li><?php echo $this->Html->link(__('<span class="glyphicon glyphicon-plus"></span>&nbsp&nbsp;New Groupchat'), array('controller' => 'groupchats', 'action' => 'add'), array('escape' => false)); ?> </li>
		<li><?php echo $this->Html->link(__('<span class="glyphicon glyphicon-list"></span>&nbsp&nbsp;List Likes'), array('controller' => 'likes', 'action' => 'index'), array('escape' => false)); ?> </li>
		<li><?php echo $this->Html->link(__('<span class="glyphicon glyphicon-plus"></span>&nbsp&nbsp;New Like'), array('controller' => 'likes', 'action' => 'add'), array('escape' => false)); ?> </li>
							</ul>
						</div><!-- end body -->
				</div><!-- end panel -->
			</div><!-- end actions -->
		</div><!-- end col md 3 -->

		<div class="col-md-9">			
			<table cellpadding="0" cellspacing="0" class="table table-striped">
				<tbody>
				<tr>
		<th><?php echo __('Id'); ?></th>
		<td>
			<?php echo h($message['Message']['id']); ?>
			&nbsp;
		</td>
</tr>
<tr>
		<th><?php echo __('User'); ?></th>
		<td>
			<?php echo $this->Html->link($message['User']['id'], array('controller' => 'users', 'action' => 'view', $message['User']['id'])); ?>
			&nbsp;
		</td>
</tr>
<tr>
		<th><?php echo __('Groupchat'); ?></th>
		<td>
			<?php echo $this->Html->link($message['Groupchat']['id'], array('controller' => 'groupchats', 'action' => 'view', $message['Groupchat']['id'])); ?>
			&nbsp;
		</td>
</tr>
<tr>
		<th><?php echo __('Body'); ?></th>
		<td>
			<?php echo h($message['Message']['body']); ?>
			&nbsp;
		</td>
</tr>
<tr>
		<th><?php echo __('Created'); ?></th>
		<td>
			<?php echo h($message['Message']['created']); ?>
			&nbsp;
		</td>
</tr>
<tr>
		<th><?php echo __('Modified'); ?></th>
		<td>
			<?php echo h($message['Message']['modified']); ?>
			&nbsp;
		</td>
</tr>
				</tbody>
			</table>

		</div><!-- end col md 9 -->

	</div>
</div>

<div class="related row">
	<div class="col-md-12">
	<h3><?php echo __('Related Likes'); ?></h3>
	<?php if (!empty($message['Like'])): ?>
	<table cellpadding = "0" cellspacing = "0" class="table table-striped">
	<thead>
	<tr>
		<th><?php echo __('Id'); ?></th>
		<th><?php echo __('User Id'); ?></th>
		<th><?php echo __('Message Id'); ?></th>
		<th><?php echo __('Thread Id'); ?></th>
		<th><?php echo __('Created'); ?></th>
		<th><?php echo __('Modified'); ?></th>
		<th class="actions"></th>
	</tr>
	<thead>
	<tbody>
	<?php foreach ($message['Like'] as $like): ?>
		<tr>
			<td><?php echo $like['id']; ?></td>
			<td><?php echo $like['user_id']; ?></td>
			<td><?php echo $like['message_id']; ?></td>
			<td><?php echo $like['thread_id']; ?></td>
			<td><?php echo $like['created']; ?></td>
			<td><?php echo $like['modified']; ?></td>
			<td class="actions">
				<?php echo $this->Html->link(__('<span class="glyphicon glyphicon-search"></span>'), array('controller' => 'likes', 'action' => 'view', $like['id']), array('escape' => false)); ?>
				<?php echo $this->Html->link(__('<span class="glyphicon glyphicon-edit"></span>'), array('controller' => 'likes', 'action' => 'edit', $like['id']), array('escape' => false)); ?>
				<?php echo $this->Form->postLink(__('<span class="glyphicon glyphicon-remove"></span>'), array('controller' => 'likes', 'action' => 'delete', $like['id']), array('escape' => false), __('Are you sure you want to delete # %s?', $like['id'])); ?>
			</td>
		</tr>
	<?php endforeach; ?>
	</tbody>
	</table>
<?php endif; ?>

	<div class="actions">
		<?php echo $this->Html->link(__('<span class="glyphicon glyphicon-plus"></span>&nbsp;&nbsp;New Like'), array('controller' => 'likes', 'action' => 'add'), array('escape' => false, 'class' => 'btn btn-default')); ?> 
	</div>
	</div><!-- end col md 12 -->
</div>
