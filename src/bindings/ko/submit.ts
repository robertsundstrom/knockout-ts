import * as ko from "_knockout";
import {BindingContext } from "../bindingContext";
import {BindingProvider } from "../bindingProvider";
import {BindingHandler, registerBindingHandler, selector } from "../bindingHandler";
import {Bindings } from "../bindings";

@selector(["form"])
class SubmitBindingHandler implements BindingHandler {
	init(element: Element, accessor: (value?: any) => any, allBindings: Bindings, bindingContext: BindingContext): void {
		(function(bindingContext) {
			function setHandler(value) {
				let $data = bindingContext.$data;
				let func = value.bind($data);
				element.onsubmit = function() {
					return func();
				};
			}
			if (ko.isObservable(accessor)) {
				accessor.subscribe((newValue) => {
					setHandler(newValue);
				});
			}
			var value = accessor();
			setHandler(value);
		})(bindingContext);
	}
}

registerBindingHandler("ko.submit", new SubmitBindingHandler());