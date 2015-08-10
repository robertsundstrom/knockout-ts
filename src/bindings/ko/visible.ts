import * as ko from "../../knockout";

class VisibleBindingHandler implements ko.BindingHandler {
	update(element: Element, accessor: (value?: any) => any, allBindings: ko.Bindings, bindingContext: ko.BindingContext) {
		let value = accessor();
		if (value) {
			element.style.visibility = "visible";
		} else {
			element.style.visibility = "collapse";
		}
	}
}

ko.bindingHandlers["ko"]["visible"] = new VisibleBindingHandler();
