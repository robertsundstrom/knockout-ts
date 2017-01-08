import * as ko from "_knockout";
import { BindingContext } from "../bindingContext";
import { BindingProvider } from "../bindingProvider";
import { BindingHandler, registerBindingHandler, selector } from "../bindingHandler";
import { Bindings } from "../bindings";
import * as templating from "../../templating";
import { ObservableArray } from "../../observables";

@selector(["div"])
class TemplateBindingHandler implements BindingHandler {
	init(element: Element, accessor: (value?: any) => any, allBindings: Bindings, bindingContext: BindingContext) {
		let options = accessor();
		console.log(options);
		if (typeof (options) === 'string') {

		} else if (typeof (options) === 'object') {
			let name = null;
			let observable: ObservableArray<any> = null;
			if ("name" in options) {
				name = options.name;
			} else {
				console.error("Invalid argument.");
			}
			if ("data" in options) {
				let items = options.data;
				observable = <any>ko.resolveObservable(bindingContext.$data, items);
				console.log(observable);
			} else if ("foreach" in options) {
				let items = options.foreach;
				observable = <ObservableArray<any>>ko.resolveObservable(bindingContext.$data, items);
				if (typeof observable !== "undefined") {
					observable.subscribe((newItems, oldItems) => {
						for (let item of newItems) {
							let templateNode = <Node>document.getElementById(name);
							templating.append(bindingContext, <HTMLElement>element, templateNode, item);
						}
					});
				}
				for (let item of items) {
					let templateNode = <Node>document.getElementById(name);
					templating.append(bindingContext, <HTMLElement>element, templateNode, item);
				}
			}
		} else {
			console.error("Invalid argument.");
		}
	}
}

registerBindingHandler("ko.template", new TemplateBindingHandler());