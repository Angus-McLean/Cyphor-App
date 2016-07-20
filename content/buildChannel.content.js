
define('buildChannel', ['CyphorObserver', 'CyphorDomLib', 'DomUILib'], function (CyphorObserver, CyphorDomLib, DomUILib) {

	console.log('buildChannel.content.js', arguments);

	// define channels module :
	var tempChannel = {};

	// state : RECIPIENT, EDITABLE, ACTIVE
	var state = null;

	var channelObj = {};

	function initSaveChannel (callback) {
		tempChannel = {};
		// state = 'RECIPIENT';
		DomUILib.addGreyOverlay();

		// prevent user click from passing through
		document.body.addEventInterceptor('keyup', prevent);
		document.body.addEventInterceptor('keypress', prevent);
		// add escape listener
		document.body.addEventInterceptor('keydown', function (eve) {
			if(eve.keyCode == 27){
				// remove overlay
				DomUILib.removeGreyOverlay();

				// reset tempChannel
				tempChannel = {};

				// remove all interceptors
				document.body.removeEventInterceptor('mousedown', true);
				document.body.removeEventInterceptor('mouseup', true);
				document.body.removeEventInterceptor('click', true);
				document.body.removeEventInterceptor('keydown', true);
				document.body.removeEventInterceptor('keyup', true);
				document.body.removeEventInterceptor('keypress', true);

				if(typeof callback === 'function') {
					callback(null, null);
				}

				// prevent propagation
				return prevent(eve);
			}
		});

		// prevent user click from passing through
		document.body.addEventInterceptor('mouseup', prevent);
		document.body.addEventInterceptor('click', prevent);
		// add click interceptor
		document.body.addEventInterceptor('mousedown', function (eve) {
			// log recipient
			if(!tempChannel.recipient_elem){
				if(eve.target.innerText && eve.target.innerText !== ''){
					// account for cases where the event target is of type Node and not Element
					// if(eve.target instanceof Node){
					// 	tempChannel.recipient_elem = eve.target.parentElement;
					// } else {
						tempChannel.recipient_elem = eve.target;
					// }
					prevent(eve);
				}
			} else if(!tempChannel.clicked_elem){
				// watch for click to editable element
				if(eve.target){
					// if(eve.target instanceof Node){
					// 	tempChannel.clicked_elem = eve.target.parentElement;
					// } else {
						tempChannel.clicked_elem = eve.target;
					// }

					// let this event pass through and remove other input interceptors
					document.body.removeEventInterceptor('mousedown', true);
					document.body.removeEventInterceptor('mouseup', true);
					document.body.removeEventInterceptor('click', true);

					document.body.removeEventInterceptor('keydown', true);
					document.body.removeEventInterceptor('keyup', true);
					document.body.removeEventInterceptor('keypress', true);

					// listen for removal of clicked element(ie linkedin)
					CyphorObserver.on('remove', tempChannel.clicked_elem, function (mutationRecord) {
						//@TODO : set up so that it handle characterData too
						if(mutationRecord.type == 'childList'){
							// element was removed or changed.. check if its a configured channel
							tempChannel.parent_elem = mutationRecord.target;
						}
					});

					setTimeout(function () {
						// wait for all events to propagate in target page..
						// get active element
						tempChannel.active_elem = document.activeElement;

						// assume that if that element was going to be removed it would be removed by now
						CyphorObserver.removeListener('remove', tempChannel.clicked_elem);

						// set the editable element
						if(tempChannel.parent_elem){
							tempChannel.editable_elem = tempChannel.active_elem;
						} else {
							tempChannel.editable_elem = tempChannel.clicked_elem;
						}
						tempChannel.editable_elem = tempChannel.active_elem;
						// save and create channel
						var channelDoc = buildChannelObj(eve);

						state = null;
						DomUILib.removeGreyOverlay();

						callback(null, channelDoc);
					}, 300);
				}
			}

		});
	}

	function prevent (eve) {
		eve.stopPropagation();
		eve.preventDefault();
		return false;
	}

	function buildPathObj (eve, chanObj) {
		var recipElem = chanObj.recipient_elem;

		// account for iframes
		var parentDocument = (document.activeElement.nodeName == 'IFRAME') ? document.activeElement.contentDocument : document;

		var paths = {};

		if(!chanObj.recipient_elem.ownerDocument.contains(chanObj.recipient_elem)){
			console.error('Recipient Element is no longer in the document');
		}

		// add editable / recipient paths.. check to make sure it hasn't been removed from the document
		if(chanObj.editable_elem.ownerDocument.contains(chanObj.editable_elem)){
			paths.editable = CyphorDomLib.getFullPath(chanObj.editable_elem).replace(/ > /g,'\u0000> ').split('\u0000');
			paths.editable_recipient = CyphorDomLib.buildPath(chanObj.editable_elem, recipElem);
			paths.recipient_editable = CyphorDomLib.buildPath(recipElem, chanObj.editable_elem);
		}

		// assume active Element is always in the document
		paths.active = CyphorDomLib.getFullPath(parentDocument.activeElement).replace(/ > /g,'\u0000> ').split('\u0000');
		paths.active_recipient = CyphorDomLib.buildPath(parentDocument.activeElement, recipElem);
		paths.recipient_active = CyphorDomLib.buildPath(recipElem, parentDocument.activeElement);

		// check that baseNode is not null
		if(parentDocument.getSelection().baseNode){
			paths.selection = CyphorDomLib.getFullPath(parentDocument.getSelection().baseNode).replace(/ > /g,'\u0000> ').split('\u0000');
			paths.selection_recipient = CyphorDomLib.buildPath(parentDocument.getSelection().baseNode, recipElem);
			paths.recipient_selection = CyphorDomLib.buildPath(recipElem, parentDocument.getSelection().baseNode);
		}

		if(chanObj.clicked_elem.ownerDocument.contains(chanObj.clicked_elem)){
			paths.clicked = CyphorDomLib.getFullPath(chanObj.clicked_elem).replace(/ > /g,'\u0000> ').split('\u0000');
			paths.clicked_recipient = CyphorDomLib.buildPath(chanObj.clicked_elem, recipElem);
			paths.recipient_clicked = CyphorDomLib.buildPath(recipElem , chanObj.clicked_elem);
		}

		return paths;
	}

	function buildSelectors (eve, tempChannel) {
		var recipElem = tempChannel.recipient_elem;
		var selectors = {
			editable : {
				id : (tempChannel.editable_elem.id) ? ('#'+tempChannel.editable_elem.id) : null,
				class : CyphorDomLib.getClassSelector(tempChannel.editable_elem),
				attr : CyphorDomLib.getAttrSelector(tempChannel.editable_elem)
			},
			active : {
				id : (document.activeElement.id) ? ('#'+document.activeElement.id) : null,
				class : CyphorDomLib.getClassSelector(document.activeElement),
				attr : CyphorDomLib.getAttrSelector(document.activeElement)
			},
			selection : {
				id : (window.getSelection().baseNode.id) ? ('#'+window.getSelection().baseNode.id) : null,
				class : CyphorDomLib.getClassSelector(window.getSelection().baseNode),
				attr : CyphorDomLib.getAttrSelector(window.getSelection().baseNode)
			},
			clicked : {
				id : (eve.target.id) ? ('#'+eve.target.id) : null,
				class : CyphorDomLib.getClassSelector(eve.target),
				attr : CyphorDomLib.getAttrSelector(eve.target)
			},
			recipient : {
				id : (recipElem.id) ? ('#'+recipElem.id) : null,
				class : CyphorDomLib.getClassSelector(recipElem),
				attr : CyphorDomLib.getAttrSelector(recipElem)
			},
		};
		return selectors;
	}

	function buildChannelObj (eve) {
		var t = tempChannel;

		var channel_id = Date.now() + Math.random().toString().substring(2,6);
		var channelObj = {
			_id : channel_id,
			origin_url : window.location.host,
			channel_paths : CyphorDomLib.buildPath(t.editable_elem, t.recipient_elem),
			channel_name : (t.recipient_elem.innerText !== '') ? t.recipient_elem.innerText : t.recipient_elem.value,
			channel_id : channel_id,
			active : true,
			paths : buildPathObj(eve, t),
			selectors : buildSelectors(eve, t)
		};

		return channelObj;
	}

	return {
		initSaveChannel : initSaveChannel
	};
});
require(['buildChannel'], function () {});
