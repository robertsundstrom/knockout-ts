import * as ko from "../../knockout";

class WithBindingHandler implements ko.BindingHandler {
	init(element: Element, accessor: (value?: any) => any, allBindings: ko.Bindings, bindingContext: ko.BindingContext) {
		let value = accessor();
		if (value !== undefined) {
			ko.track(value);
			let newContext: ko.BindingContext = {
				$data: value,
				$parent: bindingContext.$data,
				$root: bindingContext.$root
			};
			return newContext;
		}
	}

	update(element: Element, accessor: (value?: any) => any, allBindings: ko.Bindings, bindingContext: ko.BindingContext) {
		let value = accessor();
		console.log(JSON.stringify(value));
		console.log(bindingContext);
		if (value !== undefined && value !== null) {
			ko.track(value);
			let newContext: ko.BindingContext = {
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

ko.bindingHandlers["ko"]["with"] = new WithBindingHandler();