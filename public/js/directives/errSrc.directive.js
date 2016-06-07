var app = angular.module("CyphorApp");

app.directive('errSrc', function() {
	return {
		link: function(scope, element, attrs) {
			element.bind('error', function() {
				if (attrs.src != attrs.errSrc) {
					attrs.$set('ngSrc', attrs.errSrc);
				}
			});
		}
	};
});
