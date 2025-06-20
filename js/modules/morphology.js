// Morphology Module - Flexible affix management
window.MorphologyModule = {
    editingAffixName: null,

    init() {
        console.log('MorphologyModule initialized');
        this.bindEvents();
        this.displayMorphology();
        this.updateAffixDropdowns();
    },

    bindEvents() {
        // Bind custom affix form
        const addAffixBtn = document.getElementById('add-custom-affix-btn');
        if (addAffixBtn) {
            addAffixBtn.onclick = () => this.addCustomAffix();
        }

        // Bind affix applicator
        const applyAffixBtn = document.getElementById('apply-affix-btn');
        if (applyAffixBtn) {
            applyAffixBtn.onclick = () => this.applyAffix();
        }

        // Bind add inflected word
        const addInflectedBtn = document.getElementById('add-inflected-btn');
        if (addInflectedBtn) {
            addInflectedBtn.onclick = () => this.addInflectedWord();
        }

        console.log('Morphology events bound');
    },

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
                    // Check if it's in the cases list OR has case category OR was originally a case
                    (window.generator.language.morphology.cases && window.generator.language.morphology.cases.some(c => name === c)) ||
                    affix.category === 'case' ||
                    affix.originalCategory === 'case' ||
                    ['nominative', 'accusative', 'genitive', 'dative', 'locative', 'instrumental', 'ablative'].includes(name.toLowerCase())
                );
                break;
            case 'tense':
                affixes = Object.entries(allAffixes).filter(([name, affix]) => 
                    // Check if it's in the tenses list OR has tense category OR was originally a tense
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
                    // Check if it's in the genders list OR has gender category OR was originally a gender
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
        // FIXED: No automatic examples, and all affixes are deletable
        const isCustom = affix.custom || false;
        
        return `
            <div class="affix-item">
                <div class="affix-info">
                    <div class="affix-name">
                        ${name.charAt(0).toUpperCase() + name.slice(1).replace('-', ' → ')}
                        ${isCustom ? '<span style="background: #ff9800; color: white; padding: 2px 6px; border-radius: 10px; font-size: 0.7em; margin-left: 8px;">CUSTOM</span>' : ''}
                    </div>
                    <div class="affix-details">${affix.type}: -${affix.morpheme}</div>
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
        window.ActivityModule.addActivity(`Added custom affix "${name}"`, 'morphology');
        showToast(`Added custom affix "${name}" successfully!`, 'success');

        // Clear the form
        document.getElementById('custom-affix-name').value = '';
        document.getElementById('custom-affix-morpheme').value = '';
        document.getElementById('custom-affix-type').value = 'suffix';
        document.getElementById('custom-affix-category').value = 'derivational';
        document.getElementById('custom-affix-description').value = '';
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
        
        // Get the original affix
        const originalAffix = window.generator.language.morphology.affixes[this.editingAffixName];
        
        // Determine the original category if not set
        let originalCategory = originalAffix.originalCategory || originalAffix.category;
        if (!originalCategory) {
            // Infer original category from the original name
            if (['nominative', 'accusative', 'genitive', 'dative', 'locative', 'instrumental', 'ablative'].includes(this.editingAffixName.toLowerCase())) {
                originalCategory = 'case';
            } else if (['past', 'present', 'future', 'perfect', 'imperfect', 'pluperfect'].includes(this.editingAffixName.toLowerCase())) {
                originalCategory = 'tense';
            } else if (this.editingAffixName.includes('plural') || this.editingAffixName === 'dual') {
                originalCategory = 'number';
            } else if (['masculine', 'feminine', 'neuter', 'animate', 'inanimate'].includes(this.editingAffixName.toLowerCase())) {
                originalCategory = 'gender';
            } else {
                originalCategory = 'derivational'; // default
            }
        }
        
        // Update the affix with preserved category information
        const updatedAffix = {
            ...originalAffix,
            morpheme: newMorpheme,
            type: newType,
            description: newDescription,
            example: newExample,
            originalCategory: originalCategory, // Preserve original category
            lastModified: new Date().toLocaleDateString()
        };
        
        // If name changed, update the key
        if (newName !== this.editingAffixName) {
            window.generator.language.morphology.affixes[newName] = updatedAffix;
            delete window.generator.language.morphology.affixes[this.editingAffixName];
        } else {
            window.generator.language.morphology.affixes[this.editingAffixName] = updatedAffix;
        }
        
        this.displayMorphology();
        this.closeModal('edit-affix-modal');
        window.ActivityModule.addActivity(`Edited affix "${newName}"`, 'morphology');
        showToast('Affix updated successfully!', 'success');
    },

    // FIXED: Allow deletion of ALL affixes, including auto-generated ones
    deleteAffix(affixName) {
        if (confirm(`Are you sure you want to delete the affix "${affixName}"?\n\nNote: If this is a grammatical affix (case/tense/etc.), your language will use other means (like particles or word order) to express this concept.`)) {
            delete window.generator.language.morphology.affixes[affixName];
            this.displayMorphology();
            window.ActivityModule.addActivity(`Deleted affix "${affixName}"`, 'morphology');
            showToast(`Deleted affix "${affixName}"`, 'success');
        }
    },

    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
        this.editingAffixName = null;
    },

    updateAffixDropdowns() {
        const baseWordSelect = document.getElementById('base-word');
        const affixSelect = document.getElementById('affix-to-apply');
        
        if (baseWordSelect) {
            const allWords = window.appState.getState('allWords') || [];
            baseWordSelect.innerHTML = '<option value="">Select a word...</option>' +
                allWords.map((word, index) => `<option value="${index}">${word.conlang} (${word.english})</option>`).join('');
        }
        
        if (affixSelect && window.generator.language.morphology.affixes) {
            affixSelect.innerHTML = '<option value="">Select an affix...</option>' +
                Object.entries(window.generator.language.morphology.affixes).map(([name, affix]) => 
                    `<option value="${name}">${name.charAt(0).toUpperCase() + name.slice(1).replace('-', ' → ')} (-${affix.morpheme})</option>`
                ).join('');
        }
    },

    applyAffix() {
        const baseWordIndex = document.getElementById('base-word')?.value;
        const affixName = document.getElementById('affix-to-apply')?.value;
        
        if (!baseWordIndex || !affixName) {
            showToast('Please select both a base word and an affix!', 'error');
            return;
        }
        
        const allWords = window.appState.getState('allWords') || [];
        const baseWord = allWords[parseInt(baseWordIndex)];
        const affix = window.generator.language.morphology.affixes[affixName];
        
        if (!baseWord || !affix) {
            showToast('Invalid selection!', 'error');
            return;
        }
        
        const inflectedForm = this.applyAffixToWord(baseWord.conlang, affix);
        const defaultMeaning = this.getInflectionMeaning(affixName, baseWord.english);
        
        // FIXED: Enhanced result display with editable meaning
        document.getElementById('inflected-word').textContent = inflectedForm;
        document.getElementById('inflection-description').innerHTML = `
            <div style="margin-bottom: 15px;">${baseWord.conlang} + ${affix.type} "${affix.morpheme}"</div>
            <div style="display: grid; grid-template-columns: 1fr auto; gap: 15px; align-items: end;">
                <div class="form-group" style="margin-bottom: 0;">
                    <label for="inflected-meaning" style="font-size: 0.9em; color: #666;">Edit meaning:</label>
                    <input type="text" id="inflected-meaning" class="form-control" value="${defaultMeaning}" 
                           placeholder="Enter the actual meaning">
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                    <label for="inflected-pos" style="font-size: 0.9em; color: #666;">Part of speech:</label>
                    <select id="inflected-pos" class="form-control">
                        <option value="noun" ${baseWord.pos === 'noun' ? 'selected' : ''}>Noun</option>
                        <option value="verb" ${baseWord.pos === 'verb' ? 'selected' : ''}>Verb</option>
                        <option value="adjective" ${baseWord.pos === 'adjective' ? 'selected' : ''}>Adjective</option>
                        <option value="adverb" ${baseWord.pos === 'adverb' ? 'selected' : ''}>Adverb</option>
                        <option value="pronoun">Pronoun</option>
                        <option value="preposition">Preposition</option>
                        <option value="conjunction">Conjunction</option>
                    </select>
                </div>
            </div>
        `;
        document.getElementById('affix-result').style.display = 'block';
        
        // Store for potential addition - FIXED: Mark as derived type
        window.currentInflection = {
            conlang: inflectedForm,
            english: defaultMeaning,
            pos: baseWord.pos,
            baseWord: baseWord.conlang,
            affix: affixName,
            derivedFrom: baseWord.conlang,
            derivationType: affixName,
            type: 'derived' // FIXED: Correct type
        };
    },

    applyAffixToWord(word, affix) {
        switch (affix.type) {
            case 'prefix':
                return affix.morpheme + word;
            case 'suffix':
                return word + affix.morpheme;
            case 'infix':
                const mid = Math.floor(word.length / 2);
                return word.slice(0, mid) + affix.morpheme + word.slice(mid);
            default:
                return word + affix.morpheme;
        }
    },

    getInflectionMeaning(affixName, baseMeaning) {
        const meanings = {
            'accusative': `${baseMeaning} (direct object)`,
            'genitive': `${baseMeaning}'s`,
            'dative': `to ${baseMeaning}`,
            'locative': `in/at ${baseMeaning}`,
            'past': `${baseMeaning}ed`,
            'future': `will ${baseMeaning}`,
            'plural-suffix': `${baseMeaning}s`,
            'diminutive': `little ${baseMeaning}`,
            'noun-to-verb': `to use ${baseMeaning}`,
            'verb-to-noun': `${baseMeaning}er`,
            'adj-to-adv': `${baseMeaning}ly`
        };
        return meanings[affixName] || `${baseMeaning} (${affixName})`;
    },

    addInflectedWord() {
        if (!window.currentInflection) {
            showToast('No inflected word to add!', 'error');
            return;
        }
        
        // FIXED: Get the edited meaning and part of speech from the form
        const editedMeaning = document.getElementById('inflected-meaning')?.value.trim();
        const editedPos = document.getElementById('inflected-pos')?.value;
        
        if (!editedMeaning) {
            showToast('Please enter a meaning for the inflected word!', 'error');
            return;
        }
        
        const inflection = {
            ...window.currentInflection,
            english: editedMeaning, // Use edited meaning
            pos: editedPos, // Use edited part of speech
        };
        
        // Check for duplicates
        const allWords = window.appState.getState('allWords') || [];
        const duplicate = allWords.find(w => w.conlang === inflection.conlang);
        if (duplicate) {
            showToast('This inflected form already exists in the dictionary!', 'error');
            return;
        }
        
        // FIXED: Add to derivedWords instead of customWords
        if (!window.generator.language.derivedWords) {
            window.generator.language.derivedWords = [];
        }
        
        const newInflection = {
            ...inflection,
            dateAdded: new Date().toLocaleDateString()
        };
        
        window.generator.language.derivedWords.push(newInflection);
        
        // Update state
        window.appState.addWord(newInflection);
        
        // Update vocabulary module if it exists
        if (window.VocabularyModule) {
            window.VocabularyModule.updateDisplay();
        }
        
        window.ActivityModule.addActivity(`Added derived word "${inflection.conlang}" meaning "${editedMeaning}"`, 'morphology');
        showToast(`Added derived word "${inflection.conlang}" to vocabulary!`, 'success');
        
        // Clear the form
        document.getElementById('affix-result').style.display = 'none';
        window.currentInflection = null;
    }
};