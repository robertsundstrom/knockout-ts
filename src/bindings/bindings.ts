export interface Bindings {
	getBinding(key: string): (value?: any) => any;
	hasBinding(key: string): Boolean;
}