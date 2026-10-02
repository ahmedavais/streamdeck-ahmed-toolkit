import assert from "node:assert/strict";
import { test } from "node:test";
import { Keychain } from "./keychain";

test("fails for an item that isn't in the keychain", () => {
	const keychain = Keychain.create();

	assert.throws(() => keychain.readPassword("streamdeck-ahmed-toolkit-missing-item"), {
		message: 'Could not read "streamdeck-ahmed-toolkit-missing-item" from the Keychain: security: SecKeychainSearchCopyNext: The specified item could not be found in the keychain.',
	});
});

test("a nulled keychain answers with an obviously fake default password", () => {
	const keychain = Keychain.createNull();

	assert.equal(keychain.readPassword("streamdeck-ahmed-toolkit-missing-item"), "Nulled Keychain default password");
});

test("a nulled keychain answers with a configured password", () => {
	const keychain = Keychain.createNull({ password: "s3cret" });

	assert.equal(keychain.readPassword("any service"), "s3cret");
});

test("a nulled keychain fails for a configured missing item", () => {
	const keychain = Keychain.createNull({ missing: true });

	assert.throws(() => keychain.readPassword("Some Service"), {
		message: 'Could not read "Some Service" from the Keychain: security: SecKeychainSearchCopyNext: The specified item could not be found in the keychain.',
	});
});
