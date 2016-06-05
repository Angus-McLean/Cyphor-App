
(function (cont) {

	function ChromeServer() {
		var _this = this;
		this.ports = {
			'*' : []
		};

		// add join listener
		chrome.runtime.onConnect.addListener(function (newPort) {
			_this.ports['*'].push(newPort);
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
			newPort.onMessage.addListener(_this.emit.bind(_this, newPort.name));
		});
	}

	ChromeServer.prototype.remove = function (removePort) {
		var _this = this;

		((removePort.name) ? [removePort.name, '*'] : ['*']).forEach(function (portName) {
			_this.ports[portName].forEach(function (port, ind) {
				if(port == removePort) {
					_this.ports[portName].splice(ind, 1);
				}
			});
		});
	};

	ChromeServer.prototype.emit = function functionName(event, msg) {
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


	cont.ChromeServer = ChromeServer;
	cont.CyphorMessageClient = new ChromeServer();

})(window);
