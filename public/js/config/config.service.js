angular.module('CyphorApp')
	.service('config', ['$log', "$http", function ($log, $http) {

		var config = {};

		$http.get(chrome.runtime.getURL('/config.json')).then(function (resp) {
			$log.debug('Loaded Config');
			config = resp.data;
		});

		return {
			getConfig : () => config
		};
}]);
