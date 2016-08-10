// db.background.js
console.log('db.background.js');
define('db', ['CyphorMessageClient', 'dbMiddelware'], function (msgCli) {

	// Initialize PouchDB
	var db = PouchDB('channels');
	var keysDB = PouchDB('keys');

	var dbs = {
		keys : keysDB,
		channels : db
	};

	window.db = db;
	window.dbs = dbs;

	/*
	 * Add chrome.runtime listeners to process queries
	 */
	 chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		 if(/pouchdb:/.test(request.action)){
			console.log('db.background.js reveiced chrome.runtime.onMessage', arguments);
		 }
		 switch (request.action) {
		 	case "pouchdb:get":
		 		executeGet(db, request, sendResponse);
		 		break;
			case "pouchdb:getall":
		 		executeGetAll(db, request, sendResponse);
		 		break;
			case "pouchdb:query":
				executeQuery(db, request, sendResponse);
		 		break;
			case "pouchdb:put":
				executePut(db, request, sendResponse);
		 		break;
			case "pouchdb:drop":
				indexedDB.deleteDatabase('_pouch_channels');
				sendResponse({});
				break;
		 }

		 switch (request.action) {
		 	case "pouchdb:keys:get":
		 		executeGet(keysDB, request, sendResponse);
		 		break;
			case "pouchdb:keys:getall":
		 		executeGetAll(keysDB, request, sendResponse);
		 		break;
			case "pouchdb:keys:query":
				executeQuery(keysDB, request, sendResponse);
		 		break;
			case "pouchdb:keys:put":
				executePut(keysDB, request, sendResponse);
		 		break;
			case "pouchdb:keys:drop":
				indexedDB.deleteDatabase('_pouch_channels');
				sendResponse({});
				break;
		 }
		 return true;
	 });

	// get document by _id
	function executeGet(collection, requestObj, sendResponse) {
		if(!(requestObj && requestObj._id)) {
			sendResponse(null);
		}
		collection.get(requestObj._id).then(function (doc) {
			sendResponse(doc);
		}).catch(function (err) {
			console.error(err);
		});
	}

	function executeGetAll(collection, requestObj, sendResponse) {
		collection.allDocs({include_docs: true}).then(function (doc) {
			sendResponse(doc);
		}).catch(function (err) {
			console.error(err);
		});
	}

	function executeQuery(collection, req, sendResponse) {

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
		collection.query(validateDoc, req.options).then(function (resp) {
			sendResponse(resp);
		}).catch(function (err) {
			console.error(err);
		});
	}

	function executePut(collection, requestObj, sendResponse) {
		collection.put(requestObj.doc).then(function (doc) {
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
			msgCli.emit('*:deleted', change);
			msgCli.emit(change.doc.origin_url + ':deleted', change);
			msgCli.emit(change.doc._id + ':deleted', change);
		} else {
			// doc was changed
			msgCli.emit('*:change', change.doc);
			msgCli.emit(change.doc.origin_url + ':change', change.doc);
			msgCli.emit(change.doc._id + ':change', change.doc);
		}
	}).on('error', function (err) {
		// handle errors
	});

	keysDB.changes({
		since: 'now',
		live: true,
		include_docs: true
	}).on('change', function (change) {
		console.log('PouchDB change event', arguments);
		if (change.deleted) {
			// document was deleted
			msgCli.emit('keys:'+'*:deleted', change);
			msgCli.emit('keys:'+change.doc.origin_url + ':deleted', change);
			msgCli.emit('keys:'+change.doc._id + ':deleted', change);
		} else {
			// doc was changed
			msgCli.emit('keys:'+'*:change', change.doc);
			msgCli.emit('keys:'+change.doc.origin_url + ':change', change.doc);
			msgCli.emit('keys:'+change.doc._id + ':change', change.doc);
		}
	}).on('error', function (err) {
		// handle errors
	});

});
require(['db'], function(){});
