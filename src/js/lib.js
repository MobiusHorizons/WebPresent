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
	/*lib.follow = function(elem, trail){
		if (typeof trail == 'string'){
			return elem[trail];
		} else {
			var ntrail = trail[trail.key];
			return elem[lib.follow(elem[trail.key],ntrail)];
		}
	}

	lib.makeTrail(string){
		var trail = "";
		var ids = string.split('.');
		for (var i in ids)){
			var id = ids[i];
			
		}	
	}*/
}(window.lib = window.lib|| {}));
