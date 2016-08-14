
define('CyphorInput', ['CyphorMessageClient', 'parseChannel', 'CyphorObserver', 'InputOverlay', 'DecryptionManager', 'EventEmitter'], function (CyphorMessageClient, parseChannel, CyphorObserver, InputOverlay, DecryptionManager, EventEmitter) {

	class CyphorInput extends EventEmitter {
		constructor(channelObject, inputOverlay, elementsObject) {

			super();

			this.channel = channelObject;
			this.recipient_elem = elementsObject.recipient_elem;
			this.inputOverlay = inputOverlay;

			_.assign(this, elementsObject);

			// handle indexing
			CyphorInput.index.handle(this);
		}

		/**
		 * Updates the recipient_elem. Removes old listeners and adds new ones for new element
		 * @param {Element} recipient_elem : the new element to mark as recipient_elem
		 * @returns
		 */
		updateRecipientElement(recipient_elem) {

			CyphorInput.index.byRecipientElement.delete(this.recipient_elem);
			CyphorInput.index.byRecipientElement.set(recipient_elem);

			this.recipient_elem = recipient_elem;

			// remove existing listeners
			CyphorObserver.removeListener('remove', recipient_elem);
			CyphorObserver.removeListener('change', recipient_elem);

			handleRecipientChangeListeners(this);
		}

		/**
		 * Handles removing / clearing up CyphorInput Object. CLears listeners and indexes.
		 * @returns
		 */
		takeout() {
			// remove listeners
			CyphorObserver.removeListener('remove', this.recipient_elem);
			CyphorObserver.removeListener('change', this.recipient_elem);

			// remove message event listeners
			CyphorMessageClient.removeListener(this.channel._id + ':send_text');
			CyphorMessageClient.removeListener(this.channel._id + ':configure_button');
			CyphorMessageClient.removeListener(this.channel._id + ':change');
			CyphorMessageClient.removeListener(this.channel._id + ':deleted');

			delete this.channel;
			CyphorInput.index.remove(this);

			// inputOverlay will removes listeners on editable_elem with .takeout
			this.inputOverlay.takeout();
			delete this.inputOverlay;

			this.destroyed = true;
		}
	}

	CyphorInput.index = {
		all : [],
		byChannel : new WeakMap(),
		byTargetElement : new WeakMap(),
		byRecipientElement : new WeakMap(),
		handle : function (inst) {
			// handle indexing
			if(CyphorInput.index.byTargetElement.has(inst.inputOverlay.target_element) || CyphorInput.index.byRecipientElement.has(inst.recipient_elem) || CyphorInput.index.byChannel.has(inst.channel)) {
				return console.error('duplicate_object', 'CyphorInput');
			}

			CyphorInput.index.byTargetElement.set(inst.inputOverlay.target_element, inst);
			CyphorInput.index.byRecipientElement.set(inst.recipient_elem, inst);
			CyphorInput.index.byChannel.set(inst.channel, inst);

			// add to list of all CyphorInputs
			CyphorInput.index.all.push(inst);

		},
		/**
		 * Undoes all the indexing for the particular instance
		 * @param {CyphorInput} inst : Instance of the CyphorInput object
		 * @returns
		 */
		remove : function (inst) {
			CyphorInput.index.all.splice(CyphorInput.index.all.indexOf(inst), 1);
			CyphorInput.index.byChannel.delete(inst.channel);
			CyphorInput.index.byTargetElement.delete(inst.inputOverlay.target_element);
			CyphorInput.index.byRecipientElement.delete(inst.recipient_elem);
		}
	};

	/**
	 * Factory method for creating CyphorInput Objects. Creates the InputOverlay and ButtonOverlay if required
	 * Sets up listeners to bubble events up
	 * @param {object} elementsObject : Object containing {editable_elem, recipient_elem}
	 * @param {ChannelObject} channelObject : The channelObject for this CyphorInput
	 * @returns
	 */
	CyphorInput.create = function (elementsObject, channelObject) {
		var {editable_elem, recipient_elem} = elementsObject;
		// validate that it doesn't exist already, etc
		if(CyphorInput.index.byTargetElement.has(editable_elem)) {
			console.warn('duplicate_object', 'CyphorInput object already exists for this element');
			return;
		}

		// create InputOverlay
		var inputOverlay = InputOverlay.create(editable_elem, channelObject);

		// create ButtonOverlay if required

		// create CyphorInput Object
		var cyphorInput = new CyphorInput(channelObject, inputOverlay, elementsObject);

		// add listeners for recipient element
		handleRecipientChangeListeners(cyphorInput);

		// add listeners for editable_elem remove / change
		handleEditableChangeListeners(cyphorInput);

		// add event listeners
		addCyphorInputMessageListeners(cyphorInput);

		return cyphorInput;

	};

	/**
	 * Adds change / removal listeners for the recipient element. Emits the events on the CyphorInput Object
	 * @param {CyphorInput} cyphorInputObject : Instance with recipient_elem set
	 * @returns
	 */
	function handleRecipientChangeListeners(cyphorInputObject) {

		// bubble the event up to any listeners
		CyphorObserver.on('remove', cyphorInputObject.recipient_elem, cyphorInputObject.emit.bind(cyphorInputObject, 'remove'));

		// bubble the event up to any listeners
		CyphorObserver.on('change', cyphorInputObject.recipient_elem, cyphorInputObject.emit.bind(cyphorInputObject, 'change'));

	}

	/**
	 * Adds removal listener for the inputOverlay (editable_elem and iframe). Emits the events on the CyphorInput Object
	 * @param {CyphorInput} cyphorInputObject : Instance with inputOverlay set
	 * @returns
	 */
	function handleEditableChangeListeners(cyphorInputObject) {
		// bubble the event up to any listeners
		cyphorInputObject.inputOverlay.on('remove', cyphorInputObject.emit.bind(cyphorInputObject, 'remove'));
	}

	/**
	 * Adds listeners to CyphorMessageClient and handles logic accordingly
	 * :send_text, :configure_button, :change, :deleted
	 * @param {CyphorInput} cyphorInputObject : Instance
	 * @returns
	 */
	function addCyphorInputMessageListeners(cyphorInputObject) {
		CyphorMessageClient.on(cyphorInputObject.channel._id + ':send_text', function (msg) {
			if(cyphorInputObject.destroyed) {
				console.warn('destroyed_object', 'Listener triggered from CyphorMessageClient on destroyed object');
				return;
			}

			cyphorInputObject.inputOverlay.sendMessage(msg.text);
		});

		CyphorMessageClient.on(cyphorInputObject.channel._id + ':configure_button', function () {
			if(cyphorInputObject.destroyed) {
				console.warn('destroyed_object', 'Listener triggered from CyphorMessageClient on destroyed object');
				return;
			}
			cyphorInputObject.configureSendButton({
				recipient_elem : cyphorInputObject.recipient_elem,
				editable_elem : cyphorInputObject.editable_elem
			});
		});

		CyphorMessageClient.on(cyphorInputObject.channel._id + ':change', function (msg) {
			if(cyphorInputObject.destroyed) {
				console.warn('destroyed_object', 'Listener triggered from CyphorMessageClient on destroyed object');
				return;
			}
			if(!msg.active) {
				DecryptionManager.encryptForChannel(cyphorInputObject.channel._id);
				cyphorInputObject.takeout();
			} else {
				DecryptionManager.decryptForChannel(cyphorInputObject.channel._id);
			}
		});

		CyphorMessageClient.on(cyphorInputObject.channel._id + ':deleted', function (msg) {
			cyphorInputObject.takeout();
		});
	}

	return CyphorInput;

});
