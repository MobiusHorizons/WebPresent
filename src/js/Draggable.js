(function(UI){





UI.draggable = function(elem, verb, attrs){
	if (verb == 'set'){
		elem.touchstart = function(e){
			var event = e.touches[0];
			event.preventDefault = function(){e.preventDefault()}
			UI.draggable.mousedown(elem,attrs,event)
		};
		elem.onmousedown = function(e){UI.draggable.mousedown(elem,attrs,e)};
		elem.addEventListener('touchstart',elem.touchstart);
		elem.setAttribute('draggable','false'); // so we don't get drag and drop.
	} 
	if (verb == "unset" || verb == "remove" || verb == "none"){
		elem.onmousedown = null;
		if (elem.touchstart ){
			elem.removeEventListener('touchstart',elem.touchstart);
		}
		elem.setAttribute('draggable','auto'); 
	}
}
UI.draggable.mousedown = function(elem,attrs, e){
	elem.draggableOffsetX = e.clientX - elem.offsetLeft;
	elem.draggableOffsetY = e.clientY - elem.offsetTop;
	//console.log(e);
	//console.log('starting drag');
	//console.log(elem.offsetLeft);
	//console.log(elem.offsetTop);
	var old = {};
	if (attrs && attrs.cancel && lib.matches(e.target,attrs.cancel)){
		return;
	}
	e.preventDefault();
	old.mov = window.onmousemove;
	old.up = window.onmouseup;
	window.onmousemove = function(e2){UI.draggable.mousemove(elem,e2)};
	var touchmove = function(e2){UI.draggable.mousemove(elem,e2.touches[0])}
	window.addEventListener('touchmove',touchmove );
	window.onmouseup = function(){
		window.removeEventListener('touchmove',touchmove);
		window.removeEventListener('touchend',window.onmouseup);
		window.onmousemove = old.mov; window.onmouseup = old.up;
		elem.draggableOffsetX = undefined; 
		elem.draggableOffsetY = undefined; 
		elem.ontransformed({target: elem});
	}
	window.addEventListener('touchend',window.onmouseup);
	//console.log(elem.draggableOffsetX +":"+ elem.draggableOffsetY);
}

UI.draggable.getSnapCoords = function(elem, snapselectors){
	var snaplines = {}; // put in x, get out possible y's
	clientRects = [];
	lib.foreach(snapselectors, function(t,s){
		lib.foreach(lib.sel(s),function(el, idx){
			clientRects.push(el.getClientRects()[0]);
		});
	});
	console.log(clientRects);
	return clientRects;
}


UI.draggable.mousemove = function(elem, e){
	elem.style.left = (e.clientX - elem.draggableOffsetX) + "px";
	elem.style.top = (e.clientY - elem.draggableOffsetY) + "px";
}

}(window.UI = window.UI || function(){}));
