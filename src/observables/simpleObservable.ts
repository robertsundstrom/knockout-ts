import { SimpleObservable } from "observable";
import { DependencyTracker } from "dependencyTracker";
import * as e from "extenders";

import * as common from "common";

export function observable<T>(value?: T): SimpleObservable<T> {
	let data = {
		_value: value,
		_subscribers: [],
		_extenders: {},
		f: function(value, oldValue) {
			for (let subscriber of this._subscribers) {
				subscriber(value, oldValue);
			}
		},
		attach: function() {
			return;
			if (typeof this._value === "object") {
				let observables = common.getAllObservables(this._value);
				for (let prop in observables) {
					observables[prop].subscribe(this.f);
				}
			}
		},
		detach: function() {
			return;
			if (typeof this._value === "object") {
				let observables = common.getAllObservables(this._value);
				for (let prop in observables) {
					observables[prop].unsubscribe(this.f);
				}
			}
		},
		triggerExtenders: function() {
			for (let prop in this._extenders) {
				let extender = e.extenders[prop];
				let arg = this._extenders[prop];
				let accessor2 = function(value?) {
					if (typeof value === 'undefined') {
						return this._value;
					} else {
						this._value = value;
					}
				}.bind(this);
				extender(accessor2, arg);
			}
		}
	};
	let accessor = <SimpleObservable<T>><any>function(value?: T): (void | T) {
		if (typeof value === 'undefined') {
			if (DependencyTracker.isTracking) {
				DependencyTracker.registerDependency(accessor);
			}
			return this._value;
		} else {
			if (this._value !== value) {
				this.detach();

				let oldValue = this._value;
				this._value = value;

				this.attach();

				this.triggerExtenders();

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
		/*
		for (let computed of cache.computeds) {
			computed.notifyAll();

		}
		*/
	}.bind(data);
	accessor.extend = function(extenders) {
		for (let prop in extenders) {
			this._extenders[prop] = extenders[prop];
		}
	}.bind(data);
	data.attach();
	return accessor;
}