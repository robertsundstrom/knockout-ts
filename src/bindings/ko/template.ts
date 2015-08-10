import * as ko from "../../knockout";

class TemplateBindingHandler implements ko.BindingHandler {
	selector = ["div"];

	init(element: Element, accessor: (value?: any) => any, allBindings: ko.Bindings, bindingContext: ko.BindingContext) {
		let obj = accessor();
		console.log(obj);
		if (typeof (obj) === 'string') {

		} else if (typeof (obj) === 'object') {
			let name = null;
			let observable = null;
			if ("name" in obj) {
				name = obj.name;
			} else {
				console.error("Invalid argument.");
			}
			if ("data" in obj) {
				var items = obj.data;
				observable = ko.resolveObservable(bindingContext.$data, items);
				console.log(observable);
			} else if ("foreach" in obj) {
				var items = obj.foreach;
				observable = ko.resolveObservable(bindingContext.$data, items);
				console.log(observable);
			}
		} else {
			console.error("Invalid argument.");
		}
	}
}

ko.bindingHandlers["ko"]["template"] = new TemplateBindingHandler();