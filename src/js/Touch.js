(function(UI){

	UI.events = UI.events || {};
	UI.events.touchstart = function(event){
		if(event.targetTouches.length==1){
			event.target.touchStartX = event.targetTouches[0].pageX;
			event.target.touchStartY = event.targetTouches[0].pageY;
		}
	};
	UI.events.touchmove = function(event){
		tg = event.target;
		if(event.targetTouches.length == 1){
			event.preventDefault();
			tg.touchLengthX = event.targetTouches[0].pageX-tg.touchStartX;
			tg.touchLengthY = event.targetTouches[0].oageY-tg.touchStartY;
		}
	};
	UI.events.touchend = function(event){
		tg = event.target;
			if (tg.touchLengthX > 30){
				var evt = new CustomEvent("swiperight", 
				{detail: {
					swipeLength: Math.abs(tg.touchLengthX)}
				});
				tg.dispatchEvent(evt);
			}
			if(tg.touchLengthX < -30){
				var evt = new CustomEvent("swipeleft", 
				{detail: {
					swipeLength: Math.abs(tg.touchLengthX)}
				});
				tg.dispatchEvent(evt);
			}
	};
	UI.events.touchcancel = function(event){
		event.preventDefault;
	};
	UI.touch = function(element, options){
		var self = this;
		element.addEventListener('touchstart',UI.events.touchstart);
		element.addEventListener('touchmove', UI.events.touchmove);
		element.addEventListener('touchend', UI.events.touchend);
		element.addEventListener('touchcancel',UI.events.touchcancel);
	}

}(window.UI = window.UI || function(){}));
