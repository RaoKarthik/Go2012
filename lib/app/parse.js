/*
*	
*	AllofUs
*	Written by Nic Mulvaney (nic@nicmulvaney.com)
*
*/

$(document).ready(init);



// Global Variables
/* ------------------------------------------------------------ */
var currentDate = new Date(2012,07,03);
var events = new Object();

/* ------------------------------------------------------------ */
function init(){
	$.ajax({
		url: 'events.ics',
		success: function(data) {
			parseData(data);
		}
	});
}

function unwantednode(name){
	var unwanted = ["CREATED", "DTSTAMP","END","SEQUENCE","TRANSP","UID"];
	for(var i = 0 ; i < unwanted.length ; i++){
		if(unwanted[i]==name){
			return true;
		}
	}
	return false;
}

function parseData(data){
	var data = data.split("BEGIN:VEVENT\r\n");
	console.log(data.length);
	for(i = 1 ; i < data.length ; i ++){
		var nodes = data[i].split("\r\n");
		var obj = new Object();
		for(var z = 0 ; z < nodes.length ; z++){
			var nodename = nodes[z].split(":",1)[0];
			var nodevalue = nodes[z].split(":").slice(1).join(":").split('\\').join("");
			if(nodename && nodevalue && !unwantednode(nodename)){
				if(nodename=="LOCATION"){
					obj["LOC"] = nodevalue;
				}else if(nodename=="SUMMARY"){
					obj["INFO"] = nodevalue;
				}else if(nodename=="DTSTART"){
					obj["START"] = formatDate(nodevalue);
				}else if(nodename=="DTEND"){
					obj["END"] = formatDate(nodevalue);
				}else{
					obj[nodename] = nodevalue;
				}
			}
			if(nodename=="SUMMARY"){
				var sport = nodevalue.split(":")[0];
			}
			if(nodevalue.indexOf(" MEN")!=-1){
				obj.M = 1;
			}
			if(nodevalue.indexOf("WOMEN")!=-1){
				obj.W = 1;
			}
			if(nodevalue.indexOf("victory ceremony")!=-1){
				obj.ceremony = 1;
			}		
		}
		if(events[sport]){
			events[sport].push(obj);
		}else{
			events[sport] = new Array();
		}
		


	}
	var json = JSON.stringify(events);
	console.log(json);
	//$("body").html(data[1]);
}

function formatDate(date){
	var date = date.splice(4,0,"-").splice(7,0,"-").splice(10,0," ").splice(11,1,"").splice(13,0,":").splice(16,0,":").splice(19,1,"");
	return date;
}

String.prototype.splice = function( idx, rem, s ) {
    return (this.slice(0,idx) + s + this.slice(idx + Math.abs(rem)));
};

