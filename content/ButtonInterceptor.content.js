
define('ButtonInterceptor', ['DomUILib', 'simulateInput', 'CyphorMessageClient', 'CyphorIframeLib', 'CyphorDomLib'], function (DomUILib, simulateInput, CyphorMessageClient, CyphorIframeLib, CyphorDomLib) {

	function preventUser (eve) {
		eve.preventDefault();
		eve.stopPropagation();
		return false;
	}

	function ButtonInterceptor(id, channelElemsObj, buttonPathsObj) {
		this._id = id;

		this.sendButton = null;

		this.channelElemsObj = channelElemsObj;
		this.buttonPathsObj = buttonPathsObj;

		if(channelElemsObj && buttonPathsObj) {
			ButtonInterceptor.prototype.startIntercept.call(this);
		}
	}

	ButtonInterceptor.prototype.startIntercept = function () {
		// get button element relative to editable element
		var target_button = CyphorDomLib.traversePath(this.channelElemsObj.editable_elem, this.buttonPathsObj.target_button);
		if(target_button) {
			this.addSendButton(target_button);
		}
	};

	ButtonInterceptor.prototype.addSendButton = function(buttonElem) {
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

	};

	ButtonInterceptor.prototype.configureSendButton = function () {
		var _CyphorInputContext = this;

		function clickFn (eve) {
			console.log('captured click');
			_CyphorInputContext.addSendButton(eve.target);

			ButtonInterceptor.prototype.saveButtonSelector.call(_CyphorInputContext, _CyphorInputContext.channelElemsObj, eve.target);

			DomUILib.removeGreyOverlay();
			window.removeEventListener('mousedown', clickFn, true);
			window.removeEventListener('mouseup', preventUser, true);
			window.removeEventListener('click', preventUser, true);

			eve.stopPropagation();
			eve.preventDefault();
			return false;
		}
		DomUILib.addGreyOverlay();
		window.addEventListener('mousedown', clickFn, true);
		window.addEventListener('mouseup', preventUser, true);
		window.addEventListener('click', preventUser, true);
	};

	ButtonInterceptor.prototype.saveButtonSelector = function saveButtonSelector(orig, targ) {
		this.channel.button = this.channel.button || {};
		this.channel.button.recipient_button = CyphorDomLib.buildPath(orig.recipient_elem, targ);
		this.channel.button.target_button = CyphorDomLib.buildPath(orig.editable_elem, targ);

		var msgObj = {
			action : 'pouchdb:put',
			doc : this.channel
		};
		chrome.runtime.sendMessage(msgObj, function () {});
	};

	return ButtonInterceptor;
});
