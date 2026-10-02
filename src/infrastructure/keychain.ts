import { execFileSync } from "node:child_process";

export type NulledKeychainItem = { password: string };

type RunCommand = (command: string, args: string[]) => string;

export class Keychain {
	static create(): Keychain {
		return new Keychain((command, args) => execFileSync(command, args, { encoding: "utf8", stdio: "pipe" }));
	}

	static createNull(item: NulledKeychainItem = { password: "Nulled Keychain default password" }): Keychain {
		return new Keychain(stubbedSecurityCommand(item));
	}

	constructor(private readonly runCommand: RunCommand) {}

	readPassword(service: string): string {
		try {
			return this.runCommand("security", ["find-generic-password", "-s", service, "-w"]).replace(/\n$/, "");
		} catch (failure) {
			throw new Error(`Could not read "${service}" from the Keychain: ${(failure as { stderr: string }).stderr.trim()}`, { cause: failure });
		}
	}
}

function stubbedSecurityCommand({ password }: NulledKeychainItem): RunCommand {
	return () => `${password}\n`;
}
