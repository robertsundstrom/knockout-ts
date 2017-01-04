import * as ko from "_knockout";
import {BindingContext } from "../bindingContext";
import {BindingProvider } from "../bindingProvider";
import {BindingHandler, registerBindingHandler, selector } from "../bindingHandler";
import {Bindings } from "../bindings";

@selector(["div"])
class TemplateBindingHandler implements BindingHandler {
	init(element: Element, accessor: (value?: any) => any, allBindings: Bindings, bindingContext: BindingContext) {
		let options = accessor();
		console.log(options);
		if (typeof (options) === 'string') {

		} else if (typeof (options) === 'object') {
			let name = null;
			let observable = null;
			if ("name" in options) {
				name = options.name;
			} else {
				console.error("Invalid argument.");
			}
			if ("data" in options) {
				var items = options.data;
				observable = ko.resolveObservable(bindingContext.$data, items);
				console.log(observable);
			} else if ("foreach" in options) {
				var items = options.foreach;
				observable = ko.resolveObservable(bindingContext.$data, items);
				console.log(observable);
			}
		} else {
			console.error("Invalid argument.");
		}
	}
}

registerBindingHandler("ko.template", new TemplateBindingHandler());