<div class="notifications index">

	<div class="row">
		<div class="col-md-12">
			<div class="page-header">
				<h1><?php echo __('Notifications'); ?></h1>
			</div>
		</div><!-- end col md 12 -->
	</div><!-- end row -->



	<div class="row">

		<div class="col-md-3">
			<div class="actions">
				<div class="panel panel-default">
					<div class="panel-heading">Actions</div>
						<div class="panel-body">
							<ul class="nav nav-pills nav-stacked">
								<li><?php echo $this->Html->link(__('<span class="glyphicon glyphicon-plus"></span>&nbsp;&nbsp;New Notification'), array('action' => 'add'), array('escape' => false)); ?></li>
								<li><?php echo $this->Html->link(__('<span class="glyphicon glyphicon-list"></span>&nbsp;&nbsp;List Users'), array('controller' => 'users', 'action' => 'index'), array('escape' => false)); ?> </li>
		<li><?php echo $this->Html->link(__('<span class="glyphicon glyphicon-plus"></span>&nbsp;&nbsp;New User'), array('controller' => 'users', 'action' => 'add'), array('escape' => false)); ?> </li>
		<li><?php echo $this->Html->link(__('<span class="glyphicon glyphicon-list"></span>&nbsp;&nbsp;List Threads'), array('controller' => 'threads', 'action' => 'index'), array('escape' => false)); ?> </li>
		<li><?php echo $this->Html->link(__('<span class="glyphicon glyphicon-plus"></span>&nbsp;&nbsp;New Thread'), array('controller' => 'threads', 'action' => 'add'), array('escape' => false)); ?> </li>
		<li><?php echo $this->Html->link(__('<span class="glyphicon glyphicon-list"></span>&nbsp;&nbsp;List Heads'), array('controller' => 'heads', 'action' => 'index'), array('escape' => false)); ?> </li>
		<li><?php echo $this->Html->link(__('<span class="glyphicon glyphicon-plus"></span>&nbsp;&nbsp;New Head'), array('controller' => 'heads', 'action' => 'add'), array('escape' => false)); ?> </li>
		<li><?php echo $this->Html->link(__('<span class="glyphicon glyphicon-list"></span>&nbsp;&nbsp;List Messages'), array('controller' => 'messages', 'action' => 'index'), array('escape' => false)); ?> </li>
		<li><?php echo $this->Html->link(__('<span class="glyphicon glyphicon-plus"></span>&nbsp;&nbsp;New Message'), array('controller' => 'messages', 'action' => 'add'), array('escape' => false)); ?> </li>
		<li><?php echo $this->Html->link(__('<span class="glyphicon glyphicon-list"></span>&nbsp;&nbsp;List Groupchats'), array('controller' => 'groupchats', 'action' => 'index'), array('escape' => false)); ?> </li>
		<li><?php echo $this->Html->link(__('<span class="glyphicon glyphicon-plus"></span>&nbsp;&nbsp;New Groupchat'), array('controller' => 'groupchats', 'action' => 'add'), array('escape' => false)); ?> </li>
		<li><?php echo $this->Html->link(__('<span class="glyphicon glyphicon-list"></span>&nbsp;&nbsp;List Comments'), array('controller' => 'comments', 'action' => 'index'), array('escape' => false)); ?> </li>
		<li><?php echo $this->Html->link(__('<span class="glyphicon glyphicon-plus"></span>&nbsp;&nbsp;New Comment'), array('controller' => 'comments', 'action' => 'add'), array('escape' => false)); ?> </li>
		<li><?php echo $this->Html->link(__('<span class="glyphicon glyphicon-list"></span>&nbsp;&nbsp;List Likes'), array('controller' => 'likes', 'action' => 'index'), array('escape' => false)); ?> </li>
		<li><?php echo $this->Html->link(__('<span class="glyphicon glyphicon-plus"></span>&nbsp;&nbsp;New Like'), array('controller' => 'likes', 'action' => 'add'), array('escape' => false)); ?> </li>
							</ul>
						</div><!-- end body -->
				</div><!-- end panel -->
			</div><!-- end actions -->
		</div><!-- end col md 3 -->

		<div class="col-md-9">
			<table cellpadding="0" cellspacing="0" class="table table-striped">
				<thead>
					<tr>
						<th><?php echo $this->Paginator->sort('id'); ?></th>
						<th><?php echo $this->Paginator->sort('user_id'); ?></th>
						<th><?php echo $this->Paginator->sort('thread_id'); ?></th>
						<th><?php echo $this->Paginator->sort('head_id'); ?></th>
						<th><?php echo $this->Paginator->sort('message_id'); ?></th>
						<th><?php echo $this->Paginator->sort('groupchat_id'); ?></th>
						<th><?php echo $this->Paginator->sort('comment_id'); ?></th>
						<th><?php echo $this->Paginator->sort('like_id'); ?></th>
						<th><?php echo $this->Paginator->sort('message'); ?></th>
						<th><?php echo $this->Paginator->sort('created'); ?></th>
						<th><?php echo $this->Paginator->sort('modified'); ?></th>
						<th class="actions"></th>
					</tr>
				</thead>
				<tbody>
				<?php foreach ($notifications as $notification): ?>
					<tr>
						<td><?php echo h($notification['Notification']['id']); ?>&nbsp;</td>
								<td>
			<?php echo $this->Html->link($notification['User']['id'], array('controller' => 'users', 'action' => 'view', $notification['User']['id'])); ?>
		</td>
								<td>
			<?php echo $this->Html->link($notification['Thread']['title'], array('controller' => 'threads', 'action' => 'view', $notification['Thread']['id'])); ?>
		</td>
								<td>
			<?php echo $this->Html->link($notification['Head']['id'], array('controller' => 'heads', 'action' => 'view', $notification['Head']['id'])); ?>
		</td>
								<td>
			<?php echo $this->Html->link($notification['Message']['id'], array('controller' => 'messages', 'action' => 'view', $notification['Message']['id'])); ?>
		</td>
								<td>
			<?php echo $this->Html->link($notification['Groupchat']['user_id'], array('controller' => 'groupchats', 'action' => 'view', $notification['Groupchat']['id'])); ?>
		</td>
								<td>
			<?php echo $this->Html->link($notification['Comment']['id'], array('controller' => 'comments', 'action' => 'view', $notification['Comment']['id'])); ?>
		</td>
								<td>
			<?php echo $this->Html->link($notification['Like']['id'], array('controller' => 'likes', 'action' => 'view', $notification['Like']['id'])); ?>
		</td>
						<td><?php echo h($notification['Notification']['message']); ?>&nbsp;</td>
						<td><?php echo h($notification['Notification']['created']); ?>&nbsp;</td>
						<td><?php echo h($notification['Notification']['modified']); ?>&nbsp;</td>
						<td class="actions">
							<?php echo $this->Html->link('<span class="glyphicon glyphicon-search"></span>', array('action' => 'view', $notification['Notification']['id']), array('escape' => false)); ?>
							<?php echo $this->Html->link('<span class="glyphicon glyphicon-edit"></span>', array('action' => 'edit', $notification['Notification']['id']), array('escape' => false)); ?>
							<?php echo $this->Form->postLink('<span class="glyphicon glyphicon-remove"></span>', array('action' => 'delete', $notification['Notification']['id']), array('escape' => false), __('Are you sure you want to delete # %s?', $notification['Notification']['id'])); ?>
						</td>
					</tr>
				<?php endforeach; ?>
				</tbody>
			</table>

			<p>
				<small><?php echo $this->Paginator->counter(array('format' => __('Page {:page} of {:pages}, showing {:current} records out of {:count} total, starting on record {:start}, ending on {:end}')));?></small>
			</p>

			<?php
			$params = $this->Paginator->params();
			if ($params['pageCount'] > 1) {
			?>
			<ul class="pagination pagination-sm">
				<?php
					echo $this->Paginator->prev('&larr; Previous', array('class' => 'prev','tag' => 'li','escape' => false), '<a onclick="return false;">&larr; Previous</a>', array('class' => 'prev disabled','tag' => 'li','escape' => false));
					echo $this->Paginator->numbers(array('separator' => '','tag' => 'li','currentClass' => 'active','currentTag' => 'a'));
					echo $this->Paginator->next('Next &rarr;', array('class' => 'next','tag' => 'li','escape' => false), '<a onclick="return false;">Next &rarr;</a>', array('class' => 'next disabled','tag' => 'li','escape' => false));
				?>
			</ul>
			<?php } ?>

		</div> <!-- end col md 9 -->
	</div><!-- end row -->


</div><!-- end containing of content -->