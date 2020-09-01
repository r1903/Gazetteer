<?php

	include('openCage/AbstractGeocoder.php');
	include('openCage/Geocoder.php');

	$executionStartTime = microtime(true) / 1000;

// api call to  to get country information for selected country.

	$ch = array();
	$mh = curl_multi_init();

	
	$URLs = array( 'https://restcountries.eu/rest/v2/name/' . $_REQUEST['countryCode'] . '?fullText=true',
	'http://api.geonames.org/wikipediaSearchJSON?formatted=true&q=' . $_REQUEST['countryName'] .'&countrycode=' .$_REQUEST['countryCode'] .'&maxRows=25&username=roopam05&style=full');
	
	$i = 0;
	foreach($URLs as $url) {
	$ch[$i] = curl_init();
	curl_setopt($ch[$i], CURLOPT_URL, $url);
	curl_setopt($ch[$i], CURLOPT_HEADER, 0);
	curl_setopt($ch[$i], CURLOPT_RETURNTRANSFER, true);
	curl_multi_add_handle($mh, $ch[$i]);
	$i ++;
	}

	$active = null;
	do {
	$mrc = curl_multi_exec($mh, $active);
	} while ($active);

	$content = array();
	$i = 0;
	foreach ($ch AS $i => $c) {
	$content[$i] = curl_multi_getcontent($c);
	curl_multi_remove_handle($mh, $c);
	}
	curl_multi_close($mh);

	$output['data'] = json_decode($content[0],true);
	$output['wikiData'] = json_decode($content[1],true);


// opencage api call to get longitude and lattitude for capital city.
	$geocoder = new \OpenCage\Geocoder\Geocoder('98cf03024b8046b9827dd3f64c966131');
	
	$string = $output['data'][0]['capital'] ;
	
	$result = $geocoder->geocode($string); 

	$output['capital'] = $result;
	
	$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";

	header('Content-Type: application/json; charset=UTF-8');
    echo json_encode($output); 

?>
