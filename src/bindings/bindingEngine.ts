import { BindingContext } from "bindingContext";
import { BindingHandler} from "bindingHandler";

import * as bh from "bindingHandler";
import * as bp from "bindingProvider";

import * as c from "../configuration";
import * as h from "../hooks";

import * as common from "../observables/common";

import { observable } from "../observables/simpleObservable";
import { observableArray } from "../observables/observableArray";
import { computed } from "../observables/computedObservable";

export function createExpression(expression: string, context?: BindingContext) {
	if (typeof context === "undefined") {
		context = bindingContext;
	};
	return new Function("$bindingContext", `with($bindingContext) { with($bindingContext.$data) { return ${expression}; } }`).bind(context.$data, context); //this
}

export function applyBindingsInternal(bindingContext: BindingContext, node: Element) {
	let result = null;
	let deep = true;
	if (bp.bindingProvider.hasBindings(node)) {
		let bindings = bp.bindingProvider.getBindingAccessors(node, bindingContext);
		let variableNames = null;
		for (var prop in bindings) {
			let parts = prop.split(/[-.]/i);
			let bindingHandler: BindingHandler = undefined;
			if (parts.length == 2) {
				// Theres an explicit namespace.
				if (bindingHandler === undefined) {
					var ns = parts[0];
					var binding = parts[1]
					bindingHandler = <BindingHandler>bh.bindingHandlers[ns][binding];
				}
			} else if (parts.length === 1) {
				// No explicit namespace. Use default namespace..
				bindingHandler = <BindingHandler>bh.bindingHandlers[bh.bindingHandlers.defaultNamespace][prop];
			} else {
				// The binding could not be resolved.
				bindingHandler = undefined;
			}
			if (bindingHandler !== undefined) {
				// Apply the binding to the current element.
				var bindingValue = bindings[prop];
				if (bindingValue === null) {
					console.error(`Property "${prop}" is undefined.`);
					continue;
				}
				if(prop === "ko.template") {
					deep = false;
				}
				// Check if there is one or many selectors and validate.
				let isSelectable = true;
				if ("selector" in bindingHandler) {

					// Polyfill for node.matches.
					let matchesSelector = function(element, selector) {
						let matches = (element.document || element.ownerDocument).querySelectorAll(selector);
						let i = 0;
						while (matches[i] && matches[i] !== element) {
							i++;
						}
						return matches[i] ? true : false;
					}

					let selector = bindingHandler.selector;
					if (typeof (selector) == 'string') {
						isSelectable = node.matches !== undefined ? node.matches(selector) : matchesSelector(node, selector);
					} else if (Array.isArray(selector)) {
						let selectors = bindingHandler.selector;
						for (let selector of selectors) {
							isSelectable = isSelectable || <boolean>(node.matches !== undefined) ? node.matches(selector) : matchesSelector(node, selector);
							if (isSelectable) break;
						}
					} else {
						console.error("Invalid selector:", selector);
					}
				}
				if (isSelectable) {
					let accessor = null;
					if (!common.isObservable(bindingValue)) {
						// Wrap non-observable.
						accessor = function() { return bindingValue; };
					} else {
						accessor = bindingValue;
					}
					(function(bindings, node, accessor, bindingHandler, bindingContext) {
						let allBindings = {
							hasBinding: function(key: string) {
								return key in bindings;
							},
							getBinding: function(key: string) {
								return bindings[key];
							},
						};
						
						// Apply the binding			
						if ("init" in bindingHandler) {
							result = bindingHandler.init(node, accessor, allBindings, bindingContext);
						}
						if ("update" in bindingHandler) {
							if (common.isObservable(bindingValue)) {
								bindingValue.subscribe((newValue, oldValue) => {
									bindingHandler.update(node, accessor, allBindings, bindingContext);
								}).notify();
							} else {
								bindingHandler.update(node, accessor, allBindings, bindingContext);
							}
						}
					})(bindings, node, accessor, bindingHandler, bindingContext);
				} else {
					console.error(`Binding "${prop}" cannot be applied to element ${node.localName}.`);
				}
			} else {
				console.error(`Binding "${prop}" is not defined.`);
			}
		}
		//console.log(bindings);
	}
	let storedContext = undefined;
	if (result) {
		storedContext = bindingContext;
		bindingContext = result;
	}
	if(deep) {
		for (let childNode of Array.prototype.slice.call(node.childNodes)) {
			applyBindingsInternal(bindingContext, childNode);
		}
	}
	if (storedContext !== undefined) {
		bindingContext = storedContext;
	}
}

export var bindingContext: BindingContext;

export function createBindingContext(viewModel): BindingContext {
	var bindingContext = {
		$root: viewModel,
		$parent: undefined,
		$data: viewModel
	};
	return bindingContext;
}

export function applyBindings(viewModel: any, root?: Element) {
	if (typeof root === 'undefined') {
		root = document.body;
	}
	if (c.configuration.autoTrack) {
		common.track(viewModel);
	}
	h.hooks.__triggerHook("beforeBind")
	bindingContext = createBindingContext(viewModel);
	applyBindingsInternal(bindingContext, root);
	h.hooks.__triggerHook("afterBind")
}

export function createObservables(viewModel) {
	if (typeof viewModel.__observables__ === 'undefined') {
		let __observables__ = {};
		Object.defineProperty(viewModel, "__observables__", {
			get: () => {
				return __observables__;
			},
			enumerable: false,
			configurable: true
		});
	}
	for (let prop in viewModel) {
		let candidate = viewModel[prop];
		if (c.configuration.autoTrack) {
			(function(viewModel, prop, candidate) {
				Object.defineProperty(viewModel, prop, {
					get: () => {
						return candidate();
					},
					set: (value) => {
						candidate(value);
					},
					enumerable: true,
					configurable: true
				});
			})(viewModel, prop, candidate);
		}
		viewModel.__observables__[prop] = candidate;
	}
}
