define('CyphorObserver', [], function () {

	console.log('CyphorObserver.content.js', arguments);

	var listeners = [];
	var index = {
		remove : [],
		insert : [],
		change : []
	};
	window.ObserverIndex = index;

	function processMutation (mutRec) {
		var _elemContext = this;

		// call listeners for "insert" event
		if(mutRec.type === 'childList' && index.insert.length && mutRec.addedNodes && mutRec.addedNodes.length){
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
		if(mutRec.type === 'childList' && index.remove.length && mutRec.removedNodes && mutRec.removedNodes.length){
			index.remove.forEach(function (listener, ind) {

				Array.prototype.forEach.call(mutRec.removedNodes, function (removedNode) {
					//if((removedNode.textContent.toString() || removedNode.innerText.toString()).indexOf('Angus') > -1 || (mutRec.target.textContent.toString() || mutRec.target.innerText.toString()).indexOf('Angus') > -1) debugger;
					var removeListener;
					if(listener.target == mutRec.target || listener.target == removedNode || (removedNode.contains && removedNode.contains(listener.target))){
						removeListener = listener.listener.call(listener.target, mutRec, listener);
						// if the listener was called automatically clear the remove listeners
						if(removeListener) index.remove.splice(ind, 1);
					}
				});
			});
		}

		// search for characterData changes
		if(mutRec.type === 'characterData' && index.change.length) {
			_.filter(index.change, function (list) {
				return list.target === mutRec.target || list.target.contains(mutRec.target);
			}).forEach(function (list) {
				//console.log('triggereing listener', list, mutRec);
				var removeListener = list.listener.call(list.target, mutRec, listener);
				if(removeListener) index.change.splice(ind, 1);
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
		characterData: true,
		attributeFilter: ['contenteditable']
	};

	globalObserver.observe(document, globalObserverParams);


	// target is either an Element (for removals), function, or querySelectorAll string (for insert)
	function on (eventName, target, fn) {
		// validate parameters
		if(Object.keys(index).indexOf(eventName) == -1 || (!target || (typeof target != 'string' && !(target instanceof Node) && typeof target != 'function')) || typeof fn != 'function'){
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
