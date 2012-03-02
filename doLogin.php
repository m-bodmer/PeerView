<?php

	$is_ajax = $_REQUEST['is_ajax'];
	if(isset($is_ajax) && $is_ajax)
	{
		$username = $_REQUEST['username'];
		$password = $_REQUEST['password'];

		if($username == 'demo' && $password == 'demo')
		{
			echo "success";
			//Redirect to page I want to here
		}
	}

?>