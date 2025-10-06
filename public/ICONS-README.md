# PWA Icons

This app requires PWA icons for installation. 

## Required Icons:
- `icon-192x192.png` - 192x192 pixels
- `icon-512x512.png` - 512x512 pixels

## Quick Solution:

You can use any of these methods to generate icons:

1. **Use a tool like [Favicon.io](https://favicon.io/)** to generate icons from text or image
2. **Use [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator)**: 
   ```bash
   npx pwa-asset-generator logo.svg public --manifest public/manifest.json
   ```
3. **Manually create** PNG files with your logo/design

## Temporary Solution:

Until you create custom icons, you can use a simple colored square or the Next.js logo as a placeholder. The PWA will still work, but users will see generic icons.

## Theme Colors:
- Primary: `#8b5cf6` (purple)
- Background: `#ffffff` (white)
- Dark Mode Background: `#1a1a1a` (dark gray)

