(function(Archive){
/*	Archive = function(blob){

		this.resources = false;
		this.header = { files: {} };
		if (blob != undefined){
			this.load(blob);
		}
	}*/



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
	      // todo doesn't handle colissions.
	      self.header.files[identifier] = entry;
	      return self.resources.slice(entry.start, entry.start + entry.length);
      },

get : function(name){
	      var self = this;
	      if (name in self.header.files){
		      var f = self.header.files[name];
		      console.log(name + ":" + f.type);
		      return this.resources.slice(f.start,f.start + f.length,f.type);
	      }
      },

list : function(){
	       var n = [];
	       for (name in this.header.files){
		       n.push(name);	
	       }
	       return n;
	},


       /* returns the Archive being built.
       */
getBlob : function(){
		  var self = this;
		  var headBlob = new Blob([JSON.stringify(this.header)],{type:'application/json'});
		  var sizeHeader = getSizeAsUint32Array(headBlob);
		  return new Blob([sizeHeader,headBlob,this.resources],{type:'aplication/x-blob-archive'});
	},

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
