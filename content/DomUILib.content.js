
define('DomUILib', [], function () {

	function addGreyOverlay () {

		var old_elem = document.getElementById('cryptolayer-overlay');
		if(old_elem) {
			old_elem.remove();
		}

		var div_elem = document.createElement('div');

		var style_string = 'pointer-events:none;';
		style_string += 'background:#000;';
		style_string += 'opacity:0.5;';
		style_string += 'position:fixed;';
		style_string += 'top:0;';
		style_string += 'left:0;';
		style_string += 'width:100%;';
		style_string += 'height:100%;';
		//style_string += 'display:block;';
		style_string += 'z-index:100500;';
		style_string += 'font-size: 80px;';
	    //style_string += 'line-height: 1;';
		style_string += 'MsFilter: progid:DXImageTransform.Microsoft.Alpha(Opacity=50);';
		style_string += 'filter: alpha(opacity=50);';
		style_string += 'MozOpacity: 0.5;';
		style_string += 'KhtmlOpacity: 0.5;';
		style_string += 'content: attr(data-bg-text);';

		div_elem.setAttribute('style', style_string);
		div_elem.setAttribute('id','cryptolayer-overlay');

		document.body.appendChild(div_elem);
	}

	function removeGreyOverlay () {
		document.getElementById('cryptolayer-overlay').remove();
	}

	return {
		addGreyOverlay : addGreyOverlay,
		removeGreyOverlay : removeGreyOverlay
	};

})
