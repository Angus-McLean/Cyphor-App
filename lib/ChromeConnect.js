
define("CyphorMessageClient", [], function () {

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
			_this.emitLocal(msg.event, msg.message);
		});
	}
	
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

	window.ChromeConnect = ChromeConnect;
	window.CyphorMessageClient = new ChromeConnect();

	return CyphorMessageClient;
});
require(["CyphorMessageClient"], function () {});
