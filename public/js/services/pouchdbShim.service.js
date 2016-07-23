angular.module('CyphorApp')
	.service('pouchDBShim', ['$log', "$rootScope", "$q", function ($log, $rootScope, $q) {

		function getAll() {
			var msgObj = {
				action : 'pouchdb:getall',
			};
			return sendChromeRuntime(msgObj);
		}

		function put(obj) {
			return sendChromeRuntime({action:'pouchdb:put', doc:obj});
		}

		function remove(obj) {
			obj._deleted = true;
			return sendChromeRuntime({action:'pouchdb:put', doc:obj});
		}

		function sendChromeRuntime(msgObj) {
			var deferred = $q.defer();
			chrome.runtime.sendMessage(msgObj, function () {
				deferred.resolve.apply(deferred, arguments);
			});
			return deferred.promise;
		}

		return {
			put : put,
			remove : remove
		};

	}]);
