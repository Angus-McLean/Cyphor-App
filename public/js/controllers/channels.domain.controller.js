angular.module('CyphorApp')
	.controller('domainCtrl', ['$scope', 'pouchDB', '$stateParams', 'CyphorMessageClient', function($scope, pouchDB, $stateParams, CyphorMessageClient) {
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

		$scope.update = function (angularChannelObj) {
			pouchDB.db.put(angularChannelObj.doc);
		};

		self.configureSendButton = function (channelObj) {
			console.log('configureSendButton', channelObj);
			CyphorMessageClient.emit(channelObj.doc.channel_id + ':configure_button', channelObj.doc);
		};

	}]);
