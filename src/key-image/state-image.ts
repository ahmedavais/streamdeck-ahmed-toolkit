export function renderStateImage(color: string): string {
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="144" height="144"><rect width="144" height="144" fill="${color}"/></svg>`;
	return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
