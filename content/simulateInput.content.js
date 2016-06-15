define('simulateInput', [], function () {
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


	function sendMessage(elem, text) {
		elem.style.display = '';
		elem.focus();

		//@TODO : this is sketchy and should be fixed
		elem.CyphorInput.iframe.style.display = 'none';

		setTimeout(function() {
			triggerTextInput(elem, text);
			['keydown', 'keypress','keyup'].forEach(function (keyType) {
				triggerKeyEvent(elem, {
					type : keyType,
					charCode : 13,
					isTrusted: true,
					key : 'Enter',
					keyCode:13,
					which:13
				});
			});
			elem.style.display = 'none';
			elem.CyphorInput.iframe.style.display = '';
			elem.CyphorInput.iframe.focus();
		}, 10);
	}

	return {
		triggerTextInput : triggerTextInput,
		triggerKeyEvent : triggerKeyEvent,
		sendMessage : sendMessage
	};
});
