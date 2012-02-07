/* MIT licensed */
// (c) 2010 Jesse MacFadyen, Nitobi
if (!PhoneGap.hasResource("childbrowser")) {
	PhoneGap.addResource("childbrowser");
    
function Childbrowser ()
{
	
}

// Callback when the location of the page changes
// called from native
Childbrowser._onLocationChange = function(newLoc)
{
	window.plugins.childBrowser.onLocationChange(newLoc);
}

// Callback when the user chooses the 'Done' button
// called from native
Childbrowser._onClose = function()
{
	window.plugins.childBrowser.onClose();
}

// Callback when the user chooses the 'open in Safari' button
// called from native
Childbrowser._onOpenExternal = function()
{
	window.plugins.childBrowser.onOpenExternal();
}

// Pages loaded into the ChildBrowser can execute callback scripts, so be careful to 
// check location, and make sure it is a location you trust.
// Warning ... don't exec arbitrary code, it's risky and could fuck up your app.
// called from native
Childbrowser._onJSCallback = function(js,loc)
{
	// Not Implemented
	//window.plugins.childBrowser.onJSCallback(js,loc);
}

/* The interface that you will use to access functionality */

// Show a webpage, will result in a callback to onLocationChange
Childbrowser.prototype.showWebPage = function(loc)
{
	PhoneGap.exec(null, null, "com.phonegap.childbrowser", "showWebPage",[loc]);
}

// close the browser, will NOT result in close callback
Childbrowser.prototype.close = function()
{
	PhoneGap.exec(null, null, "com.phonegap.childbrowser", "close", []);
}

// Not Implemented
Childbrowser.prototype.jsExec = function(jsString)
{
	// Not Implemented!!
	//PhoneGap.exec("ChildBrowserCommand.jsExec",jsString);
}

// Note: this plugin does NOT install itself, call this method some time after deviceready to install it
// it will be returned, and also available globally from window.plugins.childBrowser
Childbrowser.install = function()
{
	if(!window.plugins)
	{
		window.plugins = {};	
	}
	
	window.plugins.childBrowser = new Childbrowser();
	return window.plugins.childBrowser;
}

PhoneGap.addConstructor(Childbrowser.install);

};
