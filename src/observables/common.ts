import { Observable } from "observable";
import * as be from "../bindings/bindingEngine";

import * as c from "../configuration";
import * as h from "../hooks";
import * as common from "../observables/common";

import { observable } from "../observables/simpleObservable";
import { observableArray } from "../observables/observableArray";
import { computed } from "../observables/computedObservable";

export function isObservable(value) {
	return value && (typeof (value.subscribe) !== "undefined") && (typeof (value.notifyAll) !== "undefined");
}

export function resolveObservable(viewModel: any, value: any): Observable<any> {
	if (isObservable(value)) {
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

export function unwrap<T>(observable: Observable<T>): T {
	return observable.data._value;
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
		console.info("Object is already being tracked", viewModel);
		return;
	}
	h.hooks.__triggerHook("beforeTrack", viewModel);
	for (let prop in viewModel) {
		let candidate = viewModel[prop];
		if (!common.isObservable(candidate)) {
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
		h.hooks.__triggerHook("afterTrack", viewModel);
	}
	return viewModel;
}

