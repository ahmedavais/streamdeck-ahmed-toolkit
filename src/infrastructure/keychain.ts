import { execFileSync } from "node:child_process";

export class Keychain {
	static create(): Keychain {
		return new Keychain();
	}

	readPassword(service: string): string {
		try {
			return execFileSync("security", ["find-generic-password", "-s", service, "-w"], { encoding: "utf8", stdio: "pipe" });
		} catch (failure) {
			throw new Error(`Could not read "${service}" from the Keychain: ${(failure as { stderr: string }).stderr.trim()}`, { cause: failure });
		}
	}
}
