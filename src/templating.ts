export * from "templating/engine";


import * as bp from "bindings/bindingEngine";
import { BindingContext } from "bindings/bindingContext";

export function append(context: BindingContext, node: HTMLElement, template: Node, model: any) {
    let templateInstance = document.createElement("div");
    let newContext: BindingContext = {
        $data: model,
        $element: templateInstance,
        $parent: context.$data,
        $root: context.$root
    };
    templateInstance.innerHTML = (<HTMLElement>template).innerHTML;
    node.appendChild(templateInstance);
    bp.applyBindingsInternal(newContext, templateInstance);
}