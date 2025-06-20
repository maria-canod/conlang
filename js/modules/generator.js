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
        const templates = {
            family: [
                { english: 'mother', pos: 'noun' },
                { english: 'father', pos: 'noun' },
                { english: 'brother', pos: 'noun' },
                { english: 'sister', pos: 'noun' },
                { english: 'child', pos: 'noun' },
                { english: 'parent', pos: 'noun' },
                { english: 'family', pos: 'noun' },
                { english: 'uncle', pos: 'noun' },
                { english: 'aunt', pos: 'noun' },
                { english: 'grandmother', pos: 'noun' },
                { english: 'grandfather', pos: 'noun' },
                { english: 'cousin', pos: 'noun' }
            ],
            emotions: [
                { english: 'happy', pos: 'adjective' },
                { english: 'sad', pos: 'adjective' },
                { english: 'angry', pos: 'adjective' },
                { english: 'peaceful', pos: 'adjective' },
                { english: 'excited', pos: 'adjective' },
                { english: 'afraid', pos: 'adjective' },
                { english: 'surprised', pos: 'adjective' },
                { english: 'tired', pos: 'adjective' },
                { english: 'calm', pos: 'adjective' },
                { english: 'stressed', pos: 'adjective' },
                { english: 'worried', pos: 'adjective' },
                { english: 'proud', pos: 'adjective' },
                { english: 'to smile', pos: 'verb' },
                { english: 'to cry', pos: 'verb' },
                { english: 'shy', pos: 'adjective' }
            ],
            colors: [
                { english: 'red', pos: 'adjective' },
                { english: 'blue', pos: 'adjective' },
                { english: 'green', pos: 'adjective' },
                { english: 'yellow', pos: 'adjective' },
                { english: 'purple', pos: 'adjective' },
                { english: 'orange', pos: 'adjective' },
                { english: 'black', pos: 'adjective' },
                { english: 'pink', pos: 'adjective' },
                { english: 'brown', pos: 'adjective' },
                { english: 'white', pos: 'adjective' }
            ],
            animals: [
                { english: 'dog', pos: 'noun' },
                { english: 'cat', pos: 'noun' },
                { english: 'bird', pos: 'noun' },
                { english: 'rabbit', pos: 'noun' },
                { english: 'chicken', pos: 'noun' },
                { english: 'fish', pos: 'noun' },
                { english: 'horse', pos: 'noun' },
                { english: 'cow', pos: 'noun' },
                { english: 'donkey', pos: 'noun' },
                { english: 'goat', pos: 'noun' },
                { english: 'snake', pos: 'noun' },
                { english: 'fur', pos: 'noun' },
                { english: 'feather', pos: 'noun' },
                { english: 'egg', pos: 'noun' },
                { english: 'worm', pos: 'noun' },
                { english: 'insect', pos: 'noun' },
                { english: 'frog', pos: 'noun' },
                { english: 'bear', pos: 'noun' },
                { english: 'wolf', pos: 'noun' },
                { english: 'deer', pos: 'noun' },
                { english: 'eagle', pos: 'noun' },
                { english: 'fox', pos: 'noun' },
                { english: 'mouse', pos: 'noun' },
                { english: 'sheep', pos: 'noun' }
            ],
            nature: [
                { english: 'mountain', pos: 'noun' },
                { english: 'river', pos: 'noun' },
                { english: 'sea', pos: 'noun' },
                { english: 'lake', pos: 'noun' },
                { english: 'forest', pos: 'noun' },
                { english: 'plant', pos: 'noun' },
                { english: 'flower', pos: 'noun' },
                { english: 'wind', pos: 'noun' },
                { english: 'rain', pos: 'noun' },
                { english: 'snow', pos: 'noun' },
                { english: 'cloud', pos: 'noun' }
            ],
            actions: [
                { english: 'to sing', pos: 'verb' },
                { english: 'to dance', pos: 'verb' },
                { english: 'to jump', pos: 'verb' },
                { english: 'to swim', pos: 'verb' },
                { english: 'to build', pos: 'verb' },
                { english: 'to walk', pos: 'verb' },
                { english: 'to fly', pos: 'verb' }
            ]
        };

        const selectedTemplates = [];
        Object.keys(templates).forEach(template => {
            const checkbox = document.getElementById(`template-${template}`);
            if (checkbox && checkbox.checked) {
                selectedTemplates.push(...templates[template]);
            }
        });

        if (selectedTemplates.length === 0) {
            showToast('Please select at least one template category!', 'error');
            return;
        }

        if (!window.generator.language.phonology.syllables || window.generator.language.phonology.syllables.length === 0) {
            showToast('Please generate phonology first!', 'error');
            switchTab('phonology');
            return;
        }

        // Filter out words that already exist in the dictionary
        const allWords = window.appState.getState('allWords') || [];
        const existingMeanings = new Set(allWords.map(w => w.english.toLowerCase()));
        const newTemplateWords = selectedTemplates.filter(word => !existingMeanings.has(word.english.toLowerCase()));

        if (newTemplateWords.length === 0) {
            showToast('All selected template words already exist in your dictionary!', 'error');
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