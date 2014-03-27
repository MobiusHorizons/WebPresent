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
			ce.setAttribute('contenteditable',false);
			ce.spellcheck = false;
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
	event.target.top = (event.target.offsetTop - ( winH/2 )) / winH ;
	event.target.left = (event.target.offsetLeft - (winW/2))/ winW;
	event.target.height = (event.target.clientHeight/winH);
	event.target.width = (event.target.clientWidth/winW);
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
		UI.draggable(child,'set');
		var ce = child.querySelector(".content-editable");
				ce.setAttribute('contenteditable',true);
				ce.spellcheck = false;
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
		lastClick.x = e.offsetX;
		lastClick.y = e.offsetY;
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
		menu.style.top = e.offsetY + "px";
		menu.style.left = e.offsetX + "px";
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
        	slide.setBackground(file,file.name); 
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
	if (type == "text_area"){
		ID_CT = slide.nextID();
		var textArea = document.createElement('div');
			//textArea.setAttribute('id','outer' + ID_CT);
			textArea.setAttribute('class','text_area');
//		UI.draggable(textArea, 'set');
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
		textArea.style.top = lastClick.y + 'px';
		textArea.style.left = lastClick.x + 'px';
		UI.resizeable(textArea,'set');
		UI.draggable(textArea,'set');
		textArea.ontransformed = boxDrag;
		slide.add(textArea,'text',[]);

		borders(true);
	return textArea;
	} else if (type == "image"){
		ID_CT = slide.nextID();
		var textArea = document.createElement('div');
			//textArea.setAttribute('id','outer' + ID_CT);
			textArea.setAttribute('class','text_area');
		var handle = document.createElement('div');
			handle.setAttribute('class','handle');
			textArea.appendChild(handle);
		var img = document.createElement('div');
				//img.setAttribute('id',ID_CT);
				img.setAttribute('class','slide_text slide_img');
				textArea.appendChild(img);
		UI.resizeable(textArea,'set');
		UI.draggable(textArea,'set');
		textArea.ontransformed = boxDrag;

		textArea.style.top = lastClick.clientY + 'px';
		textArea.style.left = lastClick.clientX + 'px';
/*		for(i=1;i<=ID_CT;i++){
			UI.resizeable(lib.selID('outer' + i), 'set');
			UI.draggable(lib.selID('outer' + i), 'set', {snap:'.text_area, #slide_main', snapMode:'both', cancel: "div.slide_text"});
			lib.selID(i).setAttribute('contenteditable',true);
			lib.selID('outer'+i).ondragstop = boxDrag;
			//	$('#outer'+i).resizable();
			//	$('#outer'+i).resizable( "destroy" );
			//	$('#outer'+i).resizable();
                	//	$('#outer'+i).draggable({snap:'.text_area, #slide_main', snapMode:'both', cancel: "div.slide_text"});
			//	$('#outer'+i).on('dragstop',boxDrag);
		}*/
		//clear_UI_modal();
		var image_preview = new Preview({type:'image'});
		image_preview.onselected = function(file){
			img.style.backgroundImage = 'url(' + URL.createObjectURL(file) + ')';
			textArea.links = [];
			textArea.links.push("img.style.backgroundImage",file.name);
			var rl = {'resource' : file,
				  'link' : {
					'type': 'css',
					'id'  : 'childNodes.1.style.backgroundImage'
					}
				};

			slide.add(textArea,'image',[rl]);
			active.appendChild(textArea);
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
	
		UI.resizeable(textArea,'set');
		UI.draggable(textArea,'set');
		textArea.style.top = lastClick.clientY + 'px';
		textArea.style.left = lastClick.clientX + 'px';
		var image_preview = new Preview({type:'video'});
		image_preview.onselected = function(file){
			img.src = URL.createObjectURL(file)  ;
			var rl = {'resource' : file,
				  'link' : {
					'type': 'url',
					'id'  : 'childNodes.1.src'
					}
				};

			slide.add(textArea,'image',[rl]);
			active.appendChild(textArea);
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
		slideshow.render(s.id,active);
		setEdit();
		previewRender(s.id)
	});
	var length = preview.children.length;
	preview.insertBefore(sp,preview.lastChild);
	if (preview = preview || true){
		previewRender();
	}
}

function previewRender(id){
	var collection = lib.selID('slides_preview').children;
	for ( var i = 0; i < collection.length; i++){
		var el = collection[i];
		if (slideshow.currentSlide.id == i){
			if (el.overlay && el.overlay.parentNode == el){
				el.overlay.style.backgroundImage = "-moz-element(#slide_main)";
			} else {
				el.overlay = lib.newEL('div',{className:'thumb overlay'});
				el.overlay.style.background = 'rgba(0,0,0,.5)';
				el.overlay.style.backgroundImage = "-moz-element(#slide_main)";
				el.overlay.style.backgroundSize = "cover";
				el.appendChild(el.overlay);
			}
		} else if (slideshow.slides.length > i){
			if (el.overlay && el.overlay.parentNode == el){
				el.removeChild(el.overlay);
				el.overlay = undefined;
			}
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

function slideResize(slide){

	var width = slide.clientWidth;
	console.log(width);
	var height = width/aspect;
	slide.style.height = height + "px";
	var textWidth = 2 * (width / 1024) + 'em';
	slide.style.fontSize = textWidth;
	lib.foreach(slide.querySelectorAll('.text_area'),function(el){
		el.style.top= (el.top* height) + height/2 + 'px';
		el.style.left = (el.left * width) + width/2 + 'px';
		el.style.height = el.height * height + 'px';
		el.style.width = el.width * width + 'px';
	});
}
