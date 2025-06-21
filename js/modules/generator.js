// Generator Module - Fixed bulk word display overflow
window.GeneratorModule = {
    currentGeneratedWord: '',
    bulkGeneratedWords: [],
    selectedBulkWords: new Set(), // Track selected word indices

    init() {
        console.log('GeneratorModule initialized');
        this.bindEvents();
    },

    bindEvents() {
        // Bind random word generation
        const generateWordBtn = document.getElementById('generate-word-btn');
        if (generateWordBtn) {
            generateWordBtn.onclick = () => this.generateRandomWord();
        }

        // Bind add to vocabulary
        const addToVocabBtn = document.getElementById('add-to-vocab-btn');
        if (addToVocabBtn) {
            addToVocabBtn.onclick = () => this.addToVocabulary();
        }

        // Bind template generation
        const generateTemplateBtn = document.getElementById('generate-template-btn');
        if (generateTemplateBtn) {
            generateTemplateBtn.onclick = () => this.generateTemplateWords();
        }

        // Bind bulk generation
        const generateBulkBtn = document.getElementById('generate-bulk-btn');
        if (generateBulkBtn) {
            generateBulkBtn.onclick = () => this.generateBulkWords();
        }

        const addAllBulkBtn = document.getElementById('add-all-bulk-btn');
        if (addAllBulkBtn) {
            addAllBulkBtn.onclick = () => this.addAllBulkWords();
        }

        // NEW: Bind add selected bulk words
        const addSelectedBulkBtn = document.getElementById('add-selected-bulk-btn');
        if (addSelectedBulkBtn) {
            addSelectedBulkBtn.onclick = () => this.addSelectedBulkWords();
        }

        // NEW: Bind select all bulk words
        const selectAllBulkBtn = document.getElementById('select-all-bulk-btn');
        if (selectAllBulkBtn) {
            selectAllBulkBtn.onclick = () => this.selectAllBulkWords();
        }

        console.log('Generator events bound');
    },

    generateRandomWord() {
        // Check if phonology exists
        if (!window.generator.language.phonology.vowels || window.generator.language.phonology.vowels.length === 0) {
            showToast('Please generate phonology first!', 'error');
            switchTab('phonology');
            return;
        }

        const syllableCountValue = document.getElementById('syllable-count')?.value;
        let syllableCount;
        
        if (syllableCountValue === 'random') {
            syllableCount = Math.floor(Math.random() * 3) + 1;
        } else {
            syllableCount = parseInt(syllableCountValue) || 2;
        }

        this.currentGeneratedWord = window.generator.generateWord(syllableCount);
        const editableInput = document.getElementById('editable-generated-word');
        if (editableInput) {
            editableInput.value = this.currentGeneratedWord;
            editableInput.setAttribute('readonly', true);
        }
        document.getElementById('word-display').style.display = 'block';
        
        // Clear previous inputs
        const meaningInput = document.getElementById('word-meaning');
        const notesInput = document.getElementById('word-notes');
        if (meaningInput) meaningInput.value = '';
        if (notesInput) notesInput.value = '';

        showToast(`Generated word: ${this.currentGeneratedWord}`);
    },

    updateGeneratedWord(newWord) {
        // Update the current generated word when user edits it
        this.currentGeneratedWord = newWord.trim();
        const editableInput = document.getElementById('editable-generated-word');
        if (editableInput) {
            editableInput.value = this.currentGeneratedWord;
            editableInput.setAttribute('readonly', true);
        }
        
        if (this.currentGeneratedWord !== newWord.trim()) {
            showToast(`Word updated to: ${this.currentGeneratedWord}`);
        }
    },

    addToVocabulary() {
        const meaning = document.getElementById('word-meaning')?.value.trim();
        const pos = document.getElementById('word-pos')?.value || 'noun';
        const notes = document.getElementById('word-notes')?.value.trim();

        if (!this.currentGeneratedWord) {
            showToast('Please generate a word first!', 'error');
            return;
        }

        if (!meaning) {
            showToast('Please enter a meaning for the word!', 'error');
            return;
        }

        // Check for duplicate conlang words
        const allWords = window.appState.getState('allWords') || [];
        const duplicateConlang = allWords.find(w => w.conlang.toLowerCase() === this.currentGeneratedWord.toLowerCase());
        if (duplicateConlang) {
            showToast('A word with that spelling already exists!', 'error');
            return;
        }

        // Check for duplicate English meanings
        const duplicateEnglish = allWords.find(w => w.english.toLowerCase() === meaning.toLowerCase());
        if (duplicateEnglish) {
            showToast(`The meaning "${meaning}" already exists for the word "${duplicateEnglish.conlang}". Try a different meaning or synonym.`, 'error');
            return;
        }

        const newWord = {
            conlang: this.currentGeneratedWord,
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
        
        // Update morphology dropdowns if module exists
        if (window.MorphologyModule) {
            window.MorphologyModule.updateAffixDropdowns();
        }

        // Update vocabulary display if module exists
        if (window.VocabularyModule) {
            window.VocabularyModule.updateDisplay();
        }
        
        window.ActivityModule.addActivity(`Added word "${this.currentGeneratedWord}" meaning "${meaning}"`, 'vocabulary');
        showToast(`Added "${this.currentGeneratedWord}" meaning "${meaning}" to vocabulary!`, 'success');
        
        // Clear the form
        document.getElementById('word-display').style.display = 'none';
        this.currentGeneratedWord = '';
    },

    generateTemplateWords() {
        console.log('🎯 Generating template words from Core Database...');
        
        // Check if core database is available
        if (typeof CoreVocabularyDatabase === 'undefined') {
            console.warn('⚠️ Core vocabulary database not available, using old template system');
            this.generateOldTemplateWords();
            return;
        }
        
        const selectedCategory = document.getElementById('template-category')?.value || 'family';
        
        // Get words from the selected category with priority 6+
        let categoryWords = CoreVocabularyDatabase.getWordsByCategory(selectedCategory);
        
        // If no specific category or category is empty, get high-priority words from multiple categories
        if (!categoryWords || categoryWords.length === 0 || selectedCategory === 'mixed') {
            const categories = ['family', 'basic', 'actions', 'nature', 'social'];
            categoryWords = [];
            categories.forEach(cat => {
                const wordsInCat = CoreVocabularyDatabase.getWordsByCategory(cat)
                    .filter(word => word.priority >= 6)
                    .slice(0, 4); // 4 from each category
                categoryWords.push(...wordsInCat);
            });
        }
        
        // Filter to priority 6+ and limit to reasonable number
        const priorityWords = categoryWords
            .filter(word => word.priority >= 6)
            .sort((a, b) => b.priority - a.priority)
            .slice(0, 20);
        
        if (priorityWords.length === 0) {
            showToast('No suitable template words found in this category!', 'error');
            return;
        }
        
        // Display template options
        const templateDisplay = document.getElementById('template-display');
        if (templateDisplay) {
            templateDisplay.innerHTML = `
                <h4>📋 Template Words from ${selectedCategory} (Select words to generate)</h4>
                <div class="template-grid">
                    ${priorityWords.map((word, index) => `
                        <label class="template-word-option">
                            <input type="checkbox" value="${index}" checked>
                            <span class="template-word">
                                <strong>${word.english}</strong> 
                                <em>(${word.pos})</em>
                                <small>Priority ${word.priority}</small>
                            </span>
                        </label>
                    `).join('')}
                </div>
                <div style="margin-top: 15px;">
                    <button class="btn btn-success" onclick="GeneratorModule.addSelectedTemplates(${JSON.stringify(priorityWords).replace(/"/g, '&quot;')})">
                        ➕ Generate Selected Words
                    </button>
                </div>
            `;
            templateDisplay.style.display = 'block';
        }
        
        console.log(`📋 Showing ${priorityWords.length} template options from ${selectedCategory}`);
    },

    addSelectedTemplates(availableWords) {
        const checkboxes = document.querySelectorAll('.template-word-option input[type="checkbox"]:checked');
        const selectedIndices = Array.from(checkboxes).map(cb => parseInt(cb.value));
        
        if (selectedIndices.length === 0) {
            showToast('Please select at least one word to generate!', 'error');
            return;
        }
        
        const selectedWords = selectedIndices.map(index => availableWords[index]);
        
        // Filter out words that already exist
        const allWords = window.appState.getState('allWords') || [];
        const existingMeanings = new Set(allWords.map(w => w.english.toLowerCase()));
        const newWords = selectedWords.filter(word => !existingMeanings.has(word.english.toLowerCase()));
        
        if (newWords.length === 0) {
            showToast('All selected words already exist in your dictionary!', 'error');
            return;
        }
        
        // Generate conlang words
        const generatedWords = newWords.map(word => ({
            conlang: window.generator.generateWord(),
            english: word.english,
            pos: word.pos,
            type: 'template',
            priority: word.priority,
            category: word.category,
            tags: word.tags,
            notes: `Template word from ${word.category} (Priority ${word.priority})`,
            dateAdded: new Date().toISOString()
        }));
        
        // Add to language data
        if (!window.generator.language.customWords) {
            window.generator.language.customWords = [];
        }
        window.generator.language.customWords.push(...generatedWords);
        
        // Update state
        generatedWords.forEach(word => window.appState.addWord(word));
        
        // Update displays
        if (window.VocabularyModule) {
            window.VocabularyModule.updateDisplay();
        }
        if (window.MorphologyModule) {
            window.MorphologyModule.updateAffixDropdowns();
        }
        
        // Clear template display
        const templateDisplay = document.getElementById('template-display');
        if (templateDisplay) {
            templateDisplay.style.display = 'none';
        }
        
        const skippedCount = selectedWords.length - newWords.length;
        let message = `Generated ${newWords.length} words from core database!`;
        if (skippedCount > 0) {
            message += ` (${skippedCount} already existed)`;
        }
        
        window.ActivityModule.addActivity(`Generated ${newWords.length} template words from core database`, 'vocabulary');
        showToast(message, 'success');
    },

    // 3. ADD this fallback function to the GeneratorModule (after addSelectedTemplates):
    generateOldTemplateWords() {
        console.log('📝 Using fallback template system...');
        
        // Keep the existing template system as fallback
        const templates = {
            family: [
                { english: 'mother', pos: 'noun' },
                { english: 'father', pos: 'noun' },
                { english: 'child', pos: 'noun' },
                { english: 'brother', pos: 'noun' },
                { english: 'sister', pos: 'noun' }
            ],
            basic: [
                { english: 'water', pos: 'noun' },
                { english: 'fire', pos: 'noun' },
                { english: 'good', pos: 'adjective' },
                { english: 'bad', pos: 'adjective' },
                { english: 'big', pos: 'adjective' }
            ],
            nature: [
                { english: 'tree', pos: 'noun' },
                { english: 'rock', pos: 'noun' },
                { english: 'sky', pos: 'noun' },
                { english: 'earth', pos: 'noun' },
                { english: 'animal', pos: 'noun' }
            ]
        };
        
        const selectedCategory = document.getElementById('template-category')?.value || 'family';
        const selectedTemplates = templates[selectedCategory] || templates.family;
        
        // Filter out existing words and generate
        const allWords = window.appState.getState('allWords') || [];
        const existingMeanings = new Set(allWords.map(w => w.english.toLowerCase()));
        const newTemplateWords = selectedTemplates.filter(word => !existingMeanings.has(word.english.toLowerCase()));

        if (newTemplateWords.length === 0) {
            showToast('All template words already exist in your dictionary!', 'error');
            return;
        }

        const newWords = newTemplateWords.map(word => ({
            conlang: window.generator.generateWord(),
            english: word.english,
            pos: word.pos,
            type: 'template',
            dateAdded: new Date().toLocaleDateString()
        }));

        // Add to language data
        if (!window.generator.language.customWords) {
            window.generator.language.customWords = [];
        }
        window.generator.language.customWords.push(...newWords);
        
        // Update state
        newWords.forEach(word => window.appState.addWord(word));
        
        // Update other modules
        if (window.MorphologyModule) {
            window.MorphologyModule.updateAffixDropdowns();
        }
        if (window.VocabularyModule) {
            window.VocabularyModule.updateDisplay();
        }
        
        const skippedCount = selectedTemplates.length - newWords.length;
        let message = `Generated ${newWords.length} template words!`;
        if (skippedCount > 0) {
            message += ` (${skippedCount} already existed and were skipped)`;
        }
        
        window.ActivityModule.addActivity(`Generated ${newWords.length} template words`, 'vocabulary');
        showToast(message, 'success');
    },

    generateBulkWords() {
        const count = parseInt(document.getElementById('bulk-count')?.value) || 10;
        
        if (!window.generator.language.phonology.syllables || window.generator.language.phonology.syllables.length === 0) {
            showToast('Please generate phonology first!', 'error');
            switchTab('phonology');
            return;
        }

        this.bulkGeneratedWords = [];
        this.selectedBulkWords.clear(); // Clear previous selections
        
        for (let i = 0; i < count; i++) {
            const syllableCount = Math.floor(Math.random() * 3) + 1;
            const word = window.generator.generateWord(syllableCount);
            this.bulkGeneratedWords.push({
                conlang: word,
                english: `word${i + 1}`, // placeholder meaning
                pos: 'noun', // default pos
                type: 'bulk'
            });
        }

        this.displayBulkWords();
        this.updateSelectedCount();
        
        const bulkResults = document.getElementById('bulk-results');
        if (bulkResults) {
            bulkResults.style.display = 'block';
        }
        
        showToast(`Generated ${count} random words! Click to select the ones you like.`, 'success');
    },

    displayBulkWords() {
        const bulkWordList = document.getElementById('bulk-word-list');
        if (bulkWordList) {
            bulkWordList.innerHTML = `
                <div style="display: flex; flex-wrap: wrap; gap: 8px; max-width: 100%;">
                    ${this.bulkGeneratedWords.map((word, index) => 
                        `<span class="phoneme bulk-word ${this.selectedBulkWords.has(index) ? 'selected' : ''}" 
                               onclick="GeneratorModule.toggleBulkWordSelection(${index})" 
                               data-index="${index}"
                               style="cursor: pointer; transition: all 0.3s ease;"
                               title="Click to select/deselect this word">${word.conlang}</span>`
                    ).join('')}
                </div>
            `;
        }
    },

    toggleBulkWordSelection(index) {
        if (this.selectedBulkWords.has(index)) {
            this.selectedBulkWords.delete(index);
        } else {
            this.selectedBulkWords.add(index);
        }
        
        // Update the visual state of the clicked word
        const wordElement = document.querySelector(`[data-index="${index}"]`);
        if (wordElement) {
            if (this.selectedBulkWords.has(index)) {
                wordElement.classList.add('selected');
            } else {
                wordElement.classList.remove('selected');
            }
        }
        
        this.updateSelectedCount();
    },

    selectAllBulkWords() {
        if (this.selectedBulkWords.size === this.bulkGeneratedWords.length) {
            // If all are selected, deselect all
            this.selectedBulkWords.clear();
            showToast('All words deselected', 'success');
        } else {
            // Select all words
            this.selectedBulkWords.clear();
            for (let i = 0; i < this.bulkGeneratedWords.length; i++) {
                this.selectedBulkWords.add(i);
            }
            showToast('All words selected', 'success');
        }
        
        this.displayBulkWords();
        this.updateSelectedCount();
        
        // Update button text
        const selectAllBtn = document.getElementById('select-all-bulk-btn');
        if (selectAllBtn) {
            selectAllBtn.innerHTML = this.selectedBulkWords.size === this.bulkGeneratedWords.length ? 
                '☐ Deselect All' : '☑️ Select All';
        }
    },

    updateSelectedCount() {
        const countElement = document.getElementById('selected-count');
        if (countElement) {
            countElement.textContent = this.selectedBulkWords.size;
        }
        
        // Update button states
        const addSelectedBtn = document.getElementById('add-selected-bulk-btn');
        const selectAllBtn = document.getElementById('select-all-bulk-btn');
        
        if (addSelectedBtn) {
            addSelectedBtn.disabled = this.selectedBulkWords.size === 0;
            if (this.selectedBulkWords.size === 0) {
                addSelectedBtn.style.opacity = '0.6';
            } else {
                addSelectedBtn.style.opacity = '1';
            }
        }
        
        if (selectAllBtn) {
            selectAllBtn.innerHTML = this.selectedBulkWords.size === this.bulkGeneratedWords.length ? 
                '☐ Deselect All' : '☑️ Select All';
        }
    },

    addSelectedBulkWords() {
        if (this.selectedBulkWords.size === 0) {
            showToast('No words selected! Click on words to select them first.', 'error');
            return;
        }

        // Get selected words
        const selectedWords = Array.from(this.selectedBulkWords).map(index => this.bulkGeneratedWords[index]);

        // Add to language data
        if (!window.generator.language.customWords) {
            window.generator.language.customWords = [];
        }
        
        const wordsWithDate = selectedWords.map(word => ({
            ...word,
            dateAdded: new Date().toLocaleDateString()
        }));
        
        window.generator.language.customWords.push(...wordsWithDate);
        
        // Update state
        wordsWithDate.forEach(word => window.appState.addWord(word));
        
        // Update other modules
        if (window.MorphologyModule) {
            window.MorphologyModule.updateAffixDropdowns();
        }
        if (window.VocabularyModule) {
            window.VocabularyModule.updateDisplay();
        }
        
        window.ActivityModule.addActivity(`Added ${selectedWords.length} selected words from bulk generation`, 'vocabulary');
        showToast(`Added ${selectedWords.length} selected words to vocabulary!`, 'success');
        
        // Clear bulk results
        const bulkResults = document.getElementById('bulk-results');
        if (bulkResults) {
            bulkResults.style.display = 'none';
        }
        this.bulkGeneratedWords = [];
        this.selectedBulkWords.clear();
    },

    addAllBulkWords() {
        if (this.bulkGeneratedWords.length === 0) {
            showToast('No bulk words to add!', 'error');
            return;
        }

        // Add to language data
        if (!window.generator.language.customWords) {
            window.generator.language.customWords = [];
        }
        
        const wordsWithDate = this.bulkGeneratedWords.map(word => ({
            ...word,
            dateAdded: new Date().toLocaleDateString()
        }));
        
        window.generator.language.customWords.push(...wordsWithDate);
        
        // Update state
        wordsWithDate.forEach(word => window.appState.addWord(word));
        
        // Update other modules
        if (window.MorphologyModule) {
            window.MorphologyModule.updateAffixDropdowns();
        }
        if (window.VocabularyModule) {
            window.VocabularyModule.updateDisplay();
        }
        
        window.ActivityModule.addActivity(`Added ${this.bulkGeneratedWords.length} bulk generated words`, 'vocabulary');
        showToast(`Added ${this.bulkGeneratedWords.length} words to vocabulary!`, 'success');
        
        // Clear bulk results
        const bulkResults = document.getElementById('bulk-results');
        if (bulkResults) {
            bulkResults.style.display = 'none';
        }
        this.bulkGeneratedWords = [];
        this.selectedBulkWords.clear();
    }
};