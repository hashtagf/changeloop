// Pi persists custom messages as top-level custom_message entries, not message entries.
export function recordedAnswers(manager) {
  const ids = new Set<string>();
  for (const entry of manager.getEntries?.() || manager.getBranch?.() || []) {
    const message = entry.type === 'custom_message' ? entry : entry.type === 'message' ? entry.message : undefined;
    if (message?.customType !== 'user-question-answer') continue;
    for (const id of message.details?.questionIds || [message.details?.questionId]) {
      if (typeof id === 'string') ids.add(id);
    }
  }
  return ids;
}
