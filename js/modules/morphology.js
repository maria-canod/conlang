// Cleaned Morphology Module - Focus on What Works
window.MorphologyModule = {
    editingAffixName: null,

    init() {
        console.log('Cleaned MorphologyModule initialized');
        this.bindEvents();
        this.displayMorphology();
        this.updateAffixDropdowns();
        this.populateWordDropdowns();
    },

    bindEvents() {
        // Existing affix management events
        const addAffixBtn = document.getElementById('add-custom-affix-btn');
        if (addAffixBtn) {
            addAffixBtn.onclick = () => this.addCustomAffix();
        }

        const applyAffixBtn = document.getElementById('apply-affix-btn');
        if (applyAffixBtn) {
            applyAffixBtn.onclick = () => this.applyAffix();
        }

        const addInflectedBtn = document.getElementById('add-inflected-btn');
        if (addInflectedBtn) {
            addInflectedBtn.onclick = () => this.addInflectedWord();
        }

        // Compound word events (simplified - no AI)
        const generateCompoundBtn = document.getElementById('generate-compound-btn');
        if (generateCompoundBtn) {
            generateCompoundBtn.onclick = () => this.generateCompound();
        }

        const addCompoundBtn = document.getElementById('add-compound-btn');
        if (addCompoundBtn) {
            addCompoundBtn.onclick = () => this.addCompoundToVocabulary();
        }

        console.log('Morphology events bound');
    },

    // Compound word generation (simplified, no AI)
    generateCompound() {
        const word1Select = document.getElementById('compound-word1');
        const word2Select = document.getElementById('compound-word2');
        const meaningInput = document.getElementById('compound-meaning');

        if (!word1Select.value || !word2Select.value) {
            showToast('Please select both words for the compound!', 'error');
            return;
        }

        if (!meaningInput.value.trim()) {
            showToast('Please enter a meaning for the compound!', 'error');
            return;
        }

        const word1 = this.getWordFromVocabulary(word1Select.value);
        const word2 = this.getWordFromVocabulary(word2Select.value);

        if (!word1 || !word2) {
            showToast('Error finding selected words in vocabulary!', 'error');
            return;
        }

        // Generate the compound word using simple combination rules
        const compoundConlang = this.combineWords(word1.conlang, word2.conlang);
        const compoundMeaning = meaningInput.value.trim();

        // Store the current compound for adding to vocabulary
        this.currentCompound = {
            english: compoundMeaning,
            conlang: compoundConlang,
            pos: 'compound',
            components: [word1.english, word2.english],
            componentWords: [word1.conlang, word2.conlang]
        };

        // Display the result
        this.displayCompoundResult(this.currentCompound);
        
        showToast('Compound word generated!', 'success');
    },

    combineWords(word1, word2) {
        // Simple combination rules
        let combined = word1;
        const vowels = 'aeiouAEIOU';
        
        // Remove final vowel from first word if second word starts with vowel
        if (vowels.includes(combined[combined.length - 1]) && vowels.includes(word2[0])) {
            combined = combined.slice(0, -1);
        }
        
        // Add a connecting element if both words end/start with consonants
        const consonants = 'bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ';
        if (consonants.includes(combined[combined.length - 1]) && consonants.includes(word2[0])) {
            // Add a simple vowel connector (could be customized per language)
            combined += 'a';
        }
        
        return combined + word2;
    },

    displayCompoundResult(compound) {
        const previewDiv = document.getElementById('compound-preview');
        const resultDiv = document.getElementById('compound-result');
        const breakdownDiv = document.getElementById('compound-breakdown');
        const meaningDiv = document.getElementById('compound-meaning-display');

        if (!previewDiv || !resultDiv || !breakdownDiv || !meaningDiv) return;

        resultDiv.textContent = compound.conlang;
        breakdownDiv.textContent = `${compound.componentWords[0]} + ${compound.componentWords[1]}`;
        meaningDiv.textContent = `"${compound.english}" (from "${compound.components[0]}" + "${compound.components[1]}")`;

        previewDiv.style.display = 'block';
    },

    addCompoundToVocabulary() {
        if (!this.currentCompound) {
            showToast('No compound word to add!', 'error');
            return;
        }

        // Add to vocabulary through the proper channels
        if (window.VocabularyModule && window.VocabularyModule.addWord) {
            window.VocabularyModule.addWord(this.currentCompound);
        } else if (window.appState) {
            const allWords = window.appState.getState('allWords') || [];
            allWords.push(this.currentCompound);
            window.appState.setState('allWords', allWords);
        }

        // Add to activity log
        if (window.ActivityModule) {
            window.ActivityModule.addActivity(`Created compound word "${this.currentCompound.conlang}"`, 'morphology');
        }

        // Update dropdowns
        this.populateWordDropdowns();

        // Clear the form and hide preview
        document.getElementById('compound-word1').value = '';
        document.getElementById('compound-word2').value = '';
        document.getElementById('compound-meaning').value = '';
        document.getElementById('compound-preview').style.display = 'none';

        showToast(`Added compound word "${this.currentCompound.conlang}" to vocabulary!`, 'success');
        this.currentCompound = null;
    },

    // Helper methods
    getVocabulary() {
        let vocabulary = [];
        
        if (window.appState) {
            const allWords = window.appState.getState('allWords');
            if (allWords && Array.isArray(allWords)) {
                vocabulary = allWords;
            }
        }
        
        if (vocabulary.length === 0 && window.VocabularyModule && window.VocabularyModule.words) {
            vocabulary = window.VocabularyModule.words;
        }
        
        if (vocabulary.length === 0 && window.generator && window.generator.generatedWords) {
            vocabulary = window.generator.generatedWords;
        }

        return vocabulary.map(word => {
            if (typeof word === 'string') {
                return { english: word, conlang: word, pos: 'unknown' };
            }
            return {
                english: word.english || word.word || 'unknown',
                conlang: word.conlang || word.generated || word.english || 'unknown',
                pos: word.pos || word.partOfSpeech || 'unknown'
            };
        });
    },

    getWordFromVocabulary(englishWord) {
        const vocabulary = this.getVocabulary();
        return vocabulary.find(word => word.english === englishWord);
    },

    populateWordDropdowns() {
        const vocabulary = this.getVocabulary();
        
        // Populate compound word dropdowns
        const dropdown1 = document.getElementById('compound-word1');
        const dropdown2 = document.getElementById('compound-word2');
        
        if (dropdown1) {
            dropdown1.innerHTML = '<option value="">Select first word...</option>' +
                vocabulary.map(word => `<option value="${word.english}">${word.english} (${word.conlang})</option>`).join('');
        }
        
        if (dropdown2) {
            dropdown2.innerHTML = '<option value="">Select second word...</option>' +
                vocabulary.map(word => `<option value="${word.english}">${word.english} (${word.conlang})</option>`).join('');
        }
    },

    // Existing affix management functionality
    displayMorphology() {
        const affixDisplay = document.getElementById('affix-display');
        const noAffixes = document.getElementById('no-affixes');
        
        if (!window.generator.language.morphology.affixes || Object.keys(window.generator.language.morphology.affixes).length === 0) {
            if (affixDisplay) affixDisplay.style.display = 'none';
            if (noAffixes) noAffixes.style.display = 'block';
            return;
        }
        
        if (affixDisplay) affixDisplay.style.display = 'block';
        if (noAffixes) noAffixes.style.display = 'none';
        
        // Display different types of affixes
        this.displayAffixCategory('case-affixes', 'case');
        this.displayAffixCategory('tense-affixes', 'tense');
        this.displayAffixCategory('number-affixes', 'number');
        this.displayAffixCategory('gender-affixes', 'gender');
        this.displayAffixCategory('derivational-affixes', 'derivational');
        this.displayAffixCategory('inflectional-affixes', 'inflectional');
        
        this.updateAffixDropdowns();
    },

    displayAffixCategory(containerId, category) {
        const container = document.getElementById(containerId);
        if (!container) return;

        let affixes = [];
        const allAffixes = window.generator.language.morphology.affixes;

        // Filter affixes by category
        switch (category) {
            case 'case':
                affixes = Object.entries(allAffixes).filter(([name, affix]) => 
                    (window.generator.language.morphology.cases && window.generator.language.morphology.cases.some(c => name === c)) ||
                    affix.category === 'case' ||
                    affix.originalCategory === 'case' ||
                    ['nominative', 'accusative', 'genitive', 'dative', 'locative', 'instrumental', 'ablative'].includes(name.toLowerCase())
                );
                break;
            case 'tense':
                affixes = Object.entries(allAffixes).filter(([name, affix]) => 
                    (window.generator.language.morphology.tenses && window.generator.language.morphology.tenses.some(t => name === t)) ||
                    affix.category === 'tense' ||
                    affix.originalCategory === 'tense' ||
                    ['past', 'present', 'future', 'perfect', 'imperfect', 'pluperfect'].includes(name.toLowerCase())
                );
                break;
            case 'number':
                affixes = Object.entries(allAffixes).filter(([name, affix]) => 
                    name.includes('plural') || 
                    name === 'dual' || 
                    name === 'trial' || 
                    affix.category === 'number' ||
                    affix.originalCategory === 'number' ||
                    name.toLowerCase().includes('dual') ||
                    name.toLowerCase().includes('plural')
                );
                break;
            case 'gender':
                affixes = Object.entries(allAffixes).filter(([name, affix]) => 
                    (window.generator.language.morphology.genders && window.generator.language.morphology.genders.some(g => name === g)) ||
                    affix.category === 'gender' ||
                    affix.originalCategory === 'gender' ||
                    ['masculine', 'feminine', 'neuter', 'animate', 'inanimate'].includes(name.toLowerCase())
                );
                break;
            case 'derivational':
                affixes = Object.entries(allAffixes).filter(([name, affix]) => 
                    affix.category === 'derivational' ||
                    affix.originalCategory === 'derivational'
                );
                break;
            case 'inflectional':
                affixes = Object.entries(allAffixes).filter(([name, affix]) => 
                    affix.category === 'inflectional' ||
                    affix.originalCategory === 'inflectional'
                );
                break;
        }

        if (affixes.length > 0) {
            container.innerHTML = affixes.map(([name, affix]) => this.createAffixItem(name, affix, category)).join('');
        } else {
            container.innerHTML = `<p style="color: #999; text-align: center;">No ${category} affixes</p>`;
        }
    },

    createAffixItem(name, affix, category) {
        const isCustom = affix.custom || false;
        
        return `
            <div class="affix-item">
                <div class="affix-info">
                    <div class="affix-name">
                        ${name.charAt(0).toUpperCase() + name.slice(1).replace('-', ' → ')}
                        ${isCustom ? '<span style="background: #ff9800; color: white; padding: 2px 6px; border-radius: 10px; font-size: 0.7em; margin-left: 8px;">CUSTOM</span>' : ''}
                    </div>
                    <div class="affix-details">${affix.type}: ${affix.morpheme}</div>
                    ${affix.description ? `<div style="color: #555; font-size: 0.9em; margin-top: 4px; font-style: italic;">${affix.description}</div>` : ''}
                    ${affix.example ? `<div class="affix-example">${affix.example}</div>` : ''}
                    ${affix.dateAdded ? `<div style="color: #888; font-size: 0.8em; margin-top: 4px;">Added: ${affix.dateAdded}</div>` : ''}
                </div>
                <div class="affix-actions">
                    <button class="btn btn-sm btn-secondary" onclick="MorphologyModule.editAffixDetailed('${name}')" title="Edit affix">✏️ Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="MorphologyModule.deleteAffix('${name}')" title="Delete affix">🗑️ Delete</button>
                </div>
            </div>
        `;
    },

    addCustomAffix() {
        const name = document.getElementById('custom-affix-name')?.value.trim();
        const morpheme = document.getElementById('custom-affix-morpheme')?.value.trim();
        const type = document.getElementById('custom-affix-type')?.value;
        const category = document.getElementById('custom-affix-category')?.value;
        const description = document.getElementById('custom-affix-description')?.value.trim();

        if (!name) {
            showToast('Please enter an affix name!', 'error');
            return;
        }

        if (!morpheme) {
            showToast('Please enter a morpheme!', 'error');
            return;
        }

        if (!description) {
            showToast('Please enter a description!', 'error');
            return;
        }

        // Check for duplicates
        if (window.generator.language.morphology.affixes && window.generator.language.morphology.affixes[name]) {
            showToast('An affix with that name already exists!', 'error');
            return;
        }

        // Initialize affixes if needed
        if (!window.generator.language.morphology.affixes) {
            window.generator.language.morphology.affixes = {};
        }

        // Add the new affix
        window.generator.language.morphology.affixes[name] = {
            type: type,
            morpheme: morpheme,
            category: category,
            description: description,
            custom: true,
            dateAdded: new Date().toLocaleDateString()
        };

        // Update displays
        this.displayMorphology();
        if (window.ActivityModule) {
            window.ActivityModule.addActivity(`Added custom affix "${name}"`, 'morphology');
        }
        showToast(`Added custom affix "${name}" successfully!`, 'success');

        // Clear the form
        document.getElementById('custom-affix-name').value = '';
        document.getElementById('custom-affix-morpheme').value = '';
        document.getElementById('custom-affix-type').value = 'suffix';
        document.getElementById('custom-affix-category').value = 'derivational';
        document.getElementById('custom-affix-description').value = '';
    },

    updateAffixDropdowns() {
        const affixSelect = document.getElementById('affix-to-apply');
        const baseWordSelect = document.getElementById('base-word');
        
        if (affixSelect) {
            const affixes = window.generator.language.morphology.affixes || {};
            affixSelect.innerHTML = '<option value="">Select an affix...</option>' +
                Object.entries(affixes).map(([name, affix]) => 
                    `<option value="${name}">${name} (${affix.type}: ${affix.morpheme})</option>`
                ).join('');
        }
        
        if (baseWordSelect) {
            const vocabulary = this.getVocabulary();
            baseWordSelect.innerHTML = '<option value="">Select a word...</option>' +
                vocabulary.map(word => `<option value="${word.english}">${word.english} (${word.conlang})</option>`).join('');
        }

        // Also update compound word dropdowns
        this.populateWordDropdowns();
    },

    applyAffix() {
        const baseWordSelect = document.getElementById('base-word');
        const affixSelect = document.getElementById('affix-to-apply');
        
        if (!baseWordSelect.value || !affixSelect.value) {
            showToast('Please select both a base word and an affix!', 'error');
            return;
        }

        const baseWord = this.getWordFromVocabulary(baseWordSelect.value);
        const affixName = affixSelect.value;
        const affix = window.generator.language.morphology.affixes[affixName];

        if (!baseWord || !affix) {
            showToast('Error finding selected word or affix!', 'error');
            return;
        }

        const result = this.applyAffixToWord(baseWord, affix, affixName);
        this.displayAffixResult(result);
    },

    applyAffixToWord(word, affix, affixName) {
        let newWord = word.conlang;
        let newMeaning = word.english;

        // Apply the affix
        if (affix.type === 'prefix') {
            newWord = affix.morpheme + newWord;
        } else if (affix.type === 'suffix') {
            newWord = newWord + affix.morpheme;
        } else if (affix.type === 'infix') {
            // Simple infix insertion (middle of word)
            const middle = Math.floor(newWord.length / 2);
            newWord = newWord.slice(0, middle) + affix.morpheme + newWord.slice(middle);
        }

        // Generate meaning based on affix function
        newMeaning = this.generateDerivativeMeaning(word.english, affix, affixName);

        return {
            conlang: newWord,
            english: newMeaning,
            pos: this.determineNewPOS(word.pos, affix),
            derivationType: affixName,
            affix: affix.morpheme,
            baseWord: word.english
        };
    },

    generateDerivativeMeaning(baseWord, affix, affixName) {
        const meaningPatterns = {
            'agentive': `one who ${baseWord}s`,
            'causative': `to cause to ${baseWord}`,
            'instrumental': `tool for ${baseWord}ing`,
            'resultative': `result of ${baseWord}ing`,
            'diminutive': `small ${baseWord}`,
            'augmentative': `big ${baseWord}`,
            'past': `${baseWord}ed`,
            'future': `will ${baseWord}`,
            'plural': `multiple ${baseWord}s`,
            'comparative': `more ${baseWord}`,
            'superlative': `most ${baseWord}`,
            'accusative': `${baseWord} (direct object)`,
            'genitive': `${baseWord}'s`,
            'dative': `to ${baseWord}`,
            'locative': `in/at ${baseWord}`
        };

        // Check if affix name or description matches a pattern
        for (const [pattern, template] of Object.entries(meaningPatterns)) {
            if (affixName.toLowerCase().includes(pattern) || 
                affix.description?.toLowerCase().includes(pattern)) {
                return template;
            }
        }

        // Default pattern
        return `${baseWord} (${affixName})`;
    },

    determineNewPOS(originalPOS, affix) {
        const posChanges = {
            'agentive': 'noun',
            'instrumental': 'noun',
            'resultative': 'noun',
            'causative': 'verb',
            'adjectival': 'adjective',
            'adverbial': 'adverb'
        };

        for (const [type, newPOS] of Object.entries(posChanges)) {
            if (affix.category?.includes(type) || 
                affix.description?.toLowerCase().includes(type)) {
                return newPOS;
            }
        }

        return originalPOS; // Keep original if unsure
    },

    displayAffixResult(result) {
        const resultDiv = document.getElementById('affix-result');
        const wordDiv = document.getElementById('inflected-word');
        const descDiv = document.getElementById('inflection-description');

        if (!resultDiv || !wordDiv || !descDiv) return;

        wordDiv.textContent = result.conlang;
        descDiv.textContent = `"${result.english}" (${result.baseWord} + ${result.affix})`;

        this.currentInflection = result;
        resultDiv.style.display = 'block';
    },

    addInflectedWord() {
        if (!this.currentInflection) {
            showToast('No inflected word to add!', 'error');
            return;
        }

        // Add to vocabulary through the proper channels
        if (window.VocabularyModule && window.VocabularyModule.addWord) {
            window.VocabularyModule.addWord(this.currentInflection);
        } else if (window.appState) {
            const allWords = window.appState.getState('allWords') || [];
            allWords.push(this.currentInflection);
            window.appState.setState('allWords', allWords);
        }

        // Add to activity log
        if (window.ActivityModule) {
            window.ActivityModule.addActivity(`Added inflected word "${this.currentInflection.conlang}"`, 'morphology');
        }

        showToast(`Added "${this.currentInflection.conlang}" to vocabulary!`, 'success');
        
        // Clear the result
        document.getElementById('affix-result').style.display = 'none';
        this.currentInflection = null;

        // Update dropdowns to include the new word
        this.updateAffixDropdowns();
    },

    editAffixDetailed(affixName) {
        const affix = window.generator.language.morphology.affixes[affixName];
        if (!affix) return;
        
        this.editingAffixName = affixName;
        document.getElementById('edit-affix-name-field').value = affixName;
        document.getElementById('edit-affix-morpheme-field').value = affix.morpheme;
        document.getElementById('edit-affix-type-field').value = affix.type;
        document.getElementById('edit-affix-description-field').value = affix.description || '';
        document.getElementById('edit-affix-example-field').value = affix.example || '';
        
        document.getElementById('edit-affix-modal').style.display = 'block';
    },

    saveAffixEdit() {
        if (!this.editingAffixName) return;
        
        const newName = document.getElementById('edit-affix-name-field').value.trim();
        const newMorpheme = document.getElementById('edit-affix-morpheme-field').value.trim();
        const newType = document.getElementById('edit-affix-type-field').value;
        const newDescription = document.getElementById('edit-affix-description-field').value.trim();
        const newExample = document.getElementById('edit-affix-example-field').value.trim();
        
        if (!newMorpheme) {
            showToast('Please enter a morpheme!', 'error');
            return;
        }

        const affixes = window.generator.language.morphology.affixes;
        const oldAffix = affixes[this.editingAffixName];
        
        // If name changed, create new entry and delete old
        if (newName !== this.editingAffixName) {
            if (affixes[newName]) {
                showToast('An affix with that name already exists!', 'error');
                return;
            }
            delete affixes[this.editingAffixName];
        }
        
        // Update the affix
        affixes[newName] = {
            ...oldAffix,
            morpheme: newMorpheme,
            type: newType,
            description: newDescription,
            example: newExample
        };

        this.displayMorphology();
        document.getElementById('edit-affix-modal').style.display = 'none';
        this.editingAffixName = null;
        
        showToast(`Updated affix "${newName}"!`, 'success');
    },

    deleteAffix(affixName) {
        if (confirm(`Are you sure you want to delete the affix "${affixName}"?`)) {
            delete window.generator.language.morphology.affixes[affixName];
            this.displayMorphology();
            this.updateAffixDropdowns();
            if (window.ActivityModule) {
                window.ActivityModule.addActivity(`Deleted affix "${affixName}"`, 'morphology');
            }
            showToast(`Deleted affix "${affixName}"`, 'success');
        }
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (window.MorphologyModule) window.MorphologyModule.init();
    });
} else {
    if (window.MorphologyModule) window.MorphologyModule.init();
}