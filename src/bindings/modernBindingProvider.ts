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

export class ModernBindingProvider implements BindingProvider {
	cache: {};

	hasBindings(node: Element): Boolean {
		if ("attributes" in node && node.attributes !== null) {
			return true;
		}
	}
	getBindingAccessors(node: Element, bindingContext: BindingContext): {} {
		var bindings = {};
		if ("attributes" in node && node.attributes !== null) {
			let attributes = Array.prototype.slice.call(node.attributes);
			for (let attribute of attributes) {
				let fullName = attribute.name;
				let nameParts = fullName.split(/[-.]/i);
				let bindingName = "", namespaceName = "";
				let bindingHandler = undefined;
				if (nameParts.length === 1) {
					return;
					// This might override expected behavior
					bindingName = nameParts[0];
					bindingHandler = bh.bindingHandlers[bh.bindingHandlers.defaultNamespace][bindingName];
					if (bindingHandler !== undefined) {
						fullName = `${bh.bindingHandlers.defaultNamespace}-${bindingName}`
					}
				} else if (nameParts.length === 2) {
					namespaceName = nameParts[0];
					bindingName = nameParts[1];
					let namespace = bh.bindingHandlers[namespaceName];
					if (namespace !== undefined) {
						bindingHandler = namespace[bindingName];
						if (bindingHandler !== undefined) {
							fullName = `${namespaceName}.${bindingName}`;
						}
					}
				} else if (nameParts.length == 3) {
					namespaceName = nameParts[0];
					bindingName = `${nameParts[1]}${nameParts[2].charAt(0).toUpperCase() + nameParts[2].slice(1) }`;
					let namespace = bh.bindingHandlers[namespaceName];
					if (namespace !== undefined) {
						bindingHandler = namespace[bindingName];
						if (bindingHandler !== undefined) {
							fullName = `${bh.bindingHandlers.defaultNamespace}.${bindingName}`;
						}
					}
				}
				if (bindingHandler !== undefined) {
					let value = attribute.nodeValue;
					bindings[fullName] = this.createBindingExpression(value, bindingContext);
				}
			}
		}
		return bindings;
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