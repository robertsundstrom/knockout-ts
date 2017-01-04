import {BindingContext } from "./bindingContext";
import {BindingProvider } from "./bindingProvider";
import {Bindings } from "./bindings";

import "reflect-metadata";

export function selector(selector: string | string[]) {
    return (target: Object) => {
        Reflect.defineMetadata("MyClassDecorator", selector, target);
    }
}

export interface BindingHandler {
	/**
	 * Gets the selector(s) for the elements to which this binding can be applied.
	 */
	selector?: string | string[];
	
	/**
	 * Initialized the binding for a element.
	 */
	init?(element: Element, valueAccessor: (value?: any) => any, allBindings: Bindings, bindingContext: BindingContext): void | BindingContext;
	 
	/**
	 * Fires when the value changes.
	 */
	update?(element: Element, valueAccessor: (value?: any) => any, allBindings: Bindings, bindingContext: BindingContext): void;
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