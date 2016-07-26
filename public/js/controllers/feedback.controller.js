angular.module('CyphorApp')
	.controller('feedbackCtrl', ['$scope', function($scope, CyphorMessageClient) {
		
		var feedbackFormDefaults = {
			allow_response : true
		};
		
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

		$scope.feedback = _.extend({}, feedbackFormDefaults);

		$scope.send = function () {
			console.log('sending feedback', $scope.feedback);
		};
		
		$scope.send = function () {
			// @TODO : get manifest parameter
			$http.post('https://www.cyphor.io' + '/forms/feedback', $scope.feedback)
				.then(()=> $scope.feedback = _.extend({}, defaultBugReport));
		};
}]);
