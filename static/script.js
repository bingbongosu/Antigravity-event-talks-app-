document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const searchInput = document.getElementById('search-input');
    const filterPills = document.querySelectorAll('.filter-pill');
    const refreshBtn = document.getElementById('refresh-btn');
    const refreshSpinner = refreshBtn.querySelector('.refresh-spinner');
    const feedContainer = document.getElementById('feed-container');
    const lastUpdatedTime = document.getElementById('last-updated-time');
    const visibleCount = document.getElementById('visible-count');
    const selectAllBtn = document.getElementById('select-all-btn');
    const floatingBar = document.getElementById('floating-bar');
    const selectedCountSpan = document.getElementById('selected-count');
    const clearSelectionBtn = document.getElementById('clear-selection-btn');
    const tweetSelectedBtn = document.getElementById('tweet-selected-btn');
    
    // Modal Elements
    const tweetModal = document.getElementById('tweet-modal');
    const tweetTextarea = document.getElementById('tweet-textarea');
    const charCountSpan = document.getElementById('char-count');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cancelTweetBtn = document.getElementById('cancel-tweet-btn');
    const sendTweetBtn = document.getElementById('send-tweet-btn');

    let selectedEntries = new Set();
    let currentFilter = 'all';
    let searchQuery = '';

    // Initialize listeners
    searchInput.addEventListener('input', handleSearch);
    filterPills.forEach(pill => pill.addEventListener('click', handleFilter));
    refreshBtn.addEventListener('click', refreshFeed);
    selectAllBtn.addEventListener('click', toggleSelectAll);
    clearSelectionBtn.addEventListener('click', clearSelection);
    tweetSelectedBtn.addEventListener('click', openMultiTweetComposer);
    
    // Modal listeners
    closeModalBtn.addEventListener('click', hideModal);
    cancelTweetBtn.addEventListener('click', hideModal);
    tweetTextarea.addEventListener('input', updateCharCount);
    sendTweetBtn.addEventListener('click', sendTweet);

    // Initial binding for checkboxes
    bindCardEvents();

    function bindCardEvents() {
        const checkboxes = document.querySelectorAll('.entry-checkbox');
        checkboxes.forEach(chk => {
            chk.removeEventListener('change', handleCheckboxChange);
            chk.addEventListener('change', handleCheckboxChange);
        });
    }

    // Search and Filter updates
    function handleSearch(e) {
        searchQuery = e.target.value.toLowerCase().trim();
        filterFeed();
    }

    function handleFilter(e) {
        filterPills.forEach(pill => pill.classList.remove('active'));
        e.currentTarget.classList.add('active');
        currentFilter = e.currentTarget.dataset.type;
        filterFeed();
    }

    function filterFeed() {
        const cards = document.querySelectorAll('.feed-card');
        let visible = 0;

        cards.forEach(card => {
            const type = card.dataset.type;
            const title = card.querySelector('.card-title').textContent.toLowerCase();
            const content = card.querySelector('.card-content').textContent.toLowerCase();
            
            const matchesFilter = (currentFilter === 'all' || type === currentFilter);
            const matchesSearch = (title.includes(searchQuery) || content.includes(searchQuery));

            if (matchesFilter && matchesSearch) {
                card.style.display = 'flex';
                visible++;
            } else {
                card.style.display = 'none';
            }
        });

        visibleCount.textContent = visible;
    }

    // Checkbox Change handler
    function handleCheckboxChange(e) {
        const checkbox = e.target;
        const card = checkbox.closest('.feed-card');
        const id = card.dataset.id;

        if (checkbox.checked) {
            card.classList.add('selected');
            selectedEntries.add(id);
        } else {
            card.classList.remove('selected');
            selectedEntries.delete(id);
        }

        updateFloatingBar();
    }

    // Floating Bar Visibility
    function updateFloatingBar() {
        const count = selectedEntries.size;
        selectedCountSpan.textContent = count;
        
        if (count > 0) {
            floatingBar.classList.add('active');
        } else {
            floatingBar.classList.remove('active');
        }
    }

    // Select All / Deselect All Toggle
    function toggleSelectAll() {
        const cards = document.querySelectorAll('.feed-card');
        const visibleCards = Array.from(cards).filter(c => c.style.display !== 'none');
        
        // Check if any visible cards are not selected
        const anyUnselected = visibleCards.some(c => !selectedEntries.has(c.dataset.id));

        visibleCards.forEach(card => {
            const checkbox = card.querySelector('.entry-checkbox');
            const id = card.dataset.id;
            
            if (anyUnselected) {
                checkbox.checked = true;
                card.classList.add('selected');
                selectedEntries.add(id);
            } else {
                checkbox.checked = false;
                card.classList.remove('selected');
                selectedEntries.delete(id);
            }
        });

        updateFloatingBar();
    }

    // Clear Selection
    function clearSelection() {
        const checkboxes = document.querySelectorAll('.entry-checkbox');
        checkboxes.forEach(chk => {
            chk.checked = false;
            chk.closest('.feed-card').classList.remove('selected');
        });
        selectedEntries.clear();
        updateFloatingBar();
    }

    // Refresh Feed via API
    async function refreshFeed() {
        if (refreshSpinner.classList.contains('spinning')) return;
        
        refreshSpinner.classList.add('spinning');
        refreshBtn.classList.add('btn-secondary');
        refreshBtn.classList.remove('btn-primary');

        try {
            const response = await fetch('/api/refresh');
            const data = await response.json();

            if (data.success) {
                lastUpdatedTime.textContent = data.last_fetched;
                renderFeed(data.entries);
                clearSelection();
            } else {
                alert('Failed to refresh feed: ' + data.error);
            }
        } catch (error) {
            console.error('Refresh error:', error);
            alert('Failed to contact server endpoint.');
        } finally {
            refreshSpinner.classList.remove('spinning');
            refreshBtn.classList.remove('btn-secondary');
            refreshBtn.classList.add('btn-primary');
        }
    }

    // Render feed cards dynamically
    function renderFeed(entries) {
        feedContainer.innerHTML = '';
        
        if (entries.length === 0) {
            feedContainer.innerHTML = '<div class="alert-error"><i class="fa-solid fa-circle-info"></i> No release notes found.</div>';
            visibleCount.textContent = 0;
            return;
        }

        entries.forEach(entry => {
            const card = document.createElement('div');
            card.className = `feed-card ${entry.type}`;
            card.dataset.type = entry.type;
            card.dataset.id = entry.id;

            card.innerHTML = `
                <div class="card-selection">
                    <input type="checkbox" class="entry-checkbox" id="check-${entry.id}">
                    <label for="check-${entry.id}"></label>
                </div>
                <div class="card-body">
                    <div class="card-meta">
                        <span class="badge badge-${entry.type}">${entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}</span>
                        <span class="card-date"><i class="fa-regular fa-calendar"></i> ${entry.date}</span>
                    </div>
                    <h3 class="card-title">${entry.title}</h3>
                    <div class="card-content">
                        ${entry.content}
                    </div>
                    <div class="card-actions">
                        ${entry.link ? `<a href="${entry.link}" target="_blank" class="card-link"><i class="fa-solid fa-arrow-up-right-from-square"></i> View Docs</a>` : ''}
                        <button class="btn btn-tweet-single" onclick="tweetSingle('${entry.title.replace(/'/g, "\\'")}', '${entry.link}', '${entry.tweet_preview.replace(/'/g, "\\'")}')">
                            <i class="fa-brands fa-x-twitter"></i> Tweet This
                        </button>
                    </div>
                </div>
            `;
            feedContainer.appendChild(card);
        });

        bindCardEvents();
        filterFeed();
    }

    // Twitter Sharing Helpers
    window.tweetSingle = function(title, link, preview) {
        // Compose a neat single update tweet
        // Title: [Title] - [Summary] #BigQuery #GCP [Link]
        let cleanTitle = title.replace(/^BigQuery\s*-\s*/i, '');
        let tweetText = `BigQuery Update: ${cleanTitle}\n\n${preview}`;
        
        if (link) {
            tweetText += `\n\nDocs: ${link}`;
        }
        
        tweetText += `\n#BigQuery #GCP`;
        
        showModal(tweetText);
    }

    function openMultiTweetComposer() {
        const cards = document.querySelectorAll('.feed-card');
        let selectedTitles = [];
        let links = [];

        cards.forEach(card => {
            if (selectedEntries.has(card.dataset.id)) {
                let title = card.querySelector('.card-title').textContent.replace(/^BigQuery\s*-\s*/i, '');
                selectedTitles.push(`• ${title}`);
                
                const linkEl = card.querySelector('.card-link');
                if (linkEl && linkEl.href) {
                    links.push(linkEl.href);
                }
            }
        });

        let tweetText = `BigQuery Updates:\n${selectedTitles.join('\n')}\n\n`;
        if (links.length > 0) {
            tweetText += `Docs: ${links[0]}\n`;
        }
        tweetText += `#BigQuery #GCP`;

        showModal(tweetText);
    }

    // Modal Control
    function showModal(initialText) {
        tweetTextarea.value = initialText;
        updateCharCount();
        tweetModal.classList.add('active');
    }

    function hideModal() {
        tweetModal.classList.remove('active');
    }

    function updateCharCount() {
        const len = tweetTextarea.value.length;
        charCountSpan.textContent = len;

        const counter = document.querySelector('.char-counter');
        counter.classList.remove('warning', 'danger');

        if (len > 280) {
            counter.classList.add('danger');
            sendTweetBtn.disabled = true;
            sendTweetBtn.style.opacity = '0.5';
        } else {
            sendTweetBtn.disabled = false;
            sendTweetBtn.style.opacity = '1';
            if (len > 250) {
                counter.classList.add('warning');
            }
        }
    }

    function sendTweet() {
        const text = tweetTextarea.value;
        if (text.length > 280) return;
        
        const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        window.open(shareUrl, '_blank', 'width=550,height=420');
        hideModal();
    }
});
