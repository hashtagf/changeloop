const names = new Set(['agent_spawn', 'agent_list', 'agent_send', 'agent_inbox', 'agent_stop']);

// The subscription transport prefixes names on the wire. Repair only our known
// tools if that prefix leaks into a finalized model call. Keep IDs/arguments and
// other tools intact; normal Pi lookup, validation and guards still run afterwards.
function normalizeAgentToolCalls(message) {
  if (message.role !== 'assistant' || !Array.isArray(message.content)) return message;
  let changed = false;
  const content = message.content.map(block => {
    if (block.type !== 'toolCall' || typeof block.name !== 'string') return block;
    const canonical = block.name.replace(/^_+/, '');
    if (canonical === block.name || !names.has(canonical)) return block;
    changed = true;
    return { ...block, name: canonical };
  });
  return changed ? { ...message, content } : message;
}
export { normalizeAgentToolCalls };
