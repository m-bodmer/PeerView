/*
 * JS for Home Screen generated by Exadel Tiggzi
 *
 * Created on: Tuesday, February 07, 2012, 10:14:49 AM (PST)
 */
/************************************
 * JS API provided by Exadel Tiggzi  *
 ************************************/
/* Setting project environment indicator */
Tiggr.env = "apk"; /* Object & array with components "name-to-id" mapping */
var n2id_buf = {
    'logoutButton': 'j_39',
    'mobilegrid3': 'j_40',
    'mobilegridcell19': 'j_41',
    'mobilenavbar10': 'j_42',
    'mobilenavbaritem28': 'j_43',
    'mobilenavbaritem29': 'j_44',
    'mobilelist1': 'j_46',
    'courseList1': 'j_47',
    'courseList2': 'j_48',
    'courseList3': 'j_49'
};
if ("n2id" in window && n2id != undefined) {
    $.extend(n2id, n2id_buf);
} else {
    var n2id = n2id_buf;
}

function pageItem(pageName, pageLocation) {
    this.name = pageName;
    this.location = pageLocation;
}
Tiggr.AppPages = [
new pageItem('Register Account Screen', 'screen-0E78.html'), new pageItem('Login Screen', 'screen-EE4B.html'), new pageItem('Survey Screen', 'screen-89CF.html'), new pageItem('Home Screen', 'screen-893A.html'), new pageItem('current', 'screen-893A.html')];

function navigateTo(outcome, useAjax) {
    Tiggr.navigateTo(outcome, useAjax);
}

function adjustContentHeight() {
    Tiggr.adjustContentHeight();
}

function adjustContentHeightWithPadding() {
    Tiggr.adjustContentHeightWithPadding();
}

function unwrapAndApply(selector, content) {
    Tiggr.unwrapAndApply(selector, content);
}

function setDetailContent(pageUrl) {
    Tiggr.setDetailContent(pageUrl);
}
/*********************
 * GENERIC SERVICES  *
 *********************/
/*************************
 * NONVISUAL COMPONENTS  *
 *************************/
var datasources = [];
/************************
 * EVENTS AND HANDLERS  *
 ************************/
// screen onload
screen_893A_onLoad = j_36_onLoad = function() {
    createSpinner("res/lib/jquerymobile/images/ajax-loader.gif");
    Tiggr.__registerComponent('logoutButton', new Tiggr.BaseComponent({
        id: 'logoutButton'
    }));
    Tiggr.__registerComponent('mobilegrid3', new Tiggr.BaseComponent({
        id: 'mobilegrid3'
    }));
    Tiggr.__registerComponent('mobilegridcell19', new Tiggr.BaseComponent({
        id: 'mobilegridcell19'
    }));
    Tiggr.__registerComponent('mobilenavbar10', new Tiggr.BaseComponent({
        id: 'mobilenavbar10'
    }));
    Tiggr.__registerComponent('mobilenavbaritem28', new Tiggr.BaseComponent({
        id: 'mobilenavbaritem28'
    }));
    Tiggr.__registerComponent('mobilenavbaritem29', new Tiggr.BaseComponent({
        id: 'mobilenavbaritem29'
    }));
    Tiggr.__registerComponent('mobilelist1', new Tiggr.BaseComponent({
        id: 'mobilelist1'
    }));
    Tiggr.__registerComponent('courseList1', new Tiggr.BaseComponent({
        id: 'courseList1'
    }));
    Tiggr.__registerComponent('courseList2', new Tiggr.BaseComponent({
        id: 'courseList2'
    }));
    Tiggr.__registerComponent('courseList3', new Tiggr.BaseComponent({
        id: 'courseList3'
    }));
    for (var idx = 0; idx < datasources.length; idx++) {
        datasources[idx].__setupDisplay();
    }
    adjustContentHeightWithPadding();
}
// screen window events
screen_893A_windowEvents = j_36_windowEvents = function() {}
// screen elements extra js
screen_893A_elementsExtraJS = j_36_elementsExtraJS = function() {
    // screen (screen-893A) extra code
}
// screen elements handler
screen_893A_elementsEvents = j_36_elementsEvents = function() {
    $("a :input,a a,a fieldset label").live({
        click: function(event) {
            event.stopPropagation();
        }
    });
}
$("body").undelegate("pagebeforeshow").delegate("#j_36", "pagebeforeshow", function(event, ui) {
    j_36_onLoad();
    j_36_windowEvents();
    screen_893A_elementsExtraJS();
    screen_893A_elementsEvents();
});
document.addEventListener("deviceready", adjustContentHeightWithPadding);