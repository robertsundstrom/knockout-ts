import * as common from "observables/common";

export interface ValidationRule {
	validate(properyName: string, accessor: (value?: any) => any): string[]| void;
}

export interface ErrorBag {
	[rule: string]: {
		[rule: string]: string[];
	};
}

export class Validation {
	static rules: { [name: string]: ValidationRule } = {
		"required": {
			validate: function(properyName: string, accessor: (value?: any) => any) {
				let value = accessor();
				if (value === "" || value === null || value === undefined) {
					return ["Value is required."];
				}
				return [];
			}
		}
	};

	static parseValidationAttributes() {

	}

	static getErrors(viewModel: any, propertyName?: string): ErrorBag {
		if (typeof (propertyName) === 'undefined') {
			let result = {};
			let observables = common.getAllObservables(viewModel);
			for (var name in observables) {
				var errors = Validation.getErrors(viewModel, propertyName);
				result[name] = errors;
			}
			return <any>result;
		} else {
			let observable = common.getObservable(viewModel, propertyName);
			return (<any>observable).__errors__;
		}
	}

	static isValid(viewModel: any): boolean {
		let errors = Validation.getErrors(viewModel);
		return Object.getOwnPropertyNames(errors).length > 0;
	}
}