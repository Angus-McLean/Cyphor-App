console.log('loaded app.js');
//angular.module('music-downloader', []);

angular
	.module('CyphorApp', [
		'ui.router',
		'ngMaterial'
	])
	.config(['$compileProvider', function( $compileProvider ){
			$compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|chrome-extension):|data:image\//);
		}
	])
	.config(['$stateProvider','$urlRouterProvider', function ($stateProvider,$urlRouterProvider) {

		$urlRouterProvider.otherwise('/channels');

		$stateProvider
			.state('channels',{
				url:'/channels',
				templateUrl:'views/channels/channels.view.html',
				controller: 'channelsCtrl as demo',
				redirectTo: 'channels.all'
			})
			.state('channels.all',{
				url:'/channels/all',
				templateUrl:'views/channels/all.view.html',
				controller: 'alldomainsCtrl as allCtrl',
			})
			.state('channels.domain',{
				url:'/channels/:domain',
				controller: 'domainCtrl as domainCtrl',
				templateUrl:'views/channels/channels.domain.view.html'
			});
	}])
	.run(['$rootScope', '$state', 'pouchDB', function($rootScope, $state) {

		$rootScope.$on('$stateChangeStart', function(evt, to, params) {
			if (to.redirectTo) {
				evt.preventDefault();
				$state.go(to.redirectTo, params, {location: 'replace'});
			}
		});
	}]);
