// Vocabulary Module - Fixed with compact design and top-right POS tags
window.VocabularyModule = {
    filteredWords: [],
    editingWordIndex: -1,

    init() {
        console.log('VocabularyModule initialized');
        this.bindEvents();
        this.updateDisplay();
        this.addSortingControls();
    },

    filterByPartOfSpeech(pos) {
        const allWords = window.appState.getState('allWords') || [];
        
        if (pos === 'all') {
            this.filteredWords = [...allWords];
        } else {
            this.filteredWords = allWords.filter(word => word.pos === pos);
        }
        
        // Apply current search if there's a search query
        const searchInput = document.getElementById('search-input');
        if (searchInput && searchInput.value.trim() !== '') {
            const query = searchInput.value.toLowerCase().trim();
            this.filteredWords = this.filteredWords.filter(word => 
                word.conlang.toLowerCase().includes(query) ||
                word.english.toLowerCase().includes(query) ||
                word.pos.toLowerCase().includes(query) ||
                (word.notes && word.notes.toLowerCase().includes(query))
            );
        }
        
        // Apply sorting
        this.filteredWords = this.sortWordsAlphabetically(this.filteredWords);
        
        window.appState.setState('filteredWords', this.filteredWords);
        this.updateDictionary();
    },

    bindEvents() {
        // Bind direct word addition
        const addDirectBtn = document.getElementById('add-direct-word-btn');
        if (addDirectBtn) {
            addDirectBtn.onclick = () => this.addDirectWord();
        }

        // FIXED: Bind search with correct ID from template
        const searchInput = document.getElementById('search-input'); // Changed from 'search' to 'search-input'
        if (searchInput) {
            searchInput.addEventListener('input', () => this.searchWords()); // Changed from 'keyup' to 'input' for better responsiveness
            searchInput.addEventListener('keyup', () => this.searchWords()); // Keep keyup as backup
        } else {
            console.warn('Search input not found! Looking for element with id="search-input"');
        }

        // Bind filter dropdown
        const filterPosSelect = document.getElementById('filter-pos');
        if (filterPosSelect) {
            filterPosSelect.addEventListener('change', () => this.filterByPartOfSpeech(filterPosSelect.value));
        }

        // Bind sort dropdown
        const sortBySelect = document.getElementById('sort-by');
        if (sortBySelect) {
            sortBySelect.addEventListener('change', () => this.applySorting(sortBySelect.value));
        }
    },

    updateDisplay() {
        this.updateVocabularyStats();
        this.updateAllWords();
        this.updateDictionary();
    },

    updateAllWords() {
        // Combine all word sources
        const allWords = [
            ...(window.generator.language.vocabulary || []),
            ...(window.generator.language.derivedWords || []),
            ...(window.generator.language.customWords || [])
        ];
        
        // Sort alphabetically before setting state
        const sortedWords = this.sortWordsAlphabetically(allWords);
        
        window.appState.setState('allWords', sortedWords);
        this.filteredWords = [...sortedWords];
        window.appState.setState('filteredWords', this.filteredWords);
    },

    // NEW: Add sorting controls to the interface
    addSortingControls() {
        // This function can be called to add sorting options to the UI if desired
        const searchFilterBar = document.querySelector('.search-filter-bar');
        if (!searchFilterBar) return;
        
        // Check if sorting controls already exist
        if (document.getElementById('sort-controls')) return;
        
        const sortControls = document.createElement('div');
        sortControls.id = 'sort-controls';
        sortControls.className = 'sort-controls';
        sortControls.innerHTML = `
            <label for="sort-select" style="font-weight: 600; color: var(--text-secondary); margin-right: 8px;">Sort by:</label>
            <select id="sort-select" class="form-control" style="width: auto; min-width: 150px;">
                <option value="alphabetical" selected>Alphabetical</option>
                <option value="chronological">Date Added</option>
                <option value="pos">Part of Speech</option>
                <option value="length">Word Length</option>
            </select>
        `;
        
        // Add to the search filter bar
        searchFilterBar.appendChild(sortControls);
        
        // Bind the sorting functionality
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', () => this.applySorting(sortSelect.value));
        }
    },

    updateVocabularyStats() {
        const stats = window.appState.getWordStats();
        
        const totalWordsEl = document.getElementById('total-words');
        const coreWordsEl = document.getElementById('core-words');
        const derivedWordsEl = document.getElementById('derived-words');
        const customWordsEl = document.getElementById('custom-words');
        
        if (totalWordsEl) totalWordsEl.textContent = stats.total;
        if (coreWordsEl) coreWordsEl.textContent = stats.core;
        if (derivedWordsEl) derivedWordsEl.textContent = stats.derived;
        if (customWordsEl) customWordsEl.textContent = stats.custom;
        
        const statsSection = document.getElementById('vocabulary-stats');
        if (statsSection) {
            statsSection.style.display = stats.total > 0 ? 'grid' : 'none';
        }
    },

    addDirectWord() {
        const conlang = document.getElementById('direct-conlang')?.value.trim();
        const meaning = document.getElementById('direct-meaning')?.value.trim();
        const pos = document.getElementById('direct-pos')?.value || 'noun';
        const notes = document.getElementById('direct-notes')?.value.trim();

        if (!conlang) {
            showToast('Please enter a conlang word!', 'error');
            return;
        }

        if (!meaning) {
            showToast('Please enter a meaning for the word!', 'error');
            return;
        }

        // Check for duplicate conlang words
        const allWords = window.appState.getState('allWords') || [];
        const duplicateConlang = allWords.find(w => w.conlang.toLowerCase() === conlang.toLowerCase());
        if (duplicateConlang) {
            showToast('A word with that spelling already exists!', 'error');
            return;
        }

        // Check for duplicate English meanings with same part of speech
        const duplicateEnglish = allWords.find(w => 
                    w.english.toLowerCase() === meaning.toLowerCase() && 
                    w.pos === pos
                );
                if (duplicateEnglish) {
                    showToast(`The meaning "${meaning}" as a ${pos} already exists for the word "${duplicateEnglish.conlang}". Try a different meaning or synonym.`, 'error');
                    return;
                }

        const newWord = {
            conlang: conlang,
            english: meaning,
            pos: pos,
            notes: notes,
            type: 'custom',
            dateAdded: new Date().toLocaleDateString()
        };

        // Add to language data
        if (!window.generator.language.customWords) {
            window.generator.language.customWords = [];
        }
        window.generator.language.customWords.push(newWord);
        
        // Update state
        window.appState.addWord(newWord);
        
        // Update displays
        this.updateDisplay();
        
        // Update morphology dropdowns
        if (window.MorphologyModule) {
            window.MorphologyModule.updateAffixDropdowns();
        }
        
        window.ActivityModule.addActivity(`Added custom word "${conlang}" meaning "${meaning}"`, 'vocabulary');
        showToast(`Added "${conlang}" meaning "${meaning}" to vocabulary!`, 'success');
        
        // Clear the form
        document.getElementById('direct-conlang').value = '';
        document.getElementById('direct-meaning').value = '';
        document.getElementById('direct-pos').value = 'noun';
        document.getElementById('direct-notes').value = '';
    },

    searchWords() {
        const searchInput = document.getElementById('search-input'); // Use correct ID
        if (!searchInput) {
            console.warn('Search input element not found');
            return;
        }
        
        const query = searchInput.value.toLowerCase().trim();
        const allWords = window.appState.getState('allWords') || [];

        if (query === '') {
            // If search is empty, show all words (or respect current filter)
            this.filteredWords = [...allWords];
        } else {
            // Filter words based on search query
            this.filteredWords = allWords.filter(word => 
                word.conlang.toLowerCase().includes(query) ||
                word.english.toLowerCase().includes(query) ||
                word.pos.toLowerCase().includes(query) ||
                (word.notes && word.notes.toLowerCase().includes(query)) ||
                (word.type && word.type.toLowerCase().includes(query))
            );
        }
        
        // Apply current sorting to search results
        const sortSelect = document.getElementById('sort-by');
        if (sortSelect && sortSelect.value) {
            this.applySorting(sortSelect.value);
        } else {
            // Default alphabetical sort
            this.filteredWords = this.sortWordsAlphabetically(this.filteredWords);
        }
        
        window.appState.setState('filteredWords', this.filteredWords);
        this.updateDictionary();
        
        // Show search results count
        const resultCount = this.filteredWords.length;
        const totalCount = allWords.length;
        
        if (query !== '') {
            console.log(`Search for "${query}" found ${resultCount} of ${totalCount} words`);
            
            // Optional: Show search results in UI
            if (window.showToast && resultCount === 0) {
                window.showToast(`No words found for "${query}"`, 'warning');
            }
        }
    },

    // FIXED filterWords function - Replace this function in vocabulary.js

    filterWords(type) {
        // Update active button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');

        const allWords = window.appState.getState('allWords') || [];

        switch(type) {
            case 'all':
                this.filteredWords = [...allWords];
                break;
            case 'nouns':
                this.filteredWords = allWords.filter(word => word.pos === 'noun');
                break;
            case 'verbs':
                this.filteredWords = allWords.filter(word => word.pos === 'verb');
                break;
            case 'adjectives':
                this.filteredWords = allWords.filter(word => word.pos === 'adjective');
                break;
            case 'derived':
                this.filteredWords = allWords.filter(word => word.derivedFrom || word.type === 'derived');
                break;
            case 'custom':
                this.filteredWords = allWords.filter(word => 
                    word.type === 'custom' || 
                    word.type === 'template' || 
                    word.type === 'bulk' ||
                    word.type === 'cultural-event' ||
                    word.type === 'social-role' ||
                    word.type === 'cultural-life' ||
                    word.type === 'cultural-seasonal' ||
                    word.type === 'cultural-social' ||
                    word.type?.startsWith('cultural-')
                );
                break;
            default:
                this.filteredWords = [...allWords];
        }
        
        // Sort alphabetically after filtering
        this.filteredWords = this.sortWordsAlphabetically(this.filteredWords);
        
        window.appState.setState('filteredWords', this.filteredWords);
        this.updateDictionary();
    },

    updateDictionary() {
        const dictionaryDiv = document.getElementById('dictionary');
        if (!dictionaryDiv) return;

        if (this.filteredWords.length === 0) {
            if (window.appState.getState('allWords').length === 0) {
                dictionaryDiv.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">Generate a language or add custom words to see the dictionary!</p>';
            } else {
                dictionaryDiv.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">No words match your search or filter. Try adjusting your criteria.</p>';
            }
            return;
        }

        // Compact grid layout
        dictionaryDiv.innerHTML = `
            <div class="word-grid-compact">
                ${this.filteredWords.map((word, index) => this.createWordCard(word, index)).join('')}
            </div>
        `;
    },

    createWordCard(word, index) {
        const allWords = window.appState.getState('allWords') || [];
        const globalIndex = allWords.findIndex(w => w.conlang === word.conlang && w.english === word.english);
        
        // Part of speech abbreviations
        const posAbbreviations = {
            'noun': 'n',
            'verb': 'v', 
            'adjective': 'adj',
            'adverb': 'adv',
            'pronoun': 'pron',
            'preposition': 'prep',
            'conjunction': 'conj',
            'interjection': 'interj',
            'determiner': 'det',
            'particle': 'part',
            'number': 'num'
        };
        
        const posAbbr = posAbbreviations[word.pos] || word.pos;
        
        // Convert to orthography
        const orthographyForm = this.convertToOrthography(word.conlang);
        const showBothForms = orthographyForm !== word.conlang;
        
        // Check if word has extra details that need expansion
        const hasExpandableContent = word.notes || word.derivedFrom || word.dateAdded || word.type;
        
        return `
            <div class="word-card-compact" id="word-${globalIndex}">
                <!-- Compact main content -->
                <div class="word-card-main" onclick="VocabularyModule.toggleWordExpansion(${globalIndex})">
                    <div class="word-header">
                        <div class="word-forms">
                            ${showBothForms ? `
                                <div class="word-conlang-compact">${orthographyForm}</div>
                                <div class="word-ipa-compact">[${word.conlang}]</div>
                            ` : `
                                <div class="word-conlang-compact">${word.conlang}</div>
                            `}
                        </div>
                        <div class="word-controls">
                            <span class="word-pos-compact">${posAbbr}</span>
                            ${hasExpandableContent ? '<span class="expand-indicator">▼</span>' : ''}
                        </div>
                    </div>
                    <div class="word-meaning-compact">${word.english}</div>
                </div>
                
                <!-- Expandable content (hidden by default) -->
                ${hasExpandableContent ? `
                    <div class="word-expanded-content" style="display: none;">
                        ${word.notes ? `
                            <div class="detail-item">
                                <span class="detail-label">📝 Notes:</span>
                                <span class="detail-value">${word.notes}</span>
                            </div>
                        ` : ''}
                        ${word.derivedFrom ? `
                            <div class="detail-item">
                                <span class="detail-label">🔗 Derived from:</span>
                                <span class="detail-value">${word.derivedFrom}</span>
                            </div>
                        ` : ''}
                        ${word.type ? `
                            <div class="detail-item">
                                <span class="detail-label">🏷️ Type:</span>
                                <span class="detail-value">${word.type}</span>
                            </div>
                        ` : ''}
                        ${word.dateAdded ? `
                            <div class="detail-item">
                                <span class="detail-label">📅 Added:</span>
                                <span class="detail-value">${word.dateAdded}</span>
                            </div>
                        ` : ''}
                        
                        <!-- Action buttons in expanded view -->
                        <div class="word-actions">
                            <button class="btn-compact btn-edit" onclick="event.stopPropagation(); VocabularyModule.editWord(${globalIndex})" title="Edit word">
                                ✏️ Edit
                            </button>
                            <button class="btn-compact btn-delete" onclick="event.stopPropagation(); VocabularyModule.deleteWord(${globalIndex})" title="Delete word">
                                🗑️ Delete
                            </button>
                        </div>
                    </div>
                ` : `
                    <!-- Simple action buttons for words without expandable content -->
                    <div class="word-simple-actions">
                        <button class="btn-mini btn-edit" onclick="event.stopPropagation(); VocabularyModule.editWord(${globalIndex})" title="Edit">✏️</button>
                        <button class="btn-mini btn-delete" onclick="event.stopPropagation(); VocabularyModule.deleteWord(${globalIndex})" title="Delete">🗑️</button>
                    </div>
                `}
            </div>
        `;
    },

    toggleWordExpansion(globalIndex) {
        const wordCard = document.getElementById(`word-${globalIndex}`);
        if (!wordCard) return;
        
        const expandedContent = wordCard.querySelector('.word-expanded-content');
        const expandIndicator = wordCard.querySelector('.expand-indicator');
        
        if (!expandedContent) return; // No expandable content
        
        const isExpanded = expandedContent.style.display !== 'none';
        
        if (isExpanded) {
            // Collapse
            expandedContent.style.display = 'none';
            if (expandIndicator) expandIndicator.textContent = '▼';
            wordCard.classList.remove('expanded');
        } else {
            // Expand
            expandedContent.style.display = 'block';
            if (expandIndicator) expandIndicator.textContent = '▲';
            wordCard.classList.add('expanded');
        }
    },


    convertToOrthography(ipaWord) {
        if (!window.PhonologyModule || !window.PhonologyModule.orthographyMap) {
            return ipaWord; // Return original if no orthography mapping
        }
        
        const orthographyMap = window.PhonologyModule.orthographyMap;
        let orthographyWord = ipaWord;
        
        // Sort by length (longest first) to avoid partial replacements
        const sortedMappings = Object.entries(orthographyMap).sort((a, b) => b[0].length - a[0].length);
        
        // Apply each mapping
        sortedMappings.forEach(([ipa, ortho]) => {
            if (ipa !== ortho) { // Only convert if different
                orthographyWord = orthographyWord.replace(new RegExp(ipa, 'g'), ortho);
            }
        });
        
        return orthographyWord;
    },

    showWordDetails(conlangWord) {
        const allWords = window.appState.getState('allWords') || [];
        const word = allWords.find(w => w.conlang === conlangWord);
        
        if (!word) {
            showToast('Word not found!', 'error');
            return;
        }
        
        const orthographyForm = this.convertToOrthography(word.conlang);
        const showBothForms = orthographyForm !== word.conlang;
        
        const detailsHTML = `
            <div class="word-details-modal">
                <div class="word-details-content">
                    <h3>Word Details</h3>
                    
                    ${showBothForms ? `
                        <div class="word-display-section">
                            <div class="word-main-form">${orthographyForm}</div>
                            <div class="word-ipa-form">[${word.conlang}]</div>
                            <div class="word-meaning">"${word.english}"</div>
                        </div>
                    ` : `
                        <div class="word-display-section">
                            <div class="word-main-form">${word.conlang}</div>
                            <div class="word-meaning">"${word.english}"</div>
                        </div>
                    `}
                    
                    <div class="word-info-grid">
                        <div><strong>Part of Speech:</strong> ${word.pos}</div>
                        ${word.notes ? `<div><strong>Notes:</strong> ${word.notes}</div>` : ''}
                        ${word.derivedFrom ? `<div><strong>Derived From:</strong> ${word.derivedFrom}</div>` : ''}
                        ${word.type ? `<div><strong>Type:</strong> ${word.type}</div>` : ''}
                        ${word.dateAdded ? `<div><strong>Added:</strong> ${word.dateAdded}</div>` : ''}
                    </div>
                    
                    <div class="word-details-actions">
                        <button class="btn btn-secondary" onclick="this.closest('.word-details-modal').remove()">Close</button>
                        <button class="btn btn-primary" onclick="VocabularyModule.editWordFromDetails('${word.conlang}'); this.closest('.word-details-modal').remove()">Edit Word</button>
                    </div>
                </div>
            </div>
        `;
        
        // Create modal backdrop
        const modal = document.createElement('div');
        modal.className = 'word-details-backdrop';
        modal.innerHTML = detailsHTML;
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
        
        document.body.appendChild(modal);
    },

    // NEW: Edit word from details view
    editWordFromDetails(conlangWord) {
        const allWords = window.appState.getState('allWords') || [];
        const globalIndex = allWords.findIndex(w => w.conlang === conlangWord);
        
        if (globalIndex !== -1) {
            this.editWord(globalIndex);
        }
    },

    showWordDetails(conlangWord) {
        const allWords = window.appState.getState('allWords') || [];
        const wordData = allWords.find(w => w.conlang === conlangWord);
        if (!wordData) return;

        let details = `Word: ${wordData.conlang}\nMeaning: ${wordData.english}\nPart of Speech: ${wordData.pos}`;
        if (wordData.derivedFrom) details += `\nDerived from: ${wordData.derivedFrom}`;
        if (wordData.notes) details += `\nNotes: ${wordData.notes}`;
        if (wordData.dateAdded) details += `\nAdded: ${wordData.dateAdded}`;
        details += `\nType: ${wordData.type || 'core'}`;

        alert(details);
    },

    // FIXED: Use proper modal instead of prompts
    editWord(wordIndex) {
        const allWords = window.appState.getState('allWords') || [];
        if (wordIndex < 0 || wordIndex >= allWords.length) return;
        
        this.editingWordIndex = wordIndex;
        const word = allWords[wordIndex];
        
        document.getElementById('edit-conlang').value = word.conlang;
        document.getElementById('edit-english').value = word.english;
        document.getElementById('edit-pos').value = word.pos;
        document.getElementById('edit-notes').value = word.notes || '';
        
        document.getElementById('edit-word-modal').style.display = 'block';
    },

    saveWordEdit() {
        if (this.editingWordIndex < 0) return;
        
        const allWords = window.appState.getState('allWords') || [];
        const newConlang = document.getElementById('edit-conlang').value.trim();
        const newEnglish = document.getElementById('edit-english').value.trim();
        const newPos = document.getElementById('edit-pos').value;
        const newNotes = document.getElementById('edit-notes').value.trim();
        
        if (!newConlang || !newEnglish) {
            showToast('Please fill in both the conlang word and English meaning!', 'error');
            return;
        }
        
        // Check for duplicate conlang words (excluding the current word)
        const duplicateConlang = allWords.find((w, i) => i !== this.editingWordIndex && w.conlang.toLowerCase() === newConlang.toLowerCase());
        if (duplicateConlang) {
            showToast('A word with that spelling already exists!', 'error');
            return;
        }

        // Check for duplicate English meanings (excluding the current word)
        const duplicateEnglish = allWords.find(w => 
                    w.english.toLowerCase() === meaning.toLowerCase() && 
                    w.pos === pos
                );
                if (duplicateEnglish) {
                    showToast(`The meaning "${meaning}" as a ${pos} already exists for the word "${duplicateEnglish.conlang}". Try a different meaning or synonym.`, 'error');
                    return;
                }
        
        // Update the word
        const oldWord = allWords[this.editingWordIndex].conlang;
        allWords[this.editingWordIndex].conlang = newConlang;
        allWords[this.editingWordIndex].english = newEnglish;
        allWords[this.editingWordIndex].pos = newPos;
        allWords[this.editingWordIndex].notes = newNotes;
        allWords[this.editingWordIndex].lastModified = new Date().toLocaleDateString();
        
        // Update in the appropriate language array
        this.updateWordInLanguageData(allWords[this.editingWordIndex], oldWord);
        
        // Update state
        window.appState.setState('allWords', [...allWords]);
        this.filteredWords = [...allWords];
        window.appState.setState('filteredWords', this.filteredWords);
        
        // Refresh displays
        this.updateDisplay();
        
        // Update morphology dropdowns
        if (window.MorphologyModule) {
            window.MorphologyModule.updateAffixDropdowns();
        }
        
        this.closeModal('edit-word-modal');
        window.ActivityModule.addActivity(`Edited word "${newConlang}"`, 'vocabulary');
        showToast('Word updated successfully!', 'success');
    },

    deleteWord(wordIndex) {
        const allWords = window.appState.getState('allWords') || [];
        if (wordIndex < 0 || wordIndex >= allWords.length) return;
        
        const word = allWords[wordIndex];
        if (confirm(`Are you sure you want to delete "${word.conlang}" (${word.english})?`)) {
            // Remove from appropriate language array
            this.removeWordFromLanguageData(word);
            
            // Remove from state
            allWords.splice(wordIndex, 1);
            window.appState.setState('allWords', [...allWords]);
            this.filteredWords = this.filteredWords.filter(w => w !== word);
            window.appState.setState('filteredWords', this.filteredWords);
            
            // Refresh displays
            this.updateDisplay();
            
            // Update morphology dropdowns
            if (window.MorphologyModule) {
                window.MorphologyModule.updateAffixDropdowns();
            }
            
            window.ActivityModule.addActivity(`Deleted word "${word.conlang}"`, 'vocabulary');
            showToast(`Deleted "${word.conlang}" from vocabulary`, 'success');
        }
    },

    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
        this.editingWordIndex = -1;
    },

    updateWordInLanguageData(word, oldConlang) {
        if (word.type === 'core') {
            const coreIndex = window.generator.language.vocabulary.findIndex(w => w.conlang === oldConlang);
            if (coreIndex >= 0) window.generator.language.vocabulary[coreIndex] = word;
        } else if (word.type === 'derived') {
            const derivedIndex = window.generator.language.derivedWords.findIndex(w => w.conlang === oldConlang);
            if (derivedIndex >= 0) window.generator.language.derivedWords[derivedIndex] = word;
        } else if (word.type === 'custom' || word.type === 'template' || word.type === 'bulk') {
            const customIndex = window.generator.language.customWords.findIndex(w => w.conlang === oldConlang);
            if (customIndex >= 0) window.generator.language.customWords[customIndex] = word;
        }
    },

    removeWordFromLanguageData(word) {
        if (word.type === 'core') {
            const coreIndex = window.generator.language.vocabulary.findIndex(w => w.conlang === word.conlang);
            if (coreIndex >= 0) window.generator.language.vocabulary.splice(coreIndex, 1);
        } else if (word.type === 'derived') {
            const derivedIndex = window.generator.language.derivedWords.findIndex(w => w.conlang === word.conlang);
            if (derivedIndex >= 0) window.generator.language.derivedWords.splice(derivedIndex, 1);
        } else if (word.type === 'custom' || word.type === 'template' || word.type === 'bulk') {
            const customIndex = window.generator.language.customWords.findIndex(w => w.conlang === word.conlang);
            if (customIndex >= 0) window.generator.language.customWords.splice(customIndex, 1);
        }
    },

    // Alphabetical Vocabulary Sorting - Add these functions to js/modules/vocabulary.js

    // NEW: Sort words alphabetically
    sortWordsAlphabetically(words) {
        return words.sort((a, b) => {
            // Get the display form (orthography if available, otherwise conlang)
            const aDisplay = this.getDisplayForm(a);
            const bDisplay = this.getDisplayForm(b);
            
            // Sort alphabetically, case-insensitive
            return aDisplay.toLowerCase().localeCompare(bDisplay.toLowerCase());
        });
    },

    // NEW: Get the display form for sorting (orthography or conlang)
    getDisplayForm(word) {
        // Convert to orthography if available
        const orthographyForm = this.convertToOrthography(word.conlang);
        
        // Use orthography if it's different from IPA, otherwise use original
        return orthographyForm !== word.conlang ? orthographyForm : word.conlang;
    },

    // Updated addSortingControls function - Replace in js/modules/vocabulary.js

    addSortingControls() {
        // This function integrates sorting controls into the existing search-filter-bar
        const searchFilterBar = document.querySelector('.search-filter-bar');
        if (!searchFilterBar) return;
        
        // Check if sorting controls already exist
        if (document.getElementById('sort-controls')) return;
        
        const sortControls = document.createElement('div');
        sortControls.id = 'sort-controls';
        sortControls.className = 'sort-controls';
        sortControls.innerHTML = `
            <label for="sort-select">Sort by:</label>
            <select id="sort-select">
                <option value="alphabetical" selected>Alphabetical</option>
                <option value="chronological">Date Added</option>
                <option value="pos">Part of Speech</option>
                <option value="length">Word Length</option>
            </select>
        `;
        
        // Add to the search filter bar (after filter buttons)
        searchFilterBar.appendChild(sortControls);
        
        // Bind the sorting functionality
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', () => this.applySorting(sortSelect.value));
        }
    },

    // NEW: Apply different sorting methods
    applySorting(sortMethod) {
        if (!this.filteredWords || this.filteredWords.length === 0) {
            this.filteredWords = window.appState.getState('allWords') || [];
        }
        
        switch (sortMethod) {
            case 'english':
                this.filteredWords = [...this.filteredWords].sort((a, b) => 
                    a.english.toLowerCase().localeCompare(b.english.toLowerCase())
                );
                break;
                
            case 'conlang':
                this.filteredWords = this.sortWordsAlphabetically([...this.filteredWords]);
                break;
                
            case 'pos':
                this.filteredWords = [...this.filteredWords].sort((a, b) => {
                    const aPos = a.pos || 'zzz';
                    const bPos = b.pos || 'zzz';
                    if (aPos === bPos) {
                        // Secondary sort by English word
                        return a.english.toLowerCase().localeCompare(b.english.toLowerCase());
                    }
                    return aPos.localeCompare(bPos);
                });
                break;
                
            case 'length':
                this.filteredWords = [...this.filteredWords].sort((a, b) => {
                    const aLength = a.conlang.length;
                    const bLength = b.conlang.length;
                    if (aLength === bLength) {
                        // Secondary sort by alphabetical
                        return a.conlang.toLowerCase().localeCompare(b.conlang.toLowerCase());
                    }
                    return aLength - bLength;
                });
                break;
                
            default:
                this.filteredWords = this.sortWordsAlphabetically([...this.filteredWords]);
        }
        
        this.updateDictionary();
        window.appState.setState('filteredWords', this.filteredWords);
    },

    sortWordsAlphabetically(words) {
        return words.sort((a, b) => {
            const aDisplay = this.getDisplayForm(a);
            const bDisplay = this.getDisplayForm(b);
            return aDisplay.toLowerCase().localeCompare(bDisplay.toLowerCase());
        });
    },

    getDisplayForm(word) {
        const orthographyForm = this.convertToOrthography ? this.convertToOrthography(word.conlang) : word.conlang;
        return orthographyForm !== word.conlang ? orthographyForm : word.conlang;
    },

    convertToOrthography(ipaWord) {
        if (!window.PhonologyModule || !window.PhonologyModule.orthographyMap) {
            return ipaWord;
        }
        
        const orthographyMap = window.PhonologyModule.orthographyMap;
        let orthographyWord = ipaWord;
        
        const sortedMappings = Object.entries(orthographyMap).sort((a, b) => b[0].length - a[0].length);
        
        sortedMappings.forEach(([ipa, ortho]) => {
            if (ipa !== ortho) {
                orthographyWord = orthographyWord.replace(new RegExp(ipa, 'g'), ortho);
            }
        });
        
        return orthographyWord;
},
};