import * as ko from "../../knockout";

class ValueBindingHandler implements ko.BindingHandler {
	selector = ["input", "select", "button"];

	init(element: Element, accessor: (value?: any) => any, allBindings: ko.Bindings, bindingContext: ko.BindingContext): void {
		if (element.localName.toLocaleLowerCase() === "input" || element.localName.toLocaleLowerCase() === "select") {
			element.onchange = function() {
				accessor(element.value);
			}
		}
	}
	update(element: Element, accessor: (value?: any) => any, allBindings: ko.Bindings, bindingContext: ko.BindingContext) {
		let newValue = accessor();
		element.value = newValue;
	}
}

ko.bindingHandlers["ko"]["value"] = new ValueBindingHandler();