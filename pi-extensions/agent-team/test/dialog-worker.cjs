// RPC transport fixture; no model, tools or external services.
const fs = require('node:fs');
const readline = require('node:readline');
const responses = [];
const requests = [
  { id: 'confirm', method: 'confirm', title: 'Allow fixture?', message: 'Test only' },
  { id: 'select', method: 'select', title: 'Choose', options: ['one', 'two'] },
  { id: 'input', method: 'input', title: 'Text' },
  { id: 'editor', method: 'editor', title: 'Multiline', prefill: 'draft' },
];
const output = event => process.stdout.write(JSON.stringify(event) + '\n');
const ask = () => output({ type: 'extension_ui_request', ...requests[responses.length] });
readline.createInterface({ input: process.stdin }).on('line', line => {
  const command = JSON.parse(line);
  if (command.type === 'get_state') output({ type: 'response', id: command.id, success: true, data: { sessionId: 'dialog-fixture' } });
  if (command.type === 'prompt') ask();
  if (command.type === 'extension_ui_response') {
    responses.push(command);
    if (responses.length < requests.length) ask();
    else { fs.writeFileSync(process.argv[2], JSON.stringify(responses)); process.exit(0); }
  }
});
