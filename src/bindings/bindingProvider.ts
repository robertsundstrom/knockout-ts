import { BindingContext } from "bindingContext";

export let bindingProvider : BindingProvider = null;

export interface BindingProvider {
	hasBindings(node: Element): Boolean;
	getBindingAccessors(node: Element, bindingContext: BindingContext): {};
	processNode(node: Element): Node[];
}

export function setBindingProvider(value: BindingProvider) {
	bindingProvider = value;
}