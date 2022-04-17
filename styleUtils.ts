function setStyle(element: HTMLElement, css: Object): void {
	for(const rule in css){
		element.style[rule] = css[rule]
	}
}

function setElement(element: HTMLElement, attributes: Object): void {
	for(const attribute in attributes){
		element[attribute] = attributes[attribute]
	}
}
