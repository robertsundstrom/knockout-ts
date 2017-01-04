import * as ko from "_knockout";
import {BindingContext } from "../bindingContext";
import {BindingProvider } from "../bindingProvider";
import {BindingHandler, registerBindingHandler } from "../bindingHandler";
import {Bindings } from "../bindings";

class TextBindingHandler implements BindingHandler {
	update(element: Element, accessor: (value?: any) => any, allBindings: Bindings, bindingContext: BindingContext): void {
		element.textContent = accessor();
	}
}

registerBindingHandler("ko.text", new TextBindingHandler());