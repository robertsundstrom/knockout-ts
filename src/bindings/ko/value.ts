import * as ko from "../../knockout";
import {BindingContext } from "../bindingContext";
import {BindingProvider } from "../bindingProvider";
import {BindingHandler, selector } from "../bindingHandler";
import {Bindings } from "../bindings";

@selector(["input", "select", "button"])
class ValueBindingHandler implements BindingHandler {
	init(element: Element, accessor: (value?: any) => any, allBindings: Bindings, bindingContext: BindingContext): void {
		if (element.localName.toLocaleLowerCase() === "input" || element.localName.toLocaleLowerCase() === "select") {
			element.onchange = function() {
				accessor(element.value);
			}
		}
	}
	update(element: Element, accessor: (value?: any) => any, allBindings: Bindings, bindingContext: BindingContext) {
		let newValue = accessor();
		element.value = newValue;
	}
}

ko.bindingHandlers["ko"]["value"] = new ValueBindingHandler();