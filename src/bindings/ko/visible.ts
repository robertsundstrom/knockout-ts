import * as ko from "_knockout";
import {BindingContext } from "../bindingContext";
import {BindingProvider } from "../bindingProvider";
import {BindingHandler, registerBindingHandler } from "../bindingHandler";
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

registerBindingHandler("ko.visible", new VisibleBindingHandler());