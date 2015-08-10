import * as ko from "../../knockout";

class HrefBindingHandler implements ko.BindingHandler {
	selector = ["a", "button", "input[type=button]", "input[type=submit]"];

	update(element: Element, accessor: (value?: any) => any, allBindings: ko.Bindings, bindingContext: ko.BindingContext) {
		let newValue = accessor();
		switch (element.localName) {
			case "a":
				element.href = newValue;
				break;

			case "input":
			case "button":
				element.onclick = function() {
					window.location.href = newValue;
				};
				break;
		}
	}
}

ko.bindingHandlers["ko"]["href"] = new HrefBindingHandler();