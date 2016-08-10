angular.module('CyphorApp')
	.controller('feedbackCtrl', ['config', '$scope', '$http', '$state', function(config, $scope, $http, $state) {

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

		$scope.feedback = angular.copy(feedbackFormDefaults);

		$scope.send = function () {
			// @TODO : get manifest parameter
			$http.post(config.get().base_url + '/forms/feedback', $scope.feedback)
				.then(()=> $scope.feedback = angular.copy(feedbackFormDefaults));
				$state.go('confirmation');
		};
}]);
