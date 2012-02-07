function createSpinner(pathToSpinnerImg) {
	if($('body.ui-mobile-viewport #ajaxBusy').length == 0) {
	    $('body.ui-mobile-viewport').append('<div id="ajaxBusy"><p><img src=' + pathToSpinnerImg + '></p></div>');
	    bindSpinner();
	    /* css styles moved are in mobilebase.css */
	} 
}

function bindSpinner() {
	$(document).ajaxStart(showSpinner).ajaxStop(hideSpinner);
}


function unbindSpinner(){
	$(document).unbind("ajaxStart ajaxStop");	
}


function showSpinner(){
	$('#ajaxBusy').show();
}


function hideSpinner(){
	$('#ajaxBusy').hide();
}