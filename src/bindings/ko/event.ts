import * as ko from "../../knockout";

class EventBindingHandler implements ko.BindingHandler {
	update(element: Element, accessor: () => any, allBindings: ko.Bindings, bindingContext: ko.BindingContext) {
		let newValue = accessor();
		if (newValue === undefined || newValue === null) {
			newValue = "";
		}
		if (typeof newValue === 'object') {
			for (let prop in newValue) {
				let propValue = newValue[prop];
				if (typeof propValue === 'function') {
					element['on' + prop] = propValue.bind(bindingContext.$data);
				} else {
					console.error("Invalid argument: Expected a function.");
				}
			}
		}
	}
}

ko.bindingHandlers["ko"]["event"] = new EventBindingHandler();