define('InputOverlay', ['IframeOverlay', 'TextSimulator'], function (IframeOverlay, TextSimulator) {

	class InputOverlay extends IframeOverlay {
		constructor(channelObject, ...args) {
			// sets : target_element
			super(...args);

			this.channel = channelObject;
			this.textSimulator = new TextSimulator(this.iframe_element, this.target_element);

		}

		/**
		 *
		 * @param {}  :
		 * @param {} [] :
		 * @returns
		 */
		sendMessage(text) {

			// text event build config logic here

			this.textSimulator.sendText(text);
		}
	}

	/**
	 * Creates the InputOverlay object.
	 * Handles the logic of duplicating target_element styling, overlaying, etc
	 * Automatically passes the channelObject into the iframe_element
	 * @param {Element} target_element : The input / textarea / contenteditable element to overlay with the iframe
	 * @param {ChannelObject} channelObj : The ChannelObject associated with this InputOverlay
	 * @returns The InputOverlay Object
	 */
	InputOverlay.create = function (target_element, channelObj) {

		// get iframe styles + do any changes if need
		var styleMsg = IframeOverlay.lib.buildInnerStylingMessage(target_element);

		// create frame element
		var iframe_element = IframeOverlay.lib.createIframeFromSib(target_element);

		// set src of iframe + append to DOM
		iframe_element.src = chrome.runtime.getURL('/iframe/div.iframe.html');

		// send the channelObject inside the iframe
		iframe_element.onload = function () {
			// send elements / styling to create
			iframe_element.contentWindow.postMessage(styleMsg, '*');

			// send channel object to iframe_element
			iframe_element.contentWindow.postMessage({
				action:'CHANNEL',
				channel:channelObj || null
			}, '*');
		};

		target_element.parentElement.appendChild(iframe_element);

		// @TODO: setup any required listeners to maintain overlay like resize, scroll, etc

		var inputOverlay = new InputOverlay(channelObj, {target_element, iframe_element});

		// set up iframe to be seamless
		addOnActiveListener(inputOverlay);

		return inputOverlay;
	};

	function addOnActiveListener(cyphorInputObject) {
		cyphorInputObject.target_element.addEventListener('focus', function (e) {
			if(cyphorInputObject.textSimulator.waitedSinceLast('focus', 100)) {
				cyphorInputObject.focus();
			}
		}, true);
	}

	return InputOverlay;

});
