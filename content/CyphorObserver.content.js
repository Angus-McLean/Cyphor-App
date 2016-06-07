define('CyphorObserver', [], function () {

	console.log('CyphorObserver.content.js', arguments);

	var listeners = [];
	var index = {
		remove : [],
		insert : []
	};
	window.ObserverIndex = index;

	function processMutation (mutRec) {
		var _elemContext = this;

		// call listeners for "removed event"
		if(mutRec.removedNodes && mutRec.removedNodes.length){
			Array.prototype.forEach.call(mutRec.removedNodes, function (removedNode) {
				listeners.forEach(function (listener) {
					if(listener.target == removedNode ||  (removedNode.contains && removedNode.contains(listener.target))){
						listener.listener.call(listener.target, mutRec);
					}
				});
			});
		}

		// call listeners for "insert" event
		if(index.insert.length && mutRec.addedNodes && mutRec.addedNodes.length){
			Array.prototype.forEach.call(mutRec.addedNodes, function (addedNode) {
				index.insert.forEach(function (listener) {
					// check if the addedNode has value query selector or custom querying function
					if(addedNode && addedNode.querySelectorAll && addedNode.querySelectorAll(listener.target)){
						listener.listener.call(listener.target, mutRec);
					} else if(addedNode && typeof listener.target == 'function' && listener.target.call(addedNode)){
						listener.listener.call(listener.target, mutRec);
					}
				});
			});
		}

		// call listeners for "remove" event
		if(index.remove.length && mutRec.removedNodes && mutRec.removedNodes.length){


			index.remove.forEach(function (listener, ind) {
				// check if the mutation target is the listener target... this is the case when innerText of an element changes
				// could also use thisCyph.iframe.ownerDocument.contains(thisCyph.iframe) to see if the iframe no longer exists in the document
				// if(listener.target == mutRec.target || (mutRec.target.contains && mutRec.target.contains(listener.target))){
				// 	listener.listener.call(listener.target, mutRec);
				// 	// automatically clear the remove listeners
				// 	index.remove.splice(ind, 1);
				// } else {
					Array.prototype.forEach.call(mutRec.removedNodes, function (removedNode) {
						if(listener.target == removedNode || (removedNode.contains && removedNode.contains(listener.target))){
							listener.listener.call(listener.target, mutRec);
							// automatically clear the remove listeners
							index.remove.splice(ind, 1);
						} else if(removedNode instanceof Node && removedNode.parentElement == listener.target){
							// the value of the target element has changed.. ie removedNode is the innerText of the listener target
							listener.listener.call(listener.target, mutRec);
							// automatically clear the remove listeners
							index.remove.splice(ind, 1);
						}
					});
				// }
			});
		}
	}

	var globalObserver = new MutationObserver(function (muts) {
		muts.forEach(processMutation);
	});

	var globalObserverParams = {
		subtree : true,
		childList: true,
		attributes: true,
		attributeFilter: ['contenteditable']
	};

	globalObserver.observe(document, globalObserverParams);


	// target is either an Element (for removals), function, or querySelectorAll string (for insert)
	function on (eventName, target, fn) {
		// validate parameters
		if(Object.keys(index).indexOf(eventName) == -1 || (!target || (typeof target != 'string' && !(target instanceof Element) && typeof target != 'function')) || typeof fn != 'function'){
			console.error('invalid parameters for cyphor mutation event listener', arguments);
		}

		index[eventName].push({
			eventName : eventName,
			target : target,
			listener : fn
		});
	}

	function removeListener (eventName, elem) {
		index[eventName].forEach(function (listener, ind) {
			if(listener.target == elem){
				index[eventName].splice(ind, 1);
			}
		});
	}

	function addObserver (element, fn) {
		if(!element || !fn){
			console.error('invalid parameters for cyphor mutation observer');
		}
		listeners.push({
			target : element,
			listener : fn
		});
	}

	// removes the listener function for that element
	function removeObserver (elem) {
		listeners.forEach(function (listener, ind) {
			if(listener.target == elem){
				listeners.splice(ind, 1);
			}
		});
	}

	return {
		on : on,
		observe : addObserver,
		removeObserver : removeObserver,
		removeListener : removeListener
	};

});
require(['CyphorObserver'], function () {});
