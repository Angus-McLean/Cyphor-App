// index.content.js
console.log('index.content.js');
require(['CyphorMessageClient'], function (msgCli) {
	msgCli.on('*', function () {
		console.log('*', arguments);
	});
});
