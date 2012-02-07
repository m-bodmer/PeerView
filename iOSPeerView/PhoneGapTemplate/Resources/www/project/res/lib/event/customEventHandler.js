var __GLOBAL_INNERHTML_TAGS = ['a', 'div', 'td', 'th','li'];
var __GLOBAL_CHECKED_TAGS = ['checkbox', 'radio'];
var __GLOBAL_TEXT_PROPERTIES = ['value', 'text'];
var __GLOBAL_ATTRIBUTES = ['style', 'onclick', 'ondblclick', 'onmouseout', 'onblur', 'onchange', 'onkeydown', 'onkeypress', 'onkeyup', 'onmousedown', 'onmousemove', 'onmouseover', 'onmouseup'];


function str2Bool(string){
	if((typeof string) == "string") {
		switch(string.toLowerCase()){
			case "true": case "checked": case "yes": case "1": return true;
			case "false": case "no": case "0": case null: return false;
			default: return Boolean(false);
		}
	} else {
		return string;
	}
}

function toggle(id, src, value) {
	var elem;
	var tag;
	if (src != "html") {
		elem = $(document).find('[id=' + id + ']');
		if (elem) {
			switch (elem.prop("tagName")) {
			case "SELECT":
			case "INPUT":
				elem= elem.parent();
				break
			case "IMG":
				elem = elem.closest('div');
				break
			case "A":
				if (elem.hasClass('ui-link-inherit')) {
					elem = elem.closest('li');
				} else {
					elem = elem.parent();
				}
				break;
				
			}
		}
	} else {
		elem = $(document).find('[id=' + id + '_comp]');
		if (elem.size() == 0) {
			elem = $(document).find('[id=' + id + ']');
			tag = elem.prop("tagName").toLowerCase(); 
			if(tag == "div" && elem.prop("class").indexOf("tabpanel") != -1 
			    && elem.prop("class").indexOf("tabs-top") == -1) {
				var elem_title = elem.parent().find('[href=#' + id +']' );
				if (value == undefined || "" == value){
					elem_title.toggle();
				} else{
					elem_title.toggle(str2Bool(value));
				}
				if(elem.css('display') == 'block' && !str2Bool(value)) {
					if(elem.prop("class").indexOf("ui-tabs-hide") == -1 ) {
						var elem_tab_panel = elem.parent();
						var sel_idx = elem_tab_panel.tabs("option", "selected");
						sel_idx++;
						sel_idx = (sel_idx == elem_tab_panel.tabs("length")) ? 0 : sel_idx;
						elem_tab_panel.tabs("select",  sel_idx);						
					}
				}
			}
		} 
	}
	if (!elem) return;
	
	if (value == undefined || "" == value){
		elem.toggle();
	} else{
		elem.toggle(str2Bool(value));
	}
	
}

function setText(id, text, src) {
    var elem = $("#" + id);
    if (!elem.length) { return; }
    var attr = "value";
    var tag = elem.prop("tagName").toLowerCase();
    if (jQuery.inArray(tag, __GLOBAL_INNERHTML_TAGS) > -1) {
        attr = "innerHTML";
        if (tag == "div" && elem.prop("class").indexOf("titledpanel") != -1) {
            elem = $("#" + id + "_title");
        } else if (tag == "div" && elem.prop("class").indexOf("ui-tabs-panel") != -1) {
            elem = elem.parent().find('[href=#' + id +']');
        }
    } else if (tag == "img") {
        attr = "src";
    } else if (tag == "input" && jQuery.inArray(elem.prop("type").toLowerCase(), __GLOBAL_CHECKED_TAGS) > -1) {
        attr = "innerHTML";
        if (src == "html") {
            elem = $("#" + id + "_label");
        } else {
            elem = $("#" + id + "_label .ui-btn-text");
        }
    }
    if ($("#" + id + " .ui-btn-text:first").length) {
        $("#" + id + " .ui-btn-text:first").text(text);
    } else {
        elem.prop(attr, text);
    }
}

function getText(id,src){
	var elem = $(document).find('[id=' + id + ']');
	if (elem.size() == 0) return;
	var attr = "value";
	var tag = elem.prop("tagName").toLowerCase(); 
	if(jQuery.inArray(tag, __GLOBAL_INNERHTML_TAGS) > -1) {
		attr="innerHTML";
		if(tag == "div" && elem.prop("class").indexOf("titledpanel") != -1) {
			elem = $('[id=' + id + '_title]');
		} else if (tag == "div" && elem.prop("class").indexOf("ui-tabs-panel") != -1) {
			elem = elem.parent().find('[href=#' + id +']' );
		}
	} else if (tag == "img"){
		attr="src";
	} else if (tag == "input" && jQuery.inArray(elem.prop('type').toLowerCase(), __GLOBAL_CHECKED_TAGS) > -1){
		if(src == "html") {
		   elem = $('[id=' + id + '_label]');
		} else {
		   elem  = $('[id=' + id + '_label] .ui-btn-text');
		}
		attr = "innerHTML";
	}
	if(elem.attr('data-role')=="collapsible"){
		return $('[id=' + id + '] .ui-btn-text:first').text();
	}else if($('[id=' + id + '] .ui-btn-text').size()>0){
		return $('[id=' + id + '] .ui-btn-text').text();
	}
	else
	return elem.prop(attr);
}

function setEnabled(id, text) {
	var elem = $(document).find('[id=' + id + ']');
	if (elem.size() == 0) return;
	var attr = "disabled";
	var tag = elem.prop("tagName").toLowerCase();
	$(elem).find('[id]').each(function() {
		__setEnabled__($(this), text)
	})
    __setEnabled__(elem, text);
    if (tag == "input" && jQuery.inArray(elem.prop('type').toLowerCase(), __GLOBAL_CHECKED_TAGS) > -1){
        __setEnabled__($(document).find('[id=' + id + '_label]') , text);
    }
}

function __setEnabled__(elem, text) {
	if (elem.size() == 0) return;
	var attr = "disabled";
	var tag = elem.prop("tagName").toLowerCase();
	text = str2Bool(text) ? "" : "disabled";
	elem.prop(attr, text);
	if(text == "disabled") {
		elem.addClass("disabled-cntrl");
	} else {
		elem.removeClass("disabled-cntrl");
	} 
	if (((tag== "input" && elem.prop('type').toLowerCase() == "text") || (tag== "div"))	
		&& elem.prop('class').toLowerCase().indexOf("hasdatepick") != -1) {
		if(text== "disabled") {
			elem.datepick('disable');
		} else {
			elem.datepick('enable');
		}
	}
}

function setChecked(id, text){
	var elem = $(document).find('[id=' + id + ']');
	if (elem.size() == 0) return;
	var attr = "checked";
	var tag = elem.prop("tagName").toLowerCase(); 
	if (tag == "input" && jQuery.inArray(elem.prop('type').toLowerCase(), __GLOBAL_CHECKED_TAGS) > -1){
		text = str2Bool(text) ? "checked" : "";
	}
	elem.prop(attr, text);
	
}

function setVar_(key, id, property, src, context){
	var elem = $(document).find('[id=' + id + ']');
	if (elem.size() == 0) return;
	if(elem[0].getAttribute('_tmpl')) {
		elem = $('[id=' + id + context.getAttribute('_idx') + ']');
	}	
	var attr = property;
	var tag = elem.prop("tagName").toLowerCase();
	if(attr=='text'){
		var text=getText(elem[0].id,src).trim();
		localStorage.setItem(key,text);
	}else{
		if( jQuery.inArray (attr.toLowerCase(), __GLOBAL_TEXT_PROPERTIES) > -1 ) {
			attr = "value";
			if(jQuery.inArray(tag, __GLOBAL_INNERHTML_TAGS) > -1) {
				attr="innerHTML";
			} else if (tag == "img"){
				attr="src";
			} else if (tag == "input" && jQuery.inArray(elem.prop('type').toLowerCase(), __GLOBAL_CHECKED_TAGS) > -1){
				attr="checked";
			}
		}
		localStorage.setItem(key,elem.prop(attr));
	}
}

function openDialog(id) {
	var elem = $('[id='+id+']');
	if(elem.size() == 0) return;
	if(elem.dialog('isOpen')) {
		alert( 'The popup window '  + elem.dialog( 'option', 'title' ) +' is already open!');
		return false;
	}
	elem.dialog('open');
}

/*
 * <script> $("#j_3").bind("click",function(){ showPopup("j_15"); }) </script>
 */
function initPageAsPopup(id){
	if (!id || "" == id) return;
	var obj = $("#"+id+"_popup");
	if (!obj.length){
		src = $("#"+id);
		obj = $( "<div data-role='dialog' id='"+id+"_popup'>" +
					"<div data-role='header'  data-position='inline' class='hdr'>" +
						"<div class='ui-title'></div>"+
					"</div>"+
				"</div>" );
		obj.find(".ui-title").text(src.find("div:[data-role='header'] h1").text());
		clone = src.find("div:[data-role='content']").clone();		
		clone.find("script").remove();
		clone.attr('data-theme','c').addClass('ui-corner-bottom ui-overlay-shadow').insertAfter(obj.find("div:[data-role='header']"));
		clone.find('[name]').each(function(index){
			var currentName=$(this).attr('name');			
			$(this).attr('name',currentName+"_popup");						
		});
		obj.appendTo($.mobile.pageContainer).dialog();	
		$("#"+id+"_popup div:[data-role='content']").css("min-height","0");	
	}
}

function initModals(str){
	if (str){
	ids = str.split(", ");
		for (id in ids){
			initPageAsPopup(ids[id]);
		}
	}
}

function showMobilePageAsPopup(id){
	var obj = $("#"+id+"_popup");
	if (obj.length){		
		try{
		$.mobile.changePage(obj, "pop", false, true);
		eval(id+"_onLoad();");	    
  } catch(e) {	    
	  } 		
	}
}

function closePopup () {
	if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1) {
		window.location.reload()
	}
	if (navigator.userAgent.toLowerCase().indexOf('safari') > -1) {
		window.location.reload()
	}
}

function format(str){
  for(i = 1; i < arguments.length; i++)  {
    str = str.replace("{" + (i - 1) + "}", arguments[i]);
  }
  return str;
}
(function($){
	$.fn.getType = function() {		
		 try{
				if(this.prop('type')){
					switch ($(this).prop('type')) {
						case 'radio':
						case 'checkbox':						
							return "checkboxradio"
						case 'button':						
							return "button"
						default:					
					}
				}		
				if($(this).attr('data-type')){
					switch (this.attr('data-type')) {		
					case 'range':					
						return "slider"			
					default:				
					}
				
				}
				if(this.attr('data-role')){
					switch ($(this).attr('data-role')) {					
					case 'slider':						
						return	"slider"		
					default:					
				}
				
				}
				if($(this).prop("tagName")=="SELECT"){						
						return "selectmenu"
				}
					return null
				}catch(e)
				{
					return null
				}
	};
	})(jQuery);



(function($){
	$.fn.setEnabled = function(value) {
		if(value!=""){
			var method=str2Bool(value)?"enable":"disable";
			var text = str2Bool(value) ? "" : "disabled";
			var s="$(this).{0}('"+method+"');"
			 this.each(function(){				 
					var type;
				try{
					type=$(this).getType();
						if(type!=null){
							eval(format(s,type));							
						}
						else if($(this).prop('tagName')=='DIV'||$(this).prop('tagName')=='OL'){
							if($(this).attr('data-role')=="collapsible" || $(this).attr('data-role')=="tiggr_label"){
								if(text=="disabled"){
									$(this).addClass('ui-disabled');
									this.onclick=function(event){																				
										event.stopPropagation();
										event.preventDefault();
										return false;
										}
								}else{
									$(this).removeClass('ui-disabled');
									this.onclick=null;
								}
								
							}
							$(this).find("[id]").setEnabled(value);
								
						}		
						else{
							if(text=="disabled"){
							$(this).addClass('ui-disabled');
								if($(this).closest('li')){
									$(this).closest('li').addClass('ui-disabled');
								}
							}else{
								$(this).removeClass('ui-disabled');
								if($(this).closest('li')){
									$(this).closest('li').removeClass('ui-disabled');
									}
							}
							$(this).prop("disabled",text);
						}			
							
					}catch(e)
					{
						
					}		
			});		
		}
	};
	})(jQuery);

(function($){
	$.fn.refresh = function(action) {
	if (action==null)
		action="refresh";
	return this.each(function(){		
		var s="$(this).{0}('refresh');"
			var type;
		try{			
			switch (action) {		
				case "refresh":
					type=$(this).getType();
					if(type!=null){
						eval(format(s,type));			 
					}
					break
				case "checkedRefresh":
					$(this).click();	
					break
				default:
			}
			}catch(e)
			{
				
			}		
	});
	};
	})(jQuery);

function setAttribute_(id, name, val) {
	var elem = $(document).find('[id=' + id + ']');
	if (elem.size() == 0) return;
    if (jQuery.inArray(name, __GLOBAL_ATTRIBUTES) > -1) {
			elem.attr(name, val);
	} else {
			elem.prop(name, val);
	}
}
