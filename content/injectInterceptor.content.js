(function () {
	var s = document.createElement("script");
	s.id = 'cyphor-injectable';
	s.src = chrome.extension.getURL("/injectables/EventInterceptor.injectable.js");
	s.async = false;
	document.documentElement.appendChild(s);
})();
