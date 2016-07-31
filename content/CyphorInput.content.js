
define('CyphorInput', ['CyphorMessageClient', 'parseChannel', 'CyphorObserver', 'CyphorIframeLib', 'simulateInput', 'ButtonInterceptor', 'DecryptionManager'], function (CyphorMessageClient, parseChannel, CyphorObserver, CyphorIframeLib, simulateInput, ButtonInterceptor, DecryptionManager) {
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

		this.simulatedEvents = {};

		ButtonInterceptor.call(this, this.channel._id, elemsObj, this.channel.button);
		//_.extend(this, new ButtonInterceptor(this.channel._id, elemsObj, this.channel.button));

		// insert the iframe
		this.insertIframe();

		this.listenForRecipientElemChange();

		this.addOnActiveListener();

		DecryptionManager.decryptForChannel(_this.channel._id);

		CyphorMessageClient.on(this.channel._id + ':send_text', function (msg) {
			if(_this.isDestroyed) return;

			var sendEvents = ['textInput', 'focus', 'keydown', 'keypress', 'keydown'];
			_.reduce(sendEvents, function (simSemaphors, eventName) {
				simSemaphors[eventName] = Date.now();
				return simSemaphors;
			}, _this.simulatedEvents);

			simulateInput.sendMessage(_this.targetElem, msg.text);

			setTimeout(function () {
				//console.warn('----- focusing on iframe..');
				_this.iframe.focus();
				_this.iframe.contentWindow.postMessage({action:'FOCUS'}, '*');
			}, 200);
		});

		CyphorMessageClient.on(this.channel._id + ':configure_button', function () {
			_this.configureSendButton({
				recipientElem : _this.recipientElem,
				targetElem : _this.targetElem
			});
		});

		CyphorMessageClient.on(this.channel._id + ':change', function (msg) {
			if(!msg.active) {
				DecryptionManager.encryptForChannel(_this.channel._id);
				_this.takeout();
			} else {
				DecryptionManager.decryptForChannel(_this.channel._id);
			}
		});

		CyphorMessageClient.on(this.channel._id + ':deleted', function (msg) {
			_this.takeout();
		});
	}

	_.extend(CyphorInput.prototype, ButtonInterceptor.prototype);

	CyphorInput.prototype.listenForRecipientElemChange = function () {
		var thisCyph = this;
		CyphorObserver.on('remove', this.recipientElem, function (mutationRecord, listener) {
			// element was removed.. check if its a configured channel
			var resObj = parseChannel.parseNodeForActiveInputs(thisCyph.targetElem);
			if(resObj && resObj.elementsObj.editable_elem == thisCyph.targetElem && resObj.channel ==  thisCyph.channel){
				// the channel is still here.. just update elements on listeners
				listener.target = resObj.elementsObj.recipient_elem;
				return false;
			} else {
				// channel has changed.. remove the currently configured CyphorInput
				thisCyph.takeout();
				if(resObj) {
					handleNewChannelParsed(resObj.elementsObj, resObj.channel);
				}
				return true;
			}
		});
		CyphorObserver.on('change', this.recipientElem, function (mutationRecord, listener) {
			// element was removed.. check if its a configured channel
			var resObj = parseChannel.parseNodeForActiveInputs(thisCyph.targetElem);
			if(resObj && resObj.elementsObj.editable_elem == thisCyph.targetElem && resObj.channel ==  thisCyph.channel){
				// the channel is still here.. just update elements on listeners
				listener.target = resObj.elementsObj.recipient_elem;
				return false;
			} else {
				// channel has changed.. remove the currently configured CyphorInput
				thisCyph.takeout();
				if(resObj) {
					handleNewChannelParsed(resObj.elementsObj, resObj.channel);
				}
				return true;
			}
		});
	};

	CyphorInput.prototype.addOnActiveListener = function () {
		var _this = this;
		this.targetElem.addEventListener('focus', function (e) {
			if(!_this.simulatedEvents.focus || _this.simulatedEvents.focus + 100 < Date.now()) {
				_this.iframe.focus();
				_this.iframe.contentWindow.postMessage({action:'FOCUS'}, '*');
			}
		}, true);
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
		// if(this.targetElem.style && this.targetElem.style.display == 'none'){
		// 	this.targetElem.style.display = this.targetElem.originalDisplay;
		// }

		// clear up memory
		this.destroy();
	};

	// clean up access to prevent memory leaks
	CyphorInput.prototype.destroy = function() {
		//CyphorObserver.removeObserver(this.iframe);
		this.isDestroyed = true;

		delete this.targetElem.CyphorInput;
		delete this.iframe.CyphorInput;

		CyphorInputsList.splice(CyphorInputsList.indexOf(this), 1);
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

	return CyphorInput;

});
require(['CyphorInput'], function(){});
