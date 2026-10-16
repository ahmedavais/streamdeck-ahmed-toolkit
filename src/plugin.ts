import streamDeck from "@elgato/streamdeck";
import { ActiveTask } from "./claude/actions/active-task";
import { McpStatus } from "./claude/actions/mcp-status";
import { UsageGauge } from "./claude/actions/usage-gauge";

streamDeck.actions.registerAction(new UsageGauge());
streamDeck.actions.registerAction(new ActiveTask());
streamDeck.actions.registerAction(new McpStatus());
streamDeck.connect();
