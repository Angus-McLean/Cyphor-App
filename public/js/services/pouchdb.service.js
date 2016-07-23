angular.module('CyphorApp')
	.service('pouchDB', ['$log', "$rootScope", "$q", "CyphorMessageClient", "pouchDBShim", function ($log, $rootScope, $q, CyphorMessageClient, pouchDBShim) {

		var urlRegex = new RegExp('^(.*:)//([A-Za-z0-9\-\.]+)(:[0-9]+)?(.*)$');
		var index = {};

		var data = {
			'*' : []
		};

		// listen for changes
		CyphorMessageClient.on('*:change', processDoc);

		function processDoc(newDoc) {
			// update index :
			if(!index[newDoc._id]) {
				var newObj = {
					doc : newDoc
				};
				index[newDoc._id] = newObj;
				data['*'].push(newObj);

				if(!data[newDoc.origin_url]){
					data[newDoc.origin_url] = [];
				}
				data[newDoc.origin_url].push(newObj);
			} else {
				index[newDoc._id].doc = newDoc;
			}
		}

		CyphorMessageClient.on('*:deleted', function (changeEvent) {
			delete index[changeEvent.id];
			if(data[changeEvent.doc.origin_url]){
				data[changeEvent.doc.origin_url].forEach(function (elem, ind, arr) {
					if(elem._id == changeEvent.doc.id){
						arr.splice(ind, 1);
					}
				});
			}
		});

		function getByOrigin(queriedOrigin) {
			var msgObj = {
				action : 'pouchdb:query',
				query : {origin_url : queriedOrigin}
			};
			return sendChromeRuntime(msgObj);
		}

		function getAll() {
			var msgObj = {
				action : 'pouchdb:getall',
			};
			return sendChromeRuntime(msgObj);
		}

		function sendChromeRuntime(msgObj) {
			var deferred = $q.defer();
			chrome.runtime.sendMessage(msgObj, function () {
				deferred.resolve.apply(deferred, arguments);
			});
			return deferred.promise;
		}

		// query for initial data
		getAll().then(function (resp) {
			resp.rows.forEach(function (row) {
				processDoc(row.doc);
			});
		});


		// chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
		// 	if(tabs && tabs.length){
		// 		var urlParsed = urlRegex.exec(tabs[0].url);
		// 		if(urlParsed){
		// 			getByOrigin(urlParsed[2]).then(function (resp) {
		// 				resp.rows.forEach(function (row) {
		// 					processDoc(row.key);
		// 				});
		// 			});
		// 		}
		// 	}
		// });



		var returnObj = {
			data : data,
			index : index,
			db : pouchDBShim
		};

		return returnObj;
	}]);
