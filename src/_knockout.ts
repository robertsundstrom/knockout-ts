import * as js from "./utils/js-object-literal-parse";

import {BindingContext } from "./bindings/bindingContext";
import {BindingProvider, setBindingProvider } from "./bindings/bindingProvider";
import {BindingHandler, registerBindingHandler} from "./bindings/bindingHandler";
import {Bindings } from "./bindings/bindings";

import "./bindings";

import {DefaultBindingProvider } from "./bindings/defaultBindingProvider";

setBindingProvider(new DefaultBindingProvider());

declare let window: any;

window.ko = this;

export {applyBindings} from "bindings/bindingEngine";
export * from "observables";
export {track, isObservable, resolveObservable, getAllObservables, getObservable, unwrap} from "observables/common";
export {registerBindingHandler} from "bindings/bindingHandler";
export {setBindingProvider} from "bindings/bindingProvider";
export {ModernBindingProvider} from "bindings/modernBindingProvider";
export {fromJS} from "helpers";
export {config} from "configuration";