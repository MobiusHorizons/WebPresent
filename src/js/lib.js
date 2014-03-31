(function(lib){
	lib.follow = function(elem, trail, set){
		var e = elem;
		var ids = trail.split('.');
		for ( var i in ids){
			if (i == ids.length-1 && set != undefined){
				e[ids[i]] = set;
				console.log(e);
			}
			e = e[ids[i]];
		}
		return e;
	}
	
	lib.apply = function(elem, attributes){
		lib.foreach(attributes,function(v,n){
			elem[n]=v;
		});
		return elem;
	}

	lib.foreach = function(collection, fptr){
		if (collection.length != undefined){
			for (var idx = 0; idx < collection.length; idx++){
				var val = collection[idx];
				fptr(val,idx);
			}
		} else {
			for (var idx in collection){
				var val = collection[idx];
				fptr(val,idx);
			}
		}	
	}
	
	lib.sel = function(selector){
		return document.querySelectorAll(selector);
	}

	lib.selID = function(id){
		return document.getElementById(id);
	}

	lib.selClass = function(cl){
		return document.getElementsByClassName(cl);
	}

	lib.setAtr = function (elem, attribs){
		lib.foreach(attribs, function(v,n){
			elem.setAttribute(n,v);
		});
		return elem;		
	}

	lib.matches = function(elem, selector){
		if (elem.webkitMatchesSelector){
			return elem.webkitMatchesSelector(selector);
		}
		else if (elem.mozMatchesSelector){
			return elem.mozMatchesSelector(selector);
		} else if (elem.msMatchesSelector){
			return elem.msMatchesSelector(selector);
		} else if (elem.matches){
			return elem.matches(selector);
		} else {
			var collection = elem.parentNode.querySelectorAll(selector);
			for ( var i = 0; i < collection.length; i ++){
				if (collection[i] == elem) return true;
			}
			return false;
		}
	}

	lib.newEL = function(type,object){
		var e = document.createElement(type);
		lib.foreach(object,function(val,name){
			if (name == 'attributes'){
				e = lib.setAtr(e,val);
			} else if (name == 'style'){
				lib.apply(e.style,val);
			} else {
				e[name] = val;
			}
		});
		return e;
	}	
}(window.lib = window.lib|| {}));
