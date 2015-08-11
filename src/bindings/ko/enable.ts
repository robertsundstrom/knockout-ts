import * as ko from "../../knockout";
import {BindingContext } from "../bindingContext";
import {BindingProvider } from "../bindingProvider";
import {BindingHandler } from "../bindingHandler";
import {Bindings } from "../bindings";

class EnableBindingHandler implements BindingHandler {
	update(element: Element, accessor: (value?: any) => any, allBindings: Bindings, bindingContext: BindingContext) {
		let value = accessor();
		if (value) {
			element.disabled = false;
		} else {
			element.disabled = true;
		}
	}
}

ko.bindingHandlers["ko"]["enable"] = new EnableBindingHandler();