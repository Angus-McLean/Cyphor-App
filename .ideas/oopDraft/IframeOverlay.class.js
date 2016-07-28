
require('IframeUtils', 'simulatedEvents')

var mod = {};

class IframeOverlay {
	constructor(targetElement, iframeElement) {
		this.events = new EventEmitter();
		this.target = targetElement;
		
	}
	simluateEvent() {
		
	}
	takeout() {
		
	}
	remove() {
		
	}
}

// IframeOverlay Factory
IframeOverlay.prototype.create = function (targetElement, config) {
	// get iframe styles
	
	// create frame element
	
	// setup any required listeners to maintain overlay like resize, scroll, etc
	
	// append iframe to dom
	
}

class ButtonOverlay extends IframeOverlay {
	constructor() {
		
	}
}

ButtonOverlay.prototype.create = function (id, ...elems) {
	IframeOverlay.prototype.create.call(this, ...elems);
	
}

class InputOverlay extends IframeOverlay {
	constructor() {
		
	}
	
	focus() {
		
	}
	
	getEncryptedText() {
		
	}
	
	setValue() {
		
	}
}

InputOverlay.prototype.create = function (id, ...elems) {
	// triggers iframe insertion logic
	IframeOverlay.prototype.create.call(this, ...elems);
	
	// add input specific listeners to underlying element (focus, etc)
	
	// add inputSimulator here
	
}

class InlineTextOverlay extends IframeOverlay {
	constructor() {
		
	}
}

InlineTextOverlay.prototype.create = function (id, ...elems) {
	IframeOverlay.prototype.create.call(this, ...elems);
	
}