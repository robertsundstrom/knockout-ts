import * as ko from "../../knockout";

class AttrBindingHandler implements ko.BindingHandler {
	update(element: Element, accessor: () => any, allBindings: ko.Bindings, bindingContext: ko.BindingContext) {
		let newValue = accessor();
		if (newValue === undefined || newValue === null) {
			newValue = "";
		}
		if (typeof newValue === 'object') {
			for (let prop in newValue) {
				element[prop] = newValue[prop];
			}
		}
	}
}

if (typeof ko.bindingHandlers["ko"] == 'undefined') {
	ko.bindingHandlers.ko = {};
	ko.bindingHandlers.defaultNamespace = "ko";
}
ko.bindingHandlers["ko"]["attr"] = new AttrBindingHandler();