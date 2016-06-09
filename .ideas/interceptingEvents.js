// intercept an object (not fully complete I don't think)
KeyboardEvent = (function () {
	var orig = KeyboardEvent;

	return function () {
		console.log('new KeyboardEvent');
		var real = new (Function.prototype.bind.apply(orig, arguments));
		var obj = Object.create(orig.prototype);

		console.log('new KeyboardEvent', real, obj);
		// add whatever properties you want to object here..

		return obj;
	};
})()

// CloneObject
function CloneObject(orig) {
	var obj = Object.create(Object.getPrototypeOf(orig));
	console.log('cloned');
	for(var i in orig){
		(function (j){
			Object.defineProperty(obj, j, {
				get : function () {
					if(typeof orig[j] == 'function') {
						GLOBAL_EVENTS[orig.type][j] = 'function';
						return orig[j].bind(orig)
					} else {
						if(j == 'isTrusted') {
							return true;
						}
						GLOBAL_EVENTS[orig.type][j] = orig[j];
						return orig[j];
					}
				},
				set : function (v) {
					if(typeof v == 'function') {
						return orig[j] = v.bind(orig);
					} else {
						return orig[j] = v;
					}
				},
				enumerable : orig.propertyIsEnumerable(j)
			});
		})(i);
	}
	return obj;
}



var GLOBAL_CLONE;
var GLOBAL_EVENTS = {};
var cloneObjsArr = ["focus", "focusin", "mousedown", "selectionchange", "mouseup", "click", "keydown", "keypress", "textInput", "input", "keyup", "paste"];

EventTarget.prototype.addEventListener = (function () {
	var orig = EventTarget.prototype.addEventListener;
	return function(){
		var eveType = arguments[0]
		var execFunc = arguments[1];
		arguments[1] = function () {
			//console.log(arguments);
			if(GLOBAL_CLONE && (this == window || this instanceof Node) && cloneObjsArr.indexOf(eveType) >= 0){
				GLOBAL_EVENTS[arguments[0].type] = {};
				arguments[0] = CloneObject2(arguments[0], {});
			}
			return execFunc.apply(this, arguments);
		}
		return orig.apply(this, arguments);
	}
})();
