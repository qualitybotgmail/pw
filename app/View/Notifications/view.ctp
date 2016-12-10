<div class="notifications view">
	<div class="row">
		<div class="col-md-12">
			<div class="page-header">
				<h1><?php echo __('Notification'); ?></h1>
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
									<li><?php echo $this->Html->link(__('<span class="glyphicon glyphicon-edit"></span>&nbsp&nbsp;Edit Notification'), array('action' => 'edit', $notification['Notification']['id']), array('escape' => false)); ?> </li>
		<li><?php echo $this->Form->postLink(__('<span class="glyphicon glyphicon-remove"></span>&nbsp;&nbsp;Delete Notification'), array('action' => 'delete', $notification['Notification']['id']), array('escape' => false), __('Are you sure you want to delete # %s?', $notification['Notification']['id'])); ?> </li>
		<li><?php echo $this->Html->link(__('<span class="glyphicon glyphicon-list"></span>&nbsp&nbsp;List Notifications'), array('action' => 'index'), array('escape' => false)); ?> </li>
		<li><?php echo $this->Html->link(__('<span class="glyphicon glyphicon-plus"></span>&nbsp&nbsp;New Notification'), array('action' => 'add'), array('escape' => false)); ?> </li>
		<li><?php echo $this->Html->link(__('<span class="glyphicon glyphicon-list"></span>&nbsp&nbsp;List Users'), array('controller' => 'users', 'action' => 'index'), array('escape' => false)); ?> </li>
		<li><?php echo $this->Html->link(__('<span class="glyphicon glyphicon-plus"></span>&nbsp&nbsp;New User'), array('controller' => 'users', 'action' => 'add'), array('escape' => false)); ?> </li>
		<li><?php echo $this->Html->link(__('<span class="glyphicon glyphicon-list"></span>&nbsp&nbsp;List Threads'), array('controller' => 'threads', 'action' => 'index'), array('escape' => false)); ?> </li>
		<li><?php echo $this->Html->link(__('<span class="glyphicon glyphicon-plus"></span>&nbsp&nbsp;New Thread'), array('controller' => 'threads', 'action' => 'add'), array('escape' => false)); ?> </li>
		<li><?php echo $this->Html->link(__('<span class="glyphicon glyphicon-list"></span>&nbsp&nbsp;List Heads'), array('controller' => 'heads', 'action' => 'index'), array('escape' => false)); ?> </li>
		<li><?php echo $this->Html->link(__('<span class="glyphicon glyphicon-plus"></span>&nbsp&nbsp;New Head'), array('controller' => 'heads', 'action' => 'add'), array('escape' => false)); ?> </li>
		<li><?php echo $this->Html->link(__('<span class="glyphicon glyphicon-list"></span>&nbsp&nbsp;List Messages'), array('controller' => 'messages', 'action' => 'index'), array('escape' => false)); ?> </li>
		<li><?php echo $this->Html->link(__('<span class="glyphicon glyphicon-plus"></span>&nbsp&nbsp;New Message'), array('controller' => 'messages', 'action' => 'add'), array('escape' => false)); ?> </li>
		<li><?php echo $this->Html->link(__('<span class="glyphicon glyphicon-list"></span>&nbsp&nbsp;List Groupchats'), array('controller' => 'groupchats', 'action' => 'index'), array('escape' => false)); ?> </li>
		<li><?php echo $this->Html->link(__('<span class="glyphicon glyphicon-plus"></span>&nbsp&nbsp;New Groupchat'), array('controller' => 'groupchats', 'action' => 'add'), array('escape' => false)); ?> </li>
		<li><?php echo $this->Html->link(__('<span class="glyphicon glyphicon-list"></span>&nbsp&nbsp;List Comments'), array('controller' => 'comments', 'action' => 'index'), array('escape' => false)); ?> </li>
		<li><?php echo $this->Html->link(__('<span class="glyphicon glyphicon-plus"></span>&nbsp&nbsp;New Comment'), array('controller' => 'comments', 'action' => 'add'), array('escape' => false)); ?> </li>
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
			<?php echo h($notification['Notification']['id']); ?>
			&nbsp;
		</td>
</tr>
<tr>
		<th><?php echo __('User'); ?></th>
		<td>
			<?php echo $this->Html->link($notification['User']['id'], array('controller' => 'users', 'action' => 'view', $notification['User']['id'])); ?>
			&nbsp;
		</td>
</tr>
<tr>
		<th><?php echo __('Thread'); ?></th>
		<td>
			<?php echo $this->Html->link($notification['Thread']['title'], array('controller' => 'threads', 'action' => 'view', $notification['Thread']['id'])); ?>
			&nbsp;
		</td>
</tr>
<tr>
		<th><?php echo __('Head'); ?></th>
		<td>
			<?php echo $this->Html->link($notification['Head']['id'], array('controller' => 'heads', 'action' => 'view', $notification['Head']['id'])); ?>
			&nbsp;
		</td>
</tr>
<tr>
		<th><?php echo __('Message'); ?></th>
		<td>
			<?php echo $this->Html->link($notification['Message']['id'], array('controller' => 'messages', 'action' => 'view', $notification['Message']['id'])); ?>
			&nbsp;
		</td>
</tr>
<tr>
		<th><?php echo __('Groupchat'); ?></th>
		<td>
			<?php echo $this->Html->link($notification['Groupchat']['user_id'], array('controller' => 'groupchats', 'action' => 'view', $notification['Groupchat']['id'])); ?>
			&nbsp;
		</td>
</tr>
<tr>
		<th><?php echo __('Comment'); ?></th>
		<td>
			<?php echo $this->Html->link($notification['Comment']['id'], array('controller' => 'comments', 'action' => 'view', $notification['Comment']['id'])); ?>
			&nbsp;
		</td>
</tr>
<tr>
		<th><?php echo __('Like'); ?></th>
		<td>
			<?php echo $this->Html->link($notification['Like']['id'], array('controller' => 'likes', 'action' => 'view', $notification['Like']['id'])); ?>
			&nbsp;
		</td>
</tr>
<tr>
		<th><?php echo __('Message'); ?></th>
		<td>
			<?php echo h($notification['Notification']['message']); ?>
			&nbsp;
		</td>
</tr>
<tr>
		<th><?php echo __('Created'); ?></th>
		<td>
			<?php echo h($notification['Notification']['created']); ?>
			&nbsp;
		</td>
</tr>
<tr>
		<th><?php echo __('Modified'); ?></th>
		<td>
			<?php echo h($notification['Notification']['modified']); ?>
			&nbsp;
		</td>
</tr>
				</tbody>
			</table>

		</div><!-- end col md 9 -->

	</div>
</div>

