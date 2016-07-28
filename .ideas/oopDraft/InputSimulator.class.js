
class InputSimulator {
	constructor(DOM_Node) {
		// acts as a series of semaphores for inputs sent to the DOM
		this.inputs = {};
	}
	
	sendInput(eventDetails) {
		// trigger custom CyphorEvent
		// log event to this.inputs
		
		// take a callback or return a promise for indicating that the event has propagated
	}
}

InputSimulator.DEFAULTS = {};