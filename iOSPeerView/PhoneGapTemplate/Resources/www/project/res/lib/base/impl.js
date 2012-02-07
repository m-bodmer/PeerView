(function($) {
$.fn.copyCSS = function(source){
    var dom = $(source).get(0);
    var style;
    var dest = {};
    if(window.getComputedStyle){
        var camelize = function(a,b){
            return b.toUpperCase();
        };
        style = window.getComputedStyle(dom, null);
        for(var i = 0, l = style.length; i < l; i++){
            var prop = style[i];
            var camel = prop.replace(/\-([a-z])/g, camelize);
            var val = style.getPropertyValue(prop);
            dest[camel] = val;
        };
        return this.css(dest);
    };
    if(style = dom.currentStyle){
        for(var prop in style){
            dest[prop] = style[prop];
        };
        return this.css(dest);
   };
   if(style = dom.style){
      for(var prop in style){
        if(typeof style[prop] != 'function'){
          dest[prop] = style[prop];
        };
      };
    };
    return this.css(dest);
};
})(jQuery);

/* Compatability with old browsers*/

if (Object.defineProperties === undefined) {
	Object.defineProperties = function(obj, properties) {
		  function convertToDescriptor(desc)
		  {
		    function hasProperty(obj, prop)
		    {
		      return Object.prototype.hasOwnProperty.call(obj, prop);
	
		    function isCallable(v)
		    {
		      // NB: modify as necessary if other values than functions are callable.
		      return typeof v === "function";
		    }
	
		    if (typeof desc !== "object" || desc === null)
		      throw new TypeError("bad desc");
	
		    var d = {};
		    if (hasProperty(desc, "enumerable"))
		      d.enumerable = !!obj.enumerable;
		    if (hasProperty(desc, "configurable"))
		      d.configurable = !!obj.configurable;
		    if (hasProperty(desc, "value"))
		      d.value = obj.value;
		    if (hasProperty(desc, "writable"))
		      d.writable = !!desc.writable;
		    if (hasProperty(desc, "get"))
		    {
		      var g = desc.get;
		      if (!isCallable(g) && g !== "undefined")
			throw new TypeError("bad get");
		      d.get = g;
		    }
		    if (hasProperty(desc, "set"))
		    {
		      var s = desc.set;
		      if (!isCallable(s) && s !== "undefined")
			throw new TypeError("bad set");
		      d.set = s;
		    }
	
		    if (("get" in d || "set" in d) && ("value" in d || "writable" in d))
		      throw new TypeError("identity-confused descriptor");
	
		    return d;
		  }
	
		  if (typeof obj !== "object" || obj === null)
		    throw new TypeError("bad obj");
	
		  properties = Object(properties);
		  var keys = Object.keys(properties);
		  var descs = [];
		  for (var i = 0; i < keys.length; i++)
		    descs.push([keys[i], convertToDescriptor(properties[keys[i]])]);
		  for (var i = 0; i < descs.length; i++)
		    Object.defineProperty(obj, descs[i][0], descs[i][1]);
	
		  return obj;
		}
	}
}

String.prototype.trim = String.prototype.trim || function() {

	if (!this) return this;
	return this.replace(/^\s+|\s+$/g, "");
	
}

window.$t = window.Tiggr = (function() {

	var components = {};
	
	var tiggrFunction = function(id, context) {
		if (!context)
			return components[id].__element
		else {
			return $('[id=' + components[id].__element[0].id + context.getAttribute('_idx') + ']');
		}
	};
	
	tiggrFunction.__registerComponent = function(id, component) {
		components[id] = component;
	};
	
	tiggrFunction.__unregisterComponent = function(id) {
		delete components[id];
	};

	return tiggrFunction;
}());

(function($t, $) {

	var linkPrototypes = function (parent, child) {
		var F = function() {};
		F.prototype = parent.prototype;
		child.prototype = new F();
	    child.prototype.constructor = child;
	    child.$super = parent.prototype;

	    return child;
	};	

	$t.createClass = function(base, methods, properties)  {
		base = base || Object;
		methods = methods || {};
		properties = properties || {};
		
		var derived = function()  {
			if (this.init) {
				this.init.apply(this, $.makeArray(arguments));
			}
		};
		linkPrototypes(base, derived);
	    $.extend(derived.prototype, methods);

    	Object.defineProperties(derived.prototype, properties);
	    
	    return derived;
	};
	
	$t.BaseComponent = $t.createClass(null, {

		init: function(options) {
			this.options = options;
			this.__element = $('[dsid="' + options.id + '"]:eq(0)', options.context);
			
			this.attachToDOM();
		},
		
		__registerComponent: function() {
			this.__componentRegistered = true;
			$t.__registerComponent(this.id, this);
			return this;
		},

		destroy: function() {
			if (this.__componentRegistered) {
				$t.__unregisterComponent(this.id);
			}
			this.__element = $();
		},
		
		__getUnknownAttribute: function(name) {
			return this.element().attr(name);
		},
		
		__getAttribute: function(name) {
			if (this.hasOwnProperty(name)) {
				return this[name];
			} else {
				return this.__getUnknownAttribute(name);
			}
		},
		
		__setUnknownAttribute: function(name, value) {
			this.element().attr(name, value);
		},
		
		__setAttribute: function(name, value) {
			if (this.hasOwnProperty(name)) {
				this[name] = value;
			} else {
				this.__setUnknownAttribute(name, value);
			}
		},

		getId: function() {
			return this.id;
		},
		
		element: function() {
			return this.__element;
		},
		
		attachToDOM: function() {
			this.element().data('Tiggr.component', this);
		},
		
		attr: function() {
			if (arguments.length == 1) {
				return this.__getAttribute(arguments[0]);
			} else {
				this.__setAttribute(arguments[0], arguments[1]);
				return this;
			}
		}
	
	}, {
		id: {
			get: function() {
				return this.options.id;
			},
			configurable : false
		}
	});
	
	var eventHandlerDelegates = ['bind', 'unbind', 'one', 'live', 'die', 'trigger'];
	$.each(eventHandlerDelegates, function(idx, methodName) {
		$t.BaseComponent.prototype[methodName] = function() {
			var elts = this.element();
			return elts[methodName].apply(elts, $.makeArray(arguments));
		};
	});	

	var commonEvents = ['mouseup', 'mousedown', 'mouseover', 'mouseout', 'mousemove', 'keypress', 'keyup', 'keydown', 'dblclick', 'click'];
	$.each(commonEvents, function(idx, type) {
		$t.BaseComponent.prototype[type] = function() {
			if (arguments.length == 0) {
				return this.trigger(type);
			} else {
				return this.bind.apply(this, $.makeArray(arguments));
			}
		};
	});

	$t.ConsoleLogger = $t.createClass(null, {

		__formatMessage: function(message, params) {
			var params = $.makeArray(arguments);
			params.shift();
			
			return message.replace(/\{(\d+)\}/g, function(str, p1, offset, s) {
				var num = parseInt(p1, 10);
				return params[num - 1 /* one-based -> zero-based */];
			});
		},
		
		error: function(message, params) {
			if (this.isLevelEnabled($t.Logger.Levels.ERROR)) {
				console.error(this.__formatMessage(message, params));
			}
		},
		
		warn: function(message, params) {
			if (this.isLevelEnabled($t.Logger.Levels.WARN)) {
				console.warn(this.__formatMessage(message, params));
			}
		},

		info: function(message, params) {
			if (this.isLevelEnabled($t.Logger.Levels.INFO)) {
				console.info(this.__formatMessage(message, params));
			}
		},

		debug: function(message, params) {
			if (this.isLevelEnabled($t.Logger.Levels.DEBUG)) {
				console.log(this.__formatMessage(message, params));
			}
		},
		
		clear: function() {
			console.clear();
		},
		
		dir: function(o) {
			console.dir(o);
		},
		
		setLevel: function(level) {
			this.level = level;
		},
		
		getLevel: function() {
			return this.level || $t.Logger.Levels.DEBUG;
		},
		
		isLevelEnabled: function(level) {
			return this.getLevel() <= level;
		}
	});
	
	var booleanAttributes = {
		'checked': true, 'compact': true, 'declare': true, 'defer': true, 'disabled': true, 'ismap': true, 
		'multiple': true, 'nohref': true, 'noresize': true, 'noshade': true, 'nowrap': true, 'readonly': true, 
		'selected': true
	};
	
	$t.MappingVisitor = $t.createClass(null, {
		
		init: function() {
			this.__contexts = new Array();
			this.__mappings = new Array();
			this.__visitArrayElement$Proxied = $.proxy(this.__visitArrayElement, this);
		},
		
		findComponent: function() {
			var context = this.getContext();
			
			var name = this.getMapping().ID;
			
			if (name) {
				elem=context.find("[dsid='" + name + "'], [dsrefid='" + name + "']");
				type=elem.attr("tiggrtype");
				if (type != "unefined" && type == "object") {
				        return Tiggr(name);
				}else{
					return elem;
				}	
			} else {
				return context;
			}
		},

		pushPath: function(p) {
		},
		
		popPath: function() {
		},
		
		getContext: function() {
			return this.__contexts[this.__contexts.length - 1];
		},
		
		getMapping: function() {
			return this.__mappings[this.__mappings.length - 1];
		},
		
		__validateRequiredMappingAttributes: function(entry) {
			//if (!entry.PATH) {
			//	$t.log.error("Error processing entry {0} - no PATH specified", JSON.stringify(entry));
			//	return false;
			//}
			
			return true;
		},

		beforeArrayElementVisit: function(elt, idx) {
		},
		
		afterArrayElementVisit: function(elt, idx) {
		},
		
		beforeArrayVisit: function() {
		},
		
		afterArrayVisit: function() {
		},
		
		visitEntry: function() {
		},
		
		getArrayElements: function() {
			return [];
		},
		
		__visitArrayElement: function(idx, elt) {
			this.pushPath(idx);
			
			this.beforeArrayElementVisit(elt, idx);
			
			this.__visitMappingsArray(this.getMapping().SET);
			
			this.afterArrayElementVisit(elt, idx, this.getMapping());

			this.popPath();
		},
		
		__visitMapping: function(mapping) {
			if (!this.__validateRequiredMappingAttributes(mapping)) {
				return;
			}
			
			if (mapping.PATH) {
				for (var i = 0; i < mapping.PATH.length; i++) {
					this.pushPath(mapping.PATH[i]);
				}
			}

			this.__mappings.push(mapping);
			
			if (!mapping.SET) {
				this.visitEntry();
			} else {
				this.beforeArrayVisit();

				if(arrayElementsBuf = this.getArrayElements()) {
					if(Object.prototype.toString.call(arrayElementsBuf) === '[object Array]') {
					$.each(arrayElementsBuf, this.__visitArrayElement$Proxied);
					}
					else {
						this.__visitArrayElement$Proxied();
					}
				}

				this.afterArrayVisit();
			}
			
			this.__mappings.pop();

			if (mapping.PATH) {
				for (var i = 0; i < mapping.PATH.length; i++) {
					this.popPath();
				}
			}
		},
		
		__visitMappingsArray: function(mappings) {
			for (var i = 0; i < mappings.length; i++) {
				this.__visitMapping(mappings[i]);
			}
		},
		
		visit: function(mappings) {
			this.__contexts.push($(document));

			this.__visitMappingsArray(mappings);
			
			this.__contexts.pop();
		}
	});
	
	$t.RenderVisitor = $t.createClass($t.MappingVisitor, {
		init: function(data) {
			$t.RenderVisitor.$super.init.apply(this);
			this.data = data;
			this.__path = new Array();
			this.__components = new Array();
		},
		
		__setupDisplay: function(cs) {
			cs.each(function(i) {
				var c = cs.eq(i);
				
				var display = c.prop('__tiggrDisplay');
				if (typeof display == 'undefined') {
					//first time call - backup 'display' settings
					c.prop('__tiggrDisplay', c.css('display'));
				} else {
					c.css('display', display);
				}
			});
		},
		
		pushPath: function(p) {
			this.__path.push(p);
		},
		
		popPath: function() {
			this.__path.pop();
		},
		
		__getDataByPath: function() {
			var path = this.__path.join('.');
			return jsonPath(this.data, path)[0];
		},

		__getComponents: function() {
			return this.__components[this.__components.length - 1];
		},
		
		getArrayElements: function() {
			return this.__getDataByPath();
		},
		
		beforeArrayElementVisit: function(elt, idx) {
			var that = this;
			var clonedElements = new Array();

			var components = this.__getComponents();
			
			components.each(function(componentIdx) {
				var component = components.eq(componentIdx);
				
				var dsid = component.attr('dsid');
				var clonedComponent = that.__specialClone(component);
					clonedComponent.appendTo(component.parent()); 
				that.changeIds(clonedComponent, dsid, idx);
				if (component.parent().attr('data-role') === 'controlgroup' )
					$.mobile.checkboxradio.prototype.enhanceWithin(clonedComponent);				
				$.merge(clonedElements, clonedComponent);
			});
			
			this.__contexts.push($(clonedElements));
		},
		
		__specialClone: function(originalComponent) {
			var that = this;
			var clonedComponent;
			
			originalComponent = originalComponent.jquery ? originalComponent : jQuery(originalComponent);
			
			if (originalComponent.jquery && originalComponent.attr('data-role') === 'collapsible') {
				clonedComponent = $('<div data-role="collapsible"><h3></h3><div></div></div>');
				clonedComponent.collapsible();
				
				this.__specialAtributesCopy(originalComponent, clonedComponent);
				
				clonedComponent.children('h3').children().remove();
				this.__specialChildrenCopy(originalComponent.children('h3'), clonedComponent.children('h3'));
				clonedComponent.children('div').children().remove();
				this.__specialChildrenCopy(originalComponent.children('div'), clonedComponent.children('div'));				
			} 
			else if (originalComponent.parent().attr('data-role') === 'controlgroup' ) {
				var typeGroup = originalComponent.children('div').children('input').attr('type');
				var nameGroup = originalComponent.children('div').children('input').attr('name');
				clonedComponent = $('<span><input></input><label></label></span>'); 							
				this.__specialAtributesCopy(originalComponent, clonedComponent);
				this.__specialAtributesCopy(originalComponent.children('div').children('label'), clonedComponent.children('label'));
				this.__specialAtributesCopy(originalComponent.children('div').children('input'), clonedComponent.children('input'));
				this.__specialChildrenCopy(originalComponent.children('div').children('label').find('.ui-btn-text'),clonedComponent.children('label') );
			} 
			else {
				clonedComponent = $('<' + originalComponent[0].nodeName + '/>');
				this.__specialAtributesCopy(originalComponent, clonedComponent);
				this.__specialChildrenCopy(originalComponent, clonedComponent);
				
			}
			return clonedComponent;
		},
		
		__specialChildrenCopy: function(originalComponent, clonedComponent) {
			var that = this;
			originalComponent.contents().each(function(){
				if (this.nodeType == Node.TEXT_NODE) {
					clonedComponent.append(this.cloneNode(false));
				}
				else if (this.nodeType == Node.ELEMENT_NODE) {
					var child = that.__specialClone(this);
					clonedComponent.append(child);
					if(child.attr('data-role') === 'controlgroup')
						$.mobile.checkboxradio.prototype.enhanceWithin(child);
				}
			});
		},
		
		__specialAtributesCopy: function(originalComponent, clonedComponent) {
			for (var i = 0;  i < originalComponent[0].attributes.length; i++)  {
				clonedComponent[0].attributes.setNamedItem(originalComponent[0].attributes.item(i).cloneNode(true));
			}
		},

		changeIds: function(component, dsid, idx) {
			
			component.attr('dsid', dsid + '_' + idx).attr('dsrefid', dsid);
			var oldComponentId = component.attr('id');
			if (oldComponentId)  {
				component.attr('_idx', '_' + idx);
				component.attr('id', oldComponentId + '_' + idx);
			}
			var replIdElements = component.find('[id]');
			replIdElements.each(function(replIdx) {
					var replEl = replIdElements.eq(replIdx);
					var oldId = replEl.attr('id');
					replEl.attr('id', oldId + '_' + idx);
					replEl.attr('_idx', '_' + idx);
			});
			replIdElements = component.find('[for]');
			replIdElements.each(function(replIdx) {
					var replEl = replIdElements.eq(replIdx);
					var oldId = replEl.attr('for');
					replEl.attr('for', oldId + '_' + idx);
			});
			replIdElements = component.find('input[type=checkbox]');
			replIdElements.each(function(replIdx) {
					var replEl = replIdElements.eq(replIdx);
					var oldId = replEl.attr('name');
					replEl.attr('name', oldId + '_' + idx);
			});
			component.removeAttr('_tmpl');
			component.find('[_tmpl]').removeAttr('_tmpl');			
		},
		
		beforeArrayVisit: function() {
			this.findComponent().filter('[dsrefid]').remove();
			var components = this.findComponent();
			this.__setupDisplay(components);
			this.__components.push(components);
		},
		
		afterArrayElementVisit: function(elt, idx, mappingSet) {
			var el = this.__contexts.pop();
			if(mappingSet && mappingSet.TRANSFORMATION)  {
				mappingSet.TRANSFORMATION(elt, el);
			}			
		},
		
		afterArrayVisit: function() {
			var components = this.__components.pop();
			components.hide();
			components.attr('_tmpl','true');
			var templates = components.find('[id]');
			templates.each(function(idx) {
				var tmplEl = templates.eq(idx);
				tmplEl.attr('_tmpl','true');
			});			
		},
		
		__updateComponent: function() {
			var entry = this.getMapping();
			var value = this.__getDataByPath() || '';
			var elt = this.findComponent();

			if(entry.TRANSFORMATION)  {
				var result = entry.TRANSFORMATION(value, elt);
				if(result) value = result; 
			}
			
			//TODO remove this legacy case (attrib!='@')
			if (entry.ATTR && entry.ATTR != '@') {
				//TODO - boolean value conversion
				//attribute can have boolean/integer type so we don't do string conversion. or do we need?
		
				if (booleanAttributes[entry.ATTR] && typeof value != 'boolean') {
					value = /^\s*true\s*$/i.test(String(value));
				}
				if(elt.hasOwnProperty("__setAttribute")){
					elt.__setAttribute(entry.ATTR, value);
				}else{
					elt.attr(entry.ATTR, value);
				}
			} else {
				//TODO - do we need explicit string constructor call here?
				//TODO - this will erase all child elements, should we handle this somehow?
				elt.html(String(value));
			}
		},
		
		visitEntry: function() {
			var entry = this.getMapping();
			var value = this.__getDataByPath() || '';
			
			if (entry.ID == '___local_storage___') {

				if(entry.TRANSFORMATION)  {
					var result = entry.TRANSFORMATION(value, undefined);
					if(result) value = result;
				};
				
				if (typeof value != 'undefined') {
					$t.persistentStorage.setItem(entry.ATTR, value);
				} else {
					$t.persistentStorage.removeItem(entry.ATTR);
				};
			} else  if(entry.ID == undefined && entry.TRANSFORMATION) {
				var element = this.findComponent();
				entry.TRANSFORMATION(value, element);
			} else {
				this.__updateComponent();
			}
		}
	});
	
	$t.RequestDataBuilderVisitor = $t.createClass($t.MappingVisitor, {
		init: function(isJsonp) {
			$t.RequestDataBuilderVisitor.$super.init.apply(this);
			this.__params = {};
			this.__headers = {};
			
			this.__paramStack = new Array();
			this.__paramStack.push(this.__params);

			this.__headerStack = new Array();
			this.__headerStack.push(this.__headers);

			this.__paths = new Array();
			
			this.__currentPath = new Array();
			
			this.__isJsonp = isJsonp;
		},

		__getParam: function() {
			return this.__paramStack[this.__paramStack.length - 1];
		},

		__getHeader: function() {
			return this.__headerStack[this.__headerStack.length - 1];
		},

		__clearPath: function() {
			this.__currentPath = new Array();
		},
		
		pushPath: function(p) {
			this.__currentPath.push(p);
		},
		
		popPath: function() {
			if (this.__currentPath.length != 0) {
				this.__currentPath.pop();
			}
		},
		
		__setValue: function(data, value) {
			for (var i = 0; i < this.__currentPath.length - 1; i++) {
				var p = this.__currentPath[i];
				if (!data[p]) {
					data = data[p] = {};
				} else {
					data = data[p];
				}
			}
			
			var pathSegment = this.__currentPath[this.__currentPath.length - 1];

			var prevValue = data[pathSegment];
			if (typeof prevValue != 'undefined') {
				if ($.isArray(prevValue)) {
					prevValue.push(value);
				} else {
					data[pathSegment] = [data[pathSegment], value];
				}
			} else {
				data[pathSegment] = value;
			}
		},
		
		__isHeader: function() {
			var l = this.__mappings.length - 1;
			for (var i = l; 0 <= i && l - 2 < i; i--) {
				var mapping = this.__mappings[i];
				if (mapping.HEADER) {
					return true;
				}
			}
			
			return false;
		},
		
		findComponent: function() {
			var elts = $t.RequestDataBuilderVisitor.$super.findComponent.call(this);
			var clonedElts = elts.filter('[dsrefid]');

			return (clonedElts.length ? clonedElts : elts);
		},
		
		getArrayElements: function() {
			return this.findComponent();
		},

		beforeArrayElementVisit: function(elt, idx) {
			this.__contexts.push($(elt));
		},
		
		afterArrayElementVisit: function(elt, idx) {
			this.__contexts.pop();
		},
		
		beforeArrayVisit: function() {
			this.__paths.push($.merge([], this.__currentPath));
			this.__clearPath();

			this.__paramStack.push([]);
			this.__headerStack.push([]);
		},
		
		afterArrayVisit: function() {
			this.__currentPath = this.__paths.pop();

			var paramArray = this.__paramStack.pop();
			if (paramArray.length != 0) {
				this.__setValue(this.__getParam(), paramArray)
			}
			
			var headerArray = this.__headerStack.pop();
			if (headerArray.length != 0) {
				this.__setValue(this.__getHeader(), headerArray)
			}
			
			this.__clearPath();
		},
		
		__setHeaderOrValue: function(value) {
			this.__setValue(this.__isHeader() ? this.__getHeader() : this.__getParam(), value);
		},
		
		visitEntry: function() {
			var entry = this.getMapping();
			var result;
			
			if (entry.ATTR) {
				var value;
				if (entry.ID) {
					if (entry.ID == '___local_storage___') {
						value = $t.persistentStorage.getItem(entry.ATTR) || entry.ATTR;
						if(entry.TRANSFORMATION) {
							result = entry.TRANSFORMATION(value);
							if(result) value = result;
						}
						this.__setHeaderOrValue(value);
					}
					else {
						var requestData = entry.ATTR == '@' ? this.findComponent().text().trim() : this.findComponent().attr(entry.ATTR).trim();
										
						if(entry.TRANSFORMATION) {
							result = entry.TRANSFORMATION(requestData);
							if(result) requestData = result;
						}
						
						this.__setHeaderOrValue(requestData);											
					}
				} else if (this.__isJsonp && entry.ATTR == '?') {
					this.jsonp = this.__currentPath.join('.');
				} else {
					value = entry.ATTR;
					if(entry.TRANSFORMATION) {
						result = entry.TRANSFORMATION(value);
						if(result) value = result;
					}
					this.__setHeaderOrValue(value);
				}
			} else 	if (entry.ID) {
				var requestData = this.findComponent().serializeArray();
				if(entry.TRANSFORMATION) {
					result = entry.TRANSFORMATION(requestData[0].value);
					if(result) requestData[0].value = result;
				}
				for (var i = 0; i < requestData.length; i++) {
					this.__setHeaderOrValue(requestData[i].value);
				}
			} else if(entry.TRANSFORMATION) {
				result = entry.TRANSFORMATION(undefined);
				if(result) this.__setHeaderOrValue(result);
			}
		},
		
		getHeaders: function() {
			return this.__headers;
		},
		
		getParams: function() {
			return this.__params;
		},
		
		getJsonp: function() {
			return this.jsonp;
		}
	});
		
	$t.DataSource = $t.createClass(null, {
		
		init: function(service, options) {
			this.service = service;
			this.options = options;
			this.__outMappings = options.outMappings || [];
			this.__inMappings = options.inMappings || [];
			this.__requestOptions = $.extend({},this.requestDefaults, options);
		},
		
		__setupDisplay: function(cs) {
			for(var i = 0; i < this.__outMappings.length; i++) {
				if(this.__outMappings[i].SET) {
					c = $("[dsid=" + this.__outMappings[i].ID + "]");
					var display = c.prop('__tiggrDisplay');
					if (typeof display == 'undefined') {
						//first time call - backup 'display' settings
//						c.prop('__tiggrDisplay', c.css('display'));
						c.prop('__tiggrDisplay', 'block');
					} else {
						c.css('display', display);
					}
					c.hide();
				}
			}
		},
		
		updateComponents: function(data) {
			this.data = data;
			
			new $t.RenderVisitor(data).visit(this.__outMappings);
			
			/*Need for rerendering fixed toolbars like footer*/
			if( "mobile" in jQuery && "fixedToolbars" in jQuery.mobile){
				jQuery.mobile.fixedToolbars.show();
			}
		},
		
		__successHandler: function(data) {
			if(this.service.__requestOptions.dataType=="xml"){				
				this.updateComponents($.xml2json(data));
			}
			else{
				this.updateComponents(data);
			}
			
			if (this.options.onSuccess) {
				this.options.onSuccess.apply(this, $.merge([], arguments));
			}
		},
		
		__responseDataHandler: function() {
			var args = $.merge([], arguments);
			var data = args[0];		
			
			if ($.type(data) == 'string') {
				data = $.parseJSON(data);
				args[0] = data;
			}
			
			var transformer = this.getTransformer();
			if (transformer) {
				args[0] = transformer.transform(args[0]);
			}
			
			this.__successHandler.apply(this, args);
		},
		
		__errorHandler: function() {
			//we are not resetting this.data here - that's done intentionally
			
			//TODO store error data
			if (this.options.onError) {
				this.options.onError.apply(this, $.merge([], arguments));
			}
		},

		__completeHandler: function() {

			if (this.options.onComplete) {
				this.options.onComplete.apply(this, $.merge([], arguments));
			}
			hideSpinner();
		},

		__beforeSendHandler: function() {
			showSpinner();
		},
		
		__replaceUrlParams: function(settings) {
			if (settings.url) {	
				function __replaceUrlParam(str, param) {
					var paramValue = settings.data[param] || settings.ssc_data[param] || '';
					delete settings.data[param];
					
					if ($.isArray(paramValue)) {
						paramValue = paramValue.join(',');
					}
					
					return isEncoded ? encodeURIComponent(paramValue) : paramValue;
				}
				
				var url = settings.url.indexOf('?') != -1 ? settings.url.substr(0, settings.url.indexOf('?')) : settings.url; 
				var getParams = settings.url.indexOf('?') != -1 ? settings.url.substr(settings.url.indexOf('?'), settings.url.length): undefined;
				var isEncoded;
				
				isEncoded = false;
				url = url.replace(/\{(\w+)\}/g, __replaceUrlParam);
				isEncoded = true;
				getParams = getParams && getParams.replace(/\{(\w+)\}/g, __replaceUrlParam);
				
				settings.url = url + (getParams ? getParams : "");
			}
		},
		
		__buildRequestSettings: function(settings) {
			var handlers = {
				'success':  $.proxy(this.__responseDataHandler, this),
				'error': $.proxy(this.__errorHandler, this),
				'complete':$.proxy(this.__completeHandler, this),
				'beforeSend':$.proxy(this.__beforeSendHandler, this)
			};
			settings = $.extend(handlers, this.service.__requestOptions, settings || {});
			
			var builder = new $t.RequestDataBuilderVisitor(!settings.jsonp && /\bjsonp\b/.test(settings.dataType || ''));
			builder.visit(this.__inMappings);
			
			settings.data = $.extend(builder.getParams(), settings.data || {});
			settings.headers = $.extend(builder.getHeaders(), settings.headers || {});
			
			this.__replaceUrlParams(settings);

			if (settings.contentType && settings.contentType.indexOf('json') !== -1) {
					settings.data  = JSON.stringify(settings.data);
			}

			var jsonp = builder.getJsonp();
			if (jsonp) {
				settings.jsonp = jsonp;
			}
			
				
			return settings;
		},
		
		execute: function(settings) {

			// simple security context data
			settings.ssc_data = {};			

			if (this.options.securityContext && this.options.securityContext.settings) {
				$.extend(settings.ssc_data , this.options.securityContext.settings)
			}
			
			settings = this.__buildRequestSettings(settings);
			
			if (this.options.echo) {
				this.__successHandler(this.options.echo);
			} else if (this.options.securityContext) {
				//TODO - rework this
				this.options.securityContext.invoke({
					execute: $.ajax
				}, settings);
			} else {
//				$.ajax(settings);
				this.service.process(settings);
			}				
		},
		
		getTransformer: function() {
			return this.__transformer;
		},
		
		setTransformer: function(transformer) {
			this.__transformer = transformer;
		}
	});

	$t.RestService = $t.createClass(null, {

		requestDefaults:  {
			dataType: 'json',
			cache: true,
			crossDomain: true,
			timeout: 5000
		},
		
		init: function(requestOptions) {
			/*This need for correct IE ajax json requests, otherwise 'no trasport' error*/
			if( navigator.userAgent.toLowerCase().indexOf('msie') != -1 ){
				jQuery.support.cors = true;
			}
			this.__requestOptions = $.extend({}, this.requestDefaults, requestOptions);
		},
		
		process: function(settings) {
			$.ajax(settings);
		}

	});
		
	$t.GeolocationService = $t.createClass(null, {
		
		requestDefaults: {
			frequency: 3000
		},

		init: function(requestOptions) {
			this.__requestOptions = {};
		},

		process: function(settings) {
			//showSpinner();
			var options = settings.data.options;
			options.watchPosition = options.watchPosition && options.watchPosition==='true'; //Now "options.watchPosition" is boolean (not string)

			var geoFunction = options.watchPosition ? navigator.geolocation.watchPosition : navigator.geolocation.getCurrentPosition;
			
			if (options.watchPosition) {
				options.frequency = options.frequency || this.requestDefaults.frequency;
			}

			geoFunction.call(navigator.geolocation,
					function(position) {
					if($.browser.mozilla){
					//converting position object
						var convertedPosition={};	
						convertedPosition.coords={};				
						convertedPosition.coords.accuracy=position.coords.accuracy;
						convertedPosition.coords.altitude=position.coords.altitude;
						convertedPosition.coords.altitudeAccuracy=position.coords.altitudeAccuracy;
						convertedPosition.coords.heading=position.coords.heading;
						convertedPosition.coords.latitude=position.coords.latitude;
						convertedPosition.coords.longitude=position.coords.longitude;
						convertedPosition.coords.speed=position.coords.speed;
						convertedPosition.timestamp=position.coords.timestamp;
						settings.success(convertedPosition);										
					}else{
						settings.success(position);
					}						
						settings.complete('success');
						hideSpinner();
					},
					function(error) {
						settings.error(error);
						settings.complete('error');
						hideSpinner();
					},
					settings.data.options);
		}

	});
	$t.ContactsService = $t.createClass(null, {

		init: function(requestOptions) {
			this.__requestOptions = $.extend({}, requestOptions);
		},
		
		process: function(settings) {	
			showSpinner();		
			navigator.contacts.find(settings.data.params.fields.split(' '),
						function(contacts) {
							settings.success(contacts);
							settings.complete('success');
							hideSpinner();
						},
						function(error) {
							settings.error(error);
							settings.complete('error');
							hideSpinner();
						},
						settings.data.options);
		}
		

	});		
	
	$t.BarCodeService = $t.createClass(null, {

		init : function(requestOptions) {
			this.__requestOptions = $.extend({}, requestOptions);
		},

		process : function(settings) {
			window.plugins.barcodeScanner.scan( function(result) {
					settings.success(JSON.stringify(result));
					settings.complete('success');
				}, function(error) {
					settings.error(error);
					settings.complete('error');
				}
			);
		}

	});

	$t.CameraService = $t.createClass(null, {

		init : function(requestOptions) {
			//Ignore component properties (quality, width, height ...) Its will be read from outMapping
			this.__requestOptions = {};
		},
		
		/**
		 * Note: "encodingTypes", "destinationTypes", "sourceTypes" are constants
		 * But it's impossible to move this object outside of function scope
		 * because class Camera is not defined when impl.js is parsed.
		 **/
		getEncodingType : function (strType) {
			var encodingTypes = {"JPEG" : Camera.EncodingType.JPEG, 
				"PNG" : Camera.EncodingType.PNG};

			if(strType in encodingTypes)
				return encodingTypes[strType];
			else
				return Camera.EncodingType.JPEG;
		},
		
		getDestinationType : function (strType) {
			var destinationTypes = { "Data URL" : Camera.DestinationType.DATA_URL, 
				"File URI" : Camera.DestinationType.FILE_URI };

			if(strType in destinationTypes)
				return destinationTypes[strType];
			else
				return Camera.DestinationType.DATA_URL;
		},

		getSourceType : function (strType) {
			var sourceTypes = { "Photolibrary" : Camera.PictureSourceType.PHOTOLIBRARY,
				"Camera" : Camera.PictureSourceType.CAMERA,
				"Saved photo album" : Camera.PictureSourceType.SAVEDPHOTOALBUM};

			if(strType in sourceTypes)
				return sourceTypes[strType];
			else
				return Camera.PictureSourceType.CAMERA;
		},
		
		//This method parses options recieved by camera service.
		//Options are converted from string to appropriate type.
		getRequestOptions : function (data) {
			var options = {};
			options['quality']         = parseInt(data.quality) || 80;
			options['destinationType'] = this.getDestinationType(data.destinationType);
			options['sourceType']      = this.getSourceType(data.sourcetype);
			options['allowEdit']       = (data.allowedit==='true');
			options['encodingType']    = this.getEncodingType(data.encodingType);
			options['targetWidth']     = parseInt(data.targetWidth) || 1024;
			options['targetHeight']    = parseInt(data.targetHeight) || 768;

			return options;
		},

		process : function(settings) {
			this.__requestOptions = this.getRequestOptions(settings.data);
			var requestOptions = this.__requestOptions;

            navigator.camera.getPicture(
                    function(imageData) {
                    	if(requestOptions.destinationType == Camera.DestinationType.DATA_URL) {
                            settings.success({ 'imageDataBase64' : "data:image/jpeg;base64," + imageData });
                    	}
                    	else {
                            settings.success({ 'imageURI' : imageData });
                    	}
                    	settings.complete('success');
                    },
                    function(error) {
                        settings.error(error);
                    	settings.complete('error');
                    },
                    this.__requestOptions);			 			
		}

	});
	
	$t.TiggrWrapper = $t.createClass(null,{
		init: function(componentId,options) {			
				this.__element = $('[dsid="' + componentId + '"]:eq(0)');				
				this.__element.options=options;
			},
		setProperty:function(name,value){	
			if (this.__element.hasOwnProperty(name)) {
				this.__element[name] = value;
				return;
			}  
			if (this.__element.hasOwnProperty("setProperty")){			
				this.setProperty(name, value);
				return;
			}
			this.__element.attr(name,value);			
			},
		refresh:function(){		
			if (this.__element.hasOwnProperty("refresh")){			
				    this.__element.refresh();
				}
		}		
		});	
		
	$t.TiggrMapComponent = $t.createClass($t.TiggrWrapper, {
		init:function(componentId,options){
				this.constructor.$super.init(componentId,options);
				this.isInitialized=false;
				this.options=options;
				this.options.mapElement=this.constructor.$super.__element;
				this.__element=this;
				this.geocoder=new google.maps.Geocoder();
				this.specifiedLocMarker=null;
				this.delayOptions=null;
				this.renderMap();
		},
		renderMap: function() {	
				var _that = this;
				if(this.options.address!=""){
					//evaluate center coordinates from address					
					this.geocoder.geocode( { 'address': this.options.address}, function(results, status) {
						if (status == google.maps.GeocoderStatus.OK) {				 
							_that.options.latitude=results[0].geometry.location.lat();        
							_that.options.longitude=results[0].geometry.location.lng();
							_that.initializeMapComponent();
						} else {
							console.log("Geocode was not successful for the following reason: " + status);
						}
					});	
					return;
				}	
				this.initializeMapComponent();			
			},
		initializeMapComponent:function(){
					this.isInitialized=false;
					var _that = this;
					mapCenter=new google.maps.LatLng(this.options.latitude,this.options.longitude);		
					this.options.mapElement.gmap({
						'center': mapCenter,
						'zoom':this.options.zoom
					}).bind('init', function(evt, map) {				
						_that.gmap=map;	
						_that.isInitialized=true;				
						
							if(_that.delayOptions!=null){								
								$.extend(_that.options,_that.delayOptions);								
								_that.delayOptions=null;
								_that.refresh();
							}else{
								_that.renderMarkers();
							}
										
						
					});
			},
			renderSpecifiedLocationMarker:function(){
				//Setting specified location marker if enabled	
				if(this.isInitialized) {
						if(typeof(this.options.showLocation)=="string") {
							switch(this.options.showLocation.toLowerCase()){
								case "true": case "yes": case "1": this.options.showLocation=true;break;						
								default: this.options.showLocation=false;
							}
						}
						if(this.options.showLocation){		
								specifiedLoc=new google.maps.LatLng(this.options.latitude,this.options.longitude);
								this.specifiedLocMarker=new google.maps.Marker({
									'position': specifiedLoc,																		
									'title': "Specified location"
									});
								this.options.mapElement.gmap('addMarker',this.specifiedLocMarker);
						}
				} else {
					console.log("Is not initialized yet, please try again later");
				}
			},
		renderMarkers:function(){
			if(this.isInitialized){
				var _that = this;	
				this.options.mapElement.gmap("clear","markers");
				this.renderSpecifiedLocationMarker();
				if(_that.options.showLocation) {
				$("[dsid="+this.options.markerSourceName+"] li").each(function(index){
					lat=$(this).attr("latitude")?$(this).attr("latitude"):$(this).find("[req]").attr("latitude");
					longt=$(this).attr("longitude")?$(this).attr("longitude"):$(this).find("[req]").attr("longitude");
					title=$(this).attr("text")?$(this).attr("text"):$(this).find("[req]").attr("text");
					address=$(this).attr("address")?$(this).attr("address"):$(this).find("[req]").attr("address");
					showInfoWindow=$(this).attr("show_info")?$(this).attr("show_info"):$(this).find("[req]").attr("show_info");
					markerName=$(this).attr("name");
					
						var marker = new google.maps.Marker({																	
								'title': title
						});	
						if(showInfoWindow=="true"){
							var infoWindowContent="";
							//rendering info window
							tagName=$(this).get(0).tagName;
							if((tagName=="LI")||(tagName=="OI")){
								//$(this).wrapInner("<div style='display:block'/>");
								infoWindowContent=$(this).html();		
							}else{
								if($(this).parent().children().size()>1){
									$(this).wrap("<div/>");
								}		
								$(this).css('display', 'block');
								infoWindowContent=$(this).parent().html();		
								$(this).css('display', 'none');
							}
						
							var iw = new google.maps.InfoWindow({
								content: infoWindowContent		
							});
							google.maps.event.addListener(marker, "click", function (e) { 		
								iw.open(_that.gmap, this); 
							});	
							iw.tiggrMarkerName=markerName;
							
							google.maps.event.addListener(iw, 'domready', function() {								
								$("[name="+iw.tiggrMarkerName+"_infoWindowContent]").parent().parent().css("overflow","");						
								$("[name="+iw.tiggrMarkerName+"_infoWindowContent]").parent().css("overflow","");
							});
						}
						//if marker address specified then geocode address
						if(address!=""){
							_that.geocoder.geocode({ 'address': address},function(results, status) {
								if (status == google.maps.GeocoderStatus.OK) {		
									lat=results[0].geometry.location.lat();        
									longt=results[0].geometry.location.lng();	
									var markerPosition = new google.maps.LatLng(lat, longt);
									marker.setPosition(markerPosition);
									_that.options.mapElement.gmap('addMarker',marker);											
								} else {
									console.log("Geocode was not successful for the following reason: " + status);
								}
							});	
						}else							
						if(lat!=""&&longt!=""){
							var markerPosition = new google.maps.LatLng(lat, longt);
							marker.setPosition(markerPosition);									
							_that.options.mapElement.gmap('addMarker',marker);
						}

			});
		}else{
			console.log("Is not initialized yet, please try again later");
		}
		}
			},
		setProperty:function(name,value){
						if(this.isInitialized){
							if(this.gmap.hasOwnProperty(name)){
								this.gmap.set(name,value);								
							}else{
								if(this.options.hasOwnProperty(name)){
									this.options[name]=value;									
								}
							}
						}else{
							if(this.options.hasOwnProperty(name)){
								if(this.delayOptions==null){
									this.delayOptions={};
								}
								this.delayOptions[name]=value;									
							}
						}
					},
		__setAttribute:function(name,value){
				    this.setProperty(name,value);
			},
		attr:function(name,value){
		    this.setProperty(name,value);
		},
		refresh:function(){
			if(this.isInitialized){
				_that=this;
				if(this.options.address!=""){
					this.geocoder.geocode({ 'address': this.options.address},function(results, status) {
										if (status == google.maps.GeocoderStatus.OK) {		
											_that.options.latitude=results[0].geometry.location.lat();        
											_that.options.longitude=results[0].geometry.location.lng();
											_that.gmap.set("center",new google.maps.LatLng(_that.options.latitude,_that.options.longitude));
											_that.renderMarkers();	
											_that.options.mapElement.gmap('refresh');											
										} else {
											console.log("Geocode was not successful for the following reason: " + status);
										}
									});
				}else{
					this.gmap.set("center",new google.maps.LatLng(this.options.latitude,this.options.longitude));
					//refresh markers
					this.renderMarkers();	
					this.options.mapElement.gmap('refresh');
				}				
			}else{
				console.log("Cannot refresh, map is not initialized!");
			}
		}
		});	
	
	$t.screenStorage = new $t.createClass(null, $t.Storage);
	$t.persistentStorage = localStorage;

	try {
		$t.applicationStorage = sessionStorage;
	}
	catch(err) {
		console.error(err);
		//sessionStorage wont work in "local mode" in firefox, but it will work if you upload the file to a server.
	}

	
	$t.adjustContentHeight = function() {

		if($(window).width() >= 650) {
			var hh = $(".ui-header").outerHeight(); hh = hh?hh:0;
			var fh = $(".ui-footer").outerHeight(); fh = fh?fh:0;
			var h = window.innerHeight - hh - fh;
			$('.ui-content').height(h);
			$('.scroller').height(h);
		}
	};
	
	$t.adjustContentHeightWithPadding = function(){
		var hh = $("[data-role='page'] > .ui-header").outerHeight() || 0;
	    var fh = $("[data-role='page'] > .ui-footer").outerHeight() || 0;
	    var topPad = $("[data-role='page'] > .ui-content").css('padding-top');
	    var bottomPad = $("[data-role='page'] > .ui-content").css('padding-bottom');
	    topPad = topPad ? topPad.replace("px", "") : 0;
	    bottomPad = bottomPad ? bottomPad.replace("px", "") : 0;
	    var h = window.innerHeight - hh - fh - topPad - bottomPad;
	    $("[data-role='page'] > .ui-content").css('min-height', h);
	};

	
	$t.unwrapAndApply = function(selector, content){
		var rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
	    var rhead = /<head\b[^<]*(?:(?!<\/head>)<[^<]*)*<\/head>/gi;

	    // Create a dummy div to hold the results
	    var tmpDiv = jQuery("<div>")
	    // inject the contents of the document in, removing the scripts
	    // to avoid any 'Permission Denied' errors in IE
	    .append(content.replace(rhead, ""))
	    jQuery(selector).html(tmpDiv
	    // Locate the specified elements
	    .find("div[data-role=content]").removeAttr("data-role"));
	    
	    window.primaryContentOnLoad = tmpDiv.find("[data-role=page]").attr("id");
	    
	    return tmpDiv.find(":jqmData(role='header')").children("h1, h2, h3, h4, h5, h6").text();
	};
	
	$t.setDetailContent = function(pageUrl){
		var that = this;
		// IPad template only has .content-primary and .content-secondary sections
		if ($(".content-primary").length && $(".content-secondary").length) {
			$.get(pageUrl, function(data) {
				var pageTitle = that.unwrapAndApply('.content-primary', data);
				$( "div[data-role='page']" ).page( "destroy" ).page();
				if ($('.ui-scrollview-view').length != 0)
					$('.scroller').scrollview("scrollTo", 0, 0);
				
				if (!pageTitle){
		        	pageTitle = data.match( /<title[^>]*>([^<]*)/ )&&  RegExp.$1;
				}
				
				//set title
				document.title= pageTitle;
				$( "div[data-role='page']" ).children(":jqmData(role='header')").find(".ui-title").text(pageTitle);
				
				$('.content-primary input, .content-primary textarea').unbind('blur', adjustContentHeight);
				$('.content-primary input, .content-primary textarea').bind('blur', adjustContentHeight);
				
				if (window.primaryContentOnLoad) {
					eval(window.primaryContentOnLoad + "_onLoad()");
					
					window.primaryContentOnLoad = undefined;
				}
				
			});
		}
		else {
			top.location = pageUrl;
		}
	};
	
	
	$t.navigateTo = function(outcome, useAjax){
		for(i=0;i<this.AppPages.length;i++) {
			if( this.AppPages[i].name == outcome) {
			  if (useAjax) {
			    $.mobile.changePage (this.AppPages[i].location);
			  } else {
	        	top.location = this.AppPages[i].location;
	        	}
	      	}
	    }
	}
} (Tiggr, jQuery));
