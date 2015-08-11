import * as ko from "../../knockout";
import {BindingContext } from "../bindingContext";
import {BindingProvider } from "../bindingProvider";
import {BindingHandler } from "../bindingHandler";
import {Bindings } from "../bindings";

class ClickBindingHandler implements BindingHandler {
	init(element: Element, accessor: (value?: any) => any, allBindings: Bindings, bindingContext: BindingContext): void {
		(function(bindingContext) {
			function setHandler(value) {
				let $data = bindingContext.$data;
				let func = value.bind($data);
				element.onclick = function() {
					func();
				};
			}
			if (ko.isObservable(accessor)) {
				accessor.subscribe((newValue) => {
					setHandler(newValue);
				});
			}
			let value = accessor();
			setHandler(value);
		})(bindingContext);
	}
}

if (typeof ko.bindingHandlers["ko"] == 'undefined') {
	ko.bindingHandlers.ko = {};
	ko.bindingHandlers.defaultNamespace = "ko";
}
ko.bindingHandlers["ko"]["click"] = new ClickBindingHandler();