
class EventEmitter {
	constructor() {
		// stores all listener functions.
		this.listeners = {};
		this.destroyed = false;
	}
	
	emit(event, data) {
		if(this.destroyed) {
			console.warn('OBJ_DESTROYED', 'Trying to emit on destroyed EventEmitter.');
		}
		// emit to listeners
	}
	
	on (event, listener) {
		
	}
	
	removeListener (event, listener) {
		
	}
	
	kill () {
		this.destroyed = true;
		// kills listeners so event callback funcitons aren't triggered
		delete this.listeners;
	}
}