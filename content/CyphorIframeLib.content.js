
define('CyphorIframeLib', [], function () {

	console.log('CyphorIframeLib.content.js', arguments);

	function insertIframe (siblingElem, channelObj) {

		var parStyle = window.getComputedStyle(siblingElem.parentElement);
		var parStyleJSON = JSON.parse(JSON.stringify(parStyle));
		//parStyleJSON.length = parStyle.length;

		var targetStyle = window.getComputedStyle(siblingElem);
		var targetStyleJSON = JSON.parse(JSON.stringify(targetStyle));
		//targetStyleJSON.length = targetStyle.length;

		var messageObj = {
			action : 'INSERT',
			parent : {
				styles : parStyleJSON,
				type : siblingElem.parentElement.nodeName.toLowerCase()
			},
			target : {
				styles : targetStyleJSON,
				type : siblingElem.nodeName.toLowerCase()
			}
		};

		console.log(messageObj);
		// create the iframe Element

		var iframe = document.createElement('iframe');

		iframe.allowtransparency = "true";
		iframe.frameborder = "0";
		iframe.scrolling = "no";
		iframe.style.width = targetStyleJSON.width;
		iframe.style.height = targetStyleJSON.height;
		iframe.style.overflow = "hidden";
		iframe.style.border = "0px none transparent";
		iframe.style.padding = "0px";

		iframe.src = chrome.runtime.getURL('/iframe/div.iframe.html');
		siblingElem.parentElement.appendChild(iframe);

		iframe.onload = function () {
			//iframe.contentWindow.postMessage({action:'INSERT'}, '*', [messageObj])

			// send channel object to iframe
			iframe.contentWindow.postMessage({
				action:'CHANNEL',
				channel:channelObj || null
			}, '*');

			iframe.contentWindow.postMessage(messageObj, '*');
			iframe.focus();
			iframe.contentWindow.postMessage({action:'FOCUS'}, '*');

			if(iframe.contentWindow){
				iframe.contentWindow.focus();
			}
		};
		siblingElem.originalDisplay = (siblingElem.style) ? siblingElem.style.display : '';
		siblingElem.style.display = 'none';

		return iframe;
	}

	function insertButtonFrame (siblingElem, channelObj) {

		var iframe = document.createElement('iframe');

		iframe.allowtransparency = 'true';
		iframe.frameborder = '0';

		//iframe.style["background-color"] = "rgba(0, 0, 255, 0.42)";
		iframe.style["z-index"] = "1000";
		iframe.style.position = "absolute";
		iframe.style.height = "100%";
		iframe.style.width = "100%";
		iframe.style.overflow = "hidden";
		iframe.style.border = "0px none transparent";
		iframe.style.top = "0px";
		iframe.style.left = "0px";

		iframe.src = chrome.runtime.getURL('/iframe/button.iframe.html');

		siblingElem.parentElement.appendChild(iframe);

		iframe.onload = function () {
			// send channel object to iframe
			iframe.contentWindow.postMessage({
				action:'CHANNEL',
				channel:channelObj || null
			}, '*');
		};

		return iframe;
	}

	function getElemBelowIframe(x, y) {
		var elem = document.elementFromPoint(x, y);
		if(elem.nodeName === "IFRAME" && elem.src && elem.src.match(new RegExp('chrome\-extension:\/\/' + chrome.runtime.id))){
			var orig = elem.style.pointerEvents;
			elem.style.pointerEvents = "none";
			var ret = document.elementFromPoint(x, y);
			elem.style.pointerEvents = orig;
			return ret;
		}
	}

	return {
		insertIframe : insertIframe,
		insertButtonFrame : insertButtonFrame,
		getElemBelowIframe : getElemBelowIframe
	};

});
