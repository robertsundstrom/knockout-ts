export interface TemplateEngine {
	renderTemplateSource(templateSource, bindingContext, options);
}

let currentTemplateEngine: TemplateEngine;

export function setTemplateEngine(templateEngine: TemplateEngine) {
	currentTemplateEngine = templateEngine;
}

export class DefaultTemplateEngine {
	renderTemplateSource(templateSource, bindingContext, options): void {

	}
}