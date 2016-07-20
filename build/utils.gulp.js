

exports.regex = {
	jsFromHtml : /(?:<script[^>]+src\=["'])([\w\/\.\-\:\?]+\.js)(?:["'])[^>]+><\/script>/g,
	cssFromHtml : /(?:href\=["'])([\w\/\.\-]+\.css)(?:["'])/g
};

exports.matchAll = function (regexp, str) {
	var scripts = [],
		match = regexp.exec(str);
	while(match) {
		scripts.push(match[1]);
		match = regexp.exec(str);
	}
	return scripts;
};

exports.copyFetchScriptsForHTML = function (file) {
	
};
