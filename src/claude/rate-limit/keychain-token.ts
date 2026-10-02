import { execFileSync } from "node:child_process";

const KEYCHAIN_SERVICE = "Claude Code-credentials";

let cachedToken: string | undefined;

function readTokenFromKeychain(): string {
	const raw = execFileSync("security", ["find-generic-password", "-s", KEYCHAIN_SERVICE, "-w"], {
		encoding: "utf8",
	});
	const { claudeAiOauth } = JSON.parse(raw.trim()) as { claudeAiOauth: { accessToken: string } };
	return claudeAiOauth.accessToken;
}

export function getAccessToken(): string {
	if (!cachedToken) {
		cachedToken = readTokenFromKeychain();
	}
	return cachedToken;
}

export function invalidateAccessToken(): void {
	cachedToken = undefined;
}
