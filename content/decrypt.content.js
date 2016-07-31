define('DecryptionManager', ['CyphorDomLib', 'CyphorMessageClient', 'indexChannel'], function (CyphorDomLib, msgCli, indexChannel) {

	var encryptedMessageRegex = /\-{1,3} cyphor\.io \-\- ([A-Za-z0-9\=\+]+) \-\- ([A-Za-z0-9\=\+\/]+) \-\- cyphor\.io \-\-/;

	var keys = [];
	var keyIndex = null;

	function decryptNodeTree(startElem) {
		iterateEncryptedNodes(startElem, function (textNode) {
			//var baseNode = CyphorDomLib.getBaseTextNode(textNode, encryptedMessageRegex);
			//console.log(textNode);

			// if(!keyIndex || textNode.getAttribute('data-cyphorencryptedmsg') === 'true') {
			// 	return;
			// }

			var decryptedMsgObj = decryptFromString((textNode.nodeValue||textNode.textContent||textNode.innerText));

			addElementOnTop(textNode, decryptedMsgObj);
		});
	}

	function filterEncryptedNodes(node, avoidRecurse) {

		// validate node
		if(!node || !node.parentElement){
			return NodeFilter.FILTER_REJECT;
		}

		// check if inside a script elements
		if(node.parentElement.nodeName == 'SCRIPT') {
			return NodeFilter.FILTER_REJECT;
		}

		// validate that its not editableElems
		if(node.isContentEditable) {
			return NodeFilter.FILTER_REJECT;
		}

		// check that it's not hidden
		var hiddenDisp = ['hidden', 'none'];
		if(hiddenDisp.indexOf(window.getComputedStyle(node.parentElement).display) != -1) {
			return NodeFilter.FILTER_REJECT;
		}

		// check for encryptedMessageRegex
		if(!((node.nodeValue||node.textContent||node.innerText).match(encryptedMessageRegex))) {
			return NodeFilter.FILTER_REJECT;
		}

		// filter for children that satis
		if(!avoidRecurse) {
			var hasEncChild = Array.prototype.reduce.call(node.childNodes, function (bool, childElem) {
				var filtVal = filterEncryptedNodes(childElem, true);
				var validChild = (filtVal === NodeFilter.FILTER_ACCEPT && childElem.childElementCount);
				return bool || validChild;
			}, false);
			if(hasEncChild) {
				return NodeFilter.FILTER_SKIP;
			}
		}

		return NodeFilter.FILTER_ACCEPT;
	}

	function iterateEncryptedNodes(startElem, handler) {
		if(!(startElem instanceof Node)) return;
		var walker = document.createTreeWalker(startElem, NodeFilter.SHOW_ELEMENT, {
			acceptNode : filterEncryptedNodes
		}, true);
		while(walker.nextNode()) {
			while(walker.firstChild()){}
			//debugger;
			handler(walker.currentNode);
		}
	}

	function decryptFromString (encryptedString) {

		// parse encrypted message
		var strMatch = encryptedString.match(encryptedMessageRegex);
		var msgID = strMatch[1],
			msgTxt = strMatch[2];

		// get associated key object
		var keyDoc = keyIndex[msgID] || {};
		var decryptionKey = (keyDoc && keyDoc.aes_key) || '1234567890';

		var decryptedObj = CryptoJS.AES.decrypt(msgTxt, decryptionKey);
		var decryptedMessage = decryptedObj.toString(CryptoJS.enc.Utf8);
		//console.log('decrypted : '+msgTxt+' to : '+decryptedMessage);

		var finalMsg = encryptedString.replace(encryptedMessageRegex, decryptedMessage);
		// NOTE : hotfix for alpha so all messages are decrypted always
		//var channel_isActive = false;
		var channel_isActive = true;

		// if(!keyDoc) {
		// 	// keyDoc is undefined because keys haven't been loaded yet..
		// 	return {
		// 		active : true,
		// 		encrypted_text : msgTxt,
		// 		decrypted_text : finalMsg,
		// 		keyDoc : {}
		// 	};
		// }

		if(indexChannel.channels.index.id[keyDoc.channel_id] && indexChannel.channels.index.id[keyDoc.channel_id].active){
			channel_isActive = true;
		}

		// replace encrypted component with decryptedMessage
		return {
			active : channel_isActive,
			encrypted_text : msgTxt,
			decrypted_text : finalMsg,
			keyDoc : keyDoc
		};
	}

	function addElementOnTop(elem, decryptedMsgObj) {
		var newE = elem.cloneNode();

		// set data attribute for cyphorchannelid to do queries on it later
		newE.setAttribute('data-cyphorchannelid', decryptedMsgObj.keyDoc.channel_id);
		newE.setAttribute('data-cyphorencryptedmsg', false);
		elem.setAttribute('data-cyphorchannelid', decryptedMsgObj.keyDoc.channel_id);
		elem.setAttribute('data-cyphorencryptedmsg', true);

		newE.innerText = decryptedMsgObj.decrypted_text;

		if(decryptedMsgObj.active) {
			elem.style.display = 'none';
		} else {
			newE.style.display = 'none';
		}

		elem.parentElement.appendChild(newE);
		return newE;
	}

	function getMessageNodes(channel_id) {
		return {
			enc : document.querySelectorAll(`[data-cyphorchannelid="${channel_id}"][data-cyphorencryptedmsg="true"]`),
			dec : document.querySelectorAll(`[data-cyphorchannelid="${channel_id}"][data-cyphorencryptedmsg="false"]`)
		};
	}

	function decryptForChannel(channel_id) {
		var {enc, dec} = getMessageNodes(channel_id);
		_.forEach(dec, elem => elem.style.display = '');
		_.forEach(enc, elem => elem.style.display = 'none');
	}

	function encryptForChannel(channel_id) {
		return;
		var {enc, dec} = getMessageNodes(channel_id);
		_.forEach(enc, elem => elem.style.display = '');
		_.forEach(dec, elem => elem.style.display = 'none');
	}

	// observe inserted encrypted text nodes
	var encryptedTextObserver = new MutationObserver(function(mutations){
		mutations.forEach(function (mut) {
			if(mut.addedNodes.length){
				for(var i=0;i<mut.addedNodes.length;i++){
					if(mut.addedNodes[i].innerText && mut.addedNodes[i].innerText.match(encryptedMessageRegex)){
						setTimeout(decryptNodeTree.bind(null, mut.addedNodes[i]), 10);
					}
				}
			}
		});
	});

	var insertText = {
		subtree : true,
		childList: true,
	};

	encryptedTextObserver.observe(document, insertText);
	decryptNodeTree(document.body);

	// query for keys for that domain
	var msgObj = {
		action : 'pouchdb:keys:query',
		query : {
			origin_url : window.location.host
		}
	};
	chrome.runtime.sendMessage(msgObj, function (resp) {
		keyIndex = keyIndex || {};
		keys = resp.rows.map(function (a) {
			keyIndex[a.key._id] = a.key;
			return a.key;
		});
	});

	msgCli.on('keys:'+window.location.host+':change', function (msg) {
		keyIndex = keyIndex || {};
		keyIndex[msg._id] = msg;
		keys.push(msg);
	});

	return {
		keys : keys,
		decryptForChannel : decryptForChannel,
		encryptForChannel : encryptForChannel
	};

});

require(['DecryptionManager'], function () {});
