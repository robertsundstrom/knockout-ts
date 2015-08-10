import * as ko from "../../knockout";

class StyleBindingHandler implements ko.BindingHandler {
	update(element: Element, accessor: () => any, allBindings: ko.Bindings, bindingContext: ko.BindingContext) {
		let newValue = accessor();
		if (newValue === undefined || newValue === null) {
			newValue = "";
		}
		if (typeof newValue === 'object') {
			for (let prop in newValue) {
				let propValue = newValue[prop];
				if (typeof propValue === 'string' || typeof propValue === 'number') {
					element.style[prop] = propValue;
				} else {
					console.error("Invalid argument.");
				}
			}
		}
	}
}

ko.bindingHandlers["ko"]["style"] = new StyleBindingHandler();