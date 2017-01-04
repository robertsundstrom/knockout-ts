import * as ko from "_knockout";
import {BindingContext } from "../bindingContext";
import {BindingProvider } from "../bindingProvider";
import {BindingHandler, registerBindingHandler, selector } from "../bindingHandler";
import {Bindings } from "../bindings";

@selector(["a", "button", "input[type=button]", "input[type=submit]"])
class HrefBindingHandler implements BindingHandler {
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

registerBindingHandler("ko.href", new HrefBindingHandler());