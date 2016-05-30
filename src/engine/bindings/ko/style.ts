import * as ko from "../../knockout";
import {BindingContext } from "../bindingContext";
import {BindingProvider } from "../bindingProvider";
import {BindingHandler } from "../bindingHandler";
import {Bindings } from "../bindings";

class StyleBindingHandler implements BindingHandler {
	update(element: Element, accessor: () => any, allBindings: Bindings, bindingContext: BindingContext) {
		let newValue = accessor();
		if (newValue === undefined || newValue === null) {
			newValue = "";
		}
		if (typeof newValue === 'object') {
			for (let prop in newValue) {
				let propValue = newValue[prop];
				if (typeof propValue === 'string' || typeof propValue === 'number') {
					element.style[prop] = propValue;
				} else {
					console.error("Invalid argument.");
				}
			}
		}
	}
}

ko.registerBindingHandler("ko.style", new StyleBindingHandler());