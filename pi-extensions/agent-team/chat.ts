import { AssistantMessageComponent, UserMessageComponent, ToolExecutionComponent, getMarkdownTheme,
  createBashToolDefinition, createReadToolDefinition, createEditToolDefinition, createWriteToolDefinition,
  createFindToolDefinition, createGrepToolDefinition, createLsToolDefinition } from '@earendil-works/pi-coding-agent';
import { Text } from '@earendil-works/pi-tui';
import { safe } from './transcript.ts';

/** Reuse Pi's native conversation components; never write to a worker's session file. */
export function renderAgentChat(messages: any[], live: any, member: any, tui: any, width: number, expanded: boolean): string[] {
  const components: any[] = [], tools = new Map<string, any>();
  const factories: Record<string, any> = { bash: createBashToolDefinition, read: createReadToolDefinition,
    edit: createEditToolDefinition, write: createWriteToolDefinition, find: createFindToolDefinition,
    grep: createGrepToolDefinition, ls: createLsToolDefinition };
  const definitions = new Map<string, any>();
  const definition = (name: string) => {
    if (!definitions.has(name)) definitions.set(name, factories[name]?.(member.cwd));
    return definitions.get(name);
  };
  const assistant = (message: any, streaming = false) => {
    const component = new AssistantMessageComponent(message, true, getMarkdownTheme(), undefined, 0);
    if (streaming) component.updateContent(message, true);
    components.push(component);
  };
  for (const entry of messages) {
    const message = entry.message;
    if (!message) { components.push(new Text(safe(entry.text), 0, 0)); continue; }
    if (message.role === 'user') components.push(new UserMessageComponent(entry.text, getMarkdownTheme(), 0));
    else if (message.role === 'assistant') {
      assistant(message);
      for (const block of message.content) if (block.type === 'toolCall') {
        const tool = new ToolExecutionComponent(block.name, block.id, block.arguments, { showImages: false, outputPad: 0 }, definition(block.name), tui, member.cwd);
        tool.setArgsComplete(); tool.markExecutionStarted(); tool.setExpanded(expanded);
        tools.set(block.id, tool); components.push(tool);
      }
    } else if (message.role === 'toolResult') {
      let tool = tools.get(message.toolCallId);
      if (!tool) {
        tool = new ToolExecutionComponent(message.toolName || 'tool', message.toolCallId || entry.id, {}, { showImages: false, outputPad: 0 }, definition(message.toolName), tui, member.cwd);
        tool.setExpanded(expanded); components.push(tool);
      }
      tool.updateResult({ content: message.content, isError: message.isError });
    } else components.push(new Text(safe(entry.text), 0, 0));
  }
  if (live.streaming && live.text) assistant({ role: 'assistant', content: [{ type: 'text', text: safe(live.text) }], timestamp: Date.now() }, true);
  if (live.tools?.length) components.push(new Text(`Running: ${live.tools.map(safe).join(', ')}`, 0, 0));
  if (!components.length) components.push(new Text(safe(member.result?.text || 'No messages yet.'), 0, 0));
  return components.flatMap(component => component.render(width));
}
