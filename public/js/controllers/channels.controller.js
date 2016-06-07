angular.module('CyphorApp')
	.controller('channelsCtrl', ['$scope', function($scope) {
		console.log('loaded channelsCtrl');

		this.selectedMode = 'md-fling';
		this.isOpen = false;

		$scope.startDownload = function () {
			console.log('Triggered Start Download');
		};
	}]);
