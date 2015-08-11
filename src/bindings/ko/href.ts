import * as ko from "../../knockout";
import {BindingContext } from "../bindingContext";
import {BindingProvider } from "../bindingProvider";
import {BindingHandler } from "../bindingHandler";
import {Bindings } from "../bindings";

class HrefBindingHandler implements BindingHandler {
	selector = ["a", "button", "input[type=button]", "input[type=submit]"];

	update(element: Element, accessor: (value?: any) => any, allBindings: Bindings, bindingContext: BindingContext) {
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