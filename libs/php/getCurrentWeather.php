<?php

	$executionStartTime = microtime(true) / 1000;

// api call to restcountry to get country information for select country.
	$url='https://api.openweathermap.org/data/2.5/weather?q=' . $_REQUEST['capitalCity'] . ',' . $_REQUEST['countryName'] . '&APPID=7090cabc9596ebe50bdf409014f045af';
	$ch = curl_init();
	
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);
	
	curl_close($ch);

	$decode = json_decode($result,true);	
	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "mission saved";
	$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
	$output['data'] = $decode;

	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 

?>
