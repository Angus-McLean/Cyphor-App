
define("CyphorMessageClient", [], function () {

	var instance = null;

	function ChromeConnect(portName) {
		var _this = this;
		var port;
		if(portName) {
			port = chrome.runtime.connect({name:portName});
		} else {
			port = chrome.runtime.connect();
		}

		this.port = port;
		this.listeners = {
			'*' : []
		};

		port.onMessage.addListener(function (msg) {
			instance.emitLocal(msg.event, msg.message);
		});
	}
	
	function getPortId(port) {
		var portId = port.sender.tab && port.sender.tab.id + ':' + (port.sender.frameId || '');
		return portId;
	}
	
	ChromeConnect.prototype.getPortId = getPortId;
	
	
	ChromeConnect.prototype.emitLocal = function (event, message) {
		(this.listeners[event] || []).forEach(function (cb) {
			cb.call(null, message);
		});

		this.listeners['*'].forEach(function (cb) {
			cb.call(null, message);
		});
	};

	ChromeConnect.prototype.on = function (eventName, cb) {
		if(this.listeners[eventName]) {
			this.listeners[eventName].push(cb);
		} else {
			this.listeners[eventName] = [cb];
		}
	};

	ChromeConnect.prototype.emit = function (event, message) {
		if(!event || typeof event != 'string') {
			throw 'ChromeConnect.prototype.emit requires and event';
		}
		this.port.postMessage({event:event, message:message});
	};

	ChromeConnect.getInstance = function () {
		if(instance === null) {
			instance = new ChromeConnect();
			window.CyphorMessageClient = instance;
		}
		return instance;
	}

	return ChromeConnect.getInstance();
});
require(["CyphorMessageClient"], function () {});
