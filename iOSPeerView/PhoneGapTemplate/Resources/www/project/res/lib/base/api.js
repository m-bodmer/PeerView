function createClass(methods) {
	var clazz = function() {
		if (this.__init) {
			this.__init.apply(this, arguments);
		}
	};
	
	jQuery.extend(clazz.prototype, methods);

	return clazz;
}

/**
 * Locates Tiggzi components by id. Accepts a string containing id of the component to find.
 * 
 * @param {String} componentId - id of the component to find
 * @returns {Array} set of DOM elements representing Tiggzi component in the view
 * 
 * @example
 * var image = Tiggr('image');
 * @namespace
 */
function Tiggr(componentId) {
}

var Tiggr = {

	/**
	 * Creates a new screen
	 * @class Represents screen in the application
	 */
	Screen: createClass(/** @lends Tiggr.Screen.prototype */ {
		
		__init: function(options) {
			this.options = options;
		},
		
		/**
		 * Triggers navigation to this screen 
		 */
		navigate: function() {
			location.href = this.options.location;
		},

		/**
		 * Returns name of this screen
		 * @return {String} name of the screen
		 */
		getName: function() {
			return this.options.name;
		},

		/**
		 * Returns whether this screen is currently active
		 * @return {Boolean} <code>true</code> if this screen is currently active, otherwise <code>false</false>
		 */
		isCurrent: function() {
			return this.options.current;
		}
	}),

	/** 
	 * Name of the currently active screen 
	 * @type String
	 */
	currentScreenName: '',
	
	/**
	 * Navigates to the screen according to the name passed. If there's screen with such name, do nothing.
	 * 
	 * <p>This method doesn't check whether the screen being navigated to is the current screen. Navigating to 
	 * current screen can be used to get view refreshed/reset.</p>
	 * 
	 * @param {String} screenName name of the screen to navigate to
	 * @return {Boolean} <code>true</code> if the screen with such name exists otherwise <code>false</code>
	 */
	navigateTo: function(screenName) {
		var screen = Tiggr.screens[screenName];
		if (screen) {
			screen.navigate();
			return true;
		}
		
		return false;
	},

	/** 
	 * Hash of all screens configured in the application 
	 * @type Object.<String, Tiggr.Screen>
	 */
	screens: {},

	/**
	 * Creates a new popup
	 * @class Represents popup in the application
	 */
	Popup: createClass(/** @lends Tiggr.Popup.prototype */ {

		__init: function(options) {
			this.options = options;
		},
		
		/**
		 * Returns name of this popup
		 * @return {String} name of the popup
		 */
		getName: function() {
			return this.options.name;
		},

		/**
		 * Opens popup. Does nothing if popup is already in the opened state.
		 */
		open: function() {
			if (this.opened) {
				return;
			}
			
			this.opened = true;
		},

		/**
		 * Returns whether the popup is in opened or closed state.
		 * @return {Boolean} <code>true</code> if this popup is currently in an opened state, otherwise <code>false</false>
		 */
		isOpened: function() {
			return this.opened;
		},

		/**
		 * Closes the popup. Does nothing if the popup is already in the closed state.
		 */
		close: function() {
			if (!this.opened) {
				return;
			}
			
			this.opened = false;
		}

	}),

	/**
	 * Hash of all popups configured in the application 
	 * @type Object.<String, Tiggr.Popup>
	 */
	popups: {}, 

	/**
	 * Creates a new storage
	 * @class Represents generic data storage in the application. Storage is a list of key-value pairs. 
	 * <p>Key has string type and any string (including empty) is a valid key.</p> 
	 * <p>Value is serialized into JSON format before saving, so it should be something that JSON format can handle.</p>
	 * <p>Storage items can be manipulated using either provided methods or by accessing storage object directly:
	 * @example
	 * storage[key] = value;
	 * 
	 * alert(storage[key]);
	 * </p>
	 */
	Storage: /** @lends Tiggr.Storage.prototype */ {

		/**
		 * Returns item that is associated with the specified key.
		 * @param {String} key - key of the storage item
		 * @return {Object} value of storage item
		 */
		getItem: function(key) {
			return this[key];
		},

		/**
		 * Associates key with the item. If there is a value already associated with the given key,
		 * new value replaces the old one.
		 * <p>Given <code>value</code> is serialized into JSON format and resulting string is placed 
		 * into the underlying storage.</p>
		 * 
		 * @param {String} key - key of the storage item
		 * @param {Object} value - value of the storage item
		 * @throws {QuotaExceededError} if the value could not be set for some reason
		 */
		setItem: function(key, value) {
			this[key] = value;
		},

		/**
		 * Removes items from the storage associated with the given key. If there is no such item, the method does nothing.
		 * @param {String} key - key of the item to remove
		 */
		removeItem: function(key) {
			delete this[key];
		},

		/**
		 * Removes all items from the storage
		 */
		clear: function() {
			for (var prop in this) {
				if (this.hasOwnProperty(prop)) {
					delete this[prop];
				}
			}
		}
	},

	/**
	 * Screen-local storage. Has the same life span as screen object itself, created when user navigates to the screen.
	 * Storage contents is invalidated when user leaves the screen.
	 * @type Tiggr.Storage
	 */
	screenStorage: null,

	/**
	 * Application-wide storage. Data stored in this type of storage is accessible to all application screens. 
	 * Storage is invalidated when application has been exited.
	 * @type Tiggr.Storage
	 */
	applicationStorage: null,

	/**
	 * Persistent storage. Data stored in this type of storage is accessible to all application screens, and on subsequent 
	 * application execution sessions, so that it's not invalidated when application exits.
	 * @type Tiggr.Storage
	 */
	persistentStorage: null,

	/**
	 * Searches for item across all storages in the following order (shorter-lifetime scopes first):
	 * <ul>
	 *  <li>screen storage</li>
	 *  <li>application storage</li>
	 *  <li>persistent storage</li>
	 * </ul>
	 * and returns the first non-empty value. If there is no item associated with the given key in any of the available storages, 
	 * return <code>null</code>
	 * 
	 * @param {String} key - key of the storage item
	 * @return item found or <code>null</code> if such item is not available
	 */
	getItemFromStorage: function(key) {
		var storages = [Tiggr.screenStorage, Tiggr.applicationStorage, Tiggr.persistentStorage];
		
		for (var i = 0; i < storages.length; i++) {
			var storage = storages[i];
			var result = storage[key];

			if (result) {
				return result;
			}
		}
		
		return null;
	},
	
	/**
	 * @class Represents security context in the application. Security context is used as a wrapper around data source communication
	 * that is actually handling application user's authorization. There may be several data sources be associated with the same security 
	 * context.
	 * 
	 * <p>User should be logged in before invocation of secured data source. Any attempt to call data source in the unauthorized state 
	 * will result in 'authorization error' event fired.</p>
	 * 
	 * <p>Successful authorization of user will trigger 'login success' event, while unsuccessful authorization attempt will cause 
	 * 'login error' event</p>
	 * 
	 * <p>It is possible that security context is initialized to the logged in state directly or can transition to unauthorized state
	 * without any explicit notice, e.g.: security context uses persistent storage to re-use authorization data from previous application
	 * execution sessions or user has revoked previously issued OAuth token. Application should handle those situations correctly.</p>
	 */
	SecurityContext: /** @lends Tiggr.SecurityContext.prototype */ {
		
		/**
		 * Initializes SecurityContext using given settings. Supported settings are implementation-dependent.
		 * @param {Object} settings - hash of settings for initialization
		 * @param {Array<Number>} [settings.authorizationErrorStatusCodes = []] - array of HTTP status codes that's being returned will 
		 * cause 'authorization error' event to trigger
		 * 
		 */
		init: function(settings) {},
		
		/**
		 * Returns whether security context is in the logged in state currently
		 * @return {Boolean} boolean value indicating whether security context is in the logged in state
		 */
		isLoggedIn: function() {},
		
		/**
		 * Logs application user in. Fires either 'login success' or 'login error' events depending on authorization success.
		 * Exact behavior of this method is implementation-dependent.
		 */
		login: function() {},
		
		/**
		 * Invokes data source using the given settings. Settings object should be exactly the same as is required by jQuery.ajax method.
		 * Security context may transform or modify settings to add extra authorization information like HTTP headers or additional request 
		 * parameters.
		 * @see The <a href="http://api.jquery.com/jQuery.ajax/">jQuery.ajax</a>.
		 * @param {DataSource} dataSource - reference to the data source object being invoked
		 * @param {Object<String, Object>} settings - request settings
		 */
		invoke: function(dataSource, settings) {},
		
		/**
		 * Builds and returns security-wrapped URL according to the given request settings. Example of such use case is referring to a resource
		 * (e.g. image) from the protected context. Settings object should be exactly the same as is required by jQuery.ajax method.
		 * @see The <a href="http://api.jquery.com/jQuery.ajax/">jQuery.ajax</a>.
		 * @param {Object<String, Object>} settings - request settings
		 */
		getUrl: function(settings) {},
		
		/**
		 * Logs out of security context.
		 * Exact behavior of this method is implementation-dependent.
		 */
		logout: function() {}
	},
	
    /**
     * TBD
     * @class
     */
	OAuthSecurityContext: {
		
	},

    /**
     * TBD
     * @class
     */
	XAuthSecurityContext: {
		
	},
	
	/**
	 * Creates new transformer object
	 * @class Transformer is used to transform data from external source into another format, e.g. format date types to more human-readable format 
	 * or filter out unwanted data entries
	 */
	Transformer: /** @lends Tiggr.Transformer.prototype */ {
		
		/**
		 * Method that does the actual transformation
		 * @param {Object<String, Object>} data - data to be transformed
		 * @return {Object<String, Object>} transformed data object
		 */
		transform: function(data) {}

	},
	
	/**
	 * Creates new data source
	 * @class Data source is an object responsible for external servers communication, It is responsible either for sending request as for updating 
	 * application components with the received data according to the specified data mappings.
	 */
	DataSource: /** @lends Tiggr.DataSource.prototype */{
		
		/**
		 * Returns transformer currently associated with data source
		 */
		getTransformer: function() {},
		
		/**
		 * Associates data source with transformer that's used to handle received data
		 */
		setTransformer: function(transformer) {},
		
		/**
		 * Method to update components according to the predefined mapping rules using given data
		 * @param {Object<String, Object>} data - data object to use for component updates
		 */
		updateComponents: function(data) {},

		/**
		 * Sends asynchronous request to the server using given settings. If request has been completed successfully, 
		 * updates components with the received data according to the defined mapping rules and fires 'success' event followed by 'complete' event.
		 * <p>If request has not completed successfully, fires 'error' event followed by 'complete'.</p>
		 * @see The <a href="http://api.jquery.com/jQuery.ajax/">jQuery.ajax</a>.
		 * @param {Object<String, Object>} settings - exactly the same object as is required by jQuery.ajax method
		 */
		execute: function(settings) {}
		
	},
	
	/**
	 * @class Logger is an object that allows logging debug messages at various levels.
	 */
	Logger: /** @lends Tiggr.Logger.prototype */ {
			
		/**
		 * Constants defining available logging levels
		 */
		Levels: {
			ERROR: 4,
			WARN: 3,
			INFO: 2,
			DEBUG: 1,
		},
		
		/**
		 * Logs message with error level
		 * @param {...Object} params - message formatting parameters
		 */
		error: function(message, params) {},
		
		/**
		 * Logs message with warning level
		 * @param {...Object} params - message formatting parameters
		 */
		warn: function(message, params) {},

		/**
		 * Logs message with info level
		 * @param {...Object} params - message formatting parameters
		 */
		info: function(message, params) {},

		/**
		 * Logs message with debug level
		 * @param {...Object} params - message formatting parameters
		 */
		debug: function(message, params) {},
		
		/**
		 * Clears logged messages
		 */
		clear: function() {},
		
		/**
		 * Logs properties of object passed as argument
		 * @param o - object which properties should be printed
		 */
		dir: function(o) {},
		
		/**
		 * Sets current logging level. Messages with level smaller than the Logger level won't be logged.
		 * @param level - new logging level to set
		 */
		setLevel: function(level) {},
		
		/**
		 * Returns current logging level
		 * @return level currently being used
		 */
		getLevel: function() {},
		
		/**
		 * Checks whether logging is enabled for the passed in level.
		 * @param level - level value to check for
		 * @return <code>true</code> if logging for this level is enabled, <code>false</code> otherwise
		 */
		isLoggingEnabled: function(level) {}
	},
	
	/**
	 * Provides access to the global logger component useful for debug purposes.
	 * <p>There are four various logging levels available (in descending priority):
	 * 	<ul>
	 * 		<li>error</li>
	 * 		<li>warning</li>
	 * 		<li>info</li>
	 * 		<li>debug</li>
	 * 	</ul>
	 * </p>
	 * <p>Logger has built-in functionality of message interpolation, so that template string can be used to format log message according to the 
	 * passed arguments:
	 * </p>
	 * 
	 * Calling:
	 * 
	 * @example
	 * log.error("User {0} has invoked {1} command", userName, command);
	 * 
	 * Will output error message with '{0}' substring replaced with the value of 'userName' parameter and '{1}' replaced with the value of 'command'.
	 * @type Tiggr.Logger
	 */
	log: null//new Tiggr.Logger()

};