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
		const entry = this.keychain.readPassword(KEYCHAIN_SERVICE);
		try {
			const { claudeAiOauth } = JSON.parse(entry) as { claudeAiOauth: { accessToken: string } };
			return claudeAiOauth.accessToken;
		} catch (failure) {
			throw new Error("Claude Code's Keychain entry holds no access token", { cause: failure });
		}
	}
}
