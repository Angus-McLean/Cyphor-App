angular.module('CyphorApp')
	.controller('domainCtrl', ['$scope', 'pouchDB', '$stateParams', function($scope, pouchDB, $stateParams) {
		var self = this;
		self.channels = pouchDB.data[$stateParams.domain];

		$scope.toggleDetails = function(channel) {
			if(!channel._a) {
				channel._a = {};
			}
			channel._a.details = !channel._a.details;
		};

		$scope.ngModelOptions = {
			debounce : 1000
		};

		$scope.update = function (song) {
			var saveObj = JSON.parse(JSON.stringify(song));
			delete saveObj._a;
			pouchDB.db.put(saveObj);
		};

	}]);
