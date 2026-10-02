import type { Keychain } from "../../infrastructure/keychain";

const KEYCHAIN_SERVICE = "Claude Code-credentials";

export class ClaudeCredentials {
	private rememberedToken: string | undefined;

	constructor(private readonly keychain: Keychain) {}

	accessToken(): string {
		this.rememberedToken ??= this.readTokenFromKeychain();
		return this.rememberedToken;
	}

	forgetToken(): void {
		this.rememberedToken = undefined;
	}

	private readTokenFromKeychain(): string {
		const token = accessTokenIn(this.keychain.readPassword(KEYCHAIN_SERVICE));
		if (typeof token !== "string") throw new Error("Claude Code's Keychain entry holds no access token");
		return token;
	}
}

function accessTokenIn(entry: string): unknown {
	try {
		return JSON.parse(entry)?.claudeAiOauth?.accessToken;
	} catch {
		return undefined;
	}
}
