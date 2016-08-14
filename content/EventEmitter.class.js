
define('EventEmitter', [], function () {

	class EventEmitter {
		constructor() {
			// stores all listener functions.
			this.listeners = {};
			this.destroyed = false;
		}

		emit(event, ...args) {
			if(this.destroyed) {
				console.warn('object_destroyed', 'Trying to emit on destroyed EventEmitter.');
				return;
			}
			// emit data and the source of the event to listeners
			_.forEach(this.listeners[event], (listener)=>listener(...args, this));
		}

		on (event, listener) {
			if(this.destroyed) {
				console.error('object_destroyed', 'Trying to .on on a destroyed EventEmitter');
			}
			this.listeners[event] = this.listeners[event] || [];
			this.listeners[event].push(listener);
		}

		removeListener (event, listener) {
			_.pull(this.listeners[event], listener);
		}

		destroy () {
			this.destroyed = true;
			// kills listeners so event callback funcitons aren't triggered
			delete this.listeners;
		}
	}

	return EventEmitter;

});
