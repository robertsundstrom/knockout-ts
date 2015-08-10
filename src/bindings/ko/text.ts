import * as ko from "../../knockout";

class TextBindingHandler implements ko.BindingHandler {
	update(element: Element, accessor: (value?: any) => any, allBindings: ko.Bindings, bindingContext: ko.BindingContext): void {
		element.textContent = accessor();
	}
}

ko.bindingHandlers["ko"]["text"] = new TextBindingHandler();