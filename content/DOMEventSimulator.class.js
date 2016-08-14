define('DOMEventSimulator', ['simulateInput'], function (simulateInput) {
	console.log('DOMEventSimulator');
	class DOMEventSimulator {
		constructor(target_element) {
			if(!target_element) return console.error('invalid_params', 'target_element is required');

			this.simulatedEvents = {}
			this.target_element = target_element;

		}

		/**
		 * Sends Input the the target_element. Uses the simulateInput library for building and sending eventsObjects
		 * @param {object} evt : Json object representing the event to be sent to the taret element
		 * @returns
		 */
		triggerTextEvent(text) {
			this.simulatedEvents['textInput'] = Date.now();
			simulateInput.triggerTextInput(this.target_element, text);
		}

		/**
		 * Sends Input the the target_element. Uses the simulateInput library for building and sending eventsObjects
		 * @param {object} evt : Json object representing the event to be sent to the taret element
		 * @returns
		 */
		triggerKeyEvent(evt) {
			this.simulatedEvents[evt.type] = Date.now();
			simulateInput.triggerKeyEvent(this.target_element, evt);
		}

		/**
		 * Sends Input the the target_element. Uses the simulateInput library for building and sending eventsObjects
		 * @param {object} evt : Json object representing the event to be sent to the taret element
		 * @returns
		 */
		triggerMouseEvent(evt) {
			this.simulatedEvents[evt.type] = Date.now();
			simulateInput.triggerMouseEvent(this.target_element, evt);
		}

		/**
		 * Sends Input the the target_element. Uses the simulateInput library for building and sending eventsObjects
		 * @param {object} evt : Json object representing the event to be sent to the taret element
		 * @returns
		 */
		triggerFocusEvent(evt={}) {
			this.simulatedEvents[evt.type || 'focus'] = Date.now();
			this.target_element.focus();
		}

		/**
		 * Returns wether an event of a given type has been simulated within set amount of time.
		 * @param {String} type : the type of the event to check (focus, keydown, etc)
		 * @param {Number} time : the time in miliseconds
		 * @returns Boolean
		 */
		waitedSinceLast(type, time) {
			return !this.simulatedEvents[type] || this.simulatedEvents[type] + time < Date.now();
		}
	}

	return DOMEventSimulator;

});

define('TextSimulator', ['DOMEventSimulator'], function (DOMEventSimulator) {
	console.log('TextSimulator');
	class TextSimulator extends DOMEventSimulator {
		constructor(iframe_element, ...args) {
			super(...args);
			this.iframe_element = iframe_element;
		}

		/**
		 * Sends text to target_element. Accepts configuration values
		 * @param {String} text : Text to be sent to target_element
		 * @param {jsonObject} [config] : Various configuration options
		 * @returns
		 */
		sendText(text, config) {

			var _this = this;

			var defaultConfig = {
				hideIframe : true,
				focusOnTarget : true,
				sendTrailingEnterEvent : true
			};

			// copy over defaults
			config = _.assign(defaultConfig, config);

			// focus on target of text input
			if(config.focusOnTarget) {
				this.target_element.focus();
			}

			if(config.hideIframe) {
				//@NOTE : Gmail will have some script error if the iframe is not removed.
				this.iframe_element.style.display = 'none';
			}

			this.triggerTextEvent(text)

			if(config.sendTrailingEnterEvent){
				['keydown', 'keypress','keyup'].forEach(function (keyType, ind) {
					_this.triggerKeyEvent({
						type : keyType,
						charCode : 13,
						isTrusted: true,
						key : 'Enter',
						keyCode:13,
						which:13
					});
				});
			}

			if(config.hideIframe) {
				this.iframe_element.style.display = '';
			}
		}
	}

	return TextSimulator;
});
