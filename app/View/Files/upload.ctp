<?php
// echo $this->Form->create('File', array('type' => 'file'));
// echo $this->Form->input('name', array('type' => 'file', 'multiple'));
// echo $this->Form->end('Upload');
?> 
<!--		sdsf-->
<!--<form action="/comments/fileupload" method="post" name="upload" id="upload" enctype="multipart/form-data"/> -->
    
<!--    <input name="name[]" id="name" type="file" multiple="multiple" />-->
<!--    <input type="number" name="comment_id" value="3"/>-->
<!--    <input type="submit" value="Submit">-->
<!--</form>-->


<?php
// echo $this->Form->create('File', array('type'=>'file', 'action'=>'upload',  'method'=>'post')); // 'enctype'=>'multipart/form-data',
// echo $this->Form->input('filename',array('type' => 'file', 'multiple' ));
// echo $this->Form->end('Submit');

// echo $this->Form->create('File',array('type' => 'file','enctype'=>'multipart/form-data', 'method'=>'post'));
// echo $this->Form->input('files', array('type' => 'file', 'multiple'=>'multiple'));
// echo $this->Form->submit('Upload');
// echo $this->Form->end();

 
echo $this->Form->create('File', array('type' => 'file'));
echo $this->Form->input('files.', array('type' => 'file', 'multiple'));
echo $this->Form->end('Upload'); 
?>