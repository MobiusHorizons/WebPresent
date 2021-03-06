(function(Archive){
	// helper functions

	function getSizeAsUint32Array(blob){
		array = new Uint32Array(2);
		array[0] = blob.size;
		return array;
	}

	Archive.read_ArrayBuffer = function(blob, callback){
		var filereader = new FileReader();
		filereader.onload = function(e){ callback(this.result)}
		filereader.readAsArrayBuffer(blob);
	}

	Archive.read_String = function(blob, callback){
		var filereader = new FileReader();
		filereader.onload = function(e){ callback(this.result)}
		filereader.readAsText(blob);
	}
	Archive.prototype = {
		// Declarations
resources : false,
header :	{ files: {} },

	/* add( Blob, identifier, attribs)
	 * Takes the blob to be added, an identifier i.e filename, and any atributes as an object
	 * attributes may be in any format
	 */
add : function(blob, identifier, atribs){
	      var self = this;
	      var entry = {};
	      entry.length = blob.size;
	      entry.type = blob.type;
	      atribs = atribs || {};
	      entry.atribs = atribs;
	      if (this.resources){
	      	      entry.start = self.resources.size;
		      var tmp = new Blob([self.resources,blob]);
		      self.resources = tmp;
	      } else {
		      entry.start = 0;
		      self.resources = new Blob([blob]);
	      }
	      this.header.total = self.resources.size;
	      console.log(entry);
	      // TODO: doesn't handle duplicates properly.
	      self.header.files[identifier] = entry;
	      return self.resources.slice(entry.start, entry.start + entry.length);
      },

// TODO: add remove support


	/* get( name ):
 	 * get file by name
 	 * returns blob of file with correct mime type.
 	 */
get : function(name){
	      var self = this;
	      if (name in self.header.files){
		      var f = self.header.files[name];
		      console.log(name + ":" + f.type);
		      return this.resources.slice(f.start,f.start + f.length,f.type);
	      }
      },
	/* list():
	 * list files in blob
 	 */ 
list : function(){
	       var n = [];
	       for (name in this.header.files){
		       n.push(name);	
	       }
	       return n;
	},


       /* returns the Archive being built as a blob.
        */
getBlob : function(){
		  var self = this;
		  var headBlob = new Blob([JSON.stringify(this.header)],{type:'application/json'});
		  var sizeHeader = getSizeAsUint32Array(headBlob);
		  return new Blob([sizeHeader,headBlob,this.resources],{type:'aplication/x-blob-archive'});
	},

	/* load archive from blob
 	 */ 
load : function(Blob, calback){
	       var self = this;
	       self.header = {};
	       self.resources = [];
	       Archive.read_ArrayBuffer(Blob.slice(0,8), function(data){
			       var length =  new Uint32Array(data)[0];
			       console.log(length);
			       Archive.read_String(Blob.slice(8,length+8),function(data){
				       self.header = JSON.parse(data);
				       console.log(data);
				       self.resources = Blob.slice(length+8, Blob.size);
				       if (calback != undefined && typeof( calback) == "function"){ calback(self)}
				       });
			       });
       },

getHeader : function(){return this.header},
getResources : function(){return this.resources}
	};
}
(window.Archive = window.Archive || function(blob){if (blob != undefined) this.load(blob)} ));



/* Blob.js
 * A Blob implementation.
 * 2013-12-27
 * 
 * By Eli Grey, http://eligrey.com
 * By Devin Samarin, https://github.com/eboyjr
 * License: X11/MIT
 *   See LICENSE.md
 */

/*global self, unescape */
/*jslint bitwise: true, regexp: true, confusion: true, es5: true, vars: true, white: true,
  plusplus: true */

/*! @source http://purl.eligrey.com/github/Blob.js/blob/master/Blob.js */

if (!(typeof Blob === "function" || typeof Blob === "object") || typeof URL === "undefined")
if ((typeof Blob === "function" || typeof Blob === "object") && typeof webkitURL !== "undefined") self.URL = webkitURL;
else var Blob = (function (view) {
	"use strict";

	var BlobBuilder = view.BlobBuilder || view.WebKitBlobBuilder || view.MozBlobBuilder || view.MSBlobBuilder || (function(view) {
		var
			  get_class = function(object) {
				return Object.prototype.toString.call(object).match(/^\[object\s(.*)\]$/)[1];
			}
			, FakeBlobBuilder = function BlobBuilder() {
				this.data = [];
			}
			, FakeBlob = function Blob(data, type, encoding) {
				this.data = data;
				this.size = data.length;
				this.type = type;
				this.encoding = encoding;
			}
			, FBB_proto = FakeBlobBuilder.prototype
			, FB_proto = FakeBlob.prototype
			, FileReaderSync = view.FileReaderSync
			, FileException = function(type) {
				this.code = this[this.name = type];
			}
			, file_ex_codes = (
				  "NOT_FOUND_ERR SECURITY_ERR ABORT_ERR NOT_READABLE_ERR ENCODING_ERR "
				+ "NO_MODIFICATION_ALLOWED_ERR INVALID_STATE_ERR SYNTAX_ERR"
			).split(" ")
			, file_ex_code = file_ex_codes.length
			, real_URL = view.URL || view.webkitURL || view
			, real_create_object_URL = real_URL.createObjectURL
			, real_revoke_object_URL = real_URL.revokeObjectURL
			, URL = real_URL
			, btoa = view.btoa
			, atob = view.atob
			
			, ArrayBuffer = view.ArrayBuffer
			, Uint8Array = view.Uint8Array
		;
		FakeBlob.fake = FB_proto.fake = true;
		while (file_ex_code--) {
			FileException.prototype[file_ex_codes[file_ex_code]] = file_ex_code + 1;
		}
		if (!real_URL.createObjectURL) {
			URL = view.URL = {};
		}
		URL.createObjectURL = function(blob) {
			var
				  type = blob.type
				, data_URI_header
			;
			if (type === null) {
				type = "application/octet-stream";
			}
			if (blob instanceof FakeBlob) {
				data_URI_header = "data:" + type;
				if (blob.encoding === "base64") {
					return data_URI_header + ";base64," + blob.data;
				} else if (blob.encoding === "URI") {
					return data_URI_header + "," + decodeURIComponent(blob.data);
				} if (btoa) {
					return data_URI_header + ";base64," + btoa(blob.data);
				} else {
					return data_URI_header + "," + encodeURIComponent(blob.data);
				}
			} else if (real_create_object_URL) {
				return real_create_object_URL.call(real_URL, blob);
			}
		};
		URL.revokeObjectURL = function(object_URL) {
			if (object_URL.substring(0, 5) !== "data:" && real_revoke_object_URL) {
				real_revoke_object_URL.call(real_URL, object_URL);
			}
		};
		FBB_proto.append = function(data/*, endings*/) {
			var bb = this.data;
			// decode data to a binary string
			if (Uint8Array && (data instanceof ArrayBuffer || data instanceof Uint8Array)) {
				var
					  str = ""
					, buf = new Uint8Array(data)
					, i = 0
					, buf_len = buf.length
				;
				for (; i < buf_len; i++) {
					str += String.fromCharCode(buf[i]);
				}
				bb.push(str);
			} else if (get_class(data) === "Blob" || get_class(data) === "File") {
				if (FileReaderSync) {
					var fr = new FileReaderSync;
					bb.push(fr.readAsBinaryString(data));
				} else {
					// async FileReader won't work as BlobBuilder is sync
					throw new FileException("NOT_READABLE_ERR");
				}
			} else if (data instanceof FakeBlob) {
				if (data.encoding === "base64" && atob) {
					bb.push(atob(data.data));
				} else if (data.encoding === "URI") {
					bb.push(decodeURIComponent(data.data));
				} else if (data.encoding === "raw") {
					bb.push(data.data);
				}
			} else {
				if (typeof data !== "string") {
					data += ""; // convert unsupported types to strings
				}
				// decode UTF-16 to binary string
				bb.push(unescape(encodeURIComponent(data)));
			}
		};
		FBB_proto.getBlob = function(type) {
			if (!arguments.length) {
				type = null;
			}
			return new FakeBlob(this.data.join(""), type, "raw");
		};
		FBB_proto.toString = function() {
			return "[object BlobBuilder]";
		};
		FB_proto.slice = function(start, end, type) {
			var args = arguments.length;
			if (args < 3) {
				type = null;
			}
			return new FakeBlob(
				  this.data.slice(start, args > 1 ? end : this.data.length)
				, type
				, this.encoding
			);
		};
		FB_proto.toString = function() {
			return "[object Blob]";
		};
		return FakeBlobBuilder;
	}(view));

	return function Blob(blobParts, options) {
		var type = options ? (options.type || "") : "";
		var builder = new BlobBuilder();
		if (blobParts) {
			for (var i = 0, len = blobParts.length; i < len; i++) {
				builder.append(blobParts[i]);
			}
		}
		return builder.getBlob(type);
	};
}(typeof self !== "undefined" && self || typeof window !== "undefined" && window || this.content || this));

(function(UI){





UI.draggable = function(elem, verb, attrs){
	if (verb == 'set'){
		elem.touchstart = function(e){
			var event = e.touches[0];
			event.preventDefault = function(){e.preventDefault()}
			UI.draggable.mousedown(elem,attrs,event)
		};
		elem.onmousedown = function(e){UI.draggable.mousedown(elem,attrs,e)};
		elem.addEventListener('touchstart',elem.touchstart);
		elem.setAttribute('draggable','false'); // so we don't get drag and drop.
	} 
	if (verb == "unset" || verb == "remove" || verb == "none"){
		elem.onmousedown = null;
		if (elem.touchstart ){
			elem.removeEventListener('touchstart',elem.touchstart);
		}
		elem.setAttribute('draggable','auto'); 
	}
}
UI.draggable.mousedown = function(elem,attrs, e){
	elem.draggableOffsetX = e.clientX - elem.offsetLeft;
	elem.draggableOffsetY = e.clientY - elem.offsetTop;
	//console.log(e);
	//console.log('starting drag');
	//console.log(elem.offsetLeft);
	//console.log(elem.offsetTop);
	var old = {};
	if (attrs && attrs.cancel && lib.matches(e.target,attrs.cancel)){
		return;
	}
	e.preventDefault();
	old.mov = window.onmousemove;
	old.up = window.onmouseup;
	window.onmousemove = function(e2){UI.draggable.mousemove(elem,e2)};
	var touchmove = function(e2){UI.draggable.mousemove(elem,e2.touches[0])}
	window.addEventListener('touchmove',touchmove );
	window.onmouseup = function(){
		window.removeEventListener('touchmove',touchmove);
		window.removeEventListener('touchend',window.onmouseup);
		window.onmousemove = old.mov; window.onmouseup = old.up;
		elem.draggableOffsetX = undefined; 
		elem.draggableOffsetY = undefined; 
		elem.ontransformed({target: elem});
	}
	window.addEventListener('touchend',window.onmouseup);
	//console.log(elem.draggableOffsetX +":"+ elem.draggableOffsetY);
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

/*! FileSaver.js
 *  A saveAs() FileSaver implementation.
 *  2014-01-24
 *
 *  By Eli Grey, http://eligrey.com
 *  License: X11/MIT
 *    See LICENSE.md
 */

/*global self */
/*jslint bitwise: true, indent: 4, laxbreak: true, laxcomma: true, smarttabs: true, plusplus: true */

/*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */

var saveAs = saveAs
  // IE 10+ (native saveAs)
  || (navigator.msSaveOrOpenBlob && navigator.msSaveOrOpenBlob.bind(navigator))
  // Everyone else
  || (function(view) {
	"use strict";
	// IE <10 is explicitly unsupported
	if (/MSIE [1-9]\./.test(navigator.userAgent)) {
		return;
	}
	var
		  doc = view.document
		  // only get URL when necessary in case BlobBuilder.js hasn't overridden it yet
		, get_URL = function() {
			return view.URL || view.webkitURL || view;
		}
		, URL = view.URL || view.webkitURL || view
		, save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a")
		, can_use_save_link = !view.externalHost && "download" in save_link
		, click = function(node) {
			var event = doc.createEvent("MouseEvents");
			event.initMouseEvent(
				"click", true, false, view, 0, 0, 0, 0, 0
				, false, false, false, false, 0, null
			);
			node.dispatchEvent(event);
		}
		, webkit_req_fs = view.webkitRequestFileSystem
		, req_fs = view.requestFileSystem || webkit_req_fs || view.mozRequestFileSystem
		, throw_outside = function(ex) {
			(view.setImmediate || view.setTimeout)(function() {
				throw ex;
			}, 0);
		}
		, force_saveable_type = "application/octet-stream"
		, fs_min_size = 0
		, deletion_queue = []
		, process_deletion_queue = function() {
			var i = deletion_queue.length;
			while (i--) {
				var file = deletion_queue[i];
				if (typeof file === "string") { // file is an object URL
					URL.revokeObjectURL(file);
				} else { // file is a File
					file.remove();
				}
			}
			deletion_queue.length = 0; // clear queue
		}
		, dispatch = function(filesaver, event_types, event) {
			event_types = [].concat(event_types);
			var i = event_types.length;
			while (i--) {
				var listener = filesaver["on" + event_types[i]];
				if (typeof listener === "function") {
					try {
						listener.call(filesaver, event || filesaver);
					} catch (ex) {
						throw_outside(ex);
					}
				}
			}
		}
		, FileSaver = function(blob, name) {
			// First try a.download, then web filesystem, then object URLs
			var
				  filesaver = this
				, type = blob.type
				, blob_changed = false
				, object_url
				, target_view
				, get_object_url = function() {
					var object_url = get_URL().createObjectURL(blob);
					deletion_queue.push(object_url);
					return object_url;
				}
				, dispatch_all = function() {
					dispatch(filesaver, "writestart progress write writeend".split(" "));
				}
				// on any filesys errors revert to saving with object URLs
				, fs_error = function() {
					// don't create more object URLs than needed
					if (blob_changed || !object_url) {
						object_url = get_object_url(blob);
					}
					if (target_view) {
						target_view.location.href = object_url;
					} else {
						window.open(object_url, "_blank");
					}
					filesaver.readyState = filesaver.DONE;
					dispatch_all();
				}
				, abortable = function(func) {
					return function() {
						if (filesaver.readyState !== filesaver.DONE) {
							return func.apply(this, arguments);
						}
					};
				}
				, create_if_not_found = {create: true, exclusive: false}
				, slice
			;
			filesaver.readyState = filesaver.INIT;
			if (!name) {
				name = "download";
			}
			if (can_use_save_link) {
				object_url = get_object_url(blob);
				// FF for Android has a nasty garbage collection mechanism
				// that turns all objects that are not pure javascript into 'deadObject'
				// this means `doc` and `save_link` are unusable and need to be recreated
				// `view` is usable though:
				doc = view.document;
				save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a");
				save_link.href = object_url;
				save_link.download = name;
				var event = doc.createEvent("MouseEvents");
				event.initMouseEvent(
					"click", true, false, view, 0, 0, 0, 0, 0
					, false, false, false, false, 0, null
				);
				save_link.dispatchEvent(event);
				filesaver.readyState = filesaver.DONE;
				dispatch_all();
				return;
			}
			// Object and web filesystem URLs have a problem saving in Google Chrome when
			// viewed in a tab, so I force save with application/octet-stream
			// http://code.google.com/p/chromium/issues/detail?id=91158
			if (view.chrome && type && type !== force_saveable_type) {
				slice = blob.slice || blob.webkitSlice;
				blob = slice.call(blob, 0, blob.size, force_saveable_type);
				blob_changed = true;
			}
			// Since I can't be sure that the guessed media type will trigger a download
			// in WebKit, I append .download to the filename.
			// https://bugs.webkit.org/show_bug.cgi?id=65440
			if (webkit_req_fs && name !== "download") {
				name += ".download";
			}
			if (type === force_saveable_type || webkit_req_fs) {
				target_view = view;
			}
			if (!req_fs) {
				fs_error();
				return;
			}
			fs_min_size += blob.size;
			req_fs(view.TEMPORARY, fs_min_size, abortable(function(fs) {
				fs.root.getDirectory("saved", create_if_not_found, abortable(function(dir) {
					var save = function() {
						dir.getFile(name, create_if_not_found, abortable(function(file) {
							file.createWriter(abortable(function(writer) {
								writer.onwriteend = function(event) {
									target_view.location.href = file.toURL();
									deletion_queue.push(file);
									filesaver.readyState = filesaver.DONE;
									dispatch(filesaver, "writeend", event);
								};
								writer.onerror = function() {
									var error = writer.error;
									if (error.code !== error.ABORT_ERR) {
										fs_error();
									}
								};
								"writestart progress write abort".split(" ").forEach(function(event) {
									writer["on" + event] = filesaver["on" + event];
								});
								writer.write(blob);
								filesaver.abort = function() {
									writer.abort();
									filesaver.readyState = filesaver.DONE;
								};
								filesaver.readyState = filesaver.WRITING;
							}), fs_error);
						}), fs_error);
					};
					dir.getFile(name, {create: false}, abortable(function(file) {
						// delete file if it already exists
						file.remove();
						save();
					}), abortable(function(ex) {
						if (ex.code === ex.NOT_FOUND_ERR) {
							save();
						} else {
							fs_error();
						}
					}));
				}), fs_error);
			}), fs_error);
		}
		, FS_proto = FileSaver.prototype
		, saveAs = function(blob, name) {
			return new FileSaver(blob, name);
		}
	;
	FS_proto.abort = function() {
		var filesaver = this;
		filesaver.readyState = filesaver.DONE;
		dispatch(filesaver, "abort");
	};
	FS_proto.readyState = FS_proto.INIT = 0;
	FS_proto.WRITING = 1;
	FS_proto.DONE = 2;

	FS_proto.error =
	FS_proto.onwritestart =
	FS_proto.onprogress =
	FS_proto.onwrite =
	FS_proto.onabort =
	FS_proto.onerror =
	FS_proto.onwriteend =
		null;

	view.addEventListener("unload", process_deletion_queue, false);
	return saveAs;
}(
	   typeof self !== "undefined" && self
	|| typeof window !== "undefined" && window
	|| this.content
));
// `self` is undefined in Firefox for Android content script context
// while `this` is nsIContentFrameMessageManager
// with an attribute `content` that corresponds to the window

if (typeof module !== "undefined") module.exports = saveAs;

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


(function(UI){


UI.resizeable = function(element, verb, attrs){
	if (element == undefined) return;
	/** some code to check for IE **/
	
	/** else **/
	if (verb == "set" || verb == "both"){
//		if (window.getComputedStyle(element,null).getPropertyValue('overflow') == "")
//			element.style.overflow = "auto";
	
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
		element.resizeHandle.addEventListener('touchstart',function(e){
			e.preventDefault();
			console.log(e)
			e.cancelBubble = true;
			UI.resizeable.mousedown(element,e.touches[0])
		});
			
	}

	if (verb == "remove" || verb == "unset" || verb == "none"){
		element.style.resize = 'none';
		if (element.resizeHandle && element.resizeHandle.parentNode == element){
			element.removeChild(element.resizeHandle);
		}
	}
}

UI.resizeable.mousedown = function(elem, e){
	elem.resizeableOffsetX = e.clientX;
	elem.resizeableOffsetY = e.clientY;
	elem.resizeableWidth = elem.offsetWidth;
	elem.resizeableHeight = elem.offsetHeight;
	elem.setAttribute('draggable','false'); // so we don't get drag and drop.
	console.log(e);
	console.log('starting resize');
	var old = {};
	old.mov = window.onmousemove;
	old.up = window.onmouseup;
	var touchmove = function(e2){UI.resizeable.mousemove(elem,e2.touches[0])};
	window.onmousemove = function(e2){UI.resizeable.mousemove(elem,e2)};
	window.addEventListener('touchmove',touchmove);
	window.onmouseup = function(){
		console.log('end resize');
		window.removeEventListener('touchmove',touchmove);
		window.removeEventListener('touchend',window.onmouseup);
		window.onmousemove = old.mov; window.onmouseup = old.up;
		elem.resizeableOffsetX = undefined; 
		elem.resizeableOffsetY = undefined; 
		elem.resizeableWidth = undefined; 
		elem.resizeableHeight = undefined; 
		elem.setAttribute('draggable','auto');
		elem.ontransformed({target:elem});
	}
	window.addEventListener('touchend',window.onmouseup);
	console.log(elem.draggableOffsetX +":"+ elem.draggableOffsetY);
}

UI.resizeable.mousemove = function(elem, e){
	elem.style.width = (e.clientX - elem.resizeableOffsetX + elem.resizeableWidth) + "px";
	elem.style.height = (e.clientY - elem.resizeableOffsetY + elem.resizeableHeight) + "px";
}

}(window.UI = window.UI || function(){}));

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
			if (setCurrent == undefined) setCurrent= true;
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

(function(UI){

UI.hide = function(el){
	el.style.visibility = "hidden";
}

UI.show = function(el){
	el.style.visibility = "visible";
}


}(window.UI = window.UI || function(){}))

var RFS = function (el){
	return el.requestFullScreen || el.webkitRequestFullScreen || el.msRequestFullScreen || el.mozRequestFullScreen || null;
}

var getRFSN = function(){
	var f = RFS(document.body);
	if ( f == null){
		console.log('does not support full screen');
		return 'focus' // harmless ubiquitous function;
	}

	return RFS(document.body).name;
}

window.getRFS = getRFSN;

////////////////////////////////////////////////////////////////////////
(function() {
	var
		fullScreenApi = {
			supportsFullScreen: false,
			isFullScreen: function() { return false; },
			requestFullScreen: function() {},
			cancelFullScreen: function() {},
			fullScreenEventName: '',
			prefix: ''
		},
		browserPrefixes = 'webkit moz o ms khtml'.split(' ');

	// check for native support
	if (typeof document.cancelFullScreen != 'undefined') {
		fullScreenApi.supportsFullScreen = true;
	} else {
		// check for fullscreen support by vendor prefix
		for (var i = 0, il = browserPrefixes.length; i < il; i++ ) {
			fullScreenApi.prefix = browserPrefixes[i];

			if (typeof document[fullScreenApi.prefix + 'CancelFullScreen' ] != 'undefined' ) {
				fullScreenApi.supportsFullScreen = true;

				break;
			}
		}
	}

	// update methods to do something useful
	if (fullScreenApi.supportsFullScreen) {
		fullScreenApi.fullScreenEventName = fullScreenApi.prefix + 'fullscreenchange';

		fullScreenApi.isFullScreen = function() {
			switch (this.prefix) {
				case '':
					return document.fullScreen;
				case 'webkit':
					return document.webkitIsFullScreen;
				default:
					return document[this.prefix + 'FullScreen'];
			}
		}
		fullScreenApi.requestFullScreen = function(el) {
			return (this.prefix === '') ? el.requestFullScreen() : el[this.prefix + 'RequestFullScreen']();
		}
		fullScreenApi.cancelFullScreen = function(el) {
			return (this.prefix === '') ? document.cancelFullScreen() : document[this.prefix + 'CancelFullScreen']();
		}
	}

	// export api
	window.fullScreenApi = fullScreenApi;
})();
/////////////////////////////////////////////////////////////////////////

var winW=0;
var winH=0;
var emSize = 0;
var count=0;
var touchStartX = 0;
var touchStartY = 0;
var subElemCount=0;
var level=0;
var remote=false;
var edit = true;
var active=null;
var background=null;
var slide_background = "";
var Remote_last="";
var ID_CT =0;
var slideshow = null;
var slide = null;
var savedHTML=null;
var current=null;//new Array();
var lastSlideHash = "";
//var aspect = 4/3 // 4:3
var aspect = 16/9;
var lastClick = {};
var files = {};

function updateAspect(sel){
	aspect = sel.options[sel.selectedIndex].value;
	resize();
}

/*function set_slide_background(){
	active.style.backgroundImage="url("+URL.createObjectURL(files["slide_BG"]) +")";
	slide.setBackground(files["slide_BG"], files['slide_BG'].name);
	document.getElementById('file').removeEventListener('change',handleBackgroundSelect,false);
}*/

/**
 *set editing borders based on boolean
 */
function borders(display){
	if (display){
		//lib.selID('slide_screen').style.border = '2px solid gray';
		//lib.foreach(lib.selClass('slide'), function(el){el.style.border = "2px dashed white"});
		//lib.foreach(lib.selClass('handle'), function(el){el.style.backgroundColor = 'rgba(0,0,0,.5)'});
		//lib.foreach(lib.selClass('text_area'), function(el){
		//	el.style.border = '2px dashed white';
		//	el.style.boxShadow = " 0 0 0.2em black, 0 0 0.2em black,0 0 0.2em gray"
		//});
//		$('.slide_text h2').css('border','2px dashed black');
//		$('.handle').css('background-color','rgba(0,0,0,.5)');
//		$('.text_area').css('border','2px dashed white');
//		$('.text_area').css('box-shadow', ' 0 0 0.2em black, 0 0 0.2em black,0 0 0.2em gray');
	} else {
		//lib.selID('slide_screen').style.border = 'none';
		//lib.foreach(lib.selClass('slide'), function(el){el.style.border = "none"});
//		lib.foreach(lib.selClass('handle'), function(el){el.style.backgroundColor = ''});
		//lib.foreach(lib.selClass('text_area'), function(el){
		//	el.style.border = 'none';
		//	el.style.boxShadow = 'none';
		//});
//		$('#slide_screen').css('border','none');
//		$('.slide').css('border','none');
//		$('.slide_text h2').css('border','none');
//		$('.handle').css('background-color','');
//		$('.text_area').css('border','none');
//		$('.text_area').css('border-shaddow','');
	}
}

/**
 * change from edit mode to display mode.
 */
function view(preview){
	var p = preview || false;
	lib.foreach(lib.sel('#toolbar,#container, #slide_main,#slidespreview'),function(el){
		if (el.dataset)
			el.dataset.edit=false
		else
			el.setAttribute('data-edit',"false");
	})
	borders(false);
	lib.foreach(active.children,function(child,i){
		UI.resizeable(child,'remove');
		UI.draggable(child,'remove');
		var ce = child.querySelector(".content-editable");
			if(!!ce){
				ce.setAttribute('contenteditable',false);
				ce.spellcheck = false;
			}
	});
	if (!p){
		active.removeEventListener('contextmenu',addItemMenu);
		slideshow.start(active);
		navigation(true);// add navigation listeners
		edit = false;
		resize();
	}
}

function preview(){
	document.body[window.getRFS()]();
	document.body.addEventListener('webkitfullscreenchange',UI.events.fsChange);
	document.body.addEventListener('mozfullscreenchange',UI.events.fsChange);
	document.body.addEventListener('fullscreenchange',UI.events.fsChange);
	location.hash = '/edit';
	location.hash = '/view';
}

function boxDrag(event, ui){
	var t = event.target;
	t.top = (event.target.offsetTop - ( winH/2 )) / winH ;
	t.left = (event.target.offsetLeft - (winW/2))/ winW;
	t.height = (event.target.clientHeight/winH);
	t.width = (event.target.clientWidth/winW);
	var event = new CustomEvent("updated",{canBubble:true})
	t.dispatchEvent(event);
	
}

function setEdit(preview){
	var p = preview || false;
	lib.foreach(lib.sel('#toolbar,#container, #slide_main,#slides_preview'),function(el){
		if (el.dataset)
			el.dataset.edit=true
		else 
			el.setAttribute('data-edit','true');
	})
	borders(true);
	lib.foreach(active.children,function(child,i){
		UI.resizeable(child,'set');
		UI.draggable(child,'set',{cancel: '[contenteditable="true"]'});
		var ce = child.querySelector(".content-editable");
			if(!!ce){
				ce.setAttribute('contenteditable',true);
				ce.spellcheck = false;
			}
		child.ontransformed = boxDrag;
	})
	if (!p){
		active.addEventListener('contextmenu',addItemMenu);
		navigation(false); // add navigation listeners
        	edit = true;
	        resize();
	}

}

function addItemMenu(e){

	if (e.target == active ){
		remove_menu();
		console.log(e);
		lastClick.x = e.offsetX;
		lastClick.y = e.offsetY;
		console.log(lastClick);
		var menu = document.createElement('div');
		menu.setAttribute('class','menu');
			var li = document.createElement("li");
				li.setAttribute('onclick','Add_elem("text_area")');
				li.innerHTML = "Text Area";
			menu.appendChild(li);
			li = document.createElement('li');
				li.setAttribute('onclick','Add_elem("image")');
				li.innerHTML = "Image";
			menu.appendChild(li);
			li = document.createElement("li");
				li.setAttribute('onclick','Add_elem("video")');
				li.innerHTML = "video";
			menu.appendChild(li);
			e.target.appendChild(menu);
		menu.style.position = "absolute";
		menu.style.top = lastClick.y+ "px";
		menu.style.left = lastClick.x + "px";
		e.preventDefault();
		e.returnValue = false;
		active.addEventListener('click',remove_menu);
	} 
	/*else 	if (e.target == active){
		var x = e.offsetX;
		var y = e.offsetY;
		var elem = Add_elem('text_area');
		elem.style.position = "absolute";
		elem.style.top = y + 'px';
		elem.style.left = x + 'px';
	}*/
}

function remove_menu(){
	var menu = document.getElementsByClassName('menu');
	if (menu.length > 0){
		for (i = 0; i < menu.length; i ++){
			active.removeChild(menu[i]);
		}
	}
	active.removeEventListener('click',remove_menu);
}

function route(){
	if (window.location.hash == "#!"){
		window.location.hash = lastSlideHash;
	}
	if (window.location.hash.match(/#\/edit/)){
		lastSlideHash = window.location.hash;
		setEdit();
	}
	if (window.location.hash.match(/#\/view/)){
		lastSlideHash = window.location.hash;
		view();
	}
}

function getDefaultFontSize(parentElement)
{
    parentElement = parentElement || document.body;
    var div = document.createElement('div');
    div.style.width = "1000em";
    parentElement.appendChild(div);
    var pixels = div.offsetWidth / 1000;
    parentElement.removeChild(div);
    return pixels;
}

function initialize(){
	
	slideshow = new SlideShow();
	active = document.getElementById("slide_main");
	//UI.touch(active);
	newSlide();
	emSize = getDefaultFontSize(active);
	resize();

	window.onresize=resize;
	if (edit== null || edit == true){
		setEdit();
		window.location.hash = "#/edit";
		// placeholder for adding borders, and toolbar
		active.addEventListener('contextmenu',addItemMenu);
	} else {
		view();
		window.location.hash = "#/view";
	}
	window.onhashchange = route;
}

function first(){
	count = 0;
	subElemCount = 0;
	attatch_listeners();
	current = slides[count];
	hide();
	load();
	if (window.fullScreenApi.supportsFullScreen) {
	//	window.fullScreenApi.requestFullScreen(document.body);
		 
	}
}

function save_elem(){
/*   if (localStorage){
   	localStorage.slide_background = slide_background;
 	localStorage.savedHTML = active.innerHTML;
	localStorage.ID_CT = ID_CT;
   }*/
	var ud = document.createElement('script');
	//ud.innerHTML += "savedHTML = '" + escape(active.innerHTML) + "';\n";
	//ud.innerHTML +=  "slide_background = '"+slide_background+"';\n";
	//ud.innerHTML += "ID_CT = "+ID_CT+';\n';
	ud.innerHTML += "edit = false;";
	document.head.appendChild(ud);
	//view();
	saveAs( slideshow.save()
    		, "slideshow.shw"
	);
	//window.location = "data:text/html,"+ encodeURIComponent (document.getElementsByTagName('html')[0].outerHTML );


}

function load_from_store(){
   if (localStorage){
	slide_background = localStorage.slide_background;
	set_slide_background();
	active.innerHTML = localStorage.savedHTML;
	ID_CT = localStorage.ID_CT;
	if (edit){
		setEdit();
	}
    }
}

function changeBG(){
	var bgChooser = new Preview(
		{
			type: 'image',
			title : "Please choose a Background Image",
		});
	bgChooser.onselected = function(file){ 
		if (file == undefined)
			return false;
		console.log(file);
		active.style.backgroundImage="url("+URL.createObjectURL(file) +")";
        	slideshow.currentSlide.setBackground(file,file.name); 
		var event = new CustomEvent("updated")
		active.dispatchEvent(event);
		return true;
	};
	bgChooser.show();		
}

/*function handleBackgroundSelect(evt){
	var file = evt.target.files[0];
	files["slide_BG"]=file;
	$('#modal-upload-img').attr('src', URL.createObjectURL(file));	
	set_slide_background();
/*	if (file.type.match('image.*')){
		console.log(file.type);
		var reader = new FileReader();
		reader.onload = (function(theFile){
			return function(e) {
				console.log(e);
				slide_background = e.target.result;
				$('#modal-upload-img').attr('src', e.target.result);
				set_slide_background();
				console.log("background changed");
			}
		})(file);
		reader.readAsBinary(file);
	}*/
//}



function Add_elem(type){
	slide = slideshow.currentSlide;
	if (type == "text_area"){
		ID_CT = slide.nextID();
		var textArea = document.createElement('div');
			//textArea.setAttribute('id','outer' + ID_CT);
			textArea.setAttribute('class','text_area');
		var handle = document.createElement('div');
			handle.setAttribute('class','handle');
			textArea.appendChild(handle);
		var text = document.createElement('div');
			//text.setAttribute('id',ID_CT);
			text.className = "slide_text content-editable";
			text.setAttribute('contenteditable',true);
			text.innerHTML = "";
			textArea.appendChild(text);
		active.appendChild(textArea);
		console.log(lastClick);
		textArea.style.top = (lastClick.y || 10 )+ 'px';
		textArea.style.left = (lastClick.x || 10)+ 'px';
		UI.resizeable(textArea,'set');
		UI.draggable(textArea,'set',{cancel: '[contenteditable="true"]'});
		textArea.ontransformed = boxDrag;
		boxDrag({target:textArea}); // save dimentions.
		slide.add(textArea,'text',[]);
		borders(true);
		//var event = new CustomEvent("updated",{canBubble:true});
		//textArea.dispatchEvent(event);
	return textArea;
	} else if (type == "image"){
		ID_CT = slide.nextID();
		var body = document.createElement('div');
			//textArea.setAttribute('id','outer' + ID_CT);
			body.setAttribute('class','text_area slide-element-body');
		var handle = lib.newEL('div',{className:'handle'});
			body.appendChild(handle);
		var img = document.createElement('div');
				img.setAttribute('class','slide_text slide_img');
				body.appendChild(img);
		body.ontransformed = boxDrag;

		body.style.top = (lastClick.y||10) + 'px';
		body.style.left =(lastClick.x||10) + 'px';
		var image_preview = new Preview({type:'image'});
		image_preview.onselected = function(file){
			img.style.backgroundImage = 'url(' + URL.createObjectURL(file) + ')';
			body.links = [];
			body.links.push("img.style.backgroundImage",file.name);
			var rl = {'resource' : file,
				  'link' : {
					'type': 'css',
					'id'  : 'childNodes.1.style.backgroundImage'
					}
				};

			slide.add(body,'image',[rl]);
			active.appendChild(body);
			UI.resizeable(body,'set');
			UI.draggable(body,'set');
			boxDrag({target:body}); // save dimentions.
			borders(true);
		}
		image_preview.show();
		return textArea;
	} else if (type == "video"){
		ID_CT ++;
		var textArea = document.createElement('div');
			//textArea.setAttribute('id','outer' + ID_CT);
			textArea.setAttribute('class','text_area');
		var handle = document.createElement('div');
			handle.setAttribute('class','handle');
			textArea.appendChild(handle);
		var img = document.createElement('video');
				//img.setAttribute('id',ID_CT);
				img.setAttribute('class','slide_text slide_img');
				img.setAttribute('controls',true);
				textArea.appendChild(img);
	
		textArea.style.top = (lastClick.y||10) + 'px';
		textArea.style.left = (lastClick.x||10) + 'px';
		var image_preview = new Preview({type:'video'});
		image_preview.onselected = function(file){
			img.src = URL.createObjectURL(file)  ;
			var rl = {'resource' : file,
				  'link' : {
					'type': 'url',
					'id'  : 'childNodes.1.src'
					}
				};

			slideshow.currentSlide.add(textArea,'image',[rl]);
			active.appendChild(textArea);
			UI.resizeable(textArea,'set');
			UI.draggable(textArea,'set');
			boxDrag({target:textArea});
			borders(true);
		}
		image_preview.show();
		return textArea;
	}
	return null;
}

/*function UI_modal_file(caption){
	var modal = UI_modal();
	var fileUpload = document.createElement('input');
	fileUpload.setAttribute("type","file");
	fileUpload.setAttribute("id","file");
	fileUpload.setAttribute("name","file");
	modal.header.innerHTML = caption;
	modal.content.appendChild(fileUpload);
	
}*/

function load_slideshow(){
        var s = document.getElementById('slide_main');
	s.innerHTML = "";
	slideshow.load(document.getElementById('loadNEW').files[0], function(){
		slide = slideshow.slides[0];
		ID_CT = slide.ID_CT;
		slideshow.render(0,active,true);
	/*	var p = lib.selID('slides_preview');
		lib.foreach(lib.sel('.slide.thumb'),function(el){
			p.removeChild(el);
		});
		lib.foreach(slideshow.slides, function(el){
			addSlidePreview(el,false);	
		});*/
		previewRender();
		setEdit();
	});
		
}

function Remote_Slide(){
	remote=true;
	$.get("../get?id="+ID, function(data){
		console.log(data!=Remote_last);
		if (data!=Remote_last){
			Remote_last = data;
			//<!--='<script>'+data+'</script>';-->
			$('body').append(script);
			console.log("updated");
		}
		setTimeout(Remote_Slide,700);
	});
}

function jump_to(slide,sub){
	count = slide;
	current = slides[count];
	hide();
	load();
	if (sub){
		for(subElemCount=0;subElemCount < sub; subElemCount++){
			current = slides[count].subElem[subElemCount];
			load();
		}
	}
}

function back(){
	slideshow.back(active);
	/*if (subElemCount){
		hide();
		jump_to(count, --subElemCount);
		subElemCount;
	} else if(count>0){
		count--;
		current = slides[count];
		if(current.subElem){
			jump_to(count,current.subElem.length);
		} else {
			hide();
			load();
		}
	}*/
}
UI.events = {};
UI.events.keyboard = function(e){
		console.log('keypress');
		console.log(e.keyCode);
		if(e.keyCode==39 ){ //right
			next();
		} else if (e.keyCode == 37){ //left
			back();
		}
};

UI.events.mouse = function(e){
	if (e.button == 0){
		if (e.clientX > (active.clientWidth/2)) {next();}
		else {back()}
	}
};

UI.events.fsChange = function(e){
	console.log(e);
	var fs = document.webkitFullscreenElement 
		|| document.mozFullscreenElement 
		|| document.msFullscreenElement 
		|| document.fullscreenElement;
	console.log("fullScreenChange");
	console.log(fs);
	if(!fs){
			location.hash = "/edit";
	}
}

function navigation(add){
	if (add){
		window.addEventListener("keydown",UI.events.keyboard);
		active.addEventListener("swipeleft", next);
		active.addEventListener("swiperight", back);
//		active.addEventListener("touchstart",UI.events.touchstart)
//		active.addEventListener("touchmove",UI.events.touchmove)
//		active.addEventListener("touchend" ,UI.events.touchend);
//		active.addEventListener("touchcancel",UI.events.touchcancel);
		active.addEventListener("mouseup",UI.events.mouse);
	} else {
		window.removeEventListener("keydown",UI.events.keyboard);
		active.removeEventListener("swipeleft", next);
		active.removeEventListener("swiperight", back);
//		active.removeEventListener("touchstart",UI.events.touchstart)
//		active.removeEventListener("touchmove",UI.events.touchmove)
//		active.removeEventListener("touchend" ,UI.events.touchend);
//		active.removeEventListener("touchcancel",UI.events.touchcancel);
		active.removeEventListener("mouseup",UI.events.mouse);
	}	
}	

function next(){
	slideshow.next(active);
	/*if ( count >= 0 && slides[count].subElem && subElemCount >= 0)
	{
		current = slides[count].subElem[subElemCount];
		subElemCount++;
		load();
		if (subElemCount == slides[count].subElem.length  )
		{
			subElemCount = -1;					//make sure we go back to 0 for the next one.
		}
	} else {
		if (subElemCount == -1){
			subElemCount = 0;
		}
		if (count >= 0){
			hide();
		}
		count ++;
		current = slides[count];
		if (count < slides.length)
		{
			load();
		} else {
			document.getElementById("slide_content").innerHTML = "<button style='font-size:1em;position:relative;height:10%; width: 16%; top:45%;left:42%' onclick='first();'>Replay</button>";

			if(ID){
				jQuery.ajax({
					type: 'GET',
					url : "../put?id="+ID+"&ended=1",
					success : function () {console.log("updated");}

				});
			}
			if(window.fullScreenApi.isFullScreen){
				//window.fullScreenApi.cancelFullScreen(document.body);
			}
		}
	}

	console.log("SubElemcount = " + subElemCount);
	*/
}

function hide(){
	document.getElementById("slide_head").innerHTML="";
	document.getElementById("slide_content").innerHTML="";
}

function load(){ //load element in current;
	console.log("load(): count ="+count);
	if(ID && !remote){
		jQuery.ajax({
			type: 'GET',
			url : "../put?id="+ID+"&slide="+count+"&sub="+subElemCount,
			success : function () {console.log("updated");}

		});
	}
	var tag = "", tagEnd = "";
	if (current.head){
		document.getElementById("slide_head").innerHTML += current.head;
	};
    if (current.type){
		tag = "<"+current.type+">";
		tagEnd = "</"+current.type+">";
	};
	if (current.content){
		document.getElementById("slide_content").innerHTML+=tag+current.content+tagEnd;
	};
};



function newSlide(){
	var s = new Slide();
	slide = slideshow.addSlide(s);
	slideshow.currentSlide = slide;
	slide.render(active,true);
	addSlidePreview(slide);
}

function addSlidePreview(s, preview){
        var preview = lib.selID('slides_preview');
	var sp = lib.newEL('div',{className: 'slide thumb'});
	sp.addEventListener('click', function(){
		slideshow.render(s.id,active,true);
		setEdit();
		previewRender(s.id)
	});
	active.addEventListener('keyup',function(e){
		var event = new CustomEvent('updated');
		e.target.parentNode.dispatchEvent(event);
	});
	active.addEventListener('updated',function(e){
		console.log('updated ' + s.id);
		if (slideshow.currentSlide.id == s.id){ // i am active
			var target = e.srcElement || e.target;
			// update slide;
			if (sp.style.backgroundImage != active.style.backgroundImage){
				sp.style.backgroundImage = active.style.backgroundImage;
			}
			console.log(e);
			console.log(sp.children.length);
			console.log(active.children.length);
			if (active.children.length > sp.children.length){ // created
				var newEL = target.cloneNode(true);
				newEL.top    = target.top;
				newEL.left   = target.left;
				newEL.width  = target.width;
				newEL.height = target.height;
				target.index = sp.children.length; 
				sp.appendChild(newEL);
			} else { // update
				var newEL = target.cloneNode(true);
				newEL.top    = target.top;
				newEL.left   = target.left;
				newEL.width  = target.width;
				newEL.height = target.height;
				var idx = target.index ; //|| 0; // fail silently
				sp.removeChild(sp.children[idx]);
				sp.insertBefore(newEL, sp.children[idx]);
			}
			slideResize(sp);
		}
		
	}, true);
	var length = preview.children.length;
	preview.insertBefore(sp,preview.lastChild);
	if (preview = preview || true){
		previewRender();
	}
}

function previewRender(id){
	var collection = lib.selID('slides_preview').children;
		console.log(slideshow.currentSlide.id);
	for ( var i = 0; i < collection.length; i++){
		var el = collection[i];
		console.log('preview #'+i+", slide #"+slideshow.currentSlide.id);
		if (slideshow.currentSlide.id == i){
			console.log(el.overlay);
			/*if (el.overlay && el.overlay.parentNode == el){
				el.overlay.style.background = 'rgba(0,0,0,.5)';
				el.overlay.style.backgroundImage = "-moz-element(#slide_main)";
			} else {
				el.overlay = lib.newEL('div',{className:'thumb overlay'});
				el.overlay.style.background = 'rgba(0,0,0,.5)';
				el.overlay.style.backgroundImage = "-moz-element(#slide_main)";
				el.overlay.style.backgroundSize = "cover";
				el.appendChild(el.overlay);
			}*/
			el.style.borderColor="white";
		} else if (slideshow.slides.length > i){
			/*if (el.overlay && el.overlay.parentNode == el){
				el.removeChild(el.overlay);
				el.overlay = undefined;
			}*/
			el.style.borderColor="";
			if (el == el.parentNode.lastChild){ // don't override the new slide button
				addSlidePreview({id: i},false);
				el = collection[i];
			}
			//el.style.cssText = null;
			slideshow.render(i,el, false);
			lib.foreach(el.children,function(elem){
				UI.draggable(elem,'remove');
				UI.resizeable(elem,'remove');
			});
		}
	}
	lib.foreach(lib.sel('.slide.thumb'),function(el){slideResize(el)})
}

function resize( event )
{	
	if ( event != null && event.target != window){
		// this is probably a text box resize
	//	boxDrag(event,null);
		 return true;
	}
	winW = 630, winH = 460;
	var slideH = winH, slideW = winW;
	var background = lib.selID('slide_screen');
	//var background = $("#slide_screen");
	if (background.clientHeight && background.clientWidth){
		winW = background.clientWidth;
		winH = background.clientHeight;
	}

	if (winH * aspect < winW){ //put plack bars on sides
		slideW = winH*aspect;
		slideH = winH;
		active.style.width = slideW + "px";
		active.style.left = ((winW-slideW) / 2) + "px";
	} else{
		slideH = winW/aspect;
		slideW = winW;
		active.style.height = slideH + "px";
		active.style.top = ( (winH-slideH)/2) + "px";
	}
	active.style.width = slideW + "px";
	active.style.left = ((winW-slideW) / 2) + "px";
	active.style.height = slideH + "px";
	active.style.top = ( (winH-slideH)/2) + "px";
	//var margins = ".03";//document.getElementByTag('slide_text')[0].style.margin;
	//var textHeight = (slideW)/1024 * 30 + "px";
	var textWidth = 2 * (slideW/1024)  + 'em';
	active.style.fontSize=textWidth;
	winW = slideW;
	winH = slideH;
	var floats = document.getElementsByClassName('text_area');
	for (i = 0; i < floats.length; i++){
		if (floats[i].top ==null || floats[i].left == null) boxDrag({target: floats[i]},null);		
		floats[i].style.top =  (floats[i].top  * slideH ) + slideH/2 + 'px';
		floats[i].style.left = (floats[i].left * slideW ) + slideW/2 + 'px'; 
		floats[i].style.height = floats[i].height * slideH + 'px';
		floats[i].style.width = floats[i].width * slideW + 'px';
	}
	
}

function slideResize(s){

	var width = s.clientWidth;
	var height = width/aspect;
	s.style.height = height + "px";
	var textWidth = 2 * (width / 1024) + 'em';
	s.style.fontSize = textWidth;
	lib.foreach(s.querySelectorAll('.text_area'),function(el){
		el.style.top= (el.top* height) + height/2 + 'px';
		el.style.left = (el.left * width) + width/2 + 'px';
		el.style.height = el.height * height + 'px';
		el.style.width = el.width * width + 'px';
		console.log(el);
	});
}

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
