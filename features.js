/* Feature are map elements representing geographic locations. 
 * There are 3 base features:
 *   1. point
 *   2. polyline
 *   3. polygon
 *
 */
 
 var Feature = function(type){
    this.type=type;   
 }
 
Feature.prototype.create = function(data){
};

Feature.prototype.destroy = function(){
};

Feature.prototype.show = function(){
};

Feature.prototype.hide = function(){
};

Feature.prototype.save = function(){
};

Feature.prototype.load = function(){
};

Feature.protoype.onClick = function(){
};

