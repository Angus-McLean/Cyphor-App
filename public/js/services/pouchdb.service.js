angular.module('CyphorApp')
	.service('pouchDB', ['$log', "$rootScope", "$q", "CyphorMessageClient", function ($log, $rootScope, $q, CyphorMessageClient) {

		var urlRegex = new RegExp('^(.*:)//([A-Za-z0-9\-\.]+)(:[0-9]+)?(.*)$');
		var index = {};

		var data = {
			'*' : []
		};

		// listen for changes
		CyphorMessageClient.on('*:change', processDoc);

		function processDoc(newDoc) {
			// update index :
			index[newDoc._id] = newDoc;

			// update data
			['*', newDoc.origin_url].forEach(function (orig) {
				data[orig] = (data[orig] || []).filter(function (oldDoc) {
					return oldDoc._id !== newDoc._id;
				});
				data[orig].push(newDoc);
			});
		}

		function getByOrigin(queriedOrigin) {
			var msgObj = {
				action : 'pouchdb:query',
				query : {origin_url : queriedOrigin}
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
		chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
			if(tabs && tabs.length){
				var urlParsed = urlRegex.exec(tabs[0].url);
				if(urlParsed){
					getByOrigin(urlParsed[2]).then(function (resp) {
						resp.rows.forEach(function (row) {
							processDoc(row.key);
						});
					});
				}
			}
		});

		var returnObj = {
			data : data,
			index : index
		};

		return returnObj;
	}]);
