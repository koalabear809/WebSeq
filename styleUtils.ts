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

function makeElement(type: string, attributes: Object, base?: Object): any {
	let styles: Object;
	let newAttributeObject: Object;
	if(base && ('style' in base) && ('style' in attributes)){
		styles = Object.assign(attributes["style"], base["style"]);
		newAttributeObject = Object.assign(attributes, base);
		newAttributeObject["style"] = styles;
	} else {
		newAttributeObject = Object.assign(attributes, base);
	}
	let newElement = document.createElement(type)
	setElementAttrs(newElement, newAttributeObject)
	return newElement;
}
