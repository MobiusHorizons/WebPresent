(function(Slide){
	Slide.prototype = {
		//ID_CT : 0,
		//background : {},
		//resources : {},
		//elements : [],
		//id : -1,
		add : function(elem, type, resourceLinks){
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
			var self = this;
			slideshow.addResource(blob,name);
			self.background[name] = blob;
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
				var e = {};
				e.type 		=  element.tagName;
				e.innerHTML 	=  element.innerHTML;
				e.top 		=  element.top; //(element.offsetTop - ( winH/2 )) / winH ;
				e.left 		=  element.left;//(element.offsetLeft - (winW/2))/ winW;
				e.height 	=  element.height;//(element.clientHeight/winH);
				e.width 	=  element.width; //(element.clientWidth/winW);
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
			var self = this;
			self.elements = [];
			if (object.background && object.background.length > 0){
				var bgName = object.background[0];
				self.background[bgName] =self.archive.get(bgName);
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
				self.linkElemResources(newEl, elem.resources);
				self.ID_CT = self.elements.push(newEl);
			}
		},

		linkElemResources : function ( elem, links ){
			var self = this;
			for (var fileName in links){
				var link = links[fileName];
				var blob = self.archive.get(fileName);
				if (link.type == 'url'){
					lib.follow(elem,link.id , URL.createObjectURL(blob));
				} else if ( link.type == 'css' ){
					lib.follow(elem,link.id , "url(" + URL.createObjectURL(blob) + ")");
				}
			}
		},
		
		render : function(div, edit){
			var self = this;
			console.log("Slide.render");
			if (Object.keys(self.background).length != 0){
				for ( var bg in self.background ){
					if (self.background[bg].url == undefined){
						self.background[bg].url = 'url("' + URL.createObjectURL(self.background[bg]) + '")';
					}
					console.log(self.background[bg].url);
					
					console.log(div.style.backgroundImage);
					if (div.style.backgroundImage != self.background[bg].url)
						div.style.backgroundImage =  self.background[bg].url;
				}
			} else {
				div.style.backgroundImage = "";
			}
			div.innerHTML = "";
			for (var i in this.elements){
				var elem = this.elements[i];
				if (elem != null){
					div.appendChild(elem);
				}
			}
			if (edit ){
				setEdit();
			} else {
				resize();
			}
		},
		next : function(screen){
			return false; // TODO: add possibility for transitions within the slide
		},
		back : function(screen){
			return false; // TODO: add possibility for transitions within the slide
		}
	};
}(window.Slide = window.Slide || function(archive,object){
	var self = this;
	self.elements = [];
	self.ID_CT = 0;
	self.id = -1;
	self.background = {};
	self.resources = {};
	if (archive != undefined)
		self.archive = archive;
	if (object != undefined)
		self.load(object);
}));
