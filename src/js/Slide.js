(function(Slide){
	Slide.prototype = {
		ID_CT : 0,
		background : {},
		resources : {},
		elements : [],
		id : -1,
		add : function(elem, type, resourceLinks){
			console.log(resourceLinks);
			var self = this;
			for (var r in resourceLinks){
				var rl = resourceLinks[r];
				var b = self.slideshow.addResource(rl.resource, rl.resource.name);
				elem.resources = elem.resources || {};
				elem.resources[rl.resource.name] = rl.link; // {id,type}
			}
			var id = ++self.ID_CT;
			elem.elem_id = ID_CT;
			self.elements[ID_CT] = elem;
			self.elements[ID_CT].onupdate = function(elem){
				self.elements[elem.elem_id] = elem;
			}
		},

		setBackground : function (blob,name){
			slideshow.addResource(blob,name);
			this.background[name] = blob;
		},

		nextID : function(){
			return this.ID_CT+1;
		},

		save : function(){
			view(true);
			var self = this;
			var elems = [];
			var object = {};
			object.background = [];
			lib.foreach(self.background, function(v,name){object.background.push(name)});
			for (var el in self.elements){
				var element = self.elements[el];
				console.log("saveElems");
				console.log(JSON.stringify(element.style));
				var e = {};
				e.type 		=  element.tagName;
				e.innerHTML 	=  element.innerHTML;
				e.top 		= (element.offsetTop - ( winH/2 )) / winH ;
				e.left 		= (element.offsetLeft - (winW/2))/ winW;
				e.height 	= (element.clientHeight/winH);
				e.width 	= (element.clientWidth/winW);
				e.id 		=  element.id;
				e.className 	=  element.className;
				e.resources 	=  element.resources;
				elems.push(e);
			}
			setEdit(true);
			object.elems = elems;
			return object;
		},
		
		load : function(object){
			console.log("Slide.load()");
			console.log(object);
			var self = this;
			self.elements = [];
			if (object.background){
				var bgName = object.background;
				self.background[bgName] = URL.createObjectURL(self.archive.get(bgName));
			}
				
			for ( var e in object.elems){
				var elem = object.elems[e];
				var newEl = document.createElement(elem.type);
				newEl.width 	= elem.width;
				newEl.height	= elem.height;
				newEl.top 	= elem.top;
				newEl.left 	= elem.left;
				newEl.className = elem.className;
				newEl.innerHTML = elem.innerHTML;
				newEl.id 	= elem.id;
				console.log(newEl);
				self.linkElemResources(newEl, elem.resources);
				self.ID_CT = self.elements.push(newEl);
			}
		},

		linkElemResources : function ( elem, links ){
			console.log('linkElemResources()');
			var self = this;
			for (var fileName in links){
				var link = links[fileName];
				var blob = self.archive.get(fileName);
				console.log(link.type);
				if (link.type == 'url'){
					lib.follow(elem,link.id , URL.createObjectURL(blob));
				} else if ( link.type == 'css' ){
					lib.follow(elem,link.id , "url(" + URL.createObjectURL(blob) + ")");
				}
			}
		},
		
		render : function(div){
			if (Object.keys(this.background).length != 0){
				for ( var bg in this.background ){
					div.style.backgroundImage = "url(" + this.background[bg] + ")";
				}
			}
			for (var i in this.elements){
				var elem = this.elements[i];
				if (elem != null){
					div.appendChild(elem);
				}
			}
			setEdit();
		}
	};
}(window.Slide = window.Slide || function(archive,object){
	var self = this;
	if (archive != undefined)
		self.archive = archive;
	if (object != undefined)
		self.load(object);
}));
