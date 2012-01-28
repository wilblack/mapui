Written by Wil Black, wilblack21@gmail.com
This work was originally inspired by my work at Advanced Research Corporation, http://oregonarc.com.
You are free to use this software for commercial and non-commercial use, free of charge provided you 
follow the FreeBSD License (see source code files).
Copyright (c) 2011

## See demo here
http://thedatamind.com/demos/mapui.html

=== Class Map ===
Main class to handle all mapping functions.


=== Attributes ===
height - STRING
width - STRING
center - ARRAY [lat , lon]
zoom - INETEGER
geom - ARRAY: Contents of the array are a mix of google.map.Markers, google.maps.Polygons, or google.maps.Polylines
nodes - ARRAY: Interal use.
segements - ARRAY
layers - ARRAY
mapType - google,maps.MapTypeId.MAPTYPE: MAPTYPE can be ROADMAP, HYBRID, SATELLITE 
scrollwheel - Boolean


=== Methods ===

init

show

hide

clear_all

list2polygon

resize

getLayerBounds

geocode_address 

showLatLng

createFeature

editFeature

make_polygon

draw_segemnts







