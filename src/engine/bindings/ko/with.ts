import * as ko from "../../knockout";
import {BindingContext } from "../bindingContext";
import {BindingProvider } from "../bindingProvider";
import {BindingHandler } from "../bindingHandler";
import {Bindings } from "../bindings";

class WithBindingHandler implements BindingHandler {
	init(element: Element, accessor: (value?: any) => any, allBindings: Bindings, bindingContext: BindingContext) {
		let value = accessor();
		if (value !== undefined) {
			ko.track(value);
			let newContext: BindingContext = {
				$data: value,
				$parent: bindingContext.$data,
				$root: bindingContext.$root
			};
			return newContext;
		}
	}

	update(element: Element, accessor: (value?: any) => any, allBindings: Bindings, bindingContext: BindingContext) {
		let value = accessor();
		console.log(JSON.stringify(value));
		console.log(bindingContext);
		if (value !== undefined && value !== null) {
			ko.track(value);
			let newContext: BindingContext = {
				$data: value,
				$parent: bindingContext.$data,
				$root: bindingContext.$root
			};
			for (let childNode of Array.prototype.slice.call(element.childNodes)) {
				ko.applyBindingsInternal(newContext, childNode);
			}
		} else {
			element.style.visibility = "collapse";
		}
	}
}

ko.registerBindingHandler("ko.with", new WithBindingHandler());