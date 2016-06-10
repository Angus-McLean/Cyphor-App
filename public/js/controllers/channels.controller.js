angular.module('CyphorApp')
	.controller('channelsCtrl', ['$scope', 'CyphorMessageClient', function($scope, CyphorMessageClient) {
		console.log('loaded channelsCtrl');

		this.selectedMode = 'md-fling';
		this.isOpen = false;

		$scope.parseNewChannel = function () {
			var query = {active: true, currentWindow: true};
			var routed = {
				event : 'parse_new_channel'
			};
			CyphorMessageClient.emit('route_message', {routed : routed, query : query});
		};

		$scope.startDownload = function () {
			console.log('Triggered Start Download');
		};
	}]);
