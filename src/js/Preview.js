/*** Preview.js 
 * file chooser with preview/ok button that validates uploaded files.
 * usage: 
 *      var p = new Preview({type:'video',modal:true});
 *      p.onload = function(blob) { ... };
 *      p.show();
 */

(function(Preview){


Preview.prototype = {
	onselected : null,
	ok : function(){
		console.log('ok');
		var self = this;
		var file = self.file.files[0];
		console.log(self.onselected)
		if (typeof self.onselected === 'function'){
			self.onselected(file);
		}
		self.close()
	},

	handleFile : function(){
		var self = this;
		var file = self.file.files[0];
		/* code that gets called when the file changes. */
		/***clear the preview window***/
		self.modal.inner.preview.innerHTML = "";
		if (self.type == 'video'){
			var video = lib.newEL('video', {className : "Preview preview",attributes:{controls:true}, 'src' : URL.createObjectURL(file)});
			self.modal.inner.preview.appendChild(video);
		} else if (self.type == 'image'){
			var img = lib.newEL('div',{className: "Preview Image preview"});
			img.style.backgroundImage = "url(" + URL.createObjectURL(file) + ")";
			self.modal.inner.preview.appendChild(img);
		}
		
	},

	init : function(object){
		var self = this;
		var b = lib.newEL('div', {className : "Preview background pbg"});
		var s = lib.newEL('div',
			{	
				className  : 'Preview modal',
		});
		var inner = lib.newEL('div',{className : "Preview modal-inner"});
					/*** Set up Header ***/
		var head = lib.newEL('header',{className: "Preview"}); 
		if (object != undefined){
			head.innerHTML = object.title || "Please choose a " + object.type + "." ;
		} else {
			head.innerHTML = "Please choose a file.";
		}
		
		var buttons = lib.newEL('div',{className: "Preview modal-buttons"});			
					/*** Set up File-Input ***/
		var file = lib.newEL('input',{attributes : {type : 'file'}, className: "Preview modal-file"});
		file.onchange = function(){self.handleFile()};
		self.file = inner.appendChild(file);

					/*** Set up Preview ***/
		var preview = lib.newEL('div',{className: "Preview modal-preview"});
		inner.preview = inner.appendChild(preview);
		
		var close = lib.newEL('button',
			{	onclick : function(){self.close()},
				className : 'Preview modal-button',
				title: "Cancel file selection",
			});
		close.innerHTML = "Cancel";
		var ok = lib.newEL('button',
			{
				onclick : function(){self.ok()},
				className: "Preview modal-button",
				title : "Use this file",
			});
		ok.innerHTML = "Ok";
		
		buttons.appendChild(ok);
		buttons.appendChild(close);
		/**************
                    <div class="modal-inner">
                        <header id="modal-label">Chose an Image<!-- Header --></header>
                        <div class="modal-content"><input type="file" id="file" name="file"/><!-- The modals content --></div>
                        <img id="modal-upload-img"></img>
                        <footer><!-- Footer --></footer>
                    </div>
		******************/
		s.head = head;
		s.inner = inner;
		s.buttons = buttons;
		self.modal = s
		self.bg = b;
		lib.apply(self,object);	
	},
	
	show : function(){
		var self = this;
		self.modal.appendChild(self.modal.head);
		self.modal.appendChild(self.modal.inner);
		self.modal.appendChild(self.modal.buttons);
		self.bg.appendChild(self.modal);
		self.bg = document.body.appendChild(self.bg);
		console.log(self.bg);
	},
	
	close : function(){
		var self = this;
		console.log("closing modal");
		console.log(self.bg);
		document.body.removeChild(self.bg);
	}
	
}

}(window.Preview = window.Preview || function(object){
	this.init(object)
}));

