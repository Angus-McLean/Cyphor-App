angular.module('CyphorApp')
	.controller('bugreportCtrl', ['$scope', function($scope, CyphorMessageClient) {

		$scope.types = [{
			name : 'User Experience'
		}, {
			name : 'Technical'
		}, {
			name : 'Performance'
		}, {
			name : 'Other'
		}]


}]);
