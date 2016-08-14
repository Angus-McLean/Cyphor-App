define('IframeOverlay', ['CyphorIframeLib', 'CyphorObserver', 'EventEmitter'], function (CyphorIframeLib, CyphorObserver, EventEmitter) {

	class IframeOverlay extends EventEmitter {
		/**
		 * Constructs IframeObject
		 * @param target_element : the element that the iframe will be overlaying
		 * @returns returns the IframeOverlay object
		 */
		constructor({target_element, iframe_element}) {
			if(!target_element) return console.error('invalid_params', 'target_element');
			if(!iframe_element) return console.error('invalid_params', 'iframe_element');

			super();

			// set properties
			this.target_element = target_element;
			this.iframe_element = iframe_element;
			//this.events = new EventEmitter();

			// handle indexing
			IframeOverlay.index.handle(this);

			// listen for DOM Mutation remove events
			CyphorObserver.on('remove', this.iframe_element, (mutRec)=>{
				this.emit('remove', mutRec, this);
				this.takeout();
			});
			CyphorObserver.on('remove', this.target_element, (mutRec)=>{
				this.emit('remove', mutRec, this);
				this.takeout();
			});
		}

		focus() {
			this.iframe_element.focus();
			if(this.iframe_element.contentWindow){
				this.iframe_element.contentWindow.focus();
				this.iframe_element.contentWindow.postMessage({action:'FOCUS'}, '*');
			}
		}

		/**
		 * Takes Iframe out of the DOM, will Automatically destroy reference once done
		 * @param {object} config : config object
		 * @param {} [] :
		 * @returns
		 */
		takeout() {

			// take frame out of DOM
			this.iframe_element.remove();

			// clear up references
			this.destroy();
		}

		destroy() {
			super.destroy();

			IframeOverlay.index.remove(this);

			CyphorObserver.removeListener('remove', this.iframe);
		}
	}

	IframeOverlay.index = {
		all : [],
		byTargetElement : new WeakMap(),
		byIframe : new WeakMap(),

		/**
		 * Indexes an IframeOverlay Object by target_element and iframe_element and adds to list of all IframeOverlays
		 * @param {IframeOverlay} inst : Instance of the IframeOverlay Class.
		 * @returns
		 */
		handle : function (inst) {
			// handle indexing
			if(IframeOverlay.index.byTargetElement.has(inst.target_element)) {
				return console.error('duplicate_object', 'IframeOverlay');
			}
			IframeOverlay.index.byTargetElement.set(inst.target_element, inst);
			if(IframeOverlay.index.byIframe.has(inst.iframe_element)) {
				return console.error('duplicate_object', 'IframeOverlay');
			}
			IframeOverlay.index.byIframe.set(inst.iframe_element, inst);

			// add to list of all IframeOverlays
			IframeOverlay.index.all.push(inst);
		},
		remove : function (inst) {
			// splice from list of all IframeOverlays
			IframeOverlay.index.all.splice(IframeOverlay.index.all.indexOf(inst), 1);

			IframeOverlay.index.byIframe.delete(inst.iframe_element);
			IframeOverlay.index.byTargetElement.delete(inst.target_element);
		}
	};

	IframeOverlay.lib = CyphorIframeLib;

	return IframeOverlay;

});
