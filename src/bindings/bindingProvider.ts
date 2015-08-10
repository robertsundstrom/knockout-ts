import { BindingContext } from "bindingContext";

export interface BindingProvider {
	hasBindings(node: Element): Boolean;
	getBindingAccessors(node: Element, bindingContext: BindingContext): {};
	processNode(node: Element): Node[];
}