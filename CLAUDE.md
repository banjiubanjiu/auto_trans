# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**easy-trans** is a Chrome extension (Manifest V3) that enables users to capture screenshots of web content, perform OCR text extraction, and translate between Chinese and English using the Kimi AI model.

**Current State**: This project is in the planning/documentation phase - only documentation exists, no implementation yet.

## Core Workflow

1. User presses Shift + drags to select an area on the page
2. Content Script captures screenshot and sends it to Background
3. Background Script performs OCR using Tesseract.js (offline)
4. Background Script sends extracted text to Kimi API for translation
5. Results are displayed in a floating overlay

## Technology Stack

- **Language**: TypeScript
- **Build Tool**: Vite
- **Package Manager**: pnpm
- **UI**: Native Web Components + CSS (no heavy frameworks)
- **CSS Preprocessor**: SCSS
- **OCR**: tesseract.js (browser-based, offline)
- **Event System**: eventemitter3
- **API Calls**: fetch API with custom wrapper

## Project Structure (Planned)

```
auto_trans/
├── public/
│   ├── manifest.json          # Chrome extension manifest
│   └── icons/                 # Extension icons
├── src/
│   ├── background/            # Background scripts (OCR, translation)
│   ├── content/              # Content scripts (screenshot, UI)
│   ├── popup/                # Extension popup
│   ├── options/              # Settings page
│   └── shared/               # Shared utilities
├── dist/                     # Build output
└── tests/                    # Test files
```

## Development Commands (Once Implemented)

Expected commands for development:

```bash
# Install dependencies
pnpm install

# Development build with hot reload
pnpm dev

# Production build
pnpm build

# Run tests
pnpm test

# Lint code
pnpm lint

# Format code
pnpm format
```

## Architecture Highlights

### Message Communication
Simple Chrome extension messaging between Content Script and Background:

```typescript
// Message types: CAPTURE_SCREENSHOT, OCR_COMPLETE, TRANSLATE_TEXT, TRANSLATION_COMPLETE
interface Message {
  type: MessageType;
  data?: any;
}
```

### State Management
Custom state machine with these states:
- Idle → Selecting → Capturing → OCRProcessing → Translating → Showing

### Key Features
- **Screenshot**: Shift + drag selection with visual overlay
- **OCR**: Offline processing with Tesseract.js (English and Chinese language packs)
- **Translation**: Kimi API (kimi-k2-0905-preview model)
- **Privacy**: Images processed locally, only text sent to API
- **History**: Last 10 translations stored in chrome.storage.sync

## Chrome Extension Permissions (Minimal)

- `activeTab` - Access current active tab for screenshots
- `tabs` - captureVisibleTab permission
- `scripting` - Inject content scripts
- `storage` - Save settings and history
- `commands` - Configurable hotkeys

## API Configuration

- **Base URL**: https://api.moonshot.cn/v1
- **Model**: kimi-k2-0905-preview
- **API Key**: Stored locally in chrome.storage.local (not synced)

## Error Handling Strategy

- Network errors: Retry mechanism with exponential backoff
- OCR errors: Offer to retry with different settings
- Translation errors: Check API key, suggest retry
- User errors: Clear instructions for recovery

## Implementation Priority

1. Set up basic project structure (package.json, tsconfig.json, vite.config.ts)
2. Create manifest.json for Chrome extension
3. Implement basic content script with screenshot capability
4. Add background script with OCR processing
5. Integrate Kimi API for translation
6. Build UI overlay for results
7. Add settings page and popup
8. Implement history feature
9. Add comprehensive error handling
10. Testing and polish

## Testing Strategy

- Unit tests for core utilities
- Integration tests for message passing
- Manual testing on various websites
- Cross-platform testing (different OS/browsers)
- Permission testing on restricted pages

## Important Notes

- OCR language packs (eng, chi_sim) are bundled with extension
- No images uploaded to servers - all processing local
- API key stored securely, never synced
- Extension doesn't work on Chrome internal pages or extension store
- File protocol (file://) requires manual permission from user