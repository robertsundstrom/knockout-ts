import * as ko from "../../knockout";
import {BindingContext } from "../bindingContext";
import {BindingProvider } from "../bindingProvider";
import {BindingHandler } from "../bindingHandler";
import {Bindings } from "../bindings";

class OptionsBindingHandler implements BindingHandler {
	selector = "select";

	update(element: Element, accessor: (value?: any) => any, allBindings: Bindings, bindingContext: BindingContext) {
		let itemsArray = accessor();

		let wasEmpty = element.length == 0;
		let multiple = element.multiple;
		let existingOptions = Array.prototype.slice.call(element.options);
		let optionsText = null;
		let optionsValue = null;

		if (allBindings.hasBinding("ko.optionsText")) {
			optionsText = allBindings.getBinding("ko.optionsText")();
		}
		if (allBindings.hasBinding("ko.optionsValue")) {
			optionsValue = allBindings.getBinding("ko.optionsValue")();
		}
		if (allBindings.hasBinding("ko.optionsCaption")) {

		}

		var added = [];
		var deleted = [];

		for (var item of itemsArray) {
			let exists = existingOptions.filter(existingItem => existingItem === item) > 0;
			if (!exists) {
				added.push(item);
			}
		}

		for (var item of existingOptions) {
			let exists = itemsArray.filter(arrayItem => arrayItem === item) > 0;
			if (!exists) {
				deleted.push(item);
			}
		}

		for (var item of added) {
			let text = item.toString();
			if (optionsText !== null) {
				text = item[optionsText];
			}
			let value = item.toString();
			if (optionsValue !== null) {
				value = item[optionsValue];
			}
			element.add(new Option(text, value));
		}

		console.log("Added", added);
		console.log("Removed", deleted);
		
		// DO SOME MAGIC TO UPDATE THE OPTIONS.
	}
}

ko.bindingHandlers["ko"]["options"] = new OptionsBindingHandler();

class OptionsTextBindingHandler implements BindingHandler {

}

ko.bindingHandlers["ko"]["optionsText"] = new OptionsTextBindingHandler();

class OptionsValueBindingHandler implements BindingHandler {

}

ko.bindingHandlers["ko"]["optionsValue"] = new OptionsValueBindingHandler();
