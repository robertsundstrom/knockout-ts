import * as c from "configuration";
import * as h from "hooks";
import * as common from "observables/common";

import { observable } from "observables/simpleObservable";
import { observableArray } from "observables/observableArray";
import { computed } from "observables/computedObservable";


export function defineProperty<T>(viewModel: any, name: string, getter: () => T, setter?: (argument: T) => void) {
	Object.defineProperty(viewModel, name, {
		get: () => {
			return getter();
		},
		set: setter || undefined,
		enumerable: true
	});
}

export function getOriginal(obj: any) {
	return obj.original;
}

export function fromJS<T>(obj: T): T {
	if (c.configuration.autoTrack) {
		return common.track(obj);
	} else {
		let target: any = {};
		for (let prop in obj) {
			let candidate: any = obj[prop];
			if (!common.isObservable(candidate)) {
				if (candidate instanceof Function) {
					continue;
				} else {
					let configuration = Object.getOwnPropertyDescriptor(obj, prop);
					if (configuration === undefined) {
						configuration = Object.getOwnPropertyDescriptor(obj.__proto__, prop);
					}
					if ("get" in configuration && (!("set" in configuration) || configuration.set === undefined)) {
						candidate = computed(configuration.get.bind(obj));
					} else {
						if (Array.isArray(candidate)) {
							candidate = observableArray(candidate);
							candidate.subscribe(() => {
								
							});
						} else {
							candidate = observable(candidate);
							/*
							candidate.subscribe((value) => {
								obj[prop] = value;
							});
							*/
						}
					}
					target[prop] = candidate;
				}
			}		
		}
		target.original = obj;
		return <T>target;
	}
}