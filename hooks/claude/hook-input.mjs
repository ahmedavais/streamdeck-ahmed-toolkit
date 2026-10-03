export async function readHookInput() {
	let data = "";
	for await (const chunk of process.stdin) data += chunk;
	return JSON.parse(data);
}
