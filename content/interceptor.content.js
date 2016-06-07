console.log('interceptor.content.js');
(function (wind) {

	var interceptors = {};

	function addEventInterceptor (eventName, fn) {

		if(!interceptors[eventName]){

			// initialize interceptors list for that type of event
			interceptors[eventName] = [];

			// add the handler function
			window.addEventListener(eventName, function (event) {

				// handling the event
				var eveCont = this;

				// if any of the functions return something (ie false) this method should also return false
				var returnVal;
				interceptors[eventName].forEach(function (intercp) {
					if(intercp.element == event.target || (intercp.element.contains && intercp.element.contains(event.target))){
						returnVal = (returnVal !== undefined) ? returnVal : intercp.interceptor.call(eveCont, event);
					}
				});

				return returnVal;
			}, true);
		}

		interceptors[eventName].push({
			element : this,
			type : eventName,
			interceptor : fn
		});
	}

	// removes an individual event listener on a target or all listeners of that type on a target if true is second parameter ie fn===true
	function removeEventInterceptor (eventName, fn) {
		var elemCont = this;
		interceptors[eventName].forEach(function (interceptorObj, ind) {
			if(elemCont ==  interceptorObj.element && (interceptorObj.interceptor == fn || fn === true)){
				interceptors[eventName].splice(ind, 1);
			}
		});
	}

	wind.Element.prototype.addEventInterceptor = addEventInterceptor;
	wind.Element.prototype.removeEventInterceptor = removeEventInterceptor;


})(window);
