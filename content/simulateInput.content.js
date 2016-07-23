define('simulateInput', ['CyphorIframeLib'], function (CyphorIframeLib) {
	console.log('simulateInput');


	function triggerTextInput(elem, text) {
		var initialization = {
			initializationType : 'create',
			eventFamily : 'TextEvent',
			initMethod : 'initTextEvent',
			initArgs : ['textInput', true, true, null, text, 9, "en-US"]
		};
		var overwriteFields = {
			isTrusted : true
		};
		var simulateEventObj = {
			type : 'textInput',
			init : initialization,
			fields : overwriteFields
		};
		var event = new CustomEvent('CyphorInputEvent', {detail:simulateEventObj});
		elem.dispatchEvent(event);
	}

	function triggerKeyEvent(elem, keyObj) {
		var initialization = {
			initializationType : 'create',
			eventFamily : 'KeyboardEvent',
			initMethod : 'initKeyboardEvent',
			initArgs : [
				keyObj.type,
				true,
				true,
				null,
				keyObj.charCode,
				keyObj.key
			]
		};
		var overwriteFields = keyObj;
		var simulateEventObj = {
			type : keyObj.type,
			init : initialization,
			fields : overwriteFields
		};
		var event = new CustomEvent('CyphorInputEvent', {detail:simulateEventObj});
		elem.dispatchEvent(event);
	}

	function triggerMouseEvent(elem, clickObj) {
		var initialization = {
			initializationType : 'construct',
			eventFamily : 'MouseEvent',
			initArgs : [
				clickObj.type,
				{
					view : null,
					bubbles : true,
					cancelable : true
				}
			]
		};
		var overwriteFields = clickObj;
		var simulateEventObj = {
			type : clickObj.type,
			init : initialization,
			fields : overwriteFields
		};
		var event = new CustomEvent('CyphorInputEvent', {detail:simulateEventObj});
		elem.dispatchEvent(event);
	}

	function sendMouseEvent (elem, ev) {
		triggerMouseEvent (elem, {
			type : 'mousedown',
			isTrusted : true,
			which : 1
		});
		triggerMouseEvent (elem, {
			type : 'mouseup',
			isTrusted : true,
			which : 1
		});
		triggerMouseEvent (elem, {
			type : 'click',
			isTrusted : true,
			which : 1
		});
	}

	function sendMessage(elem, text) {
		//elem.style.display = '';
		elem.focus();

		//@NOTE : Gmail will have some script error if this is does not happen.
		elem.CyphorInput.iframe.style.display = 'none';

		setTimeout(function() {
			triggerTextInput(elem, text);
			//setTimeout(function () {
				['keydown', 'keypress','keyup'].forEach(function (keyType, ind) {
					triggerKeyEvent(elem, {
						type : keyType,
						charCode : 13,
						isTrusted: true,
						key : 'Enter',
						keyCode:13,
						which:13
					});
				});
			//}, 5);

			setTimeout(function () {
				elem.CyphorInput.iframe.focus();
				elem.CyphorInput.iframe.style.display = '';
			},5);
		}, 5);
	}

	function proxyMouseEvent(ev) {
		// trim objects and functions from event object.
		var dupObj = _.assignInWith({},ev, function(o,s){return (s instanceof Function || s instanceof Object) ? undefined : s;});
		triggerMouseEvent(ev.target, dupObj);
	}

	function proxyMouseEventPastIframe(buttonIfr, ev) {
		var ifrCoords = buttonIfr.getClientRects();
		var sendButton = CyphorIframeLib.getElemBelowIframe(ifrCoords[0].left + ev.x, ifrCoords[0].top + ev.y);
		sendMouseEvent(sendButton, ev);
	}

	return {
		triggerTextInput : triggerTextInput,
		triggerKeyEvent : triggerKeyEvent,
		sendMessage : sendMessage,
		sendMouseEvent : sendMouseEvent,
		proxyMouseEvent : proxyMouseEvent,
		proxyMouseEventPastIframe : proxyMouseEventPastIframe
	};
});
