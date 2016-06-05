

// listen for all changes
(function () {
	CyphorMessageClient.on('*:change', function () {
		console.log('*:change fired', arguments);
	});
})();
