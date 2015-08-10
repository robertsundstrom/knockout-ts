import * as ko from "../../knockout";

class JsonBindingHandler implements ko.BindingHandler {
	update(element: Element, accessor: (value?: any) => any, allBindings: ko.Bindings, bindingContext: ko.BindingContext) {
		let newValue = accessor();
		element.textContent = JSON.stringify(newValue);
	}
}

ko.bindingHandlers["ko"]["json"] = new JsonBindingHandler();