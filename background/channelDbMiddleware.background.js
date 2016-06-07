
define('dbMiddelware', [], function () {

	function channelPreSave(chanDoc) {

		// add settings
		chanDoc.settings = {
			controls : {
				sendHotkey : {
					keyCode : '13',
					ctrlKey : false,
					shiftKey : false,
					altKey : false,
					metaKey : false
				}
			},
			security : {

			}
		};
	}

	return {
		channelPreSave : channelPreSave
	};

});
