const WAITING_REASON_BY_NOTIFICATION = {
	permission_prompt: "permission",
	idle_prompt: "input",
};

export function waitingReasonFor(notificationType) {
	return WAITING_REASON_BY_NOTIFICATION[notificationType];
}
