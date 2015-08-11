import * as ko from "../../knockout";
import {BindingContext } from "../bindingContext";
import {BindingProvider } from "../bindingProvider";
import {BindingHandler } from "../bindingHandler";
import {Bindings } from "../bindings";

class AttrBindingHandler implements BindingHandler {
	update(element: Element, accessor: () => any, allBindings: Bindings, bindingContext: BindingContext) {
		let newValue = accessor();
		if (newValue === undefined || newValue === null) {
			newValue = "";
		}
		if (typeof newValue === 'object') {
			for (let prop in newValue) {
				element[prop] = newValue[prop];
			}
		}
	}
}

if (typeof ko.bindingHandlers["ko"] == 'undefined') {
	ko.bindingHandlers.ko = {};
	ko.bindingHandlers.defaultNamespace = "ko";
}
ko.bindingHandlers["ko"]["attr"] = new AttrBindingHandler();