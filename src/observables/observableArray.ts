import { ObservableArray } from "observable";
import { DependencyTracker } from "dependencyTracker";

import * as o from "observable";

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
		for (let computed of o.cache.computeds) {
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
	}.bind(data);
	return accessor;
}
