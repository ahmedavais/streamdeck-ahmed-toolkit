import assert from "node:assert/strict";
import { test } from "node:test";
import { renderStateImage } from "./state-image";

test("renders a data-uri svg image", () => {
	assert.match(renderStateImage("#2f6fed"), /^data:image\/svg\+xml;base64,/);
});

test("different colors produce different images", () => {
	assert.notEqual(renderStateImage("#2f6fed"), renderStateImage("#3a3a42"));
});
