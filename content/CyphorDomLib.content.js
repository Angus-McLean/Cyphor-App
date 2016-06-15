// domParse.content.js

define('CyphorDomLib', [], function () {

	console.log('CyphorDomLib.content.js', arguments);

	function traversePath(start, pathArr, fuzzyTravers){
		var cur_elem = start,
			next_elem;
		for (var i = 0; i < pathArr.length; i++) {
			if(pathArr[i] == '^'){

				// account for traversing upwards through iframes
				if(cur_elem.parentElement == null && cur_elem.ownerDocument.defaultView.frameElement != null){
					cur_elem = cur_elem.ownerDocument.defaultView.frameElement;
				} else if(cur_elem.parentElement !== null) {
					cur_elem = cur_elem.parentElement;
				} else {
					return null;
				}

			} else {
				if(fuzzyTravers){
					var query = pathArr.slice(i).join('').replace(/:scope/g,'').replace(/\:nth\-child\([0-9]+\)/g,'');
					next_elem = cur_elem.querySelectorAll(':scope'+query + ', '+query.replace(/^ *> */,''));
					if(next_elem && next_elem.length == 1){
						return next_elem[0];
					} else if(next_elem && next_elem.length !== 0){
						cur_elem = cur_elem.querySelectorAll(pathArr[i])[0];
					} else {
						return null;
					}
				} else {
					next_elem = cur_elem.querySelectorAll(pathArr[i])[0];
					cur_elem = next_elem;
				}
			}
		}
		return cur_elem;
	}

	// build a path between 2 elements
	function buildPath (origin, destination) {
		var cur = origin,
			path = [];

		var destinationIframe = (!document.contains(destination)) ? destination.ownerDocument.defaultView.frameElement : null;
		while(!cur.contains(destination) || (destinationIframe && !cur.contains(destinationIframe))){
			// account for traversing upwards through iframes
			if(cur.parentElement == null && cur.ownerDocument.defaultView.frameElement != null){
				cur = cur.ownerDocument.defaultView.frameElement;
			} else {
				cur = cur.parentElement;
			}
			path.push('^');
		}
		while(cur){
			path.push(getContainingElemPath(cur, destination));
			cur = cur.querySelectorAll(path[path.length-1])[0];
		}
		path.pop();
		return path;
	}

	//@TODO : account for nested Iframes
	// get one level queryselector for a target child element
	function getContainingElemPath (parentElement, targetElem) {
		// parentElement is an iframe
		var elems = (parentElement.nodeName === 'IFRAME') ? parentElement.contentDocument.children : parentElement.children;

		// destination element is in iframe
		var destinationIframe = (!document.contains(targetElem)) ? targetElem.ownerDocument.defaultView.frameElement : null;
		for(var i=0;i<elems.length;i++){
			if(elems[i].contains(targetElem) || (destinationIframe && elems[i].contains(destinationIframe))){

				// get index of particular element
				var ind;
				//var child_elems = parentElement.querySelectorAll(':scope > '+elems[i].nodeName.toLowerCase());
				var child_elems = parentElement.children;
				for(var j=0;j<child_elems.length;j++){
					if(child_elems[j] == elems[i]){
						ind = j;
						if(ind === 0){
							return ':scope > '+elems[i].nodeName.toLowerCase();
						} else {
							return ':scope > '+elems[i].nodeName.toLowerCase()+':nth-child('+(j+1)+')';
						}
					}
				}
			}
		}
	}

	function getFullPath(el){
		var names = [];
		while (el.parentNode){
			if (el.id){
				names.unshift('#'+el.id);
				break;
			}else{
				if (el==el.ownerDocument.documentElement) names.unshift(el.tagName);
				else{
					for (var c=1,e=el;e.previousElementSibling;e=e.previousElementSibling,c++);
						names.unshift(el.tagName+":nth-child("+c+")");
				}
				el=el.parentNode;
			}
		}
		return names.join(" > ");
	}


	// get a selector pattern that queries the correct element even when there were some modifications too it
	function getClassSelector (elem) {
		var eleQuery = '';
		// account for element being of type node and has no attributes property
		eleQuery += (elem.attributes && elem.attributes.class && elem.attributes.class.value) ? '.'+elem.attributes.class.value.split(' ').join('.') : '';
		return (eleQuery !== '') ? elem.tagName + ' ' + eleQuery : null;
	}

	function getAttrSelector (elem) {
		var avoid = ['class', 'style'];
		var eleQuery = '';
		if(!elem.attributes){
			return null;
		}
		Array.prototype.forEach.call(elem.attributes, function (attr) {
			if(avoid.indexOf(attr.name) == -1){
				eleQuery += (attr.value) ? ('['+attr.name+'="'+attr.value.replace(/"/g,'\\"')+'"]') : '';
			}
		});
		return (eleQuery !== '') ? elem.tagName + '' + eleQuery : null;
	}

	var nonTextElems = ['SCRIPT','INPUT','TEXTAREA', 'BODY'];
	function getBaseTextNode (DOM_Node,regex) {
		if(DOM_Node.textContent||DOM_Node.innerText){
			var matchVal = (DOM_Node.textContent||DOM_Node.innerText).match(regex);
		} else {
			matchVal = null;
		}

		if(matchVal !== null){
			var nodeTagName = (DOM_Node.tagName || DOM_Node.parentElement.tagName).toUpperCase();
			if(DOM_Node.children && DOM_Node.children.length > 0){
				var child_containsRegex = false;
				for(var i=0;i<DOM_Node.children.length;i++){

					if(nonTextElems.indexOf(DOM_Node.children[i].tagName.toUpperCase()) >= 0){
						continue;
					}
					var innerNode = getBaseTextNode(DOM_Node.children[i],regex);
					if(innerNode !== false){
						return innerNode;
					}
				}
				if(!child_containsRegex && nonTextElems.indexOf(nodeTagName) < 0){
					return DOM_Node;
				} else if(!child_containsRegex){
					return false;
				}
			} else if(nonTextElems.indexOf(nodeTagName) < 0){
				return DOM_Node;
			} else {
				return false;
			}
		} else {
			return false;
		}
	}

	return {
		traversePath : traversePath,
		buildPath : buildPath,
		getBaseTextNode : getBaseTextNode,
		getFullPath : getFullPath,
		getClassSelector : getClassSelector,
		getAttrSelector : getAttrSelector
	};
});
require(['CyphorDomLib'], function(){});
