/*
*	
*	Go 2012 Phonegap (iOS & Android) written by Nic Mulvaney
*
*/

// CORDOVA


document.addEventListener("deviceready", onDeviceReady, false);

var documentRoot = '';
var introInt;
var initDone = false;

// Disable Console if not available;
window.console = window.console || { log: function (d) {} };


function onDeviceReady() {
	console.log("Device Ready");
	_PG = true;
	window.requestFileSystem(LocalFileSystem.TEMPORARY, 0, gotFS, function() {});

	if(android){
		document.addEventListener("backbutton", onBackKeyDown, false);
		document.addEventListener(window.onorientationchange, onResume, false);
	}else{
		// INSTALL CHILD BROWSER
		childbrowser = ChildBrowser.install();
	}
	introInt = setInterval(function(){
		if(window.jQuery && !initDone){
			init();
			window.clearInterval(introInt);
		}
	},100);

	
}

function onSuccess(fileEntry) {
    al("SUCCESS fileEntry.name:"+fileEntry.name);
}
function onError(fileEntry) {
    al("ERROR fileEntry.name"+fileEntry.name);
}

function gotFS(fileSystem) { 
	documentRoot = fileSystem.root.fullPath;
}

function al(value){
	navigator.notification.alert(value);
}




// CHECK BROWSER
/* ------------------------------------------------------------ */

var pc = false;
if( ua.match(/iPhone/i) || ua.match(/iPad/i) || ua.match(/Android/i) ){
	// MOBILE DEVICE
	event_down =  "touchstart";
	event_move = "touchmove";
	event_release =  "touchend";
}else{
	// PC BROWSER
	event_down = "mousedown";
	event_move = "mousemove";
	event_release =  "mouseup";
	pc = true;
}

iPad = false;
if(ua.match(/iPad/i)){
	iPad = true;
}

if(pc){
	$(window).load(init);
}


// Global Variables
/* ------------------------------------------------------------ */

//var games = 1; // 1 for paralympics

var olympic_startDate = [new Date(2012,6,25),new Date(2012,7,29)];
var olympic_currentDate = [new Date(2012,6,25),new Date(2012,7,29)];
var olympic_dayDuration = [19,12];
var olympic_scheduleID = [["0Ai5Q6Z5eSbyjdFlnNHZvNVpkSmJSaF9GNzNCRExZZ3c",2], ["0Ai5Q6Z5eSbyjdFZ6QnJ0U1Y4V0kzOU4yMW1GREREc1E",0]];
var olympic_news = [["0Ai5Q6Z5eSbyjdHM1RURQWUZZV09YSm1QdmpCUTkzMXc",3], ["0Ai5Q6Z5eSbyjdEFoTDJkbGM5V185ZU85Q29TVHpBWHc",3]];
var olympic_resultID = [["0Ai5Q6Z5eSbyjdHF6MDhoYWc3V3Z1SlJXdWxvMnZIUkE",0], ["0Ai5Q6Z5eSbyjdFQ1Z0dUSUV6YnEzcGpYVUdMZ3BvSmc",0]]

function setGames(){
    scheduleID = olympic_scheduleID[_settings.games];
    newsID = olympic_news[_settings.games];
    resultID = olympic_resultID[_settings.games];
    data = olympic_data[_settings.games];
    medals = olympic_medals[_settings.games];
    
    startDate = olympic_startDate[_settings.games];
    currentDate = olympic_currentDate[_settings.games];
    dayDuration = olympic_dayDuration[_settings.games];
    
    formatSports();
    formatDates();
    formatDayTitles();
    formatMedalTitles();
    
    yearid = medalsTitles.length-1;
 
}

var dayofweek = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
var months = [ "January", "February", "March", "April", "May", "June", "Jul", "Aug", "September", "October", "November", "December" ];
var _storage = window.localStorage;

// CHECK FOR STORED SETTINGS
//_storage.removeItem('_go2012_settings');

var _settings = {tz_offset:0, updated:"6/10/2012 17:08:00", favourites:new Object(), introduction:true, standardclock:true, games:1}; //  DEFAULT SETTINGS


var storedSettings = _storage.getItem('_go2012_settings');
if(storedSettings){
	_settings = JSON.parse(storedSettings);
	console.log("HAS STORED SETTINGS");
}


setGames();

var keys = [];
var down = false;
var myScroll;
var wikiDelay, hitDelay;
var currentSection = -1;
var header_menu;
var _PG = false;
var scrollPositions = [0,0,0,0];
var _currentDownloadKey;
var currentNews;
var childbrowser;
var tut_menu;

var timelineInterval;

// CHECK FOR ANY STORED UPDATES
//_storage.removeItem('_go2012_data');

var storedData = _storage.getItem('_go2012_data_'+_settings.games); // CHANGE TO GET ITEM // IMPORTANT!!!!

if(storedData){
	data = JSON.parse(storedData);
	setGames();
}

function formatDates(){
	for(var date in data){
		for(var sport in data[date]){
			for(var i = 0 ; i < data[date][sport].length ; i ++){
				var dt = data[date][sport][i];
				
				dt.START = new Date(Date.parse(dt.START));
				dt.END = new Date(Date.parse(dt.END));
			}
		}
	}
}

// MAKE SURE WE INCLUDE THE NEW FAVOURITES
if(!_settings.hasOwnProperty("games")){
	_settings.favourites = 1;
	_settings.introduction = true;
}


// MAKE SURE WE INCLUDE THE NEW FAVOURITES
if(!_settings.hasOwnProperty("favourites")){
	_settings.favourites = new Object();
}

// AND THE INTRO
if(!_settings.hasOwnProperty("introduction")){
	_settings.introduction = true;
}

saveSettings();

function formatSports(){
    sports = new Object();
    for(var date in data){
    	for(var sport in data[date]){
    		if(!sports[sport]){
    			sports[sport] = 1;
    		}
    	}
    }
    // GET SPORTS FOR QUICKNESS
    
    var arr = new Array();
    for(var sport in sports){
    	arr.push(sport);
    }
    sports = arr.sort();
}

//console.log(data);

function saveSettings(){
	_storage.setItem('_go2012_settings', JSON.stringify(_settings));
	console.log("Settings saved");
	
	var storedSettings = _storage.getItem('_go2012_settings');
	if(storedSettings){
		_settings = JSON.parse(storedSettings);
		
	}
}

// HTML FOR DAY MENU

function formatDayTitles(){
    dayTitles = [];
    for(var i = 0 ; i < dayDuration ; i++){
    	var millisecondOffset = i * 24 * 60 * 60 * 1000;
    	var date = new Date(startDate.getTime() + millisecondOffset); 
    	var nth = date.getDate();
    	if(_settings.games==1){
	    	if(i>0){
		    	var theday = "DAY "+(i);
	    	}else{
		    	var theday = "";
	    	}
    	}else{
	    	if(i>2){
		    	var theday = "DAY "+(i-2);
	    	}else{
		    	var theday = "";
	    	}
    	}
    	var date_text = "<span class='title-center'>"+dayofweek[date.getDay()].toUpperCase()+" "+nth+" <span class='nth'>"+get_nth_suffix(nth) +"</span> "+months[date.getMonth()]+"<span class='title-day'>"+theday+"</span></span>";
    	dayTitles.push(date_text);
    }
}
formatDayTitles();

// HTML FOR MEDAL TITLES



function formatMedalTitles(){
    medalsTitles = [];
    for(var year in medals){
    	var m = medals[year];
    	var l = m.location.split(",");
    	var html = "<span class='title-center'><div class='title-day'>"+l[1]+"</div><span class='year'>"+m.year+"</span> "+l[0]+"</span>";
    	medalsTitles.push(html);
    }
}


// SORT OBJECT BY KEYS
for (var k in data) {
	keys.push(k);
}
keys.sort();




// PREVENT REORIENTATION
/* ------------------------------------------------------------ */

window.onorientationchange = function(){
	var orientation = window.orientation;
	window.scrollTo(0, 0);
	if(orientation!=0){
		$("#page-holder, #settings, .intro1").addClass("landscape");
	}else{
		$("#page-holder, #settings, .intro1").removeClass("landscape");
	}
	if($("#page-holder").hasClass("landscape")){
		myScroll.refresh();
	}
	setTimeout(function(){
		header_menu.refreshSize();
		header_menu.goToPage(header_menu.page);
	},100);
}

// PREVENT ZOOMING/DRAGGING ON MOBILE DEVICE
/* ------------------------------------------------------------ */

document.ontouchmove = function(e){
	e.preventDefault();
}


/* ------------------------------------------------------------ */
function init(){
	
	console.log("INITIALIZE");
	initDone = true;
	
	
	// IF ANDROID ADD EXTRA CSS
	if(android){
		$("body").addClass("android");
	}
	if(iPad){
		$("body").addClass("iPad");
	}
	$('body').bind('mousewheel DOMMouseScroll', function(e) {
		e.preventDefault();
	});
	
	if(_settings.introduction){
		$("body").addClass("intro");
	}
	
	
  	drawTimeBar();
	
	// FIX THE DATES // IMPROVE THIS FOR MORE SPEED
	if(!storedData){
		for(var day in data){
			var daySports = data[day];
			for(var sport in daySports){
				var events = daySports[sport];
				for(var i = 0 ; i < events.length; i++){
					events[i].START = new Date(Date.parse(events[i].START));
					events[i].END = new Date(Date.parse(events[i].END));
				}
			}
		}
	}
	
	
	$(".font-preload").hide();
	
	var titles = $("#sport-titles");
	var timebar = $("#time-bar");
	
	
	setTimeout(function () {
	 	// SCROLL AREA
		myScroll = new iScroll('page', { bounce: true, topOffset: 0, hScrollbar: false, useTransition: true, onScroll: function () {
			titles.css({"webkit-transition-duration":"0ms","-webkit-transform":"translate(0px, "+this.y+"px)"});
			timebar.css({"webkit-transition-duration":"0ms", "-webkit-transform":"translate("+this.x+"px, 0px)"});
			if(this.x<0){
				$(".notmany").addClass("hide");
			}else{
				$(".notmany").removeClass("hide");
			}
			down = false;
			window.clearTimeout(hitDelay);
			$('.scroller .hit').removeClass('hit');
		},onScrollMove:function(){
			if(this.y>-5){
				var last = $(".lastupdated").html();
				if(!last){
					last = '';
				}
				$(".pulltorefresh").html("Release to refresh <div class='lastupdated'>"+last+"</div>").addClass('reload');
				this.minScrollY = 0;
			}
		},customAni: function(step){
			timebar.css({"webkit-transition-duration":step.time+"ms","-webkit-transform":"translate("+step.x+"px, 0px)"});
			titles.css({"webkit-transition-duration":step.time+"ms","-webkit-transform":"translate(0px, "+step.y+"px)"});
		}, onRefresh:function(){
			
		},onScrollEnd: function () {
			if($(".pulltorefresh").hasClass('reload')){
				if(currentSection==2){
					loadLiveResults();
				}else if(currentSection==3){
					loadNews(true);
				}
			}
		}});
		myScrollLeft = new iScroll('page2', { bounce: true, hScrollbar: false, topOffset: 0, useTransition: true, onScroll: function () {
			down = false;
			window.clearTimeout(hitDelay);
			$('.hit').removeClass('hit');
		}});
		myScrollRight = new iScroll('page3', { bounce: true, hScrollbar: false, topOffset: 0, useTransition: true, onScroll: function () {
		   down = false;
		   window.clearTimeout(hitDelay);
		   $('.hit').removeClass('hit');					   
		}});
		
		// Menu
		header_menu = new SwipeView('#wrapper', {
			numberOfPages: dayTitles.length,
			hastyPageFlip: true,
			loop:false
		});

		// GO TO THE FIRST TAB
		if(_settings.introduction){
			$(".tab:eq(1)").trigger(event_down);
		}else{
			$(".tab:eq(0)").trigger(event_down);
		}
		
        getTimezone(); 
        
        // CHECK FOR UPDATE
		if(!_settings.introduction){
			console.log("autocheck");
			checkUpdate(true);
		}
		
		$(['images/tut_1.png','images/tut_2.png','images/star-small.png','images/star-all.png','images/star-inner.png']).preload();
			   
        // THEN HIDE SPLASH
       if(!android && !pc){
       		console.log("HIDE SPLASH SCREEN");
            cordova.exec(null, null, "SplashScreen", "hide", []);
       }
		
	},20);
	
	$(".event, .event-tap").live(event_down, function(){
		down = true;
		var _that = $(this);
		window.clearTimeout(hitDelay);
		hitDelay = setTimeout(function(){
			_that.addClass('hit');
		},150);
	}).live(event_release, function(){
		var _that = $(this);
		window.clearTimeout(hitDelay);
		if(down){
			_that.addClass('hit');
			hitDelay = setTimeout(function(){
				_that.removeClass('hit');
				var eid = _that.attr("data-id").split('|');
				var o = data[eid[0]][eid[1]][eid[2]];
				$("#details-title").html(o.SPORT);
				var nth = o.START.getDate();
				var day = dayofweek[o.START.getDay()]+" "+nth+" <span class='nth'>"+get_nth_suffix(nth).toUpperCase()+"</span> "+months[o.START.getMonth()];

				if(o.END.getTime()){
					$("#details-time").html(day+"<span class='poptime'>"+formatTime(o.START)+"-"+formatTime(o.END)+"</span>");
				}else{
					$("#details-time").html(day+"<span class='poptime'>"+formatTime(o.START)+"</span>");
				}
				
				if(o.LOC){
					$("#details-location").html(o.LOC).show();
				}else{
					$("#details-location").hide();
				}
				
				var medal = "";
				if(o.ceremony==1){
					medal = "<div class='medal-icon'></div>";
				}
				$("#details-info").html(medal+o.INFO.split("&middot;").join("<br />"));
				
				$("#details-cover, #details").addClass('show');
				setTimeout(function(){
					$("#details-cover").addClass('fade');
					$("#details").addClass('flip');
				},1);
				down = false;
			},50);
		}
	});

	$(".sport-link").live(event_down, function(){
	  down = true;
	  var _that = $(this);
	  window.clearTimeout(hitDelay);
	  if(!$("body").hasClass('intro')){
		  hitDelay = setTimeout(function(){
				_that.addClass('hit');
		  },150);		  
	  }else{
	  	_that.addClass('hit');
	  }
	}).live(event_release, function(){
		var _that = $(this);
		window.clearTimeout(hitDelay);
		if(down){
			_that.addClass('hit');
			hitDelay = setTimeout(function(){
				_that.removeClass('hit');
				if(_that.hasClass('all')){
					return false;
				}
				if($("body").hasClass("intro")){
					_that.find(".star").trigger(event_release);
				}else{
					var sport = _that.text();
					$(".back").addClass("show");
					$("#page-holder").addClass("insport");
					showSportDay(sport);
					if(_settings.favourites[sport]){
						$(".star-inner").addClass("on");
					}else{
						$(".star-inner").removeClass("on");
					}
					$(".star-inner").addClass("show");
				}
				down = false;
			},25);
			
		}
	});

	$(".star").live(event_down, function(e){
		down = true;
		e.preventDefault();
		e.stopPropagation();
	}).live(event_release, function(e){
		if(down){
			$(this).toggleClass("on");
			var id = $(this).parent().text();
			if($(this).hasClass('on')){
				_settings.favourites[id] = true;
			}else{
				delete _settings.favourites[id];
			}
			checkReady();
			$(".all-sport-button").removeClass("toggle");
			$(".sport-link.all").text("Select All");
			saveSettings();
		}
		down = false;
		e.preventDefault();
		e.stopPropagation();
	});
	$(".star-inner").live(event_release, function(e){
		$(this).toggleClass("on");
		var id = $("#panel-title-right").text();
		if($(this).hasClass('on')){
			_settings.favourites[id] = true;
		}else{
			delete _settings.favourites[id];
		}
	});
	$(".all-sport-button").live(event_down, function(e){
		$(this).toggleClass("toggle");
		if($(this).hasClass("toggle")){
			for(var sport in sports){
				_settings.favourites[sports[sport]] = true;
			}
			$(".star").addClass("on");
			$(".sport-link.all").text("Select None");
		}else{
			delete _settings.favourites;
			_settings.favourites = {};
			$(".star").removeClass("on");
			$(".sport-link.all").text("Select All");
		}
		saveSettings();
	});
	
	$(".sport-link.all").unbind(event_down).unbind(event_release).live(event_down, function(e){
		$(".all-sport-button").trigger(event_down);
		checkReady();
		e.preventDefault();
		e.stopPropagation();
	});
	
	$(".intro-done").live(event_release, function(e){
		if($(this).hasClass('ready')){
			$(".revealer").addClass("show");
			_settings.introduction = false;
			saveSettings();
			
			setTimeout(function(){
				$(".revealer").addClass("fadein");
				setTimeout(function(){
					myScrollLeft.scrollTo(0,0,0);
					$(".intro1").addClass("show");
					setUpTutorialSwipe();
					

				},350);	
			},1);	
		}	  
		
	});
	$(".tutorial-done").live(event_release, function(e){
		$(".tab:eq(0)").trigger(event_down);
		if($(this).hasClass('show')){
		$(".intro1").removeClass("show");
		$("body").removeClass("intro");
		$(".revealer").removeClass("fadein");
		$(this).removeClass("show");
		setTimeout(function(){
			// DESTROY THE SWIPE
			tut_menu.destroy();
			$("#tutorial-swipe").empty();
			$(".revealer").removeClass("show");
			checkUpdate(true);
		}, 350);
		}
	});
	
	$("#details-cover, #details-close").live(event_down, function(e){
		window.clearTimeout(hitDelay);
		$("#details").removeClass('flip');
		$("#details-cover").removeClass('fade');
		setTimeout(function(){
			$("#details-cover, #details").removeClass('show');
		},150);
		e.preventDefault();
	});
	
	$("#readme-close").live(event_down, function(e){
		$(".readme").removeClass('show');
		e.preventDefault();
	});
	$(".show-all-medals").live(event_down, function(e){
		showRestofResults();
	});
	
	$("#details-location").live(event_down, function(e){
		var _that = $(this);
		window.clearTimeout(hitDelay);
		_that.addClass('hit');
		e.preventDefault();
	}).live(event_release, function(e){
		var _that = $(this);
		window.clearTimeout(hitDelay);

			_that.removeClass('hit');
			var venue = _that.html();
			for(var i = 0 ; i < venues.length ; i++){
				if(venue==venues[i][0]){
					var coords = venues[i][1];
					break
				}
			}
			if(android){
				_openurl("http://maps.google.com/maps?ll="+coords+"&q="+venue);
			}else{
				window.location = "maps:ll="+coords+"&q="+venue;
			}

		e.preventDefault();
	});
	
	$("#view-toggle").live(event_down, function(){
		var _this = $(this);
		if(_this.text()=="LIST"){
			_this.text("GRID");
			$("#page-holder").addClass("list");
		}else{
			_this.text("LIST");
			$("#page-holder").removeClass("list");
		}
		changeSchedule();
	});
	
	 $(".arrow").bind(event_down, navArrows).bind(event_release, function(){
	 	var _that = $(this);
	 	_that.removeClass("hit");
	 	setTimeout(function(){
	 		
	 	},200);
	 });
	
	$(".tab").bind(event_down,function(){
		$(".tab").removeClass("on");
		$(this).addClass("on");
		
		// STORE SCROLL POSITIONS
		scrollPositions[currentSection] = myScroll.y;
		window.clearInterval(timelineInterval);
		
		var id = $(".tab").index(this);
		if(id==currentSection){
			scrollPositions[currentSection] = 0;
		   if(id==0){
				if(myScroll.y == 0){
				   jumpToToday();
				}else{
				  resetScroll(null,false,300);
				}
		   }else if(id==1){
				if($("#page-holder").hasClass('insport')){
				   $(".back").trigger(event_down);
				}else{
				   myScrollLeft.scrollTo(0,0,300);
				}
		   }else{
				resetScroll(null,false,300);
		   }
			return false;
		}
		
		// ATTEMPT TO HELP REDRAW
		$("#content").hide();
		
		_currentDownloadKey = -1;
		
		if(id==0){
			$("#page-holder").addClass("showtoolbar").removeClass("results-view").removeClass("news-view").removeClass("sport-view");
		}else if(id==1){
			$("#page-holder").addClass("showtoolbar").removeClass("results-view").removeClass("news-view").addClass("sport-view");
		}else if(id==2){
			$("#page-holder").addClass("showtoolbar").addClass("results-view").removeClass("news-view").removeClass("sport-view");
		}else if(id==3){
			$("#page-holder").removeClass("showtoolbar").removeClass("results-view").addClass("news-view").removeClass("sport-view");
			loadNews();
		}
		swapheader_menu(id);
		$("#content").show();
		myScroll.refresh();
		
		
	});
	$(".back").bind(event_down,function(){
		$("#page-holder").removeClass("insport");
		$(".star-inner").removeClass("show");
		var i = 0;
		for(var sport in sports){
			if(_settings.favourites[sports[sport]]){
				$(".star").eq(i).addClass("on");
			}else{
				$(".star").eq(i).removeClass("on");
			}
			i++;
		}
		setTimeout(function(){
			$(".back").removeClass('show');
		},300);
	});
	
	
	$(".results-overview").live(event_down, function(){
		down = true;
	}).live(event_release,function(e){ 
		if(down){
			window.clearTimeout(wikiDelay);
			$(this).toggleClass('open');
			if($(this).hasClass('open')){
				$(this).css({height:$(".oh").height()});
				wikiDelay = setTimeout(function(){
					myScroll.refresh();
				},250);
			}else{
				$(this).css({height:95});
				wikiDelay = setTimeout(function(){
					myScroll.refresh();
				},250);
			}
		}
		e.preventDefault();
	});
	
	$(".settings-button").bind(event_down, function(){
		$(this).addClass('hit');
	}).live(event_release,function(e){
		$(this).removeClass('hit');
		if(_settings.games==1){
    		$(".gamesbut").html("Displaying: London Paralympics 2012");
		}else{
    		$(".gamesbut").html("Displaying: London Olympics 2012");
		}
		$(".update").html("Check for schedule update");
		$(".aboutbut").html("About");
		$(".ratebut").html("Rate this app");
		$(".tutbut").html("Introduction");
		if(_settings.standardclock){
			$(".clockbut").text("Displaying: 12hr clock");
		}else{
			$(".clockbut").text("Displaying: 24hr clock");
		}
		$("body").addClass("flip").addClass("perspective");
	});
	$("#settings-close").bind(event_release, function(){
		$('.readme').removeClass("show");
		$("body").removeClass("flip");	
		setTimeout(function(){
			$("body").removeClass("perspective");
		},600);		
	});
	$(".gamesbut").bind(event_down, function(e){
			$(this).addClass('hit');
			e.preventDefault();
			e.stopPropagation();
	}).live(event_release,function(e){
			$(this).removeClass('hit');
    		if(_settings.games==1){
    		      _settings.games = 0;
        		$(".gamesbut").html("Displaying: Olympics London 2012");
    		}else{
    		      _settings.games = 1;
        		$(".gamesbut").html("Displaying: Paralympics London 2012");
    		}
			saveSettings();
			setGames();
			updateAfterDownload();
			drawTimeBar();
	});
	$("#an-update").bind(event_down, function(e){
		$(".settings-button").trigger(event_release);
		$(this).hide();
		setTimeout(function(){
			$(".update").trigger(event_down);
			setTimeout(function(){
				$(".update").trigger(event_release);
			},300);
		}, 1000);
	});
	$(".update").bind(event_down, function(e){
			$(this).addClass('hit');
			e.preventDefault();
			e.stopPropagation();
	}).live(event_release,function(e){
			$(this).removeClass('hit');
			checkUpdate();
	});
	$(".aboutbut").bind(event_down, function(e){
			$(this).addClass('hit');
			e.preventDefault();
			e.stopPropagation();
	}).live(event_release,function(e){
			$(this).removeClass('hit');
			$(".readme").addClass("show");
	});
	$(".gowebbut").bind(event_down, function(e){
			$(this).addClass('hit');
			e.preventDefault();
			e.stopPropagation();
	}).live(event_release,function(e){
			$(this).removeClass('hit');
			_openurl("http://www.go2012app.com"); 
	});
	$(".tutbut").bind(event_down, function(e){
			$(this).addClass('hit');
			e.preventDefault();
			e.stopPropagation();
	}).live(event_release,function(e){
			$(this).removeClass('hit');
			$("#page-holder").removeClass('insport');
			$(".star-inner").removeClass("show");
			$(".revealer").removeClass("show");
			$(".revealer").removeClass("fadein");
			$("body").addClass("intro");
			$(".tab:eq(0)").trigger(event_down);
			$(".tab:eq(1)").trigger(event_down);
			checkReady();
			$("#settings-close").trigger(event_release);
	});
	$(".clockbut").bind(event_down, function(e){
			$(this).addClass('hit');
			e.preventDefault();
			e.stopPropagation();
	}).live(event_release,function(e){
			$(this).removeClass('hit');
			_settings.standardclock = !_settings.standardclock;
			if(_settings.standardclock){
				$(this).text("Displaying: 12hr clock");
			}else{
				$(this).text("Displaying: 24hr clock");
			}
			saveSettings();
			updateAfterDownload();
			drawTimeBar();
	});
	$(".ratebut").bind(event_down, function(e){
			$(this).addClass('hit');
			e.preventDefault();
			e.stopPropagation();
	}).live(event_release,function(e){
			$(this).removeClass('hit');
			if(android) {
				window.open('market://details?id=com.mulvaney.go2012');
			}else{
				window.open('itms-apps://itunes.apple.com/WebObjects/MZStore.woa/wa/viewContentsUserReviews?id=535282035&pageNumber=0&sortOrdering=1&type=Purple+Software');
			}
	});
	
	
	
	
	$('.results-overview .wiki').live(event_down, function(){
		down = true;
		$(this).addClass('hit');
	}).live(event_release,function(e){
		$(this).removeClass('hit');
		if(down){
			var year = games_medals.year;
			if(_settings.games==1){
				var url = "http://en.wikipedia.org/wiki/"+year+"_Summer_Paralympics"; 
			}else{
				var url = "http://en.wikipedia.org/wiki/"+year+"_Summer_Olympics"; 
			}
			_openurl(url);
		}
		e.preventDefault();
		e.stopPropagation();
	});
	
	console.log("END OF INITIALIZE");

}

function checkReady(){
	if(Object.keys(_settings.favourites).length){
		$(".intro-done").addClass('ready');
	}else{
		$(".intro-done").removeClass('ready');
	}
}

function setUpTutorialSwipe(){
		tut_menu = new SwipeView('#tutorial-swipe', {
			numberOfPages: 2,
			hastyPageFlip: true,
			loop:false
		});
		tut_menu.data = ["<div class='tuthold'><div class='tut_1 tut'></div>Your custom schedule <br />is in the <span class='tut-days'>DAYS</span> tab</div>","<div class='tuthold'><div class='tut_2 tut'></div>Edit your favourites by tapping<br />stars in the <span class='tut-sports'>SPORTS</span> tab</div>"];
		tut_menu.update();
		tut_menu.goToPage(0);
		tut_menu.onFlip(function(){
			$(".tutorial-dot").removeClass("hit");
			$(".tutorial-dot").eq(tut_menu.page).addClass("hit");
			if(tut_menu.page==1){
				$(".tutorial-done").addClass("show");	
			}
		});
		$(".tutorial-dot").eq(0).addClass("hit");
		$(".tutorial-dot").eq(1).removeClass("hit");
}


function onBackKeyDown() {
    var p = $("#page-holder");
    var d = $("#details");
    if(d.hasClass("show")){
    	hideDetails();
    }else if(p.hasClass("insport")){
    	$(".back").trigger(event_down);
    }else if($(".readme").hasClass('show')){
    	$("#readme-close").trigger(event_down);
    }else if($("body").hasClass('flip')){
    	$("#settings-close").trigger(event_release);
    }else{
    	navigator.app.exitApp();
    }
    //return false;
}

function getTimezone(){
	var file = "http://jsontimezone.appspot.com/time.json?tz=GB&callback=?";
	_ajax(file, function(){
		var roundDiff = Math.round((new Date()-new Date(this.datetime))/3600000);
		_settings.tz_offset = roundDiff;
		// HARD CODE AND REMOVE WHEN PUBLISHING
		//_settings.tz_offset = 0;
		if(_settings.tz_offset>27){
			_settings.tz_offset = 0; // IT CAN"T BE MORE THAN 28 HOURS TIME DIFFERENCE
		}
		saveSettings();
		console.log("Time Difference is "+_settings.tz_offset+" hours");
	}, 'json', "datekey", true);
}

function jumpToToday(){
	var d = new Date();
	var now = new Date(d.getTime()+(_settings.tz_offset*3600000)); // COMPENSATE FOR OTHER TIMEZONES;
	var dayid = Math.floor((now-startDate)/(24*60*60*1000));
	if(dayid>=0 && dayid<dayTitles.length){
		header_menu.goToPage(dayid);
	}
}

function hideDetails(){
	if($("#details-cover").hasClass('show')){
		$("#details").removeClass('flip');
		$("#details-cover").removeClass('fade');
		$("#details-cover, #details").removeClass('show');
	}
}

function createDate(date){
	var arr = date.split(/[- :]/);
    return new Date(arr[0], arr[1]-1, arr[2], arr[3], arr[4], arr[5]);
}

function navArrows(){
	$(this).addClass("hit");
	_this = this;
	setTimeout(function(){
		if($(_this).hasClass("r")){
			header_menu.next();
		}else{
			header_menu.prev();
		}
	},10);
}

function swapheader_menu(id){
	// STORE ID
	currentSection = id;
	
	console.log("currentSection:"+currentSection);
	
	// CLEAR DETAILS
	hideDetails();
	
	var dayid = (currentDate-startDate)/(24*60*60*1000);
	
	
	if(id==0){
		header_menu.data = dayTitles;
		header_menu.onFlip(changeSchedule);
		header_menu.update();
		header_menu.goToPage(dayid);
		jumpToToday();
	}else if(id==1){
		header_menu.data = [""];
		header_menu.onFlip(sportsList);
		header_menu.update();
		header_menu.goToPage(0);
	}else if(id==2){
		header_menu.data = medalsTitles;
		header_menu.onFlip(changeMedals);
		header_menu.update();
		header_menu.goToPage(yearid);
	}else{
		header_menu.data = [""];
		header_menu.onFlip(function(){console.log("EMPTY CALL");});
		header_menu.update();
		header_menu.goToPage(0);
	}
	
}

function updateAfterDownload(){
	console.log("updateAfterDownload");
	currentNews = false;
	swapheader_menu(currentSection);
}

function resetScroll(offset,noscroll,speed){
	if(offset==null){
		offset = myScroll.options.topOffset;
	}
	var offset = offset ? offset : 0;
	var s = speed ? speed : 0;
	myScroll.options.topOffset = offset;
	myScroll.refresh();
	if(!noscroll){
		var y = 0; //scrollPositions[currentSection];
		myScroll.scrollTo(0,y,s);
	}
}
function changeSchedule(e){
	console.log('changeSchedule');

	window.clearInterval(timelineInterval);
	
	changeTitle();
	changeDate();
	
	if($("#view-toggle").text()=="GRID"){
		drawList();
	}else{
		drawGrid();
	}
	resetScroll(0,false,0);
}

function changeMedals(){
	console.log('changeMedals');
	_currentDownloadKey = -1;
	changeTitle();
	yearid = header_menu.page;
	loadResults();
}

function sportsList(){
	console.log('show sports');
	var html = "";
	if($("body").hasClass('intro')){
		html = "<div class='sport-link all'><div class='star "+on+"'></div>Select All</div>"
	}
	var allon = true;
	for(var sport in sports){
		var on = _settings.favourites[sports[sport]] ? 'on' : '';
		if(on==''){
			allon = false;
		}
		html += "<div class='sport-link'><div class='star "+on+"'></div>"+sports[sport]+"</div>";
	}
	if(allon){
		$(".all-sport-button").addClass('toggle');
	}else{
		$(".all-sport-button").removeClass('toggle');
	}
	$(".panel-left .panel-scroll").html(html);
	myScrollLeft.refresh();
	if(!$("#page-holder").hasClass('insport')){
		myScrollLeft.scrollTo(0,0,0);
	}
}


function showSportDay(id){
	var todaysEvents = [];
	for(var date in data){
		for(var sport in data[date]){
			var events = data[date][sport];
			for(var i= 0 ; i < events.length ; i++){
				events[i].id = i;
			}
			if(sport == id){
				todaysEvents = todaysEvents.concat(events);
			}
		}
	}
	$("#panel-title-right").html(id);
	drawList(todaysEvents);
	myScrollRight.refresh();
	myScrollRight.scrollTo(0,0,0);
}

function changeTitle(){
	hideDetails();
	for (i=0; i<3; i++) {
		var upcoming = header_menu.masterPages[i].dataset.upcomingPageIndex;
		if (upcoming != header_menu.masterPages[i].dataset.pageIndex) {
			$(header_menu.masterPages[i]).html("<span>"+header_menu.data[upcoming]+"</span>");
		}
	}
    var id = header_menu.page;
    var total = header_menu.data.length;
    $(".arrow").removeClass("disable");
    if(id==0){
        $(".arrow.l").addClass("disable");
    }
    if(id==total-1){
        $(".arrow.r").addClass("disable");
    }
}

function drawGrid(){
	var html = '';
	var html_titles = '';
	
	var todaysEvents = getEvents();
	first_Pos = 100;
	Object.keys(todaysEvents).sort().forEach(function(sport) {
		var events = todaysEvents[sport];
		if(_settings.favourites[sport]){ // HIDE EVENTS NOT IN FAVOURITES
			html += "<div class='row'>"+createEventsRow(sport,events)+"</div>";
			html_titles += "<div class='row-title title-spaced'>"+sport+"</div>";// &raquo;
		}
	});

	var id = header_menu.page;
	if(!html){
		if(id<2 && _settings.games==0){
			html_titles += "<div class='morefaves'>No favourite events on this day<br />Add some <div class='small-star'></div>s in the SPORTS tab<br /><br /><div class='note'>Note: there is only Football on this day</div></div>";
		}else if(id==2 && _settings.games==0){
			html_titles += "<div class='morefaves'>No favourite events on this day<br />Add some <div class='small-star'></div>s in the SPORTS tab<br /><br /><div class='note'>Note: there is only Archery on this day</div></div>";
		}else{
			html_titles += "<div class='morefaves'>No favourite events on this day<br />Add some <div class='small-star'></div>s in the SPORTS tab</div>";
		}
		//html_titles += "<div class='show-all'>Show all</div>";
	}else{
		if(id<3){
			html_titles += "<div class='notmany'>There aren't many events today.<br />Swipe across &harr; to see them.</div>";
		}
	}
	
	// IF IT'S TODAY DRAW A TIMELINE
	var d = new Date();
	//_settings.tz_offset = -1; // TESTING
	var now = new Date(d.getTime()+(_settings.tz_offset*3600000));
	var dayid = Math.floor((now-startDate)/(24*60*60*1000));
	if(dayid==header_menu.page){
		html+="<div class='time-line'></div>";
	}

	$("#content, #sport-titles").hide();
	$("#sport-titles").html(html_titles);
	setHTML(html);
	$("#content, #sport-titles").show();
	myScroll.refresh();
	
	if(dayid==header_menu.page){
		updateTimeline();
		timelineInterval = setInterval(updateTimeline,300000); //300000// Update every 5 mins;
	}
	
}

function updateTimeline(){
	var d = new Date(new Date().getTime()+(_settings.tz_offset*3600000));
	var hours = d.getHours();
	var mins = d.getMinutes()/60;
	var x = 100*(((hours+mins)-8)/16);
	$(".time-line").css({left:x+"%"});
	console.log("updating timeline " + x);
}


function setHTML(html, cache, key){
	var content = document.getElementById('content');
	content.innerHTML = html;
}

function getEvents(){
	var dateKey = getDateKey(currentDate);
	return data[dateKey];
}
function getDateKey(date){
	return date.getFullYear()+"-"+pad(date.getMonth(),2)+"-"+pad(date.getDate(),2);
}

function drawTimeBar(){
	var html = '';
	var hour = 8;
	for(var i = 0 ; i < 16 ; i++){
		var x = 1500*(i/16);
		html += "<div class='hour' style='left:"+x+"px'>"+formatTime(hour,true)+"</div>";
		hour++;
	}
	$("#time-bar").html(html);
}


function createEventsRow(sport, events){
	sortByDate(events);
	var html = "<div class='events'>";
	var dKey = getDateKey(currentDate)+"|"+sport+"|";
	for(var i = 0 ; i < events.length ; i++){
			var e  = events[i];
			var ehtml =  $('<div>' + e.INFO + '</div>').text();
			var title = ehtml.split(":").slice(1).join(":").slice(0,40)+"&#133;";
			var time = formatTime(e.START);
			var hour = e.START.getHours();
			var mins = e.START.getMinutes()/60;
			var x = 100*(((hour+mins)-8)/16);

			//var width = (100*((e.END.getHours()-8)/16))-x;
			var dataid = dKey+i;
			var e2 = events[i+1];
			if(e2){
				var nexttime = e2.START.getHours();
				var nexttimemins = e2.START.getMinutes()/60;
				var nextx = 100*(((nexttime+nexttimemins)-8)/16);
				var width = nextx-x;
			}else{
				width = 100-x;
			}
			
			if(x<first_Pos){
				first_Pos = x;
			}
			var first = '';
			if(x==0){first = "first-event";}
			var medal = "";
			if(e.ceremony==1){medal = "<div class='medal-icon'></div>";}
			
			html += "<div class='event "+first+"' data-id='"+dataid+"' style='width:"+width+"%;left:"+x+"%'><div class='time'>"+time+"</div>"+medal+title+"</div>";
	}

	html+="</div>";
	return html;
}

function drawList(evts){

	if(!evts){
		var todaysEvents_temp = getEvents();
		var todaysEvents = [];
		
		for(var sport in todaysEvents_temp){
			var events = todaysEvents_temp[sport];
			for(var i= 0 ; i < events.length ; i++){
				events[i].id = i;
			}
			todaysEvents = todaysEvents.concat(events);
		}
	}else{
		var todaysEvents = evts;
	}
	
	sortByDate(todaysEvents);
	
	if(!evts){
		var html = "<div class='padscroll'>";
	}else{
		var html = "";
	}
	var old_time, old_sport, old_day;
	
	for (i = 0; i < todaysEvents.length; i++) {
		var event = todaysEvents[i];
		
		if(!_settings.favourites[event.SPORT] && !evts){continue;} // HIDE EVENTS NOT IN FAVOURITES
		
		var time = formatTime(event.START);
		var dataid = getDateKey(event.START)+"|"+event.SPORT+'|'+event.id;
		
		var dayid = Math.floor((event.START-startDate)/(24 * 60 * 60 * 1000));
		var day = dayTitles[dayid];
		
		// MARK AN EVENT AS LIVE
		var islive = "";
		var d = new Date();
		var now = new Date(d.getTime()+(_settings.tz_offset*3600000)); // COMPENSATE FOR OTHER TIMEZONES;
		if((now>=event.START && now<=event.END) || (now>=event.START && now<=new Date(event.START.getTime()+(0.25* 60 * 60 * 1000)))){ // IF NEAR 15 mins
			var islive = "live";
		}
		
		if(!evts){
			if(time!=old_time){
				if(old_time){
					html += '';
				}
				html += "<div class='divide'></div><div class='list-time'>"+time+"</div>";
				old_time = time;
				old_sport = -1;
			}
			
			html+= "<div class='event-tap' data-id='"+dataid+"'>";
			if(event.SPORT!=old_sport){
				html+= "<div class='list-title "+islive+"'>"+event.SPORT.toUpperCase()+"</div>";
				old_sport = event.SPORT;
			}
		}else{
			
			if(day!=old_day){
				
				html+= "<div class='divide'></div><div class='list-time'>"+day+"</div>";
				old_day = day;
				old_time = -1;
			}
			html+= "<div class='event-tap' data-id='"+dataid+"'>";
			if(time!=old_time){
				if(old_time){
					html += '';
				}
				html += "<div class='list-title "+islive+"'>"+time+"</div>";
				old_time = time;
			}

		}

		var medal = "";
		if(event.ceremony==1){
			medal = "<div class='medal-icon'></div>";
		}
		
		var info = event.INFO.split(":").slice(1).join(":");
		if(event.SPORT!="Ceremonies"){
			info = info;
		}
		html+= "<div class='list-text'>"+medal+info+"</div></div>";
	}

	if(evts){
		$(".panel-right .panel-scroll").html(html);
	}else{
		if(!$(html).text()){
			var did = header_menu.page;
			if(did<2 && _settings.games==0){
				html += "<div class='morefaves'>No favourite events on this day<br />Add some <div class='small-star'></div>s in the SPORTS tab<br /><br /><div class='note'>Note: there is only Football on this day</div></div>";
			}else if(did==2 && _settings.games==0){
				html += "<div class='morefaves'>No favourite events on this day<br />Add some <div class='small-star'></div>s in the SPORTS tab<br /><br /><div class='note'>Note: there is only Archery on this day</div></div>";
			}else{
				html += "<div class='morefaves'>No favourite events on this day<br />Add some <div class='small-star'></div>s in the SPORTS tab</div>";
			}
		}
		html+="</div>";

		setHTML(html);
	}

}

function sortByDate(arr){
	arr.sort(function(a, b){
	    var keyA = new Date(a.START),
	    keyB = new Date(b.START);
	    if(keyA < keyB) return -1;
	    if(keyA > keyB) return 1;
	    return 0;
	});
}


function formatTime(time,num,raise){
	if(num){
		var hour = time;
		var min = 0;
	}else{
		var hour = time.getHours(); // +_settings.tz_offset ?
		var min = time.getMinutes();
	}
	if(_settings.standardclock){
		var ap = "AM";
		if(hour>=12){
			ap = "PM";
		}
		hour = hour>12?hour-12:hour;
	}else{
		ap = "";
	}
	if(min){
		min = min<10?":0"+min:":"+min;
	}else{
		if(_settings.standardclock){
			min = "";
		}else{
			min = ":00";
		}
	}
	if(raise){
		return hour+min+"<span class='ap'>"+ap+"</span>";
	}else{
		return hour+min+ap;
	}
}


function changeDate(by){
	var oneday = 24 * 60 * 60 * 1000;
	currentDate.setTime(startDate.getTime() + (oneday*header_menu.page));
}


function pad(numNumber, numLength){
	var strString = '' + numNumber;
	while(strString.length<numLength){
		strString = '0' + strString;
	}
	return strString;
}


function loadNews(second){
    $("#sport-titles").html("");
	if(!second){
		if(currentNews){
			setHTML(currentNews);
			resetScroll(55);
			return false;
		}else{
			resetScroll(0);
			var html = "<div class='pulltorefresh'></div><div class='oops'></div><div class='padscroll'></div>";
			setHTML(html);
		}
		
	}
	$(".pulltorefresh").html("<div class='loading-icon'></div>Loading...");
	var key = newsID[0];
	_loadFile(key,'GoogleNews.csv', parseNews, newsID[1]); // Updated News (sheet 3)
}

function parseNews(data){

	var powered = this[0][0];
	var data = this.slice(1);
	var html = "<div class='pulltorefresh'>Pull down to refresh <div class='lastupdated'></div></div><div class='oops'></div><div class='padscroll'>";
	
	for(var i = 1 ; i < data.length-1 ; i++){
		var d = data[i];
		var title = d[0];
		var link = d[1];
		var img = d[2]; //.replace('6.jpg','11.jpg');
		var credit = d[3];
		html += "<div class='news-item' data-link='"+link+"'><div class='news-image' style='background-image:url("+img+")'></div>";
		html += "<div class='news-title'>"+title+"<div class='news-story'>"+credit+"</div></div></div>";
	}	
    html += "<div class='provided'>"+powered+"</div>"
	html += "<div class='clear'></div></div>";
	currentNews = html;
	
	setHTML(html);
    resetScroll(55,true,300);
    
	$(".news-item").live(event_down, function(){
        down = true;
		var _that = $(this);
		window.clearTimeout(hitDelay);
		hitDelay = setTimeout(function(){
			_that.addClass('hit');
		},150);
     }).live(event_release,function(){
		var _that = $(this);
		window.clearTimeout(hitDelay);
		if(down){
			_that.addClass('hit');
			hitDelay = setTimeout(function(){
				_that.removeClass('hit');
            	var url = _that.attr("data-link");//.slice(7).split(".html")[0]+".html";
				_openurl(url);
            	down = false;
            });
        }
        return false;
	});

}

_openurl = function(url){
    if(_PG){
    	if(android){
    		navigator.app.loadUrl(url, { openExternal:true } ); 
    	}else{
    		window.plugins.childBrowser.showWebPage(url);
    	}
    }else{
    	window.open(url,"_blank");
    }
}


function loadResults(){

	$("#sport-titles").html("");
	setHTML("");
	
	var m = medals[yearid];

	// IF NO RESULTS ARE LOADED...
	if(!m.medals.length){
		html = "<div class='pulltorefresh'></div><div class='oops'></div><div class='padscroll'></div>";
		setHTML(html);
		resetScroll(0);
		loadLiveResults();
		return false;
	}

	drawResults(m,facts[_settings.games][m.year], false, "no_message");
}

function drawResults(games_medals,games_facts,zip, message){
		var html = "";
		window.games_medals = games_medals;
		
		var date = new Date();
		date = date.toUTCString();
		var days_left = Math.floor((startDate-(new Date()))/(24 * 60 * 60 * 1000))+1;

		if(games_facts=="nofacts"){
			if(days_left>0){
				html = "<div class='pulltorefresh'>Pull down to refresh <div class='lastupdated'>Last updated: "+date+"</div></div><div class='oops'></div><div class='padscroll'><div class='results-2012-overview'>The 2012 Paralympics haven't started yet<div class='countdown'>They begin in "+days_left+" days</div>Click the arrow to view previous medals</div><div class='gsb'>Rank/Nation</div><div class='medal-holder'>";
			}else if(message!="no_message"){
				html = "<div class='pulltorefresh'>Pull down to refresh <div class='lastupdated'>Last updated: "+date+"</div></div><div class='oops'></div><div class='padscroll'><div class='results-message'>"+message+"</div><div class='gsb'>Rank/Nation</div><div class='medal-holder'>";
			}else{
				html = "<div class='pulltorefresh'>Pull down to refresh <div class='lastupdated'>Last updated: "+date+"</div></div><div class='oops'></div><div class='padscroll'><div class='gsb'>Rank/Nation</div><div class='medal-holder'>";
			}
			var offset = 55;
		}else{
			var offset = 0;
			html = "<div class='padscroll'><div class='results-overview'><div class='oh'>"+games_facts+" <a href='#' class='wiki'>Continue reading on Wikipedia</a></div></div><div class='gsb'>Rank/Nation</div><div class='medal-holder'>";
		}
		var length = games_medals.medals.length>20 ? 20 : games_medals.medals.length;
		for(var i = 0 ; i < length ; i++){
			var m = games_medals.medals[i];
			html += createMedalRow(m,i);
		}
		if(games_medals.medals.length>20){
			html += "<div class='show-all-medals'>Show all</div>";
		}
		html += "</div></div>";
		setHTML(html);
		resetScroll(offset,zip);
}

function createMedalRow(m,i){
	var html = "";
	html += "<div class='medal-row'>";
	html += "<div class='position'>"+(i+1)+"</div>";
	var nation = m[0].toUpperCase().split("(");
	if(nation.length>1){
		html += "<div class='nation'>"+nation[0]+" <span class='code'>("+nation[1]+"</span></div>";
	}else{
		html += "<div class='nation'>"+m[0].toUpperCase()+"</div>";
	}
	html += "<div class='medal t'>"+m[4]+"</div>";
	html += "<div class='medal b'>"+m[3]+"</div>";
	html += "<div class='medal s'>"+m[2]+"</div>";
	html += "<div class='medal g'>"+m[1]+"</div>";
	html += "</div>";
	return html;
}

function showRestofResults(){
	var html = "";
	for(var i = 20 ; i < games_medals.medals.length ; i++){
		var m = games_medals.medals[i];
		html += createMedalRow(m,i);
	}
	$(".show-all-medals").remove();
	$(".medal-holder").append(html);
	myScroll.refresh();
}

function loadLiveResults(){
	$(".pulltorefresh").html("<div class='loading-icon'></div>Loading...");
	var key = resultID[0];
	_loadFile(key,'2012Medals.csv', formatResults, resultID[1]);
}

// REUSABLE FILE LOADING

_loadFile = function(key,saveas,func,page){
	if(!page){page=0;}
	_currentDownloadKey = key;
	var nocache = (new Date).getTime();
	if(_PG){
		var file = "https://docs.google.com/spreadsheet/pub?key="+key+"&single=true&gid="+page+"&output=csv&no-cache="+nocache;
		fileTransfer = new FileTransfer();
		var doc = documentRoot + '/' + saveas;
		fileTransfer.download(
		    file,
		    doc,
		    function(){
		    	console.log("Finished downloading!");
				if(key==_currentDownloadKey){
					console.log("Key Matched!");
					_ajax(doc, func, 'text', key);
				}
		    },
		    _error
		);
	}else{
		var file = "https://spreadsheets.google.com/feeds/list/"+key+"/od6/public/basic?alt=json-in-script&gid="+page+"&no-cache="+nocache;
		_ajax(file, func, 'jsonp', key);
	}
}

_ajax = function(file, func, type, key, notarray){
	console.log("LOADING VIA AJAX");
	_currentDownloadKey = key;
	var data;
	$.ajax({
	  url: file,
	  timeout:20000,
	  dataType: type,
	  success: function(data){
		console.log("FINISHED LOADING VIA AJAX");
		console.log(_currentDownloadKey);

		if(key!=_currentDownloadKey){return false;}
		   
				   
		$(".oops").removeClass("live");
		
		if(!notarray){
			if(type=='text'){
				data = CSVToArray(data);
			}else{
				data = JSONToArray(data);
			}
		}
	  	func.apply(data);
	  },
	  error: _error
	});
}

_error = function(error, textStatus, errorThrown){
	console.log("Error");
	if($("body").hasClass("flip")){
		$(".update").html("Oops! no internet. Try again.");
	}else{
		var html = "<b>Oops! we couldn't download at this moment.</b><br />Please check your 3G or WiFi connection and try again.";
		$(".oops").html(html).addClass("live");
		if(_currentDownloadKey!="datekey"){
			resetScroll(55,true);
		}
	}
}


function formatResults(){
	var message = this[0][6];

	var m = medals[yearid];
	for(var i = 0 ; i < this.length ; i++){
		this[i] = this[i].slice(1);
	}
	m.medals = this.slice(1);

	drawResults(m, "nofacts",true, message);
	//navigator.notification.vibrate(300);
}

function checkUpdate(shhh){
	silent = shhh;
	$(".update").html("Checking...");
	var key = scheduleID[0];
	_loadFile(key,'2012Events.csv', isUpdate, 1);
}

function isUpdate(){
	_newupdateid = this[0][0];
	if(_newupdateid!=_settings.updated){
		if(silent){
			console.log("there is an update");
			$("#an-update").slideDown(300);
		}else{
			updateEvents();
		}
	}else{
		$(".update").html("All up to date!");
		getTimezone();
	}
	silent = false;
}

function updateEvents(){
	$(".update").html("Downloading update...");
	var key = scheduleID[0];
	_loadFile(key,'2012Events.csv', formatUpdate, scheduleID[1]);
}

function formatUpdate(){
	var dt = this;
	var _events = new Object();
	for(var i = 0 ; i < dt.length ; i++){
		var d = dt[i];
		var date = new Date(d[0]);
		
		if(!isNaN(date)){
			var obj = new Object();
			var datekey = getDateKey(date);
			obj.SPORT = d[3];
			obj.START = new Date(d[0]);
			obj.END = new Date(d[1]);
			obj.INFO = d[2];
			obj.LOC = d[4];
			obj.ceremony = 0;
			
			var infolower = obj.INFO.toLowerCase();
			
			if(infolower.indexOf(" final") !=-1 || infolower.indexOf(" medal") != -1){
				obj.ceremony = 1;
			}
			
			if(!_events[datekey]){
				_events[datekey] = new Object();
			}
			if(!_events[datekey][obj.SPORT]){
				_events[datekey][obj.SPORT] = new Array();
			}
			
			// MERGE IF START AT SAME TIME
			var curr = _events[datekey][obj.SPORT];
			var alreadySet = false;
			for(var z = 0 ; z < curr.length ; z++){
				if(curr[z].START.getTime() == obj.START.getTime()){
					curr[z].INFO += " &middot; "+ obj.INFO.split(":").slice(1).join(":");
					if(obj.ceremony==1){curr[z].ceremony = 1;}
					alreadySet = true;
					break;
				}
			}
			if(!alreadySet){
				_events[datekey][obj.SPORT].push(obj);
			}
		}
		
	}
	
	data = _events;
	_storage.setItem('_go2012_data_'+_settings.games, JSON.stringify(data));
	setGames();
	updateAfterDownload();
	$(".update").html("All up to date!");
	getTimezone();
	_settings.updated = _newupdateid;
	saveSettings();
}

function get_nth_suffix(date) {
   switch (date) {
     case 1:
     case 21:
     case 31:
        return 'st';
     case 2:
     case 22:
        return 'nd';
     case 3:
     case 23:
        return 'rd';
     default:
        return 'th';
   }
 }
 
 
function JSONToArray(data){
	var d = data.feed.entry;
	var arr = [];
	for(var i = 0 ; i < d.length ; i++){
		var n_arr = [];
		var title = d[i].title["$t"];
		n_arr.push(title);
		var c = d[i].content["$t"];
		c = c.split(": ").slice(1);
		for(var z = 0 ; z < c.length ; z++){
			var item = c[z].split(",")[0];
			n_arr.push(item);
		}
		arr.push(n_arr);
	}
	return arr;
}

function CSVToArray( strData, strDelimiter ){
    strDelimiter = (strDelimiter || ",");
    var objPattern = new RegExp(
                                (
                                 // Delimiters.
                                 "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
                                 
                                 // Quoted fields.
                                 "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
                                 
                                 // Standard fields.
                                 "([^\"\\" + strDelimiter + "\\r\\n]*))"
                                 ),
                                "gi"
                                );
    var arrData = [[]];
    var arrMatches = null;
    while (arrMatches = objPattern.exec( strData )){
        var strMatchedDelimiter = arrMatches[ 1 ];
        if (
            strMatchedDelimiter.length &&
            (strMatchedDelimiter != strDelimiter)
            ){
            arrData.push( [] );
        }
        if (arrMatches[ 2 ]){
            var strMatchedValue = arrMatches[ 2 ].replace(new RegExp( "\"\"", "g" ),"\"");
        } else {
            var strMatchedValue = arrMatches[ 3 ];
            
        }
        arrData[ arrData.length - 1 ].push( strMatchedValue );
    }
    return arrData;
}


$.fn.preload = function() {
    this.each(function(){
        $('<img/>')[0].src = this;
    });
}

