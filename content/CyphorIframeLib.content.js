
define('CyphorIframeLib', [], function () {

	console.log('CyphorIframeLib.content.js', arguments);

	function getZIndex (e) {
		var z = window.document.defaultView.getComputedStyle(e).getPropertyValue('z-index');
		if (isNaN(z)) return getZIndex(e.parentNode);
		return z;
	}

	function mapOverProperties(dest, destProps, orig, origProps) {
		dest = dest || {};
		destProps = destProps || origProps;
		if(!orig || !Array.isArray(origProps)) throw 'invalid mapOverProperties parameters';
		return _.reduce(origProps, function (prop, ind) {
			dest[destProps[ind]] = orig[prop];
			return dest;
		}, dest);
	}

	/**
	 * Parses target element's styles into a message to be passed to iframe so it can recreate input elements inside iframe
	 * @param {Element} siblingElem : The target element
	 * @returns Message to be passed to iframe
	 */
	function buildInnerStylingMessage(siblingElem) {
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

		return messageObj;
	}

	/**
	 * Creates the Iframe Element and adds the default styling to the iframe element
	 * @param {Element} siblingElem : the targetElem
	 * @returns the iframe element. Not yet inserted into the DOM
	 */
	function createIframeFromSib(siblingElem) {
		var iframe = document.createElement('iframe');

		iframe.allowtransparency = "true";
		iframe.frameborder = "0";
		iframe.scrolling = "no";

		iframe.style["z-index"] = getZIndex(siblingElem) + 1;
		// defaults backgroundColor to '' if not defined in parent element
		//iframe.style.backgroundColor = (siblingElem.parentElement && siblingElem.parentElement.style) ? (siblingElem.parentElement.style.backgroundColor) || '' : '';
		iframe.style.position = "absolute";
		var {height, width} = siblingElem.getClientRects()[0];
		iframe.style.height = height + 'px';
		iframe.style.width = width + 'px';
		iframe.style.top = siblingElem.offsetTop + 'px';
		iframe.style.left = siblingElem.offsetLeft + 'px';
		iframe.style.overflow = "hidden";
		iframe.style.border = "0px none transparent";
		iframe.style.padding = "0px";

		return iframe;
	}

	function insertIframe (siblingElem, channelObj) {

		var msgObj = buildInnerStylingMessage(siblingElem);

		// create the iframe Element
		var iframe = createIframeFromSib(siblingElem);

		iframe.src = chrome.runtime.getURL('/iframe/div.iframe.html');
		siblingElem.parentElement.appendChild(iframe);

		iframe.onload = function () {

			// send channel object to iframe
			iframe.contentWindow.postMessage({
				action:'CHANNEL',
				channel:channelObj || null
			}, '*');

			iframe.contentWindow.postMessage(msgObj, '*');
			iframe.focus();
			iframe.contentWindow.postMessage({action:'FOCUS'}, '*');

			if(iframe.contentWindow){
				iframe.contentWindow.focus();
			}
		};

		return iframe;
	}

	function insertButtonFrame (siblingElem, channelObj) {

		var iframe = createIframeFromSib(siblingElem);

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
		insertIframe,
		insertButtonFrame,
		getElemBelowIframe,
		buildInnerStylingMessage,
		createIframeFromSib
	};

});
