// file src/lib/shame.ts
//
// `shame` as in ashamed for not thinking
// of a better name (or place) than "utils" or "helpers".
// credit: https://csswizardry.com/2013/04/shame-cs

export type FormatTimeFn = (date?: number | Date | undefined) => string;

const formatTimeOnly = (() => {
	const options = Intl.DateTimeFormat().resolvedOptions();
	const timeOnly = new Intl.DateTimeFormat(options.locale, {
		timeZone: options.timeZone,
		hour12: false,
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
	});

	return timeOnly.format;
})();

const formatISO = (date?: number | Date | undefined) =>
	typeof date === 'number'
		? new Date(date).toISOString()
		: date instanceof Date
			? date.toISOString()
			: new Date().toISOString();

export { formatISO, formatTimeOnly };
