// CloneObject
function CloneObject(orig) {
	var obj = Object.create(Object.getPrototypeOf(orig));
	//console.log('cloned');
	for(var i in orig){
		(function (j){
			Object.defineProperty(obj, j, {
				get : function () {

					//if(!GLOBAL_EVENTS[orig.type][j]) { GLOBAL_EVENTS[orig.type][j] = []; }
					if(typeof orig[j] == 'function') {
						//GLOBAL_EVENTS[orig.type][j].push('function');
						return function () {
							var returnVal = orig[j].apply(orig, arguments);
							var argStr = '('+ [].join.call(arguments,',') +')';
							ACCESS_LOG.push(orig.type + '.'+ j + argStr +':'+returnVal);
							return returnVal;
						}

					} else {
						if(typeof orig[j] != 'object'){
							ACCESS_LOG.push(orig.type + '.'+j+':'+orig[j]);
							//GLOBAL_EVENTS[orig.type][j].push(orig[j]);
						}
						if(j == 'isTrusted') {
							return true;
						} else if (j == 'which') {
							return 13;
						} else if (j == 'keyCode') {
							return 13;
						} else {
							return orig[j];
						}

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
var ACCESS_LOG = [];
//var GLOBAL_EVENTS = {};
var cloneObjsArr = ["focus", "focusin", "mousedown", "selectionchange", "mouseup", "click", "keydown", "keypress", "textInput", "input", "keyup", "paste"];
var cloneObjsArr2 = ["selectionchange", "keydown", "keypress", "textInput", "input", "keyup", "paste"];
EventTarget.prototype.addEventListener = (function () {
	var orig = EventTarget.prototype.addEventListener;
	return function(){
		var eveType = arguments[0]
		var execFunc = arguments[1];
		arguments[1] = function () {
			//console.log(arguments);
			if(GLOBAL_CLONE && (this == window || this instanceof Node) && cloneObjsArr2.indexOf(eveType) >= 0){
				//GLOBAL_EVENTS[arguments[0].type] = {};
				arguments[0] = CloneObject(arguments[0], {});
				window.event = arguments[0];
			}
			return execFunc.apply(this, arguments);
		}
		return orig.apply(this, arguments);
	}
})();









function simulateInputEvent(element, type, character) {
	evt = new KeyboardEvent(type, {
		bubbles : true,
		key : character,
		ctrlKey : false,
		shiftKey : false,
		altKey : false,
		metaKey : false,
		repeat : false,
		charCode : character.charCodeAt(0),
		keyCode : character.charCodeAt(0),
		which : character.charCodeAt(0)
	});

	element.dispatchEvent(evt);
}

function simulateKeyEvent(element, type, character) {
	evt = new KeyboardEvent(type, {
		bubbles : true,
		key : character,
		ctrlKey : false,
		shiftKey : false,
		altKey : false,
		metaKey : false,
		repeat : false,
		charCode : character.charCodeAt(0),
		keyCode : character.charCodeAt(0),
		which : character.charCodeAt(0)
	});

	element.dispatchEvent(evt);
}

setTimeout(function () {
	ACCESS_LOG = []

	simulateKeyEvent(document.activeElement, 'keydown', 'a')
	simulateKeyEvent(document.activeElement, 'keypress', 'a')
	simulateKeyEvent(document.activeElement, 'keyup', 'a')
},2000);
