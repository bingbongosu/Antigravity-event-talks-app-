# BigQuery Release Notes Dashboard

A modern, responsive dashboard to fetch, categorize, search, and share Google Cloud BigQuery release updates. Built with a Python Flask backend and a vanilla HTML5, CSS3, and JavaScript frontend.

---

## Features

- **Automated Parsing**: Uses Python's `feedparser` to digest the official Google Cloud BigQuery RSS release feed.
- **Auto-Categorization**: Automatically categorizes release notes into **Features**, **Fixes**, **Deprecations**, and **Updates** based on update headers and content keywords.
- **Dynamic Refresh**: A clean refresh system using a CSS-animated loading spinner fetches updates dynamically using an internal AJAX API.
- **Search & Filtering**: Instant client-side filtering by categories or keyword queries.
- **X / Twitter Sharing**:
  - **Single Update**: Share a customized summary of any update.
  - **Bulk Share**: Check multiple updates and generate a combined summary to share in a single tweet.
  - **Tweet Composer Modal**: Interactive character counter (up to 280 characters limit) and preview editor.

---

## Tech Stack

- **Backend**: Python 3.10+, Flask, Feedparser, Requests
- **Frontend**: Vanilla HTML5, Vanilla CSS3 (Custom Variables, CSS Transitions, Glassmorphic Grid), Vanilla JavaScript (ES6)
- **Icons**: FontAwesome 6

---

## Installation & Setup

### 1. Prerequisites
Make sure you have Python 3.10+ installed on your system.

### 2. Install Dependencies
Install the required packages using `pip`:

```bash
pip install Flask requests feedparser
```

### 3. Running the Server
Run the Flask application from the root directory:

```bash
python app.py
```

By default, the server starts in debug mode at:
`http://127.0.0.1:5000`

---

## File Structure

- [app.py](file:///C:/Users/steve/Documents/Antigravity/app.py): Server routing, feed fetching, and data parsing pipeline.
- [templates/index.html](file:///C:/Users/steve/Documents/Antigravity/templates/index.html): Client UI dashboard layout and modals.
- [static/style.css](file:///C:/Users/steve/Documents/Antigravity/static/style.css): Custom dark-mode style sheets, animations, and typography tokens.
- [static/script.js](file:///C:/Users/steve/Documents/Antigravity/static/script.js): DOM manipulation, feed loading, checkbox selections, search, filtering, and Twitter/X integration.
- [.gitignore](file:///C:/Users/steve/Documents/Antigravity/.gitignore): Version control exclusions list.
