/* 
Written by Wil Black 05.15.2011

A javascript class that creates movable <UL> DOM Elements whose <LI>
can be dragged and dropped into one another. Styling is done with jQueryUI 1.8.11 
which can be gotten here http://jqueryui.com

Copyright 2011 Wil Black. All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are
permitted provided that the following conditions are met:

   1. Redistributions of source code must retain the above copyright notice, this list of
      conditions and the following disclaimer.

   2. Redistributions in binary form must reproduce the above copyright notice, this list
      of conditions and the following disclaimer in the documentation and/or other materials
      provided with the distribution.

THIS SOFTWARE IS PROVIDED BY WIL BLACK ''AS IS'' AND ANY EXPRESS OR IMPLIED
WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL WIL BLACK OR
CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

The views and conclusions contained in the software and documentation are those of the
authors and should not be interpreted as representing official policies, either expressed
or implied, of Wil Black.
*/

Map = {};
  Map.height = "550px"; 
  Map.width = "500px";
  Map.center = [44.565, -124];
  Map.zoom = 8;

  Map.geom=null;  // This needs to change to []. This is only the latest active geom
  Map.nodes=[];  // This is only the latest active nodes
  Map.segments=[]; // This is only the latest active segments
  Map.layers=[]; // A layer is a collection of features
  Map.mapType= google.maps.MapTypeId.ROADMAP;
  Map.scrollwheel = true;
  Map.features=[]; // All feature associated with the map.
  
  Map.activeStrokeWeight = 6;
  Map.inactiveStrokeWeight = 3;
  Map.activeStrokeColor = '#000000'; 
  Map.activeStrokeColor = '#FF0000';
  
Map.init = function(div){
    /* Draw a map in the canvas given by the CSS selector string div.
     * Must include 
     * <script type="text/javascript" src="http://maps.google.com/maps/api/js?sensor=false"></script>
     * 
     */
	this.div = $(div);
    this.div.css({width:Map.width,height:Map.height});	
    var center = new google.maps.LatLng(this.center[0],this.center[1]);
    var myOptions = {
      zoom: this.zoom,
	  center: center,
	  mapTypeId: this.mapType,
	  scrollwheel:this.scrollwheel,
    };
    myOptions.mapTypeControlOptions={mapTypeIds:[google.maps.MapTypeId.ROADMAP,
                                               'plain',
                                               google.maps.MapTypeId.HYBRID
                                               ]}
    Map.map = new google.maps.Map(Map.div[0], myOptions);
}

Map.show = function(feature){
    // Takes a list of features and shows them on the current map.
	for (i in feature){feature[i].geom.setMap(Map.map)}
};

Map.hide = function(feature){
    for (i in feature){ feature[i].geom.setMap(null); }
};

Map.features.hide_all = function() {
	for (i in Map.features){
		Map.features[i].hide();
	}
};

Map.clear_all = function(){
	// Clears all geometries used in createFeature()
	if (this.geom){
		this.geom.setMap(null);
		this.geom=null;
	}
	if (this.nodes.length){
		for (i in this.nodes){this.nodes[i].setMap(null);}
		this.nodes=[];
	}	
	if (this.segments.length){
		for (i in this.segments){this.segments[i].setMap(null);}
		this.nodes=[];
	}
};

Map.list2polygon = function(list){
	// Takes a list of lists of coordinates (lat, lon). Returns a polygon.
	// Use out.setMap(Map.map) to show on the map. 
	var path=[];
	for (i in list){
		path[i]=new google.maps.LatLng(list[i][0],list[i][1]);		
	}
	var out = new google.maps.Polygon({
		path:path,
		zIndex:-30,	
	});
	return out;
};

Map.list2polyline = function(list){
	// Takes a list of lists of coordinates (lat, lon). Returns a polygon.
	// Use out.setMap(Map.map) to show on the map. 
	var path=[];
	for (i in list){
		path[i]=new google.maps.LatLng(list[i][0],list[i][1]);		
	}
	var out = new google.maps.Polyline({
		path:path,
		zIndex:-30,	
	});
	return out;
};

Map.resize = function(layer){
	// Resizes and repositions a map to the elements in a given layer.
	//Map.map.setZoom(20);
	var bounds = this.getLayerBounds(layer);
	//Map.map.setCenter(bounds.getCenter());
	Map.map.fitBounds(bounds);
	if (Map.map.getMapTypeId=="hybrid" && Map.mapType.getZoom()>19){
		Map.map.setZoom(19);
	}
}

Map.getLayerBounds = function(layer){
	// Returns the bounds of a given layer.
	var bounds = new google.maps.LatLngBounds();
	for (i in layer.geom){
		if (layer.geom[i].position){bounds.extend(layer.geom[i].position);}
		else {
			var path = layer.geom[i].getPath();
			for (j=0;j<path.length;j++){bounds.extend(path.getAt(j))}
		}	
	}
	return bounds;
}

Map.geocode_address = function(address, show) {
    /* Geocodes an address and optionally displays it on the map. 
	  Inputs:
		address - String 
		show - Boolean, determines whether or not to show the marker on the map
	*/ 
	
	if (arguments.length==1) show=true;
  	geocoder = new google.maps.Geocoder()
	geocoder.geocode( { 'address': address}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
	    Map.map.setCenter(results[0].geometry.location);
	    map=null;
	    if (show==true) map=Map.map;
	    var marker = new google.maps.Marker({
	        map: map, 
	        position: results[0].geometry.location,
	     });
	    return marker;
      } else {
    	if (show==true) alert("Geocode was not successful for the following reason: " + status);
    	return {'error':status}
      }
    });
};

Map.showLatLng = function(latLng) {
	$('#coords').text(latLng.toUrlValue());
};

Map.createFeature = function (type) {
	var types = ['point','polygon','polyline','none'];
	var listeners=[]
	if (types.indexOf(type) == -1) {return "Error: "+type+" is not a valid Type.";}
	
	switch(type){
	case 'point':
		Map.geom = new google.maps.Marker({
			map:Map.map,
		});
		listeners[0] = new google.maps.event.addListener(Map.map,'mousemove',function(event){
			Map.geom.setDraggable(true);
			Map.geom.setPosition(event.latLng);
			$("[name=geom]").html("["+Map.geom.position.lat()+","+Map.geom.position.lng()+"]");
		});
		listeners[1] = new google.maps.event.addListenerOnce(Map.map,'mouseout',function(event){
			Map.geom.setMap(null);
			Map.geom=null;
		});
		listeners[2] = new google.maps.event.addListenerOnce(Map.map,'click',function(event){
			google.maps.event.removeListener(listeners[0]);
			google.maps.event.removeListener(listeners[1]);
			Map.geom.setPosition(event.latLng);
			coords = [Map.geom.position.lat(),Map.geom.position.lng()];			
			$("[name=geom]").val(JSON.stringify(coords));
			
		});
		listeners[3] = new google.maps.event.addListener(Map.geom,'dblclick',function(event){
			for (i in listeners){google.maps.event.removeListener(listeners[i]);}
			Map.geom.setDraggable(false);
			Map.geom.setPosition(event.latLng);
			
		});
		Map.features.push( new feature({'type':'point', 'geom':Map.geom}) );
		break;	
	case 'polygon':
		Map.make_polygon();
		
		break;
	case 'polyline':
		Map.make_polyline();
		break;
	case 'none':
		//mapObj.clearState('none');
		break;
	
	};
}

Map.editFeature = function (feature) {
	/* Takes in a single feature an makes it editable. feature is
	 * an object with the following keys
	 * 	- geom
	 *  - featuretype
	 *  - geomtype
	 *   
	 * 
	 * 
	 */
	var listeners=[]	
	switch(feature.geomtype){
	case 1: 	// Point
		Map.geom = new google.maps.Marker({
			position:new google.maps.LatLng(feature.geom[0],feature.geom[1]),
			map:Map.map,
			title:'What',
			draggable:true,
		});
		var layer = {};
		layer.geom==[g];
		Map.resize(layer);
		listeners[0] = new google.maps.event.addListener(Map.geom,'drag',function(event){
			$("[name=geom]").html("["+Map.geom.position.lat()+","+Map.geom.position.lng()+"]");
		});
		
		
		break;	
	case 3:			// Polygon
		var corners=[];
		for (i in feature.geom.slice(0,-1)) {
			corners.push(new google.maps.LatLng(feature.geom[i][0],feature.geom[i][1]));
		}		
		Map.make_polygon(corners);
		var layer = {};
		layer.geom = Map.nodes;
		Map.resize(layer);
		break;
	case 'polyline':
		
		break;
	case 'none':
		//mapObj.clearState('none');
		break;
	};
}

Map.make_polygon = function(corners) {
/* Takes in a corners array, corners are an array of google LatLngs.
 * They are not closed, this function closes them for you.
 * If no corners are given then it makes rectanlge based on the current
 * map boundary.
 */	
	if (!arguments.length){
		corners = Map._make_corners();
	} 
	this._draw_segments(corners, 'polygon');
};

Map.make_polyline = function(corners) {
	/* Takes in a corners array, corners are an array of google LatLngs.
	 * They are not closed, this function closes them for you.
	 * If no corners are given then it makes rectangle based on the current
	 * map boundary.
	 */	
		if (!arguments.length){
			corners = Map._make_corners();
		} 
		this._draw_segments(corners, 'polyline');
	};

Map._make_corners = function(){
	var b = Map.map.getBounds();
	var c = b.getCenter();
	var dx = .1*( b.getNorthEast().lng()-b.getSouthWest().lng() ) / 2;
	var dy = .1*( b.getNorthEast().lat()-b.getSouthWest().lat() ) / 2;
	var corners=[
		new google.maps.LatLng(c.lat() + dy , c.lng() - dx ),
	    new google.maps.LatLng(c.lat() + dy , c.lng() + dx ),
	    new google.maps.LatLng(c.lat() - dy , c.lng() + dx ),
	    new google.maps.LatLng(c.lat() - dy , c.lng() - dx )
	];
	return corners;
};

	
Map._draw_segments = function(corners, type){
	// Given a list of lists of corners draw segments spanning them.
	// And adds listeners to insert new corners in each segment.
		
	Map.nodes=[];  		// Google map markers that are the nodes of the polygon. 
	Map.segments=[]; 	// Google map polylines, the faces of the polygon.
	var listeners=[];
	var N = corners.length-1;	
	var i1; var i2;
	
	for (i=0;i<corners.length;i++){
		Map.nodes[i] = new google.maps.Marker({
			position:corners[i],
			draggable:true,
			shape:{coords:[8,8,8],type:'circle'},
			map:Map.map
		});
		new google.maps.event.addListener(Map.nodes[i],'drag',function(event){
			var index = Map.nodes.indexOf(this);
			if (index==0){i1=N;}
			else {i1=index-1;}
			i2=index;
						
			var index = Map.nodes.indexOf(this);
			if ( !(type=="polyline" && index==0) ){
				console.log("in")
				var path1 = Map.segments[i1].getPath();
				path1.setAt(1,event.latLng);
			}
			if ( !(type=="polyline" && index==N) ){
				var path2 = Map.segments[i2].getPath();
				path2.setAt(0,event.latLng);
			};
		});
				
				
		if (i==corners.length-1){tmp=[corners.slice(-1)[0], corners[0]];}
				
		else {tmp = [corners[i],corners[i+1]];}
		
		Map.segments[i] = new google.maps.Polyline({			
			path:tmp,
			map:Map.map,
		});
		listeners[i] = google.maps.event.addListener(Map.segments[i],'click', function(event){
			var path = this.getPath();	
			var index = Map.segments.indexOf(this);
			
			path.insertAt(1,event.latLng);
			var marker = new google.maps.Marker({position:event.latLng, map:Map.map, draggable:true});
			google.maps.event.addListener(marker, 'drag', function(event){
		    	path.setAt(1,event.latLng);
		    });
		    google.maps.event.addListener(marker, 'dragend', function(event){
		    	marker.setPosition(event.latLng);
		    	Map.nodes.splice(index+1,0,marker);
		    	marker.setMap(null);
				var corners =[];
				for(i in Map.nodes){
					corners[i]=Map.nodes[i].position;
					Map.nodes[i].setMap(null);
				}
				for (i in Map.segments){Map.segments[i].setMap(null);}
				Map._draw_segments(corners, type);
			});		
		});
				
		new google.maps.event.addListener(Map.segments[i],'mouseover',function(event){
			this.setOptions({
				'strokeWeight':Map.activeStrokeWeight,
				'strokeColor':Map.activeStrokeColor,
			});
		});
		
		new google.maps.event.addListener(Map.segments[i],'mouseout',function(event){
			this.setOptions({
				'strokeWeight':Map.inactiveStrokeWeight,
				'strokeColor':Map.inactiveStrokeColor,
			});	
		});
		
		
	}	// End for i in corners	
	
	// Removing the last segment if we are drawing a path
	if (type=="polyline"){
		var last = Map.segments.pop(-1);
		last.setMap(null);
	}
		
	coords=[];
	for (i in this.nodes){
		coords.push([this.nodes[i].position.lat(),this.nodes[i].position.lng()]);
	}
	if (type == 'polygon'){
		coords.push([this.nodes[0].position.lat(),this.nodes[0].position.lng()]);
	}
	$("[name=geom]").val(JSON.stringify(coords));
	
	Map.features.push(new feature({'type':type, 'geom':{'nodes':Map.nodes,'segments':Map.segments}}) );
	
	//this._node_listeners();
}	// End draw_nodes()


feature = function(fobj){
	this.geom=fobj.geom;
	this.type=fobj.type;
};

feature.prototype.hide = function(){
	if (this.type=="point"){
		this.geom.setMap(null);
	
	} else if (this.type=="polygon"){
		for (var j in this.geom.nodes){
			this.geom.nodes[j].setMap(null);
		}
		for (var j in this.geom.segments){
			this.geom.segments[j].setMap(null);
		}
	}
};
/****************************** MAP STYLES **************************************/

style1 = [
 {
   featureType: "administrative",
   elementType: "all",
   stylers: [
     { visibility: "off" }
   ]
 },{
   featureType: "landscape.natural",
   elementType: "all",
   stylers: [
     { visibility: "on" }
   ]
 }
];

