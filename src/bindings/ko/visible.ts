import * as ko from "../../knockout";
import {BindingContext } from "../bindingContext";
import {BindingProvider } from "../bindingProvider";
import {BindingHandler } from "../bindingHandler";
import {Bindings } from "../bindings";

class VisibleBindingHandler implements BindingHandler {
	update(element: Element, accessor: (value?: any) => any, allBindings: Bindings, bindingContext: BindingContext) {
		let value = accessor();
		if (value) {
			element.style.visibility = "visible";
		} else {
			element.style.visibility = "collapse";
		}
	}
}

ko.bindingHandlers["ko"]["visible"] = new VisibleBindingHandler();
