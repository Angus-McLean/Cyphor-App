require(['CyphorDomLib'], function (CyphorDomLib) {

	var encryptedMessageRegex = /\-{1,3} cyphor\.io \-\- ([A-Za-z0-9\=\+]+) \-\- ([A-Za-z0-9\=\+\/]+) \-\- cyphor\.io \-\-/;

	function decryptNodeTree(startElem) {
		iterateEncryptedNodes(startElem, function (textNode) {
			//var baseNode = CyphorDomLib.getBaseTextNode(textNode, encryptedMessageRegex);
			//console.log(textNode);
			addElementOnTop(textNode, decryptFromString((textNode.nodeValue||textNode.textContent||textNode.innerText)));
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
		var strMatch = encryptedString.match(encryptedMessageRegex);
		var msgID = strMatch[1],
			msgTxt = strMatch[2];

		var decryptionKey = '1234567890';

		var decryptedObj = CryptoJS.AES.decrypt(msgTxt, decryptionKey);
		var decryptedMessage = decryptedObj.toString(CryptoJS.enc.Utf8);
		//console.log('decrypted : '+msgTxt+' to : '+decryptedMessage);

		// replace encrypted component with decryptedMessage
		return encryptedString.replace(encryptedMessageRegex, decryptedMessage);
	}

	function addElementOnTop(elem, textStr) {
		var newE = elem.cloneNode();

		newE.innerText = textStr;
		elem.style.display = 'none';
		elem.parentElement.appendChild(newE);
		return newE;
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


})();
