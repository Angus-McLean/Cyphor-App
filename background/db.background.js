// db.background.js
console.log('db.background.js');
define('db', ['CyphorMessageClient', 'dbMiddelware'], function (msgCli) {

	// Initialize PouchDB
	var db = PouchDB('channels');
	window.db = db;

	/*
	 * Add chrome.runtime listeners to process queries
	 */
	 chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		 if(/pouchdb:/.test(request.action)){
			console.log('db.background.js reveiced chrome.runtime.onMessage', arguments);
		 }
		 switch (request.action) {
		 	case "pouchdb:get":
		 		executeGet(request, sendResponse);
		 		break;
			case "pouchdb:query":
				executeQuery(request, sendResponse);
		 		break;
			case "pouchdb:put":
				executePut(request, sendResponse);
		 		break;
			case "pouchdb:drop":
				indexedDB.deleteDatabase('_pouch_channels');
				sendResponse({});
				break;
		 }
		 return true;
	 });

	// get document by _id
	function executeGet(requestObj, sendResponse) {
		if(!(requestObj && requestObj._id)) {
			sendResponse(null);
		}
		db.get(requestObj._id).then(function (doc) {
			sendResponse(doc);
		}).catch(function (err) {
			console.error(err);
		});
	}

	function executeQuery(req, sendResponse) {

		function validateDoc(doc, emit) {
			for(var i in req.query){
				if(doc[i] != req.query[i]) {
					return false;
				}
			}
			emit(doc);
		}

		var options = req.options || {};
		options.include_docs = true;
		db.query(validateDoc, req.options).then(function (resp) {
			sendResponse(resp);
		}).catch(function (err) {
			console.error(err);
		});
	}

	function executePut(requestObj, sendResponse) {
		db.put(requestObj.doc).then(function (doc) {
			sendResponse(doc);
		}).catch(function (err) {
			console.error(err);
		});
	}

	/*
	 * Emit messages to CyphorMessageClient changes
	 */

	db.changes({
		since: 'now',
		live: true,
		include_docs: true
	}).on('change', function (change) {
		console.log('PouchDB change event', arguments);
		if (change.deleted) {
			// document was deleted
		} else {
			// doc was changed
			msgCli.emit('*:change', change.doc);
			msgCli.emit(change.doc.origin_url + ':change', change.doc);
			msgCli.emit(change.doc._id + ':change', change.doc);
		}
	}).on('error', function (err) {
		// handle errors
	});

});
require(['db'], function(){});
