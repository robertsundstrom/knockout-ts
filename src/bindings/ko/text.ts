import * as ko from "../../knockout";
import {BindingContext } from "../bindingContext";
import {BindingProvider } from "../bindingProvider";
import {BindingHandler } from "../bindingHandler";
import {Bindings } from "../bindings";

class TextBindingHandler implements BindingHandler {
	update(element: Element, accessor: (value?: any) => any, allBindings: Bindings, bindingContext: BindingContext): void {
		element.textContent = accessor();
	}
}

ko.bindingHandlers["ko"]["text"] = new TextBindingHandler();