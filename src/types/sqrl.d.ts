declare namespace Sqrl {
		export type TemplateOptionsArray = Record<string, any>;

		export function renderFile(filePath: string, options: TemplateOptionsArray): string;
}
