angular.module('CyphorApp')
	.controller('bugreportCtrl', ['$scope', function($scope, CyphorMessageClient) {

		$scope.activeTab = 0;

		$scope.types = [{
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

		$scope.bugreport = {
			allow_contact : true,
			steps : [{
				notes : ''
			}]
		};

		$scope.shift = function (ind, direction) {
			var steps = $scope.bugreport.steps;

			if(ind + direction < 0 || ind + direction == steps.length) return;

			var a = steps[ind + direction];
			steps[ind + direction] = steps[ind];
			steps[ind] = a;
		};

		$scope.insert = function (ind) {
			$scope.bugreport.steps.splice(ind + 1, 0, {
				notes : ''
			});
		};

		$scope.remove = function (ind) {

			$scope.bugreport.steps.splice(ind, 1);

			if($scope.bugreport.steps.length === 0) {
				$scope.insert(0);
			}

		};

		$scope.goToTab = function (ind) {
			$scope.activeTab = ind;
		};

}]);
