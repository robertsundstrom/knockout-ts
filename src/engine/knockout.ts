import * as js from "./utils/js-object-literal-parse";

export let log: boolean = true;

import {BindingContext } from "./bindings/bindingContext";
import {BindingProvider } from "./bindings/bindingProvider";
import {BindingHandler } from "./bindings/bindingHandler";
import {Bindings } from "./bindings/bindings";

/*
export interface BindingProvider {
	hasBindings(node: Element): Boolean;
	getBindingAccessors(node: Element, bindingContext: BindingContext): {};
	processNode(node: Element): Node[];
}

export interface BindingContext {
	$root: any;
	$parent: any;
	$data: any;
	$element?: any;
	$index?: any;
}

export interface Bindings {
	getBinding(key: string): (value?: any) => any;
	hasBinding(key: string): Boolean;
}
*/

export interface KnockoutConfiguration {
	autoTrack?: Boolean,
	deepTrack?: Boolean
}

export interface Hooks {
	beforeTrack: ((obj: any) => void)[];
	afterTrack: ((obj: any) => void)[];
	beforeBind: (() => void)[];
	afterBind: (() => void)[];
	beforeElementBind: ((element: Element, bindingHandler: BindingHandler, expression: string) => void)[];
	afterElementBind: ((element: Element, bindingHandler: BindingHandler, expression: string) => void)[];

	__triggerHook(name: string, arg1?, arg2?, arg3?);
}

export let hooks: Hooks = {
	"beforeTrack": [],
	"afterTrack": [],
	"beforeBind": [],
	"afterBind": [],
	"beforeElementBind": [],
	"afterElementBind": [],

	__triggerHook: function(name: string, arg1?, arg2?, arg3?) {
		for (let handler of hooks[name]) {
			(<any>handler)(arg1, arg2, arg3);
		}
	}
};

export interface Subscribable<T> {
	subscribe(handler: (newValue: T, oldValue: T) => void): { notify(): void };
	unsubscribe(handler: (newValue: T, oldValue: T) => void): void;
}

export interface Observable<T> extends Function, Subscribable<T> {
	notifyAll(): void;
	data: {
		_subscribers: ((newValue: T, oldValue: T) => void)[]
		_value?: T;
	}
	extend(obj: {}): void;
}

export interface SimpleObservable<T> extends Observable<T> {

}

export interface ObservableArray<T> extends Observable<T> {
	push(value: T): void;

	subscribe(handler: (newValue: T, oldValue: T) => void): { notify(): void };
	subscribe(handler: (newItems: T[], oldItems: T[]) => void): { notify(): void };
}

export interface ComputedObservable<T> extends Observable<T> {

}

export function defineProperty<T>(viewModel: any, name: string, getter: () => T, setter?: (argument: T) => void) {
	Object.defineProperty(viewModel, name, {
		get: () => {
			return getter();
		},
		set: setter || undefined,
		enumerable: true
	});
}

export function unwrap<T>(observable: Observable<T>): T {
	return observable.data._value;
}

export let extenders = {};

extenders.track = function(target, option) {
	/*  target.subscribe(function(newValue) {
		 track(newValue);
	  }); */
    return target;
};

interface DependencyFrame {
	onDependencyDetected: (subscribable: Subscribable<any>) => void;
	parent: DependencyFrame;
}

export class DependencyTracker {
	private static _frame: DependencyFrame = undefined;

	static begin(onDetected: (subscribable: Subscribable<any>) => void): void {
		DependencyTracker._frame = {
			onDependencyDetected: onDetected,
			parent: DependencyTracker._frame
		};
	}

	static end(): void {
		DependencyTracker._frame = DependencyTracker._frame.parent;
	}

	static get isTracking() {
		return DependencyTracker._frame !== undefined;
	}

	static registerDependency(subscribable: Subscribable<any>): void {
		DependencyTracker._frame.onDependencyDetected(subscribable);
	}
}

export function observable<T>(value?: T): SimpleObservable<T> {
	let data = {
		_value: value,
		_subscribers: [],
		_extenders: {},
		f: function(value, oldValue) {
			for (let subscriber of this._subscribers) {
				subscriber(value, oldValue);
			}
		},
		attach: function() {
			return;
			if (typeof this._value === "object") {
				let observables = getAllObservables(this._value);
				for (let prop in observables) {
					observables[prop].subscribe(this.f);
				}
			}
		},
		detach: function() {
			return;
			if (typeof this._value === "object") {
				let observables = getAllObservables(this._value);
				for (let prop in observables) {
					observables[prop].unsubscribe(this.f);
				}
			}
		},
		triggerExtenders: function() {
			for (let prop in this._extenders) {
				let extender = extenders[prop];
				let arg = this._extenders[prop];
				let accessor2 = function(value?) {
					if (typeof value === 'undefined') {
						return this._value;
					} else {
						this._value = value;
					}
				}.bind(this);
				extender(accessor2, arg);
			}
		}
	};
	let accessor = <SimpleObservable<T>><any>function(value?: T): (void | T) {
		if (typeof value === 'undefined') {
			if (DependencyTracker.isTracking) {
				DependencyTracker.registerDependency(accessor);
			}
			return this._value;
		} else {
			if (this._value !== value) {
				this.detach();

				let oldValue = this._value;
				this._value = value;

				this.attach();

				this.triggerExtenders();

				for (let subscriber of this._subscribers) {
					subscriber(value, oldValue);
				}
				
				/*
				for (let computed of cache.computeds) {
					computed.notifyAll();
				}
				*/
			}
		}
	}.bind(data);
	accessor.data = data;
	accessor.subscribe = function(handler: (newValue: T, oldValue: T) => void) {
		this._subscribers.push(handler);
		return {
			notify: function(): void {
				handler(this._value, this._value);
			}.bind(data)
		};
	}.bind(data);
	accessor.unsubscribe = function(handler: (newValue: T, oldValue: T) => void) {
		let index = this._subscribers.indexOf(handler);
		if (index > -1) {
			this._subscribers.splice(index, 1);
		}
	}.bind(data);
	accessor.notifyAll = function() {
		for (let subscriber of this._subscribers) {
			subscriber(this._value, this._value);
		}
		/*
		for (let computed of cache.computeds) {
			computed.notifyAll();

		}
		*/
	}.bind(data);
	accessor.extend = function(extenders) {
		for (let prop in extenders) {
			this._extenders[prop] = extenders[prop];
		}
	}.bind(data);
	data.attach();
	return accessor;
}


export function observableArray<T>(value?: T[]): ObservableArray<T> {
	let data = {
		_value: value,
		_subscribers: [],
		_extenders: {}
	};
	let accessor = <ObservableArray<T>><any>function(value?: T[]): (void | T[]) {
		if (typeof value === 'undefined') {
			if (DependencyTracker.isTracking) {
				DependencyTracker.registerDependency(accessor);
			}
			return this._value;
		} else {
			if (this._value !== value) {
				let oldValue = this._value;
				this._value = value;

				for (let subscriber of this._subscribers) {
					subscriber(value, oldValue);
				}
				/*
				for (let computed of cache.computeds) {
					computed.notifyAll();
				}
				*/
			}
		}
	}.bind(data);
	accessor.data = data;
	accessor.subscribe = function(handler: (newValue: T, oldValue: T) => void) {
		this._subscribers.push(handler);
		return {
			notify: function(): void {
				handler(this._value, this._value);
			}.bind(data)
		};
	}.bind(data);
	accessor.unsubscribe = function(handler: (newValue: T, oldValue: T) => void) {
		let index = this._subscribers.indexOf(handler);
		if (index > -1) {
			this._subscribers.splice(index, 1);
		}
	}.bind(data);
	accessor.notifyAll = function() {
		for (let subscriber of this._subscribers) {
			subscriber(this._value, this._value);
		}
		for (let computed of cache.computeds) {
			computed.notifyAll();
		}
	}.bind(data);
	accessor.push = function(value: T): void {
		this._value.push(value);
		for (let subscriber of this._subscribers) {
			subscriber([value], null);
		}
		/*
		for (let computed of cache.computeds) {
			computed.notifyAll();
		}
		*/
	}
	return accessor;
}

export let cache = {
	computeds: <ComputedObservable<any>[]>[]
};

export function computed<T>(func?: () => T): ComputedObservable<T> {
	let data = {
		_value: null,
		_func: func,
		_subscribers: [],
		_extenders: {},
		computeValue: function() {
			let value = this._func();
			if (value !== this._value) {
				this._value = value;
				return true;
			}
			return false;
		},
		flag: true
	};
	let accessor = <ComputedObservable<T>><any>function(func?): (void | T) {
		if (typeof func === 'undefined') {
			if (DependencyTracker.isTracking) {
				DependencyTracker.registerDependency(accessor);
			}
			if (this.flag) {
				DependencyTracker.begin((subscribable) => {
					subscribable.subscribe(() => {
						if (this.computeValue()) {
							accessor.notifyAll();
							if (log) {
								console.log("Recomputed observable:", this._value);
							};
						}
					});
				});
			}
			this.computeValue();
			if (this.flag) {
				DependencyTracker.end();
				this.flag = false;
			}
			return this._value;
		} else {
			console.error("Computed Observables can only be set once when being initialized.");
		}
	}.bind(data);
	accessor.data = data;
	accessor.subscribe = function(handler: (newValue: T, oldValue: T) => void) {
		this._subscribers.push(handler);
		return {
			notify: function(): void {
				handler(this._value, undefined);
			}.bind(data)
		};
	}.bind(data);
	accessor.unsubscribe = function(handler: (newValue: T, oldValue: T) => void) {
		let index = this._subscribers.indexOf(handler);
		if (index > -1) {
			this._subscribers.splice(index, 1);
		}
	}.bind(data);
	accessor.notifyAll = function() {
		for (let subscriber of this._subscribers) {
			subscriber(this._value, undefined);
			if (log) {
				console.log("Notified changes:", subscriber);
			};
		}
	}.bind(data);
	cache.computeds.push(accessor);
	return accessor;
}

export function isObservable(value) {
	return value && (typeof (value.subscribe) !== "undefined") && (typeof (value.notifyAll) !== "undefined");
}

export function resolveObservable(viewModel: any, value: any): Observable<any> {
	if (isObservable(observable)) {
		return value;
	}
	for (let prop in viewModel) {
		let observable = viewModel[prop];
		if (isObservable(observable)) {
			let value2 = observable();
			if (value === value2)
				return observable;
		}
	}
	if (typeof (viewModel.__observables__) !== "undefined") {
		for (let prop in viewModel.__observables__) {
			let observable = viewModel.__observables__[prop];
			let value2 = observable();
			if (value === value2)
				return observable;
		}
	}
	return undefined;
}

export function getObservable<T>(viewModel: any, prop: string): Observable<T> {
	let observable = viewModel[prop];
	if (!isObservable(observable)) {
		if (typeof (viewModel.__observables__) !== "undefined") {
			observable = viewModel.__observables__[prop];
		} else {
			observable = undefined;
		}
	}
	return observable;
}

export function getAllObservables(viewModel: any) {
	let observables = {};
	for (let prop in viewModel) {
		let candidate = getObservable(viewModel, prop);
		if (candidate !== undefined) {
			observables[prop] = candidate;
		}
	}
	return observables;
}

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

export function createExpression(expression: string, context?: BindingContext) {
	if (typeof context === "undefined") {
		context = bindingContext;
	};
	return new Function("$bindingContext", `with($bindingContext) { with($bindingContext.$data) { return ${expression}; } }`).bind(context.$data, context); //this
}

export function applyBindingsInternal(bindingContext: BindingContext, node: Element) {
	let result = null;
	if (bindingProvider.hasBindings(node)) {
		let bindings = bindingProvider.getBindingAccessors(node, bindingContext);
		let variableNames = null;
		for (var prop in bindings) {
			let parts = prop.split(/[-.]/i);
			let bindingHandler: BindingHandler = undefined;
			if (parts.length == 2) {
				// Theres an explicit namespace.
				if (bindingHandler === undefined) {
					var ns = parts[0];
					var binding = parts[1]
					bindingHandler = <BindingHandler>bindingHandlers[ns][binding];
				}
			} else if (parts.length === 1) {
				// No explicit namespace. Use default namespace..
				bindingHandler = <BindingHandler>bindingHandlers[bindingHandlers.defaultNamespace][prop];
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
				// Check if there is one or many selectors and validate.
				let isSelectable = true;
				if ("selector" in bindingHandler) {

					// Polyfill for node.matches.
					function matchesSelector(element, selector) {
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
							isSelectable = isSelectable || <boolean>node.matches !== undefined ? node.matches(selector) : matchesSelector(node, selector);
							if (isSelectable) break;
						}
					} else {
						console.error("Invalid selector:", selector);
					}
				}
				if (isSelectable) {
					let accessor = null;
					if (!isObservable(bindingValue)) {
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
							if (isObservable(bindingValue)) {
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
	for (let childNode of Array.prototype.slice.call(node.childNodes)) {
		applyBindingsInternal(bindingContext, childNode);
	}
	if (storedContext !== undefined) {
		bindingContext = storedContext;
	}
}

export let configuration: KnockoutConfiguration = {
	autoTrack: true,
	deepTrack: true,
};

export function config(parameters: KnockoutConfiguration) {
	for (let prop in parameters) {
		configuration[prop] = parameters[prop];
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
	if (configuration.autoTrack) {
		track(viewModel);
	}
	hooks.__triggerHook("beforeBind")
	bindingContext = createBindingContext(viewModel);
	applyBindingsInternal(bindingContext, root);
	hooks.__triggerHook("afterBind")
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
		if (configuration.autoTrack) {
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

export function track(viewModel: any): any {
	if (typeof viewModel.__observables__ === 'undefined') {
		let __observables__ = {};
		Object.defineProperty(viewModel, "__observables__", {
			get: () => {
				return __observables__;
			},
			enumerable: false,
			configurable: true
		});
	} else {
		return;
	}
	hooks.__triggerHook("beforeTrack", viewModel);
	for (let prop in viewModel) {
		let candidate = viewModel[prop];
		if (!isObservable(candidate)) {
			if (candidate instanceof Function) {
				continue;
			} else {
				let configuration = Object.getOwnPropertyDescriptor(viewModel, prop);
				if (configuration === undefined) {
					configuration = Object.getOwnPropertyDescriptor(viewModel.__proto__, prop);
				}
				if ("get" in configuration && (!("set" in configuration) || configuration.set === undefined)) {
					candidate = computed(configuration.get.bind(viewModel));
				} else {
					if (Array.isArray(candidate)) {
						candidate = observableArray(candidate);
					} else {
						candidate = observable(candidate);
					}
				}
			}
		}
		try {
			(function(viewModel, prop, candidate) {
				candidate.extend({
					track: true
				});
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
			viewModel.__observables__[prop] = candidate;
		} catch (error) {
			if (error.toString().indexOf("redefine") === 0) {
				console.error(error);
			}
		}
		hooks.__triggerHook("afterTrack", viewModel);
	}
	return viewModel;
}

export let bindingHandlers = {
	defaultNamespace: "ko",
};

export function registerBindingHandler(bindingName: string, bindingHandler: BindingHandler) {
		let parts = bindingName.split('.');	
		let ns = null;
		let name = null;
		if(parts.length === 2) {
			ns = parts[0];
			name = parts[1];
		} else if(parts.length === 1) {
			name = parts[0];
		} else {
			throw "Invalid binding name";
		}
		if(parts.length == 2) {
			if (typeof this.bindingHandlers[ns] == 'undefined') {
				this.bindingHandlers[ns] = {};
			}		
			this.bindingHandlers[ns][name] = bindingHandler;
		} else {
			throw "Namespace is required";
		}
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
				bindings2[`${bindingHandlers.defaultNamespace}.${prop}`] = bindings[prop];
			} else if (parts.length == 3) {
				bindings2[`${bindingHandlers.defaultNamespace}.${parts[0]}${parts[1].charAt(0).toUpperCase() + parts[1].slice(1) }`] = bindings[prop];
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
				let func = createExpression(bindingExpression, bindingContext);
				bindingValue = computed(func);
			} else {
				let $data = bindingContext.$data;
				bindingValue = getObservable($data, value);
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

var bindingProvider: BindingProvider = new DefaultBindingProvider();

export function setBindingProvider(value: BindingProvider) {
	bindingProvider = value;
}

export interface TemplateEngine {
	renderTemplateSource(templateSource, bindingContext, options);
}

let currentTemplateEngine: TemplateEngine;

export function setTemplateEngine(templateEngine: TemplateEngine) {
	currentTemplateEngine = templateEngine;
}

export class DefaultTemplateEngine {
	renderTemplateSource(templateSource, bindingContext, options): void {

	}
}

setTemplateEngine(new DefaultTemplateEngine());

export interface ValidationRule {
	validate(properyName: string, accessor: (value?: any) => any): string[]| void;
}

export interface ErrorBag {
	[rule: string]: {
		[rule: string]: string[];
	};
}

export class Validation {
	static rules: { [name: string]: ValidationRule } = {
		"required": {
			validate: function(properyName: string, accessor: (value?: any) => any) {
				let value = accessor();
				if (value === "" || value === null || value === undefined) {
					return ["Value is required."];
				}
				return [];
			}
		}
	};

	static parseValidationAttributes() {

	}

	static getErrors(viewModel: any, propertyName?: string): ErrorBag {
		if (typeof (propertyName) === 'undefined') {
			let result = {};
			let observables = getAllObservables(viewModel);
			for (var name in observables) {
				var errors = Validation.getErrors(viewModel, propertyName);
				result[name] = errors;
			}
			return <any>result;
		} else {
			let observable = getObservable(viewModel, propertyName);
			return (<any>observable).__errors__;
		}
	}

	static isValid(viewModel: any): boolean {
		let errors = Validation.getErrors(viewModel);
		return Object.getOwnPropertyNames(errors).length > 0;
	}
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
					/*
					bindingName = nameParts[0];
					bindingHandler = bindingHandlers[bindingHandlers.defaultNamespace][bindingName];
					if (bindingHandler !== undefined) {
						fullName = `${bindingHandlers.defaultNamespace}-${bindingName}`
					}
					*/
				} else if (nameParts.length === 2) {
					namespaceName = nameParts[0];
					bindingName = nameParts[1];
					let namespace = bindingHandlers[namespaceName];
					if (namespace !== undefined) {
						bindingHandler = namespace[bindingName];
						if (bindingHandler !== undefined) {
							fullName = `${namespaceName}.${bindingName}`;
						}
					}
				} else if (nameParts.length == 3) {
					namespaceName = nameParts[0];
					bindingName = `${nameParts[1]}${nameParts[2].charAt(0).toUpperCase() + nameParts[2].slice(1) }`;
					let namespace = bindingHandlers[namespaceName];
					if (namespace !== undefined) {
						bindingHandler = namespace[bindingName];
						if (bindingHandler !== undefined) {
							fullName = `${bindingHandlers.defaultNamespace}.${bindingName}`;
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
				let func = createExpression(bindingExpression, bindingContext);
				bindingValue = computed(func);
			} else {
				let $data = bindingContext.$data;
				bindingValue = getObservable($data, value);
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

window.ko = this;