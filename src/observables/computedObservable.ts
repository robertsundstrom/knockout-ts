import { DependencyTracker } from "dependencyTracker";
import { ComputedObservable } from "observable";

import * as o from "observable";

import * as logging from "../logging";

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
							if (logging.enabled) {
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
			if (logging.enabled) {
				console.log("Notified changes:", subscriber);
			};
		}
	}.bind(data);
	o.cache.computeds.push(accessor);
	return accessor;
}