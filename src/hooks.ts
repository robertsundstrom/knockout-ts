import { BindingHandler } from "bindings/bindingHandler";

export interface Hooks {
	beforeTrack: ((obj: any) => void)[];
	afterTrack: ((obj: any) => void)[];
	beforeBind: (() => void)[];
	afterBind: (() => void)[];
	beforeElementBind: ((element: Element, bindingHandler: BindingHandler, expression: string) => void)[];
	afterElementBind: ((element: Element, bindingHandler: BindingHandler, expression: string) => void)[];

	__triggerHook(name: string, arg1?, arg2?, arg3?);
}

export let hooks: Hooks = {
	"beforeTrack": [],
	"afterTrack": [],
	"beforeBind": [],
	"afterBind": [],
	"beforeElementBind": [],
	"afterElementBind": [],

	__triggerHook: function(name: string, arg1?, arg2?, arg3?) {
		for (let handler of hooks[name]) {
			(<any>handler)(arg1, arg2, arg3);
		}
	}
};
