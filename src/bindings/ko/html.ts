import * as ko from "../../knockout";

class HtmlBindingHandler implements ko.BindingHandler {
	update(element: Element, accessor: (value?: any) => any, allBindings: ko.Bindings, bindingContext: ko.BindingContext) {
		let newValue = newValue = accessor();
		element.innerHTML = newValue;
	}
}

ko.bindingHandlers["ko"]["html"] = new HtmlBindingHandler();