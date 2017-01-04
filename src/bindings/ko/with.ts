import * as ko from "_knockout";
import {BindingContext } from "../bindingContext";
import {BindingProvider } from "../bindingProvider";
import {BindingHandler, registerBindingHandler } from "../bindingHandler";
import {Bindings } from "../bindings";

import { applyBindingsInternal } from "../bindingEngine";

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
				applyBindingsInternal(newContext, childNode);
			}
		} else {
			element.style.visibility = "collapse";
		}
	}
}

registerBindingHandler("ko.with", new WithBindingHandler());