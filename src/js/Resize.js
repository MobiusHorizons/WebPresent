(function(UI){


UI.resizeable = function(element, verb, attrs){
	if (element == undefined) return;
	/** some code to check for IE **/
	
	/** else **/
	if (verb == "set" || verb == "both"){
		if (element.style.overflow == "")
			element.style.overflow = "auto";
	
		//element.style.resize = 'both';
		var handle = lib.newEL('div', 
		{
			style : { position: 'absolute',
				height: '.75em',
				width : '.75em',
				bottom: '0px',
				right: '0px',
				zIndex: 100,
				cursor: 'se-resize',
				MozAppearance: 'resizer',
				webkitAppearance: 'resizer',
			},
			className : "resize-handle",
		});
		element.resizeHandle = element.appendChild(handle);
		element.resizeHandle.onmousedown = function(e){
			console.log(e); 
			e.cancelBubble = true;
			UI.resizeable.mousedown(element, e);
		}
	}

	if (verb == "remove" || verb == "unset" || verb == "none"){
		element.style.resize = 'none';
		if (element.resizeHandle != undefined){
			element.removeChild(element.resizeHandle);
		}
	}
}

UI.resizeable.mousedown = function(elem, e){
	elem.resizeableOffsetX = e.clientX;
	elem.resizeableOffsetY = e.clientY;
	elem.resizeableWidth = elem.offsetWidth;
	elem.resizeableHeight = elem.offsetHeight;
	console.log(e);
	console.log('starting resize');
	var old = {};
	old.mov = window.onmousemove;
	old.up = window.onmouseup;
	window.onmousemove = function(e2){UI.resizeable.mousemove(elem,e2)};
	window.onmouseup = function(){
		window.onmousemove = old.mov; window.onmouseup = old.up;
		elem.resizeableOffsetX = undefined; 
		elem.resizeableOffsetY = undefined; 
		elem.resizeableWidth = undefined; 
		elem.resizeableHeight = undefined; 
		elem.ondragstop(e);
	}
	console.log(elem.draggableOffsetX +":"+ elem.draggableOffsetY);
}

UI.resizeable.mousemove = function(elem, e){
	elem.style.width = (e.clientX - elem.resizeableOffsetX + elem.resizeableWidth) + "px";
	elem.style.height = (e.clientY - elem.resizeableOffsetY + elem.resizeableHeight) + "px";
}

}(window.UI = window.UI || function(){}));
