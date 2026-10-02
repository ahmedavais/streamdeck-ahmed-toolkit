import { Keychain, type NulledKeychainItem } from "../../infrastructure/keychain";

export type NulledCredentials = { accessToken: string };

const KEYCHAIN_SERVICE = "Claude Code-credentials";

export class ClaudeCredentials {
	static createNull(credentials: NulledCredentials | NulledCredentials[] = { accessToken: "Nulled ClaudeCredentials access token" }): ClaudeCredentials {
		const keychainItems = Array.isArray(credentials) ? credentials.map(keychainEntryFor) : keychainEntryFor(credentials);
		return new ClaudeCredentials(Keychain.createNull(keychainItems));
	}

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

function keychainEntryFor({ accessToken }: NulledCredentials): NulledKeychainItem {
	return { password: JSON.stringify({ claudeAiOauth: { accessToken } }) };
}
