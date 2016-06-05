

// Save a doc from the content scripts
(function saveDoc(doc) {

	var genDoc = {
		_id : ''+Math.random(),
		domain : window.location.host
	};

	var obj = {
		action : 'pouchdb:put',
		doc : (doc || genDoc)
	};
	chrome.runtime.sendMessage(obj, function () {
		console.log('saveDoc recieved', arguments);
	});
})();

(function getDoc(doc) {
	var obj = {
		action : 'pouchdb:get',
		doc : doc
	};
	chrome.runtime.sendMessage(obj, function () {
		console.log('queryDoc recieved', arguments);
	});
})();

(function queryDoc(queryObj, options) {
	var obj = {
		action : 'pouchdb:query',
		query : queryObj || {},
		options : options
	};
	chrome.runtime.sendMessage(obj, function () {
		console.log('queryDoc recieved', arguments);
	});
})();

(function dropDB() {
	var obj = {
		action : 'pouchdb:drop'
	};
	chrome.runtime.sendMessage(obj, function () {
		console.log('dropDB recieved', arguments);
	});
})();
