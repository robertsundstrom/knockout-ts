import {BindingProvider} from "bindingProvider";
import {BindingContext} from "bindingContext";

import { observable } from "../observables/simpleObservable";
import { observableArray } from "../observables/observableArray";
import { computed } from "../observables/computedObservable";

import  * as js from "../utils/js-object-literal-parse";

import  * as be from "bindingEngine";
import  * as bh from "bindingHandler";

import * as common from "../observables/common";

interface String {
	matchAll(regexp: RegExp): any[];
}

String.prototype.matchAll = function(regexp: RegExp): any[] {
	let matches = [];
	this.replace(regexp, function() {
		let arr = ([]).slice.call(arguments, 0);
		let extras = arr.splice(-2);
		arr.index = extras[0];
		arr.input = extras[1];
		matches.push(arr);
	});
	return matches.length ? matches : null;
};

let javaScriptAssignmentTarget = /(?:["][_$a-öA-Ö0-9]+["])|(?:['][_$a-öA-Ö0-9]+['])|([_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*)/g // /([_$a-öA-Ö0-9]+)(\[[_$a-öA-Ö0-9"']+\])/g;
let javaScriptAssignmentTarget2 = /^([_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*)$/

function getVariableNames(expr) {
	let matches = expr.match(javaScriptAssignmentTarget);
	let items = [];
	for (let match of matches) {
		if (!match.startsWith('"') && !match.startsWith("'"))
			items.push(match);
	}
	return items;
}

export class DefaultBindingProvider implements BindingProvider {
	parseBindingAttribute(attribute: Attr, bindingContext: BindingContext) {
		let value = attribute.nodeValue;
		let matches = js.parseObjectLiteral(`{${value}}`);
		let bindings = {};
		for (let match of matches) {
			let bindingName = match[0];
			if (bindingName in bindings) {
				console.error(`Binding "${bindingName}" is already declared on element.`);
				return;
			}
			let bindingValue = match[1];
			bindings[bindingName] = this.createBindingExpression(bindingValue, bindingContext);
			if (bindings[bindingName] == undefined) {
				console.info(`Binding "${bindingName}" has no value.`);
			}
		}
		return bindings;
	}
	hasBindings(node: Element): Boolean {
		if ("attributes" in node && node.attributes !== null) {
			let attributes = <Node[]>Array.prototype.slice.call(node.attributes);
			let count = attributes.filter((attribute) => {
				return attribute.localName === "data-bind";
			}).length;
			if (count > 1) {
				console.error('Only one "data-bind" attribute is allowed per element.');
			}
			return count > 0;
		}
	}
	getBindingAccessors(node: Element, bindingContext: BindingContext): {} {
		let bindings = {};
		if ("attributes" in node && node.attributes !== null) {
			let attributes = <Node[]>Array.prototype.slice.call(node.attributes);
			attributes = attributes.filter((attribute) => {
				return attribute.localName === "data-bind";
			});
			for (let attribute of attributes) {
				bindings = this.parseBindingAttribute(<Attr>attribute, bindingContext);
				break;
			}
		}
		let bindings2 = {};
		for (let prop in bindings) {
			let parts = prop.split(/[-]/i);
			if (parts.length == 1) {
				bindings2[`${bh.bindingHandlers.defaultNamespace}.${prop}`] = bindings[prop];
			} else if (parts.length == 3) {
				bindings2[`${bh.bindingHandlers.defaultNamespace}.${parts[0]}${parts[1].charAt(0).toUpperCase() + parts[1].slice(1) }`] = bindings[prop];
			} else if (parts.length == 2) {
				bindings2[prop] = bindings[prop];
			}
		}
		return bindings2;
	}
	processNode(node: Node): Node[] {
		return null;
	}
	createBindingExpression(bindingExpression: string, bindingContext?: BindingContext) {
		let bindingValue = undefined;
		if (bindingExpression !== undefined && bindingExpression !== null) {
			let value = bindingExpression.trim();
			let matches = javaScriptAssignmentTarget2.test(value);
			if (!matches) {
				let func = be.createExpression(bindingExpression, bindingContext);
				bindingValue = computed(func);
			} else {
				let $data = bindingContext.$data;
				bindingValue = common.getObservable($data, value);
				if (bindingValue === undefined) {
					bindingValue = $data[value];
					if (bindingValue === undefined) {
						bindingValue = bindingContext[value];
					}
				}
			}
		}
		return bindingValue;
	}
}