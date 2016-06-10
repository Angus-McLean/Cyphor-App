function sendText(element, text) {
	var ev3 = document.createEvent('TextEvent')
	ev3.initTextEvent('textInput', true, true, null, text, 9, "en-US");
	element.dispatchEvent(ev3)

	var ev1 = new KeyboardEvent('keydown', {
		altKey:false,
		bubbles:true,
		cancelable:true,
		ctrlKey:false,
		isTrusted:true,
		key:'Enter',
		keyCode:13,
		location:0,
		metaKey:false,
		repeat:false,
		returnValue:true,
		shiftKey:false,
		type:'keydown',
		which:13
	});
	element.dispatchEvent(ev1)

	// keypress :
	var ev2 = new KeyboardEvent('keypress', {
		altKey:false,
		bubbles:true,
		cancelable:true,
		charCode:13,
		ctrlKey:false,
		isTrusted:true,
		key:'Enter',
		keyCode:13,
		location:0,
		metaKey:false,
		repeat:false,
		returnValue:true,
		shiftKey:false,
		type:'keypress',
		which:13
	});
	element.dispatchEvent(ev2)
	// keyup
	var ev5 = new KeyboardEvent('keyup', {
		altKey:false,
		bubbles:true,
		cancelable:true,
		ctrlKey:false,
		isTrusted:true,
		key:'Enter',
		keyCode:13,
		location:0,
		metaKey:false,
		repeat:false,
		returnValue:true,
		shiftKey:false,
		type:'keyup',
		which:13
	});
	element.dispatchEvent(ev5);
}
