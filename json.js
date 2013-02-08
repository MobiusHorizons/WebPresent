var winW=0;
var winH=0;
var count=0;
var touchStartX = 0;
var touchStartY = 0;
var subElemCount=0;
var level=0;
var remote=false;
var active=null;
var background=null;
var Remote_last="";
var ID_CT =0;
var current=null;//new Array();
//var aspect = 4/3 // 4:3
var aspect = 16/9;
function initialize(){
	active = document.getElementById("slide_main");
	if (slide_background){
		active.style.backgroundImage="url("+slide_background+")";
		active.style.backgroundSize="100% auto";
	}
	resize();

	window.onresize=resize;
}

function first(){
	count = 0;
	subElemCount = 0; 
	attatch_listeners();
	current = slides[count];
	hide();
	load();
	if (window.fullScreenApi.supportsFullScreen) {
		window.fullScreenApi.requestFullScreen(document.body);
	}
}

function Add_elem(type){
	if (type == "text_area"){
		ID_CT ++;
		active.innerHTML += '<div id="outer'+ID_CT+'" class="text_area"><div id="'+ID_CT+'" class="slide_text" contenteditable="true">Type your own text here</div></div>';
	 	for(i=1;i<=ID_CT;i++){		
			$('#outer'+i).resizable();
	                $('#outer'+i).resizable( "destroy" );
        	        $('#outer'+i).resizable();
                	$('#outer'+i).draggable({snap:true, cancel: "div.slide_text"});
		}
	}
}

function Remote_Slide(){
	remote=true;
	$.get("../get?id="+ID, function(data){
		console.log(data!=Remote_last);
		if (data!=Remote_last){
			Remote_last = data;
			script='<script>'+data+'</script>';
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
	if (subElemCount){
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
	}
}

function attatch_listeners(){
	active.addEventListener("mouseup",next,false);
	$('body').keydown(function(e){
		if (e){
			if(e.keyCode==39){ //right
				next();
			} else if (e.keyCode == 37){ //left
				back();
			}
		}
	});
	active.addEventListener("touchstart",function(event){
		if(event.targetTouches.length==1){
			//event.preventDefault();
			//alert("hello");
			touchStartX = event.targetTouches[0].pageX;
			touchStartY = event.targetTouches[0].pageY;
		}
	}, true);
	active.addEventListener("touchmove", function(event){
		if(event.targetTouches.length == 1){		
			event.preventDefault();
			//if(event.targetTouches[0].pageX-touchStartX >30){alert("swipe");}
			touchLengthX = event.targetTouches[0].pageX-touchStartX;
			touchLengthY = event.targetTouches[0].oageY-touchStartY;
		}
	},true);
	active.addEventListener("touchend" , function(event){
		event.preventDefault();
			if (touchLengthX > 30){
				back();
			}
			if(touchLengthX < -30){
				next();
			}
	},true);
	active.addEventListener("touchcancel", function(event){event.preventDefault;},true);
}
			
function next(){
	console.log("SubElemcount = " + subElemCount);
	if ( count >= 0 && slides[count].subElem && subElemCount >= 0)
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
	
/*			if(ID){
				jQuery.ajax({
					type: 'GET',
					url : "../put?id="+ID+"&ended=1",
					success : function () {console.log("updated");}
			
				});
			}*/
			if(window.fullScreenApi.isFullScreen){window.fullScreenApi.cancelFullScreen(document.body);}
		}
	}

	console.log("SubElemcount = " + subElemCount);
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





function resize()
{
	winW = 630, winH = 460;
	var slideH =winH, slideW = winW;
	var background = $('#slide_screen');
	/*if ( background && active.offsetWidth) {
	 winW = active.offsetWidth;
	 winH = active.offsetHeight;
	}
	if (document.compatMode=='CSS1Compat' &&
		document.documentElement &&
		document.documentElement.offsetWidth ) {
	 winW = document.documentElement.offsetWidth;
	 winH = document.documentElement.offsetHeight;
	}
	if (window.innerWidth && window.innerHeight) {
	 winW = window.innerWidth();
	 winH = window.innerHeight();
	} 
	if (document.documentElement){
		winW = document.documentElement.clientWidth;
		winH = document.documentElement.clientHeight;
	}*/
	if (background.innerHeight && background.innerWidth){
		winW = background.innerWidth();
		winH = background.innerHeight();
	}
	if (winH * aspect < winW){ //put plack bars on sides
		slideW = winH*aspect;
		slideH = winH;
		active.style.width = slideW + "px";
		active.style.left = ((winW-slideW) / 2) + "px";
		console.log("slideH="+winH+"slideW="+slideW);
	} else{
		slideH = winW/aspect;
		slideW = winW;
		active.style.height = slideH + "px";
		active.style.top = ( (winH-slideH)/2) + "px";
		console.log("winH="+winH+", and slideH="+slideH);
	}
	active.style.width = slideW + "px";
	active.style.left = ((winW-slideW) / 2) + "px";
	active.style.height = slideH + "px";
	active.style.top = ( (winH-slideH)/2) + "px";
	var margins = ".03";//document.getElementByTag('slide_text')[0].style.margin;
	var textHeight = (slideW-(2*slideW*margins))/1024 * 30 + "px";
	active.style.fontSize=textHeight;
}
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
