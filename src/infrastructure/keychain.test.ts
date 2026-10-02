import assert from "node:assert/strict";
import { test } from "node:test";
import { Keychain } from "./keychain";

test("fails for an item that isn't in the keychain", () => {
	const keychain = Keychain.create();

	assert.throws(() => keychain.readPassword("streamdeck-ahmed-toolkit-missing-item"), {
		message: 'Could not read "streamdeck-ahmed-toolkit-missing-item" from the Keychain: security: SecKeychainSearchCopyNext: The specified item could not be found in the keychain.',
	});
});
