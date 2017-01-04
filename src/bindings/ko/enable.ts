import * as ko from "_knockout";
import {BindingContext } from "../bindingContext";
import {BindingProvider } from "../bindingProvider";
import {BindingHandler, registerBindingHandler } from "../bindingHandler";
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

registerBindingHandler("ko.enable", new EnableBindingHandler());