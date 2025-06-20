// Vocabulary Module - Fixed with compact design and top-right POS tags
window.VocabularyModule = {
    filteredWords: [],
    editingWordIndex: -1,

    init() {
        console.log('VocabularyModule initialized');
        this.bindEvents();
        this.updateDisplay();
    },

    bindEvents() {
        // Bind direct word addition
        const addDirectBtn = document.getElementById('add-direct-word-btn');
        if (addDirectBtn) {
            addDirectBtn.onclick = () => this.addDirectWord();
        }

        // Bind search
        const searchInput = document.getElementById('search');
        if (searchInput) {
            searchInput.addEventListener('keyup', () => this.searchWords());
        }

        // Bind filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.filterWords(e.target.textContent.toLowerCase()));
        });

        console.log('Vocabulary events bound');
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
        
        window.appState.setState('allWords', allWords);
        this.filteredWords = [...allWords];
        window.appState.setState('filteredWords', this.filteredWords);
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
        const query = document.getElementById('search')?.value.toLowerCase() || '';
        const allWords = window.appState.getState('allWords') || [];
        
        if (!query) {
            this.filteredWords = [...allWords];
        } else {
            this.filteredWords = allWords.filter(word => 
                word.conlang.toLowerCase().includes(query) ||
                word.english.toLowerCase().includes(query) ||
                word.pos.toLowerCase().includes(query) ||
                (word.notes && word.notes.toLowerCase().includes(query))
            );
        }
        
        window.appState.setState('filteredWords', this.filteredWords);
        this.updateDictionary();
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
            // FIXED: Include all non-core word types (custom, template, bulk, and all cultural types)
            this.filteredWords = allWords.filter(word => 
                word.type === 'custom' || 
                word.type === 'template' || 
                word.type === 'bulk' ||
                word.type === 'cultural-event' ||
                word.type === 'social-role' ||
                word.type === 'cultural-life' ||
                word.type === 'cultural-seasonal' ||
                word.type === 'cultural-social' ||
                word.type?.startsWith('cultural-') // Catch any other cultural types
            );
            break;
        default:
            this.filteredWords = [...allWords];
    }
    
    window.appState.setState('filteredWords', this.filteredWords);
    this.updateDictionary();
},

    updateDictionary() {
        const dictionaryDiv = document.getElementById('dictionary');
        if (!dictionaryDiv) return;
        
        if (this.filteredWords.length === 0) {
            const allWords = window.appState.getState('allWords') || [];
            if (allWords.length === 0) {
                dictionaryDiv.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">No words found. Generate a language or add custom words to see the dictionary!</p>';
            } else {
                dictionaryDiv.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">No words match your search or filter. Try adjusting your criteria.</p>';
            }
            return;
        }

        dictionaryDiv.innerHTML = `
            <div class="word-grid">
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
        
        return `
            <div class="word-card" onclick="VocabularyModule.showWordDetails('${word.conlang}')">
                <span class="word-pos">${posAbbr}</span>
                <button class="edit-btn" onclick="event.stopPropagation(); VocabularyModule.editWord(${globalIndex})" title="Edit word">✏️</button>
                <button class="delete-btn" onclick="event.stopPropagation(); VocabularyModule.deleteWord(${globalIndex})" title="Delete word">🗑️</button>
                <div class="word-conlang">${word.conlang}</div>
                <div class="word-english">${word.english}</div>
                ${word.derivedFrom ? `<div class="word-derived">← ${word.derivedFrom}</div>` : ''}
                ${word.notes ? `<div class="word-derived">${word.notes}</div>` : ''}
                ${word.dateAdded ? `<div class="word-derived">Added: ${word.dateAdded}</div>` : ''}
            </div>
        `;
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
    }
};