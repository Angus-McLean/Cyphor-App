angular.module('CyphorApp')
	.controller('alldomainsCtrl', ['$scope', 'pouchDB', function($scope, pouchDB) {
		console.log('loaded alldomainsCtrl');

		this.domains = pouchDB.data;
		console.log(pouchDB.data);

		this.uiNavigate = function (stateName) {
			$state.go(stateName);
		};

	}]);
