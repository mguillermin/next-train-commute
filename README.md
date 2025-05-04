# Next Train Commute PWA

A simple Progressive Web App (PWA) to quickly check the next departing commuter trains between two configurable stations in Finland.

## Features

*   Displays the next 10 departing commuter trains.
*   Shows departure time relative to now (e.g., "in 5 min", "Now", "Departed").
*   Shows the departure track.
*   Shows the train line ID (e.g., "A", "P", "U").
*   Allows switching the direction (e.g., from Helsinki → Leppävaara to Leppävaara → Helsinki).
*   Configurable departure and arrival stations via a settings panel (uses station names with autocomplete).
*   Settings are saved locally in the browser.
*   Works offline (app shell loads, but fetching new train times requires internet).
*   Installable as a PWA on mobile devices.

## Data Source

This app uses the open Digitrafic API provided by Fintraffic: [https://www.digitraffic.fi/rautatieliikenne/](https://www.digitraffic.fi/rautatieliikenne/)

## Deployment (GitHub Pages)

This app is designed to be easily deployed using GitHub Pages:

1.  **Repository:** Ensure your project is a GitHub repository.
2.  **GitHub Pages Settings:**
    *   Go to your repository on GitHub.
    *   Navigate to `Settings` > `Pages`.
    *   Under "Build and deployment", select `Deploy from a branch` as the source.
    *   Choose the branch you want to deploy from (e.g., `main`).
    *   Select the `/ (root)` folder.
    *   Click `Save`.
3.  **Base URL:** GitHub Pages typically deploys to a subpath like `https://<username>.github.io/<repository-name>/`. The `start_url` in `manifest.json` and the service worker registration path in `script.js` should reflect this repository name (e.g., `/next-train-commute/`). Make sure these paths match your repository name.
4.  **Access:** Your app will be available at the URL provided in the GitHub Pages settings section after deployment (it might take a minute or two).

## Installing as a PWA on iPhone (iOS/Safari)

1.  **Open Safari:** Navigate to the deployed app's URL in the Safari browser on your iPhone.
2.  **Tap the Share Button:** Tap the "Share" icon (the square with an arrow pointing upwards) at the bottom of the screen.
3.  **Scroll Down:** Scroll down the share sheet options.
4.  **Tap "Add to Home Screen":** Select the "Add to Home Screen" option.
5.  **Confirm:** You might be asked to confirm the name for the home screen icon. Tap "Add" in the top-right corner.
6.  **Done:** The app icon will now appear on your home screen, allowing you to launch it like a native app.

## Development Notes

*   **Service Worker Updates:** When making changes to cached files (`index.html`, `style.css`, `script.js`, `manifest.json`, icons, or `sw.js` itself), remember to increment the `CACHE_NAME` variable within `sw.js` to ensure the PWA updates correctly for users.
*   **Local Testing:** Service workers require HTTPS or localhost. For local testing, use a simple local web server instead of opening `index.html` directly via `file://`. Many tools can provide this (e.g., `npx serve`, Python's `http.server`, VS Code Live Server extension).

## License

MIT License

Copyright (c) 2025 Matthieu Guillermin

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
