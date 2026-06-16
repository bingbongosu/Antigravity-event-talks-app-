import os
import re
import datetime
import urllib.parse
from flask import Flask, render_template, jsonify, request
import feedparser
import requests

app = Flask(__name__)

FEED_URL = "https://docs.cloud.google.com/feeds/bigquery-release-notes.xml"

def clean_html(raw_html):
    # Remove HTML tags if we want a plain text preview for tweets
    cleanr = re.compile('<.*?>')
    cleantext = re.sub(cleanr, '', raw_html)
    return cleantext.strip()

def parse_feed():
    try:
        # Fetch the feed XML directly or use feedparser on the URL
        # We fetch manually to control headers/timeouts
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(FEED_URL, headers=headers, timeout=15)
        response.raise_for_status()
        
        feed = feedparser.parse(response.content)
        
        entries = []
        for index, entry in enumerate(feed.entries):
            # Parse update date
            updated_str = entry.get('updated', entry.get('published', ''))
            formatted_date = updated_str
            try:
                # BigQuery dates look like '2026-06-15T00:00:00Z'
                dt = datetime.datetime.fromisoformat(updated_str.replace('Z', '+00:00'))
                formatted_date = dt.strftime('%B %d, %Y')
            except Exception:
                pass

            # Determine type of release note (Feature, Fix, Deprecation, General)
            title = entry.get('title', '')
            content = entry.get('summary', entry.get('description', ''))
            
            note_type = "general"
            title_lower = title.lower()
            content_lower = content.lower()
            
            if "feature" in title_lower or "new" in title_lower or "support for" in title_lower:
                note_type = "feature"
            elif "fix" in title_lower or "resolve" in title_lower or "error" in title_lower:
                note_type = "fix"
            elif "deprecate" in title_lower or "remove" in title_lower or "obsolete" in title_lower:
                note_type = "deprecation"
            elif "change" in title_lower or "update" in title_lower:
                note_type = "update"

            # Plain text preview for tweets (max 180 chars for preview)
            plain_text_content = clean_html(content)
            tweet_preview = plain_text_content[:180] + '...' if len(plain_text_content) > 180 else plain_text_content

            entries.append({
                'id': entry.get('id', str(index)),
                'title': title,
                'content': content,
                'plain_content': plain_text_content,
                'tweet_preview': tweet_preview,
                'date': formatted_date,
                'raw_date': updated_str,
                'link': entry.get('link', ''),
                'type': note_type
            })
            
        return {
            'success': True,
            'title': feed.feed.get('title', 'BigQuery Release Notes'),
            'subtitle': feed.feed.get('subtitle', 'Latest updates and releases for Google Cloud BigQuery'),
            'entries': entries,
            'last_fetched': datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'last_fetched': datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'entries': []
        }

@app.route('/')
def index():
    feed_data = parse_feed()
    return render_template('index.html', data=feed_data)

@app.route('/api/refresh')
def refresh():
    feed_data = parse_feed()
    return jsonify(feed_data)

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
