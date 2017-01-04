export let cache = {
	computeds: <ComputedObservable<any>[]>[]
};

export interface Subscribable<T> {
	subscribe(handler: (newValue: T, oldValue: T) => void): { notify(): void };
	unsubscribe(handler: (newValue: T, oldValue: T) => void): void;
}

export interface Observable<T> extends Function, Subscribable<T> {
	notifyAll(): void;
	data: {
		_subscribers: ((newValue: T, oldValue: T) => void)[]
		_value?: T;
	}
	extend(obj: {}): void;
}

export interface SimpleObservable<T> extends Observable<T> {

}

export interface ObservableArray<T> extends Observable<T> {
	push(value: T): void;

	subscribe(handler: (newValue: T, oldValue: T) => void): { notify(): void };
	subscribe(handler: (newItems: T[], oldItems: T[]) => void): { notify(): void };
}

export interface ComputedObservable<T> extends Observable<T> {

}