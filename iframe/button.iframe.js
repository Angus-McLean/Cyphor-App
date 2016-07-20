var channelObj;

window.addEventListener('message', function(eve) {
	if(eve.data.action == 'CHANNEL'){
		channelObj = eve.data.channel;
	}
});


document.onclick = function (event) {
	require('CyphorMessageClient').emit(channelObj._id + ':button_click', event);
};
