(function(UI){





UI.draggable = function(elem, verb, attrs){
	if (verb == 'set'){
		elem.onmousedown = function(e){UI.draggable.mousedown(elem,e)};
	} 
	if (verb == "unset" || verb == "remove" || verb == "none"){
		elem.onmousedown = null;
	}
}
UI.draggable.mousedown = function(elem, e){
	elem.draggableOffsetX = e.clientX - elem.offsetLeft;
	elem.draggableOffsetY = e.clientY - elem.offsetTop;
	console.log(e);
	console.log('starting drag');
	console.log(elem.offsetLeft);
	console.log(elem.offsetTop);
	elem.setAttribute('draggable','false'); // so we don't get drag and drop.
	var old = {};
	old.mov = window.onmousemove;
	old.up = window.onmouseup;
	window.onmousemove = function(e2){UI.draggable.mousemove(elem,e2)};
	window.onmouseup = function(){
		window.onmousemove = old.mov; window.onmouseup = old.up;
		elem.draggableOffsetX = undefined; 
		elem.setAttribute('draggable','auto'); 
		elem.draggableOffsetY = undefined; 
		elem.ontransformed({target: elem});
	}
	console.log(elem.draggableOffsetX +":"+ elem.draggableOffsetY);
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
