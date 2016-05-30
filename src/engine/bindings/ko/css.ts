import * as ko from "../../knockout";
import {BindingContext } from "../bindingContext";
import {BindingProvider } from "../bindingProvider";
import {BindingHandler } from "../bindingHandler";
import {Bindings } from "../bindings";

class CssBindingHandler implements BindingHandler {
	update(element: Element, accessor: () => any, allBindings: Bindings, bindingContext: BindingContext) {
		let newValue = accessor();
		if (newValue === undefined || newValue === null) {
			newValue = "";
		}
		let classStr = "";
		if (typeof newValue === 'object') {
			for (let prop in newValue) {
				if (newValue[prop] === true) {
					classStr += `${prop} `;
				}
			}
		}
		element.className = classStr.trim();
	}
}

ko.registerBindingHandler("ko.css", new CssBindingHandler());