import * as ko from "_knockout";
import {BindingContext } from "../bindingContext";
import {BindingProvider } from "../bindingProvider";
import {BindingHandler, registerBindingHandler } from "../bindingHandler";
import {Bindings } from "../bindings";

class EventBindingHandler implements BindingHandler {
	update(element: Element, accessor: () => any, allBindings: Bindings, bindingContext: BindingContext) {
		let newValue = accessor();
		if (newValue === undefined || newValue === null) {
			newValue = "";
		}
		if (typeof newValue === 'object') {
			for (let prop in newValue) {
				let propValue = newValue[prop];
				if (typeof propValue === 'function') {
					element['on' + prop] = propValue.bind(bindingContext.$data);
				} else {
					console.error("Invalid argument: Expected a function.");
				}
			}
		}
	}
}

registerBindingHandler("ko.event", new EventBindingHandler());