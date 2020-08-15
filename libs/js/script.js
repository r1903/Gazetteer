	$('#btnRun').click(function() {

		$.ajax({
			url: "libs/php/getPostalCodes.php",
			type: 'POST',
			dataType: 'json',
			data: {
				country: $('#selCountry').val(),
				postcode: $('#selPostCode').val()
			},
			success: function(result) {
				console.log(result);
				if (result.status.name == "ok") {
					console.log('here');
					var trHTML = '';
					if(result.data.length>0) {
						trHTML = '<table border="1"><tr><th>Place Name</th><th>Post Code</th><th>County</th></tr>';
						$.each(result.data, function (i, data) {
							trHTML += `<tr><td> ${data.placeName} </td><td> ${data.postalCode} </td><td> ${data.adminName2?data.adminName2:'unknown'} </td></tr>`;
						});
						trHTML += '</table>';
					} else {
						var trHTML = '<p>Post Name or Post Code does not exist</p>';
					}	

					$('#divResults').html(trHTML);
				}
			},
			error: function(jqXHR, textStatus, errorThrown) {
				
				var trHTML = '<p>Post Name or Post Code does not exist</p>';
				$('#divResults').html(trHTML);
				
			}
		}); 
	

	});