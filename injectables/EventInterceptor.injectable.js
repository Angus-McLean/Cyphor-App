
(function () {

	// used to programmatically assign what the clonedObject's values should be overwritten with
	var targetElem = null;
	var overwriteValue = null;

	// CloneObject
	function CloneObject(orig) {
		var obj = Object.create(Object.getPrototypeOf(orig));
		for(var i in orig){
			(function (j){
				Object.defineProperty(obj, j, {
					get : function () {
						if(typeof orig[j] == 'function') {
							return orig[j].apply(orig, arguments);
						} else {
							if(overwriteValue && overwriteValue.fields[j]) {
								return overwriteValue.fields[j];
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

	// receive CyphorInputEvents and trigger fake input
	document.addEventListener('CyphorInputEvent', function (cyphorEvent) {
		console.log('received CyphorInputEvent', cyphorEvent);

		overwriteValue = cyphorEvent.detail;

		if(cyphorEvent.detail === null){
			targetElem = null;
		} else {
			targetElem = cyphorEvent.target;
			simualteEvent(cyphorEvent);
			overwriteValue = null;
			targetElem = null;
		}
	}, true);

	// rewrite the functionality of addEventListener to inject possibility to clone native events
	EventTarget.prototype.addEventListener = (function () {
		var orig = EventTarget.prototype.addEventListener;
		return function(eventType,listnerFn){
			if(eventType !== 'invalid'){
				arguments[1] = function () {
					if(overwriteValue && overwriteValue.type === eventType){
						arguments[0] = CloneObject(arguments[0]);
						window.event = arguments[0];
					}
					return listnerFn.apply(this, arguments);
				};
			}
			return orig.apply(this, arguments);
		};
	})();

	function simualteEvent(cyphorEvent) {
		var ev;
		if(cyphorEvent.detail.init.initializationType === 'create'){
			ev = document.createEvent(cyphorEvent.detail.init.eventFamily);
			ev[cyphorEvent.detail.init.initMethod].apply(ev, cyphorEvent.detail.init.initArgs);
		} else if(cyphorEvent.detail.init.initializationType === 'construct') {
			var evConstr = window[cyphorEvent.detail.init.eventFamily];
			var constrArgs = [evConstr].concat(cyphorEvent.detail.init.initArgs);
			var builder = evConstr.bind.apply(evConstr, constrArgs);
			ev = new builder();
		}
		cyphorEvent.target.dispatchEvent(ev);
	}
})();
