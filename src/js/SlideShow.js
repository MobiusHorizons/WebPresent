/* this is the part that handles the actual slideshow files. */
/* depends on tarfile.js */
/* the basic structure is a tar file with a package.json describing the contents. */
(function(SlideShow){
	
	SlideShow.prototype = {
		
		archive : null,
		onload: null,
		slides : [],
		currentSlide: null,
		load : function (file, cb){
			var self = this;
			self.slides = [];
			
			self.archive.load(file, function(b){
				Archive.read_String(b.get('package.json'), function(data){
					var package = JSON.parse(data);
					for (s in package.slides){
						var slide = new Slide(self.archive,package.slides[s]);
						slide.slideshow = self;
						var id = self.slides.push(slide);
						self.slides[id-1].id=id-1;
					}	
					if (cb != undefined) cb(self);
					if (self.onload != null) self.onload(self);
				})
			})
		},

		save : function(){
			var self = this;
			var package = {slides:[]};
			for (slide in self.slides){
				package.slides.push(self.slides[slide].save())
			}
//			console.log(package);
			var stringJSON = JSON.stringify(package);
			var pkg = new Blob([stringJSON],{type:'aplication/json'});
//			console.log(stringJSON);
			self.archive.add(pkg, 'package.json', {});
			return self.archive.getBlob(); 	
		},
		
		/*load: function(file){
			var self = this;
			self.archive.load(file);
			Archive.read_String(
				self.archive.get('package.json',
					function(data){
						var package = JSON.parse(data);
						for (s in package.slides){
							var slide = new Slide(package.slides[s]);
							slide.slideshow = self;
							slides.push(slide);
						}	
					}
				)
			);	
		},*/

		getArchive : function(){
			return this.archive;
		},
		
		addSlide : function(slide){
			var id = this.slides.push(slide);
			id --;
			this.slides[id].id = id;	
			this.slides[id].slideshow = this;
			return this.slides[id];
		},

		removeSlide : function(slide){
			self.slides[slide.id].delete();
			self.slides.remove(slide.id);
		},
		addResource : function (blob, name){
			var self = this;
			if (name in self.archive.list()){
				return archive.get(name);
				// increment count
			} else {
				return self.archive.add(blob,name, {});
			}
		},
		next : function (screen){
			var self = this;
			if (self.currentSlide == null){
				return self.start(screen);
			}
			if (self.currentSlide.next(screen) == false){
				var id = self.currentSlide.id;
				console.log(id);
				return self.render(id+1,screen);
				/*if ((id+1) < self.slides.length){
					self.currentSlide = self.slides[id+1];
					self.currentSlide.render(screen);
					return true;
				}
				return false;*/
			}
		},
		back : function (screen){
			var self = this;
			if (self.currentSlide == null){
				return self.start(screen)
			}
			if (self.currentSlide.back(screen) == false){
				var id = self.currentSlide.id;
				console.log(id);
				return self.render(id-1,screen);
			}
		},
		render : function(id, screen, setCurrent){
			if (setCurrent == undefined){ setCurrent = true; }
			else { console.log('currentSide updating to ' + id)};
			var self = this;
			if (id >=0 && id < self.slides.length){
				self.slides[id].render(screen);
				if (setCurrent) self.currentSlide = self.slides[id];
				return true;
			} 
			return false;
		},
		start : function(screen){
			var self = this;
			self.render(0,screen,true);
		}
	}
}(window.SlideShow = window.SlideShow || function(){ 
	this.archive = new Archive();
}));
