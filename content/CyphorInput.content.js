
define('CyphorInput', ['CyphorMessageClient', 'parseChannel', 'CyphorObserver', 'CyphorIframeLib', 'simulateInput', 'DomUILib'], function (CyphorMessageClient, parseChannel, CyphorObserver, CyphorIframeLib, simulateInput, DomUILib) {
	console.log('CyphorInput.content.js', arguments);

	var CyphorInputsList = [];

	parseChannel.onNewActiveChannel(handleNewChannelParsed);

	function handleNewChannelParsed(elemsObj, channelObj) {
		var targetElem = elemsObj.editable_elem || elemsObj;			//@TEMP : just so createIframe is backwards compatible (ie elemsObj is now an object.. used to be just an element)
		if(targetElem.CyphorInput || !channelObj.active){
			return;
		}

		// check if cyphorInput Obj already exists
		var existing = CyphorInputsList.filter(function (cyphorInputObj) {
			return cyphorInputObj.channel == channelObj;
		});

		if(existing && existing.length){
			existing[0].targetElem = targetElem;
			existing[0].recipientElem = elemsObj.recipient_elem || existing[0].recipientElem;
			existing[0].listenForRecipientElemChange();
			existing[0].insertIframe();
		} else {

			var cyphorInputObj = new CyphorInput(elemsObj, channelObj);

			// add references to the cyphorInput Object
			CyphorInputsList.push(cyphorInputObj);
			targetElem.CyphorInput = cyphorInputObj;
		}
	}

	function CyphorInput(elemsObj, channelObj) {
		var _this = this;
		this.iframe = null;
		this.channel = channelObj || null;
		this.targetElem = elemsObj.editable_elem || null;
		this.recipientElem = elemsObj.recipient_elem || null;
		this.coords = getCoords(this.targetElem);

		// insert the iframe
		this.insertIframe();

		this.listenForRecipientElemChange();

		CyphorMessageClient.on(this.channel._id + ':send_text', function (msg) {
			simulateInput.sendMessage(_this.targetElem, msg.text);
		});

		CyphorMessageClient.on(this.channel._id + ':configure_button', function () {
			_this.configureSendButton();
		});

		CyphorMessageClient.on(this.channel._id + ':change', function (msg) {
			console.log(arguments);
			if(!msg.active) {
				_this.takeout();
			}
		});
	}

	CyphorInput.prototype.listenForRecipientElemChange = function () {
		var thisCyph = this;
		CyphorObserver.on('remove', this.recipientElem, function (mutationRecord) {
			//@TODO : set up so that it handle characterData too
			if(mutationRecord.type == 'childList'){
				// element was removed or changed.. check if its a configured channel
				var resObj = parseChannel.parseNodeForActiveInputs(thisCyph.targetElem);
				if(resObj && resObj.elementsObj.editable_elem == thisCyph.targetElem && resObj.channel ==  thisCyph.channel){
					// do nothing because its the same channel
				} else {
					// channel has changed.. remove the currently configured CyphorInput
					thisCyph.takeout();
					if(resObj) {
						handleNewChannelParsed(resObj.elementsObj, resObj.channel);
					}
				}
			}
		});
	};

	function getCoords (elem) {
		var rect = elem.getClientRects()[0];
		var x = parseInt(rect.left + (rect.right - rect.left)/2);
		var y = parseInt(rect.top + (rect.bottom - rect.top)/2);
		return {x:x,y:y};
	}

	function prevent (eve) {
		eve.stopPropagation();
		eve.preventDefault();
		return false;
	}

	CyphorInput.prototype.takeout = function () {

		// clear removal observer so it doesn't get reinserted
		CyphorObserver.removeListener('remove', this.iframe);
		CyphorObserver.removeListener('remove', this.targetElem);
		CyphorObserver.removeListener('remove', this.recipientElem);

		//@TODO : Clear up listeners on CyphorMessageClient

		// take out the iframe
		this.iframe.remove();

		// reset display of original element
		if(this.targetElem.style && this.targetElem.style.display == 'none'){
			this.targetElem.style.display = this.targetElem.originalDisplay;
		}

		// clear up memory
		this.destroy();
	};

	// clean up access to prevent memory leaks
	CyphorInput.prototype.destroy = function() {
		//CyphorObserver.removeObserver(this.iframe);

		delete this.targetElem.CyphorInput;
		delete this.iframe.CyphorInput;
	};

	// requires that this object has its targetElem and channel object configured
	CyphorInput.prototype.insertIframe = function() {

		// double check that this element doesn't already have a channel associated with it
		if(this.targetElem.CyphorInput){
			return;
		}

		var ifr = CyphorIframeLib.insertIframe(this.targetElem, this.channel);
		this.iframe = ifr;

		// listen for removal of this iframe and reinsert if channel is still configured
		var thisCyph = this;
		CyphorObserver.on('remove', ifr, function (mutationRecord) {
			if(mutationRecord.type == 'childList'){
				// iframe was removed, create a new CyphorInput Object
				setTimeout(function () {
					var resObj = parseChannel.parseNodeForActiveInputs(mutationRecord.target);
					if(resObj){
						// creates a new iframe element
						handleNewChannelParsed(resObj.elementsObj, resObj.channel);
					}
				}, 10);

				// either a copy has been created or this channel is no longer on the page... delete this instance
				thisCyph.takeout();
			}
		});

		this.targetElem.parentElement.appendChild(ifr);

		// update references
		this.targetElem.CyphorInput = this;
		this.iframe.CyphorInput = this;
	};

	CyphorInput.prototype.addSendButton = function(buttonElem) {
		var _self = this;
		_self.sendButton = buttonElem;



		CyphorMessageClient.on(_self.channel._id + ':button_click', function (event) {
			CyphorMessageClient.request(_self.channel._id + ':request_text').then(function (encMsg) {
				simulateInput.sendMessage(_self.targetElem, encMsg.text);
				setTimeout(simulateInput.sendMouseEvent.bind(null, _self.sendButton, event),100);
				//simulateInput.proxyMouseEventPastIframe(_self.sendButton, event);

				//@TODO : proxy the click event here...
			});
		});

		CyphorIframeLib.insertButtonFrame(buttonElem, _self.channel);

		// var mouseSems = {
		// 	mousedown : null,
		// 	mouseup : null,
		// 	click : null
		// };

		// var resetSem = _.debounce(_.forEach.bind(_,mouseSems,(v,p)=>mouseSems[p] = null), 500);
		//
		// Object.keys(mouseSems).forEach(function (val, key) {
		// 	buttonElem.addEventInterceptor(key, function (eve) {
		// 		// only interrupts the first event (ie the user inputted event. Lets the simulated event pass through)
		// 		if(mouseSems[key] = !mouseSems[key]) {
		// 			simulateInput.proxyMouseEvent(eve);
		// 			return preventUser(eve);
		// 		}
		// 	});
		// });

		function preventUser (eve) {
			eve.preventDefault();
			eve.stopPropagation();
			return false;
		}
	};

	CyphorInput.prototype.configureSendButton = function () {
		var _CyphorInputContext = this;

		function clickFn (eve) {
			console.log('captured click');
			_CyphorInputContext.addSendButton(eve.target);

			DomUILib.removeGreyOverlay();
			window.removeEventListener('mousedown', clickFn, true);
			window.removeEventListener('mouseup', prevent, true);
			window.removeEventListener('click', prevent, true);

			eve.stopPropagation();
			eve.preventDefault();
			return false;
		}
		DomUILib.addGreyOverlay();
		window.addEventListener('mousedown', clickFn, true);
		window.addEventListener('mouseup', prevent, true);
		window.addEventListener('click', prevent, true);
	};

	return CyphorInput;

});
require(['CyphorInput'], function(){});
