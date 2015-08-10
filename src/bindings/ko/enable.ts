import * as ko from "../../knockout";

class EnableBindingHandler implements ko.BindingHandler {
	update(element: Element, accessor: (value?: any) => any, allBindings: ko.Bindings, bindingContext: ko.BindingContext) {
		let value = accessor();
		if (value) {
			element.disabled = false;
		} else {
			element.disabled = true;
		}
	}
}

ko.bindingHandlers["ko"]["enable"] = new EnableBindingHandler();