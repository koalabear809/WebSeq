function setStyle(element: HTMLElement, css: Object): void {
	for(const rule in css){
		element.style[rule] = css[rule]
	}
}

function setElementAttrs(element: HTMLElement, attributes: Object): void {
	for(const attribute in attributes){
		if(attribute == "style"){
			setStyle(element, attributes[attribute]);
			continue;
		}
		element[attribute] = attributes[attribute]
	}
}

function makeElement(type: string, attributes: Object): any {
	let newElement = document.createElement(type)
	setElementAttrs(newElement, attributes)
	return newElement;
}
