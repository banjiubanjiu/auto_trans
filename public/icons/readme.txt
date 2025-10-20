# Icon Files

This directory contains the extension icons.

## How to create the icons:

1. Open `convert-icon.html` in your browser
2. Right-click on each icon and save as PNG:
   - icon-16.png (16x16 pixels)
   - icon-32.png (32x32 pixels)
   - icon-48.png (48x48 pixels)
   - icon-128.png (128x128 pixels)

Or use any image editing software to create blue circular icons with "Aa" text.

## Temporary Solution

If you don't have icons ready, you can remove the icon references from manifest.json temporarily:

```json
"icons": {},
"action": {
  "default_popup": "popup/index.html",
  "default_title": "EasyTrans"
}
```