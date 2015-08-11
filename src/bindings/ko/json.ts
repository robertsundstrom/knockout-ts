import * as ko from "../../knockout";
import {BindingContext } from "../bindingContext";
import {BindingProvider } from "../bindingProvider";
import {BindingHandler } from "../bindingHandler";
import {Bindings } from "../bindings";

class JsonBindingHandler implements BindingHandler {
	update(element: Element, accessor: (value?: any) => any, allBindings: Bindings, bindingContext: BindingContext) {
		let newValue = accessor();
		element.textContent = JSON.stringify(newValue);
	}
}

ko.bindingHandlers["ko"]["json"] = new JsonBindingHandler();