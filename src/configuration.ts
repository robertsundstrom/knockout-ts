export interface KnockoutConfiguration {
	autoTrack?: Boolean,
	deepTrack?: Boolean
    logging?: boolean;
}

export let configuration: KnockoutConfiguration = {
	autoTrack: true,
	deepTrack: true,
};

export function config(parameters: KnockoutConfiguration) {
	for (let prop in parameters) {
		configuration[prop] = parameters[prop];
	}
}