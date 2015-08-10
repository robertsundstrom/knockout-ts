import * as ko from "../../knockout";

class SubmitBindingHandler implements ko.BindingHandler {
	selector = "form";

	init(element: Element, accessor: (value?: any) => any, allBindings: ko.Bindings, bindingContext: ko.BindingContext): void {
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

ko.bindingHandlers["ko"]["submit"] = new SubmitBindingHandler();