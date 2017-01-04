import * as ko from "_knockout";
import {BindingContext } from "../bindingContext";
import {BindingProvider } from "../bindingProvider";
import {BindingHandler, registerBindingHandler } from "../bindingHandler";
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

registerBindingHandler("ko.click", new ClickBindingHandler());