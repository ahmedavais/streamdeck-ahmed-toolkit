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
		const { claudeAiOauth } = JSON.parse(this.keychain.readPassword(KEYCHAIN_SERVICE)) as { claudeAiOauth: { accessToken: string } };
		return claudeAiOauth.accessToken;
	}
}
