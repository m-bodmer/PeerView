// https://gist.github.com/723870
//run this script after jQuery loads, but before jQuery Mobile loads

//customize jQuery Mobile to let IE7+ in (Mobile IE)
$(document).bind("mobileinit", function(){
  $.extend( $.mobile , {
  
  //extend gradeA qualifier to include IE7+
    gradeA: function(){
     //IE version check by James Padolsey, modified by jdalton - from http://gist.github.com/527683
var ie = (function() {
var v = 3, div = document.createElement('div'), a = div.all || [];
while (div.innerHTML = '<!--[if gt IE '+(++v)+']><br><![endif]-->', a[0]);
return v > 4 ? v : !v;
}());
    
     //must either support media queries or be IE7+
     return $.support.mediaquery || (ie && ie >= 7);
    }
  });
});
