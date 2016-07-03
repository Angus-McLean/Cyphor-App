
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
			var responder = (msg.id) ? _this.emit.bind(_this, msg.id.replace('req','res')) : function(){};
			instance.emitLocal(msg.event, msg.message, responder);
		});
	}

	function getPortId(port) {
		var portId = port.sender.tab && port.sender.tab.id + ':' + (port.sender.frameId || '');
		return portId;
	}

	ChromeConnect.prototype.getPortId = getPortId;

	ChromeConnect.prototype.emitLocal = function (event, message, responder) {
		(this.listeners[event] || []).forEach(function (cb) {
			cb.call(null, message, responder);
		});

		this.listeners['*'].forEach(function (cb) {
			cb.call(null, message, responder);
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

	ChromeConnect.prototype.request = function (event, message) {
		var _this = this;
		// generate request UUID
		var reqId = Date.now() + (''+Math.random()).slice(2);
		this.port.postMessage({
			id : 'req' + reqId,
			event : event,
			message : message
		});

		return new Promise(function (res, rej) {
			_this.on('res' + reqId, function () {
				res.apply(this, [].slice.call(arguments));
				delete _this.listeners['res'+reqId];
			});
			setTimeout(rej.bind(this, 'Promise timed out'), 1000);
		});
	};

	ChromeConnect.getInstance = function () {
		if(instance === null) {
			instance = new ChromeConnect();
			window.CyphorMessageClient = instance;
		}
		return instance;
	};

	return ChromeConnect.getInstance();
});
require(["CyphorMessageClient"], function () {});
