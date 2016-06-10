
define("CyphorMessageClient", [], function () {

	function ChromeServer() {
		var _this = this;
		this.ports = {
			'*' : []
		};
		this.index = {};
		
		// add event listeners
		this.listeners = {
			'*' : []
		};

		// add join listener
		chrome.runtime.onConnect.addListener(function (newPort) {
			// add to port list
			_this.ports['*'].push(newPort);
			
			// add to port index
			_this.index[getPortId(newPort)] = newPort;
			
			if(newPort.name) {
				if(_this.ports[newPort.name]) {
					_this.ports[newPort.name].push(newPort);
				} else {
					_this.ports[newPort.name] = [newPort];
				}
			}

			// add disconnect listener
			newPort.onDisconnect.addListener(_this.remove.bind(_this, newPort));

			// add message listener
			newPort.onMessage.addListener(function (msg) {
				_this.emit.call(_this, msg.event, msg.message);
			});
		});
	}
	
	function getPortId(port) {
		var portId = port.sender.tab && port.sender.tab.id + ':' + (port.sender.frameId || 'top');
		return portId;
	}
	
	ChromeServer.prototype.getPortId = getPortId;
	
	ChromeServer.prototype.emit = function (event, message) {
		this.emitLocal(event, message);
		this.emitRemote(event, message);
	};
	
	ChromeServer.prototype.emitLocal = function (event, message) {
		(this.listeners[event] || []).forEach(function (cb) {
			cb.call(null, message);
		});

		this.listeners['*'].forEach(function (cb) {
			cb.call(null, message);
		});
	};
	
	ChromeServer.prototype.on = function (eventName, cb) {
		if(this.listeners[eventName]) {
			this.listeners[eventName].push(cb);
		} else {
			this.listeners[eventName] = [cb];
		}
	};

	ChromeServer.prototype.remove = function (removePort) {
		var _this = this;

		// remove from port index
		delete _this.index[getPortId(removePort)];

		// remove from port list
		((removePort.name) ? [removePort.name, '*'] : ['*']).forEach(function (portName) {
			_this.ports[portName].forEach(function (port, ind) {
				if(port == removePort) {
					_this.ports[portName].splice(ind, 1);
				}
			});
		});
	};

	ChromeServer.prototype.emitRemote = function functionName(event, msg) {
		this.send('*', {event : event, message : msg});
	};

	ChromeServer.prototype.send = function functionName(portName, msgObj) {
		var _this = this;
		(portName ? [portName] : ['*']).forEach(function (destPort) {
			(_this.ports[destPort] || []).forEach(function (portObj) {
				try{
					portObj.postMessage(msgObj);
				} catch(e) {
					_this.remove(portObj);
				}
			});
		});
	};


	window.ChromeServer = ChromeServer;
	window.CyphorMessageClient = new ChromeServer();

	return CyphorMessageClient;
});
require(['CyphorMessageClient'], function(){});
