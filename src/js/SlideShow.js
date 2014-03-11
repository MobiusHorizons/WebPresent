/* this is the part that handles the actual slideshow files. */
/* depends on tarfile.js */
/* the basic structure is a tar file with a package.json describing the contents. */
(function(SlideShow){
	
	SlideShow.prototype = {
		
		archive : null,
		onload: null,
		slides : [],
		load : function (file, cb){
			var self = this;
			self.slides = [];
			
			self.archive.load(file, function(b){
				Archive.read_String(b.get('package.json'), function(data){
					var package = JSON.parse(data);
					for (s in package.slides){
						var slide = new Slide(self.archive,package.slides[s]);
						slide.slideshow = self;
						self.slides.push(slide);
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
			console.log(package);
			var stringJSON = JSON.stringify(package);
			var pkg = new Blob([stringJSON],{type:'aplication/json'});
			console.log(stringJSON);
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
			slides[slide.id].delete();
			slides.remove(slide.id);
		},
		addResource : function (blob, name){
			var self = this;
			if (name in self.archive.list()){
				return archive.get(name);
				// increment count
			} else {
				return self.archive.add(blob,name, {});
			}
		}
	}
}(window.SlideShow = window.SlideShow || function(){ 
	this.archive = new Archive();
	console.log(this.archive);
}));
