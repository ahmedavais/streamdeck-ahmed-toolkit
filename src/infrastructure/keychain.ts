import { execFileSync } from "node:child_process";
import { OutputListener, type OutputTracker } from "./output-listener";

export type NulledKeychainItem = { password: string } | { missing: true };

export type KeychainRead = { service: string };

type RunCommand = (command: string, args: string[]) => string;

export class Keychain {
	static create(): Keychain {
		return new Keychain((command, args) => execFileSync(command, args, { encoding: "utf8", stdio: "pipe" }));
	}

	static createNull(item: NulledKeychainItem = { password: "Nulled Keychain default password" }): Keychain {
		return new Keychain(stubbedSecurityCommand(item));
	}

	private readonly reads = new OutputListener<KeychainRead>();

	constructor(private readonly runCommand: RunCommand) {}

	trackReads(): OutputTracker<KeychainRead> {
		return this.reads.trackOutput();
	}

	readPassword(service: string): string {
		this.reads.emit({ service });
		try {
			return this.runCommand("security", ["find-generic-password", "-s", service, "-w"]).replace(/\n$/, "");
		} catch (failure) {
			throw new Error(`Could not read "${service}" from the Keychain: ${(failure as { stderr: string }).stderr.trim()}`, { cause: failure });
		}
	}
}

const ITEM_NOT_FOUND = "security: SecKeychainSearchCopyNext: The specified item could not be found in the keychain.\n";

function stubbedSecurityCommand(item: NulledKeychainItem): RunCommand {
	return () => {
		if ("missing" in item) throw Object.assign(new Error("Command failed"), { stderr: ITEM_NOT_FOUND });
		return `${item.password}\n`;
	};
}
