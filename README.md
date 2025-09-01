# slack-message-to-md

A TypeScript library that converts Slack API message objects to Markdown format.

[日本語版 README](./README_ja.md)

## Features

- **Block Kit Support**: Convert Block Kit elements to Markdown
- **Legacy Attachments**: Support for traditional attachment formats
- **File Sharing**: Convert image and document files
- **User Mapping**: Convert user IDs to real names
- **Type Safe**: Full TypeScript support

## Installation

```bash
npm install slack-message-to-md
```

## Usage

### Programmatic API

```typescript
import { convertMessage } from 'slack-message-to-md';

const message = {
  type: "message",
  text: "Hello *world*!",
  user: "U123456789",
  ts: "1704980400"
};

// Basic conversion
const markdown = convertMessage(message);

// Conversion with user mapping
const userMapping = { "U123456789": "John Doe" };
const markdownWithUsers = convertMessage(message, userMapping);
```

### CLI

```bash
# Convert JSON file to stdout
npx slack-message-to-md message.json

# Output to file
npx slack-message-to-md message.json output.md
```

## Supported Elements

- **Block Kit**: Section, Header, Divider, Image, Context, Rich Text
- **Text**: mrkdwn format (bold, italic, links, emojis)
- **Attachments**: Title, text, fields, colors
- **Files**: Image files, documents
- **Metadata**: User info, timestamps, reactions

## Development

```bash
# Install dependencies
bun install

# Run tests
bun test

# Lint
bun lint

# Build
bun run build
```

## License

Apache-2.0