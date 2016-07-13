require(['CyphorDomLib'], function (CyphorDomLib) {

	var encryptedMessageRegex = /\-{1,3} cyphor\.io \-\- ([A-Za-z0-9\=\+]+) \-\- ([A-Za-z0-9\=\+\/]+) \-\- cyphor\.io \-\-/;

	function decryptNodeTree (node) {
		var elem = CyphorDomLib.getBaseTextNode(node, encryptedMessageRegex);

		// account for possibility of multiple encrypted messages in this mutation record
		while(elem && !elem.isContentEditable){
			var val, decryptedMessage;

			if(elem.textContent){
				val = elem.textContent;
				decryptedMessage = decryptFromString(val);

				elem.textContent = elem.textContent.replace(val,decryptedMessage);
			} else if(elem.innerText){
				val = elem.innerText;
				decryptedMessage = decryptFromString(val);
				elem.innerText = elem.innerText.replace(val,decryptedMessage);
			}

			elem = CyphorDomLib.getBaseTextNode(node, encryptedMessageRegex);
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

		return decryptedMessage;
	}




	// observe inserted encrypted text nodes
	var encryptedTextObserver = new MutationObserver(function(mutations){
		mutations.forEach(function (mut) {
			if(mut.addedNodes.length){
				for(var i=0;i<mut.addedNodes.length;i++){
					if(mut.addedNodes[i].innerText && mut.addedNodes[i].innerText.match(encryptedMessageRegex)){
						decryptNodeTree(mut.addedNodes[i]);
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
