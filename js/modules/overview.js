// Overview Module - Complete and Fixed with proper random generation
window.OverviewModule = {
    init() {
        console.log('OverviewModule initialized');
        this.bindEvents();
        this.updateOverview();
    },

    bindEvents() {
        const generateCompleteBtn = document.getElementById('generate-complete-btn');
        if (generateCompleteBtn) {
            generateCompleteBtn.onclick = () => this.generateCompleteLanguage();
        }
        console.log('Overview events bound');
    },

    generateOrthographyForLanguage(phonology) {
        const orthographyMap = {};
        
        // Smart romanization rules for quick start
        const vowelMappings = {
            'a': 'a', 'e': 'e', 'i': 'i', 'o': 'o', 'u': 'u',
            'ə': 'ë', 'ɛ': 'è', 'ɔ': 'ò', 'ɪ': 'ì', 'ʊ': 'ù',
            'ʌ': 'ú', 'æ': 'ä', 'ø': 'ö', 'œ': 'ő', 'y': 'ü',
            'ɨ': 'î', 'ɯ': 'û', 'ɤ': 'ô', 'ɐ': 'á', 'ɑ': 'â',
            'ɒ': 'å', 'ã': 'ã', 'ẽ': 'ẽ', 'ĩ': 'ĩ', 'õ': 'õ', 'ũ': 'ũ'
        };
        
        const consonantMappings = {
            'p': 'p', 't': 't', 'k': 'k', 'q': 'q', 'b': 'b', 'd': 'd', 'g': 'g',
            'm': 'm', 'n': 'n', 'l': 'l', 'r': 'r', 'f': 'f', 'v': 'v', 
            's': 's', 'z': 'z', 'h': 'h', 'w': 'w', 'j': 'y',
            'ŋ': 'ng', 'ɲ': 'ñ', 'ɳ': 'ņ', 'ʃ': 'sh', 'ʒ': 'zh', 
            'θ': 'th', 'ð': 'dh', 'χ': 'x', 'ɣ': 'ġ', 'x': 'kh',
            'ħ': 'ḥ', 'ʕ': 'ʿ', 'ɸ': 'φ', 'β': 'β', 'ʂ': 'ş', 'ʐ': 'ẑ',
            'ɕ': 'ś', 'ʑ': 'ź', 'ç': 'ç', 'ʝ': 'ĵ', 'ʔ': "'", 'ɖ': 'ḍ',
            'ʈ': 'ṭ', 'ɟ': 'ǰ', 'ɡ': 'g', 'ɢ': 'G', 'ʡ': 'ʔ',
            'tʃ': 'ch', 'dʒ': 'j', 'ts': 'c', 'dz': 'ċ', 'ɾ': 'r̄',
            'ɻ': 'ř', 'ʀ': 'R', 'ʁ': 'ṟ', 'ɭ': 'ḷ', 'ʎ': 'ľ',
            'ɬ': 'ł', 'ɮ': 'ƚ', 'pʼ': "p'", 'tʼ': "t'", 'kʼ': "k'"
        };
        
        // Track used symbols to prevent duplicates
        const usedSymbols = new Set();
        
        // Map vowels
        if (phonology.vowels) {
            phonology.vowels.forEach(vowel => {
                let orthoSymbol = vowelMappings[vowel] || vowel;
                
                // Resolve conflicts
                if (usedSymbols.has(orthoSymbol)) {
                    orthoSymbol = orthoSymbol + '̂'; // Add circumflex
                    if (usedSymbols.has(orthoSymbol)) {
                        orthoSymbol = orthoSymbol.replace('̂', '́'); // Try acute
                    }
                }
                
                orthographyMap[vowel] = orthoSymbol;
                usedSymbols.add(orthoSymbol);
            });
        }
        
        // Map consonants
        if (phonology.consonants) {
            phonology.consonants.forEach(consonant => {
                let orthoSymbol = consonantMappings[consonant] || consonant;
                
                // Resolve conflicts
                if (usedSymbols.has(orthoSymbol)) {
                    if (orthoSymbol.length === 1) {
                        orthoSymbol = orthoSymbol + 'h';
                        if (usedSymbols.has(orthoSymbol)) {
                            orthoSymbol = orthoSymbol.replace('h', 'w');
                        }
                    } else {
                        orthoSymbol = orthoSymbol + 'x';
                    }
                }
                
                orthographyMap[consonant] = orthoSymbol;
                usedSymbols.add(orthoSymbol);
            });
        }
        
        return orthographyMap;
    },

    generateCompleteLanguage() {
        console.log('Starting complete random language generation...');
        
        const progressBar = document.getElementById('generation-progress');
        const progressFill = document.getElementById('progress-fill');
        const generateBtn = document.getElementById('generate-complete-btn');
        
        try {
            if (generateBtn) {
                generateBtn.disabled = true;
                generateBtn.innerHTML = '<div class="loading"></div> Generating...';
            }
            
            if (progressBar) progressBar.style.display = 'block';
            if (progressFill) progressFill.style.width = '20%';
            
            // Don't clear existing language data - let generateCompleteLanguage decide what to keep
            
            if (progressFill) progressFill.style.width = '50%';
            
            // Generate the completely random language
            window.generator.generateCompleteLanguage();
            console.log('Random language generated successfully');

            // AUTO-GENERATE ORTHOGRAPHY FOR QUICK START
            setTimeout(() => {
                console.log('Auto-generating orthography for quick start language...');
                
                // Only generate orthography if we have phonology
                if (window.generator.language.phonology && 
                    window.generator.language.phonology.vowels && 
                    window.generator.language.phonology.consonants) {
                    
                    // Generate unique orthography mapping
                    const orthographyMap = this.generateOrthographyForLanguage(window.generator.language.phonology);
                    
                    // Set it in the PhonologyModule
                    if (window.PhonologyModule) {
                        window.PhonologyModule.orthographyMap = orthographyMap;
                        
                        // Show orthography section if it exists
                        const orthographySection = document.getElementById('orthography-section');
                        if (orthographySection) {
                            orthographySection.style.display = 'block';
                        }
                        
                        // Update the phonology display
                        window.PhonologyModule.displayPhonology(window.generator.language.phonology);
                    }
                    
                    const uniqueCount = new Set(Object.values(orthographyMap)).size;
                    const totalCount = Object.keys(orthographyMap).length;
                    
                    console.log(`Quick start orthography generated: ${totalCount} sounds → ${uniqueCount} unique symbols`);
                    showToast(`Orthography generated! ${totalCount} sounds mapped to unique symbols`, 'info');
                } else {
                    console.log('No phonology available for orthography generation');
                }
            }, 1000); // Short delay to let generation complete
            
            if (progressFill) progressFill.style.width = '80%';
            
            // Update state
            if (window.appState) {
                window.appState.updateLanguageData();
            }
            
            // Update displays
            this.updateOverview();
            
            if (window.VocabularyModule) {
                window.VocabularyModule.updateDisplay();
            }
            if (window.MorphologyModule) {
                window.MorphologyModule.displayMorphology();
            }
            
            window.ActivityModule.addActivity('Generated complete random language', 'complete');
            
            if (progressFill) progressFill.style.width = '100%';
            
            // Show summary of what was generated
            const summary = this.getGenerationSummary();
            console.log('Generated language summary:', summary);
            
            // Finish
            setTimeout(() => {
                if (progressBar) progressBar.style.display = 'none';
                if (generateBtn) {
                    generateBtn.disabled = false;
                    generateBtn.innerHTML = '✨ Generate Complete Language';
                }
                showToast(`Complete random language generated! ${summary}`, 'success');
            }, 500);
            
        } catch (error) {
            console.error('Generation error:', error);
            if (progressBar) progressBar.style.display = 'none';
            if (generateBtn) {
                generateBtn.disabled = false;
                generateBtn.innerHTML = '✨ Generate Complete Language';
            }
            showToast('Generation failed. Please try again.', 'error');
        }
    },

    getGenerationSummary() {
        const lang = window.generator.language;
        const vowelCount = lang.phonology.vowels ? lang.phonology.vowels.length : 0;
        const consonantCount = lang.phonology.consonants ? lang.phonology.consonants.length : 0;
        const wordOrder = lang.syntax.wordOrder ? lang.syntax.wordOrder.toUpperCase() : 'Unknown';
        const environment = lang.culture.environment || 'Unknown';
        const caseCount = lang.morphology.cases ? lang.morphology.cases.length : 0;
        const tenseCount = lang.morphology.tenses ? lang.morphology.tenses.length : 0;
        
        return `${vowelCount}V/${consonantCount}C, ${wordOrder} order, ${environment} culture, ${caseCount} cases, ${tenseCount} tenses`;
    },

    updateOverview() {
        this.updateLanguageStats();
        this.updatePhonologyOverview();
        this.updateGrammarOverview();
        this.updateMorphologyOverview();
        this.updateVocabularyOverview();
        this.checkCompleteness();
    },

    updateLanguageStats() {
        const stats = window.appState ? window.appState.getWordStats() : { total: 0, core: 0, derived: 0, custom: 0 };
        
        const elements = {
            'overview-total-words': stats.total,
            'overview-core-words': stats.core,
            'overview-derived-words': stats.derived,
            'overview-custom-words': stats.custom
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });

        const statsSection = document.getElementById('overview-stats-section');
        if (statsSection) {
            statsSection.style.display = stats.total > 0 ? 'block' : 'none';
        }

        const phonologyCount = window.generator.language.phonology.vowels ? 
            window.generator.language.phonology.vowels.length + window.generator.language.phonology.consonants.length : 0;
        
        const affixCount = window.generator.language.morphology.affixes ? 
            Object.keys(window.generator.language.morphology.affixes).length : 0;
        
        const grammarRuleCount = window.generator.language.grammarRules ? 
            window.generator.language.grammarRules.length : 0;

        const additionalElements = {
            'overview-phonemes': phonologyCount,
            'overview-affixes': affixCount,
            'overview-grammar-rules': grammarRuleCount
        };
        
        Object.entries(additionalElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    },

    updatePhonologyOverview() {
        const phonologySection = document.getElementById('overview-phonology-section');
        if (!phonologySection) return;

        const phonology = window.generator.language.phonology;
        
        if (!phonology.vowels || phonology.vowels.length === 0) {
            phonologySection.style.display = 'none';
            return;
        }

        phonologySection.style.display = 'block';
        const phonologyContent = document.getElementById('overview-phonology-content');
        if (phonologyContent) {
            phonologyContent.innerHTML = `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div>
                        <strong>Vowels (${phonology.vowels.length}):</strong>
                        <div class="phoneme-display">
                            ${phonology.vowels.map(v => `<span class="phoneme">${v}</span>`).join('')}
                        </div>
                    </div>
                    <div>
                        <strong>Consonants (${phonology.consonants.length}):</strong>
                        <div class="phoneme-display">
                            ${phonology.consonants.map(c => `<span class="phoneme">${c}</span>`).join('')}
                        </div>
                    </div>
                </div>
                <div style="margin-top: 15px;">
                    <strong>Syllable Structures:</strong> ${phonology.syllableStructures.join(', ')}
                </div>
                <div style="margin-top: 10px;">
                    <strong>Cultural Environment:</strong> ${window.generator.language.culture.environment || 'Not set'}
                </div>
            `;
        }
    },

    updateGrammarOverview() {
        const grammarSection = document.getElementById('overview-grammar-section');
        if (!grammarSection) return;

        const grammarRules = window.generator.language.grammarRules;
        
        if (!grammarRules || grammarRules.length === 0) {
            grammarSection.style.display = 'none';
            return;
        }

        grammarSection.style.display = 'block';
        const grammarContent = document.getElementById('overview-grammar-content');
        if (grammarContent) {
            grammarContent.innerHTML = grammarRules.slice(0, 5).map(rule => `
                <div class="grammar-rule">
                    <div class="grammar-rule-title">${rule.category}</div>
                    <div>${rule.rule}</div>
                    ${rule.details ? `<div class="grammar-rule-example">${rule.details}</div>` : ''}
                </div>
            `).join('');
            
            if (grammarRules.length > 5) {
                grammarContent.innerHTML += `<p style="text-align: center; color: #666; margin-top: 15px;">And ${grammarRules.length - 5} more rules...</p>`;
            }
        }
    },

    updateMorphologyOverview() {
        const morphologySection = document.getElementById('overview-morphology-section');
        if (!morphologySection) return;

        const morphology = window.generator.language.morphology;
        
        if (!morphology.affixes || Object.keys(morphology.affixes).length === 0) {
            morphologySection.style.display = 'none';
            return;
        }

        morphologySection.style.display = 'block';
        const morphologyContent = document.getElementById('overview-morphology-content');
        if (morphologyContent) {
            const features = [];
            
            if (morphology.cases && morphology.cases.length > 0) {
                features.push(`<div><strong>Cases:</strong> ${morphology.cases.join(', ')}</div>`);
            }
            if (morphology.tenses && morphology.tenses.length > 0) {
                features.push(`<div><strong>Tenses:</strong> ${morphology.tenses.join(', ')}</div>`);
            }
            if (morphology.genders && morphology.genders.length > 0) {
                features.push(`<div><strong>Genders:</strong> ${morphology.genders.join(', ')}</div>`);
            }
            if (morphology.pluralTypes && morphology.pluralTypes.length > 0) {
                features.push(`<div><strong>Plural types:</strong> ${morphology.pluralTypes.join(', ')}</div>`);
            }
            
            morphologyContent.innerHTML = `
                <div style="background: white; padding: 15px; border-radius: 8px;">
                    ${features.join('')}
                    <div style="margin-top: 10px;"><strong>Total Affixes:</strong> ${Object.keys(morphology.affixes).length}</div>
                    <div style="margin-top: 5px;"><strong>Word Order:</strong> ${window.generator.language.syntax.wordOrder ? window.generator.language.syntax.wordOrder.toUpperCase() : 'Not set'}</div>
                </div>
            `;
        }
    },

    updateVocabularyOverview() {
        const vocabularySection = document.getElementById('overview-vocabulary-section');
        if (!vocabularySection) return;

        const allWords = window.appState ? window.appState.getState('allWords') || [] : [];
        
        if (allWords.length === 0) {
            vocabularySection.style.display = 'none';
            return;
        }

        vocabularySection.style.display = 'block';
        const vocabularyContent = document.getElementById('overview-vocabulary-content');
        if (vocabularyContent) {
            vocabularyContent.innerHTML = `
                <div class="word-grid">
                    ${allWords.slice(0, 12).map(word => `
                        <div class="word-card">
                            <div class="word-conlang">${word.conlang}</div>
                            <div class="word-english">${word.english}</div>
                            <div class="word-pos">${word.pos}</div>
                            ${word.derivedFrom ? `<div class="word-derived">← ${word.derivedFrom}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
                ${allWords.length > 12 ? `<p style="text-align: center; color: #666; margin-top: 15px;">And ${allWords.length - 12} more words...</p>` : ''}
            `;
        }
    },

    checkCompleteness() {
        const completenessSection = document.getElementById('completeness-check');
        if (!completenessSection) return;

        const checks = [
            {
                name: 'Phonology',
                complete: window.generator.language.phonology.vowels && window.generator.language.phonology.vowels.length > 0,
                description: 'Sound system with vowels and consonants'
            },
            {
                name: 'Grammar',
                complete: window.generator.language.grammarRules && window.generator.language.grammarRules.length > 0,
                description: 'Grammar rules and morphological system'
            },
            {
                name: 'Vocabulary',
                complete: window.appState ? (window.appState.getState('allWords') || []).length > 0 : false,
                description: 'Words and dictionary entries'
            },
            {
                name: 'Morphology',
                complete: window.generator.language.morphology.affixes && Object.keys(window.generator.language.morphology.affixes).length > 0,
                description: 'Affixes and word formation rules'
            }
        ];

        const completedCount = checks.filter(check => check.complete).length;
        const completionPercentage = Math.round((completedCount / checks.length) * 100);

        completenessSection.innerHTML = `
            <div style="margin-bottom: 20px;">
                <h4 style="color: #4CAF50;">Language Completeness: ${completionPercentage}%</h4>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${completionPercentage}%;"></div>
                </div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                ${checks.map(check => `
                    <div style="padding: 15px; background: ${check.complete ? '#e8f5e8' : '#fff3cd'}; border-radius: 8px; border-left: 4px solid ${check.complete ? '#4CAF50' : '#ffc107'};">
                        <div style="display: flex; align-items: center; margin-bottom: 5px;">
                            <span style="font-size: 1.2em; margin-right: 8px;">${check.complete ? '✅' : '⚠️'}</span>
                            <strong>${check.name}</strong>
                        </div>
                        <div style="font-size: 0.9em; color: #666;">${check.description}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }
};