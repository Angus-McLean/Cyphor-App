angular.module('CyphorApp')
	.controller('feedbackCtrl', ['$scope', function($scope, CyphorMessageClient) {
		$scope.types = [{
			name : 'Design / UI',
			val : 'design_ui'
		}, {
			name : 'Enhancement Request',
			val : 'enhancement'
		}, {
			name : 'Marketing',
			val : 'marketing'
		},{
			name : 'Business',
			val : 'business'
		}, {
			name : 'User Experience',
			val : 'user_experience'
		}, {
			name : 'Technical',
			val : 'technical'
		}, {
			name : 'Performance',
			val : 'performance'
		}, {
			name : 'Other',
			val : 'other'
		}];

		$scope.feedback = {
			allow_response : true
		};

		$scope.send = function () {
			console.log('sending feedback', $scope.feedback);
		};
}]);
