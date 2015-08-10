import * as ko from "../../knockout";

class ClickBindingHandler implements ko.BindingHandler {
	init(element: Element, accessor: (value?: any) => any, allBindings: ko.Bindings, bindingContext: ko.BindingContext): void {
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