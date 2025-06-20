// Grammar Module
window.GrammarModule = {
    init() {
        console.log('GrammarModule initialized');
        this.bindEvents();
        this.setupCheckboxToggling();
        this.populateFormFromLanguageData(); // Populate form with current language data
    },

    bindEvents() {
        // Find and bind the generate button by ID
        const generateBtn = document.getElementById('generate-grammar-btn');
        if (generateBtn) {
            generateBtn.onclick = () => this.generateGrammar();
            console.log('Grammar generate button bound successfully');
        } else {
            console.log('Grammar generate button not found');
        }

        // Bind checkbox change events
        const featureCheckboxes = ['has-cases', 'has-plurals', 'has-tenses', 'has-genders'];
        featureCheckboxes.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.addEventListener('change', () => this.toggleDetailOptions(id));
            }
        });
    },

    populateFormFromLanguageData() {
        // Populate form fields with current language data if it exists
        if (window.generator && window.generator.language) {
            const language = window.generator.language;
            
            // Populate word order
            if (language.syntax && language.syntax.wordOrder) {
                const wordOrderSelect = document.getElementById('word-order');
                if (wordOrderSelect) {
                    wordOrderSelect.value = language.syntax.wordOrder;
                }
            }
            
            // Populate morphological features
            if (language.morphology) {
                const morphology = language.morphology;
                
                // Main feature checkboxes
                const hasCasesCheckbox = document.getElementById('has-cases');
                if (hasCasesCheckbox) {
                    hasCasesCheckbox.checked = morphology.hasCases || false;
                }
                
                const hasPluralsCheckbox = document.getElementById('has-plurals');
                if (hasPluralsCheckbox) {
                    hasPluralsCheckbox.checked = morphology.hasPlurals || false;
                }
                
                const hasTensesCheckbox = document.getElementById('has-tenses');
                if (hasTensesCheckbox) {
                    hasTensesCheckbox.checked = morphology.hasTenses || false;
                }
                
                const hasGendersCheckbox = document.getElementById('has-genders');
                if (hasGendersCheckbox) {
                    hasGendersCheckbox.checked = morphology.hasGenders || false;
                }
                
                // Case system details
                if (morphology.cases && morphology.cases.length > 0) {
                    // First uncheck all case checkboxes
                    const allCases = ['nominative', 'accusative', 'genitive', 'dative', 'locative', 'instrumental'];
                    allCases.forEach(caseName => {
                        const checkbox = document.getElementById(`case-${caseName}`);
                        if (checkbox) {
                            checkbox.checked = false;
                        }
                    });
                    
                    // Then check the ones from the language data
                    morphology.cases.forEach(caseName => {
                        const checkbox = document.getElementById(`case-${caseName}`);
                        if (checkbox) {
                            checkbox.checked = true;
                        }
                    });
                }
                
                // Tense system details
                if (morphology.tenses && morphology.tenses.length > 0) {
                    // First uncheck all tense checkboxes
                    const allTenses = ['past', 'present', 'future', 'perfect', 'imperfect', 'pluperfect'];
                    allTenses.forEach(tenseName => {
                        const checkbox = document.getElementById(`tense-${tenseName}`);
                        if (checkbox) {
                            checkbox.checked = false;
                        }
                    });
                    
                    // Then check the ones from the language data
                    morphology.tenses.forEach(tenseName => {
                        const checkbox = document.getElementById(`tense-${tenseName}`);
                        if (checkbox) {
                            checkbox.checked = true;
                        }
                    });
                }
                
                // Plural system details
                if (morphology.pluralTypes && morphology.pluralTypes.length > 0) {
                    // First uncheck all plural checkboxes
                    const allPluralTypes = ['suffix', 'prefix', 'internal', 'dual'];
                    allPluralTypes.forEach(pluralType => {
                        const checkbox = document.getElementById(`plural-${pluralType}`);
                        if (checkbox) {
                            checkbox.checked = false;
                        }
                    });
                    
                    // Then check the ones from the language data
                    morphology.pluralTypes.forEach(pluralType => {
                        const checkbox = document.getElementById(`plural-${pluralType}`);
                        if (checkbox) {
                            checkbox.checked = true;
                        }
                    });
                }
                
                // Gender system details
                if (morphology.genders && morphology.genders.length > 0) {
                    // First uncheck all gender checkboxes
                    const allGenders = ['masculine', 'feminine', 'neuter', 'animate', 'inanimate'];
                    allGenders.forEach(genderName => {
                        const checkbox = document.getElementById(`gender-${genderName}`);
                        if (checkbox) {
                            checkbox.checked = false;
                        }
                    });
                    
                    // Then check the ones from the language data
                    morphology.genders.forEach(genderName => {
                        const checkbox = document.getElementById(`gender-${genderName}`);
                        if (checkbox) {
                            checkbox.checked = true;
                        }
                    });
                }
            }
        }
        
        // Update the detail sections visibility after populating
        this.setupCheckboxToggling();
        
        // Display grammar results if they exist
        if (window.generator && window.generator.language && window.generator.language.grammarRules && 
            window.generator.language.grammarRules.length > 0) {
            this.displayGrammarRules(window.generator.language.grammarRules);
        }
    },

    setupCheckboxToggling() {
        // Set up initial visibility of detailed options based on checkbox states
        this.toggleDetailOptions('has-cases');
        this.toggleDetailOptions('has-plurals');
        this.toggleDetailOptions('has-tenses');
        this.toggleDetailOptions('has-genders');
    },

    toggleDetailOptions(checkboxId) {
        const checkbox = document.getElementById(checkboxId);
        if (!checkbox) return;

        const detailsId = checkboxId.replace('has-', '') + '-details';
        const detailsSection = document.getElementById(detailsId);
        
        if (detailsSection) {
            if (checkbox.checked) {
                detailsSection.classList.add('show');
                detailsSection.style.display = 'block';
            } else {
                detailsSection.classList.remove('show');
                detailsSection.style.display = 'none';
            }
        }
    },

    getCheckedValues(prefix) {
        const values = [];
        document.querySelectorAll(`[id^="${prefix}"]:checked`).forEach(checkbox => {
            values.push(checkbox.id.replace(prefix, ''));
        });
        return values;
    },

    isChecked(id) {
        const element = document.getElementById(id);
        return element ? element.checked : false;
    },

    generateGrammar() {
        console.log('Generating grammar...');

        // Make sure we have phonology first
        if (!window.generator.language.phonology.vowels || window.generator.language.phonology.vowels.length === 0) {
            showToast('Please generate phonology first!', 'error');
            switchTab('phonology');
            return;
        }

        // Generate morphology and grammar rules
        const morphology = window.generator.generateMorphologySystem();
        const grammarRules = this.generateGrammarRules();
        
        // Display results
        this.displayGrammarRules(grammarRules);
        
        // Add to activity
        if (window.ActivityModule) {
            window.ActivityModule.addActivity('Generated grammar and morphology system', 'grammar');
        }
        
        showToast('Grammar system generated successfully!');
    },

    generateGrammarRules() {
        const rules = [];
        const language = window.generator.language;
        
        // Phonology rules
        if (language.phonology.vowels && language.phonology.consonants) {
            rules.push({
                category: 'Phonology',
                rule: `The language has ${language.phonology.vowels.length} vowels and ${language.phonology.consonants.length} consonants`,
                details: `Vowels: ${language.phonology.vowels.join(', ')}\nConsonants: ${language.phonology.consonants.join(', ')}`
            });
            
            rules.push({
                category: 'Phonology',
                rule: `Allowed syllable structures: ${language.phonology.syllableStructures.join(', ')}`,
                details: 'C = consonant, V = vowel'
            });
        }
        
        // Syntax rules
        if (language.syntax.wordOrder) {
            rules.push({
                category: 'Syntax',
                rule: `Basic word order: ${language.syntax.wordOrder.toUpperCase()}`,
                details: this.getWordOrderExample()
            });
        }
        
        // Morphology rules
        if (language.morphology.hasCases && language.morphology.cases) {
            rules.push({
                category: 'Morphology',
                rule: `Case system with ${language.morphology.cases.length} cases: ${language.morphology.cases.join(', ')}`,
                details: this.getCaseDetails()
            });
        }
        
        if (language.morphology.hasTenses && language.morphology.tenses) {
            rules.push({
                category: 'Morphology',
                rule: `Tense system includes: ${language.morphology.tenses.join(', ')}`,
                details: this.getTenseDetails()
            });
        }
        
        if (language.morphology.hasGenders && language.morphology.genders) {
            rules.push({
                category: 'Morphology',
                rule: `Gender system: ${language.morphology.genders.join(', ')}`,
                details: 'All nouns belong to one of these gender categories'
            });
        }
        
        if (language.morphology.hasPlurals && language.morphology.pluralTypes) {
            rules.push({
                category: 'Morphology',
                rule: `Plural formation: ${language.morphology.pluralTypes.join(', ')}`,
                details: this.getPluralDetails()
            });
        }
        
        // Derivational morphology
        rules.push({
            category: 'Word Formation',
            rule: 'The language has productive derivational morphology',
            details: 'Words can be derived using affixes to change part of speech or meaning'
        });

        // Store rules in language object
        window.generator.language.grammarRules = rules;
        
        return rules;
    },

    displayGrammarRules(rules) {
        const display = document.getElementById('grammar-rules-display');
        const results = document.getElementById('grammar-results');
        
        if (results) {
            results.style.display = 'block';
        }

        if (!display) {
            console.error('Grammar rules display element not found');
            return;
        }
        
        display.innerHTML = rules.map(rule => `
            <div class="grammar-rule">
                <div class="grammar-rule-title">${rule.category}</div>
                <div>${rule.rule}</div>
                ${rule.details ? `<div class="grammar-rule-example">${rule.details}</div>` : ''}
            </div>
        `).join('');
        
        console.log('Grammar rules displayed');
    },

    getWordOrderExample() {
        const language = window.generator.language;
        const subject = this.findWord('person') || 'kela';
        const verb = this.findWord('see') || 'niva';
        const object = this.findWord('tree') || 'taro';
        
        const examples = {
            'svo': `${subject} ${verb} ${object} (person sees tree)`,
            'sov': `${subject} ${object} ${verb} (person tree sees)`,
            'vso': `${verb} ${subject} ${object} (sees person tree)`,
            'vos': `${verb} ${object} ${subject} (sees tree person)`,
            'osv': `${object} ${subject} ${verb} (tree person sees)`,
            'ovs': `${object} ${verb} ${subject} (tree sees person)`,
            'free': `Word order is flexible, meaning determined by case marking`
        };
        
        return examples[language.syntax.wordOrder] || 'Variable word order';
    },

    getCaseDetails() {
        const language = window.generator.language;
        let details = '';
        if (language.morphology.cases) {
            language.morphology.cases.forEach(case_ => {
                const affix = language.morphology.affixes?.[case_];
                if (affix) {
                    details += `${case_}: -${affix.morpheme} (${affix.type})\n`;
                }
            });
        }
        return details.trim();
    },

    getTenseDetails() {
        const language = window.generator.language;
        let details = '';
        if (language.morphology.tenses) {
            language.morphology.tenses.forEach(tense => {
                const affix = language.morphology.affixes?.[tense];
                if (affix) {
                    details += `${tense}: -${affix.morpheme} (${affix.type})\n`;
                }
            });
        }
        return details.trim();
    },

    getPluralDetails() {
        const language = window.generator.language;
        let details = '';
        if (language.morphology.pluralTypes) {
            language.morphology.pluralTypes.forEach(type => {
                const affix = language.morphology.affixes?.[`plural-${type}`];
                if (affix) {
                    details += `${type}: ${affix.morpheme} (${affix.type})\n`;
                }
            });
        }
        return details.trim();
    },

    findWord(meaning) {
        const language = window.generator.language;
        const found = language.vocabulary?.find(w => 
            w.english.toLowerCase().includes(meaning.toLowerCase())
        );
        return found ? found.conlang : null;
    },

    // Utility method to get current grammar data
    getCurrentGrammar() {
        return {
            morphology: window.generator.language.morphology,
            syntax: window.generator.language.syntax,
            grammarRules: window.generator.language.grammarRules
        };
    }
};