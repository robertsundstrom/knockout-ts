import {BindingContext } from "./bindingContext";
import {BindingProvider } from "./bindingProvider";
import {Bindings } from "./bindings";

import "Reflect";

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
