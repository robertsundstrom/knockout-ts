import * as ko from "../../knockout";

class CssBindingHandler implements ko.BindingHandler {
	update(element: Element, accessor: () => any, allBindings: ko.Bindings, bindingContext: ko.BindingContext) {
		let newValue = accessor();
		if (newValue === undefined || newValue === null) {
			newValue = "";
		}
		let classStr = "";
		if (typeof newValue === 'object') {
			for (let prop in newValue) {
				if (newValue[prop] === true) {
					classStr += `${prop} `;
				}
			}
		}
		element.className = classStr.trim();
	}
}

ko.bindingHandlers["ko"]["css"] = new CssBindingHandler();