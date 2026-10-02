import streamDeck from "@elgato/streamdeck";
import { ActiveTask } from "./actions/active-task";
import { McpStatus } from "./actions/mcp-status";
import { UsageGauge } from "./actions/usage-gauge";

streamDeck.actions.registerAction(new UsageGauge());
streamDeck.actions.registerAction(new ActiveTask());
streamDeck.actions.registerAction(new McpStatus());
streamDeck.connect();
