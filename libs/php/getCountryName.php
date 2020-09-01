<?php

	include('openCage/AbstractGeocoder.php');
	include('openCage/Geocoder.php');

	$geocoder = new \OpenCage\Geocoder\Geocoder('98cf03024b8046b9827dd3f64c966131');
	
	$string = (isset($_POST['country'])) ? $_POST['country'] : $_POST['latitude'].',' .$_POST['longitude'] ;
	
	$result = $geocoder->geocode($string); 

	
	header('Content-Type: application/json; charset=UTF-8');
	echo json_encode($result, JSON_UNESCAPED_UNICODE);
	
?>
