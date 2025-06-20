// Corpus Module - Bilingual Corpus and Grammar Analysis
window.CorpusModule = {
    sentencePairs: [],
    filteredSentences: [],
    editingIndex: -1,
    currentAnalysis: null,
    currentSuggestion: null,

    init() {
        console.log('CorpusModule initialized');
        this.bindEvents();
        this.loadSentencePairs();
        this.updateDisplay();
    },

    bindEvents() {
        // Add sentence pair
        const addPairBtn = document.getElementById('add-sentence-pair-btn');
        if (addPairBtn) {
            addPairBtn.onclick = () => this.addSentencePair();
        }

        // Grammar analysis
        const analyzeBtn = document.getElementById('analyze-grammar-btn');
        if (analyzeBtn) {
            analyzeBtn.onclick = () => this.analyzeGrammar();
        }

        // Translation assistant
        const translateBtn = document.getElementById('get-translation-btn');
        if (translateBtn) {
            translateBtn.onclick = () => this.suggestTranslation();
        }

        // Add suggested pair
        const addSuggestedBtn = document.getElementById('add-suggested-pair-btn');
        if (addSuggestedBtn) {
            addSuggestedBtn.onclick = () => this.addSuggestedPair();
        }

        // Sample text generator
        const generateSampleBtn = document.getElementById('generate-sample-btn');
        if (generateSampleBtn) {
            generateSampleBtn.onclick = () => this.generateSampleText();
        }

        // Search functionality
        const searchInput = document.getElementById('corpus-search');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.searchSentences());
        }

        console.log('Corpus events bound');
    },

    loadSentencePairs() {
        // Load from language data if it exists
        if (window.generator && window.generator.language && window.generator.language.corpus) {
            this.sentencePairs = window.generator.language.corpus;
        } else {
            this.sentencePairs = [];
            // Initialize corpus in language data
            if (window.generator && window.generator.language) {
                window.generator.language.corpus = this.sentencePairs;
            }
        }
        this.filteredSentences = [...this.sentencePairs];
    },

    addSentencePair() {
        const englishSentence = document.getElementById('english-sentence')?.value.trim();
        const conlangSentence = document.getElementById('conlang-sentence')?.value.trim();
        const category = document.getElementById('sentence-category')?.value || 'general';
        const notes = document.getElementById('sentence-notes')?.value.trim();

        if (!englishSentence) {
            showToast('Please enter an English sentence!', 'error');
            return;
        }

        if (!conlangSentence) {
            showToast('Please enter a conlang translation!', 'error');
            return;
        }

        const newPair = {
            id: Date.now(),
            english: englishSentence,
            conlang: conlangSentence,
            category: category,
            notes: notes,
            dateAdded: new Date().toLocaleDateString(),
            wordCount: englishSentence.split(/\s+/).length,
            conlangWordCount: conlangSentence.split(/\s+/).length
        };

        this.sentencePairs.push(newPair);
        this.filteredSentences = [...this.sentencePairs];
        
        // Save to language data
        if (window.generator && window.generator.language) {
            window.generator.language.corpus = this.sentencePairs;
        }

        this.updateDisplay();
        this.updateAnalysisDropdown();
        
        if (window.ActivityModule) {
            window.ActivityModule.addActivity(`Added sentence pair: "${englishSentence.substring(0, 30)}..."`, 'corpus');
        }
        
        showToast('Sentence pair added successfully!', 'success');
        
        // Clear form
        document.getElementById('english-sentence').value = '';
        document.getElementById('conlang-sentence').value = '';
        document.getElementById('sentence-category').value = 'general';
        document.getElementById('sentence-notes').value = '';
    },

    updateDisplay() {
        this.updateStatistics();
        this.updateSentencePairsDisplay();
    },

    updateStatistics() {
        const stats = this.calculateStatistics();
        
        const totalSentencesEl = document.getElementById('total-sentences');
        const totalWordsEl = document.getElementById('total-words');
        const avgLengthEl = document.getElementById('avg-length');
        const categoriesUsedEl = document.getElementById('categories-used');
        
        if (totalSentencesEl) totalSentencesEl.textContent = stats.totalSentences;
        if (totalWordsEl) totalWordsEl.textContent = stats.totalWords;
        if (avgLengthEl) avgLengthEl.textContent = stats.avgLength;
        if (categoriesUsedEl) categoriesUsedEl.textContent = stats.categoriesUsed;
        
        const statsSection = document.getElementById('corpus-stats');
        if (statsSection) {
            statsSection.style.display = stats.totalSentences > 0 ? 'grid' : 'none';
        }
    },

    calculateStatistics() {
        const totalSentences = this.sentencePairs.length;
        const totalWords = this.sentencePairs.reduce((sum, pair) => sum + pair.wordCount, 0);
        const avgLength = totalSentences > 0 ? Math.round(totalWords / totalSentences) : 0;
        const categories = new Set(this.sentencePairs.map(pair => pair.category));
        
        return {
            totalSentences,
            totalWords,
            avgLength,
            categoriesUsed: categories.size
        };
    },

    updateSentencePairsDisplay() {
        const container = document.getElementById('sentence-pairs-container');
        if (!container) return;
        
        if (this.filteredSentences.length === 0) {
            if (this.sentencePairs.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">No sentence pairs yet. Add your first translation above!</p>';
            } else {
                container.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">No sentences match your search or filter criteria.</p>';
            }
            return;
        }

        container.innerHTML = this.filteredSentences.map((pair, index) => this.createSentencePairCard(pair, index)).join('');
    },

    createSentencePairCard(pair, index) {
        const globalIndex = this.sentencePairs.findIndex(p => p.id === pair.id);
        
        return `
            <div class="sentence-pair-card" onclick="CorpusModule.showSentenceDetails(${pair.id})">
                <div class="sentence-meta">
                    <span class="sentence-category">${pair.category}</span>
                    <div class="sentence-actions">
                        <button class="edit-btn" onclick="event.stopPropagation(); CorpusModule.editSentencePair(${globalIndex})" title="Edit sentence pair">✏️</button>
                        <button class="delete-btn" onclick="event.stopPropagation(); CorpusModule.deleteSentencePair(${globalIndex})" title="Delete sentence pair">🗑️</button>
                    </div>
                </div>
                <div class="sentence-english">
                    <strong>🇺🇸 English:</strong> ${pair.english}
                </div>
                <div class="sentence-conlang">
                    <strong>🌍 Conlang:</strong> <span style="color: var(--accent-primary); font-weight: 600;">${pair.conlang}</span>
                </div>
                <div class="sentence-info">
                    <span style="color: #666; font-size: 0.8rem;">
                        ${pair.wordCount} words • Added ${pair.dateAdded}
                        ${pair.notes ? ` • ${pair.notes}` : ''}
                    </span>
                </div>
            </div>
        `;
    },

    showSentenceDetails(pairId) {
        const pair = this.sentencePairs.find(p => p.id === pairId);
        if (!pair) return;

        let details = `English: ${pair.english}\n`;
        details += `Conlang: ${pair.conlang}\n`;
        details += `Category: ${pair.category}\n`;
        details += `Word Count: ${pair.wordCount} (EN) / ${pair.conlangWordCount} (Conlang)\n`;
        if (pair.notes) details += `Notes: ${pair.notes}\n`;
        details += `Added: ${pair.dateAdded}`;

        alert(details);
    },

    editSentencePair(index) {
        if (index < 0 || index >= this.sentencePairs.length) return;
        
        this.editingIndex = index;
        const pair = this.sentencePairs[index];
        
        document.getElementById('edit-english-sentence').value = pair.english;
        document.getElementById('edit-conlang-sentence').value = pair.conlang;
        document.getElementById('edit-sentence-category').value = pair.category;
        document.getElementById('edit-sentence-notes').value = pair.notes || '';
        
        document.getElementById('edit-sentence-modal').style.display = 'block';
    },

    saveSentenceEdit() {
        if (this.editingIndex < 0) return;
        
        const newEnglish = document.getElementById('edit-english-sentence').value.trim();
        const newConlang = document.getElementById('edit-conlang-sentence').value.trim();
        const newCategory = document.getElementById('edit-sentence-category').value;
        const newNotes = document.getElementById('edit-sentence-notes').value.trim();
        
        if (!newEnglish || !newConlang) {
            showToast('Please fill in both English and conlang sentences!', 'error');
            return;
        }
        
        // Update the sentence pair
        this.sentencePairs[this.editingIndex].english = newEnglish;
        this.sentencePairs[this.editingIndex].conlang = newConlang;
        this.sentencePairs[this.editingIndex].category = newCategory;
        this.sentencePairs[this.editingIndex].notes = newNotes;
        this.sentencePairs[this.editingIndex].wordCount = newEnglish.split(/\s+/).length;
        this.sentencePairs[this.editingIndex].conlangWordCount = newConlang.split(/\s+/).length;
        this.sentencePairs[this.editingIndex].lastModified = new Date().toLocaleDateString();
        
        // Update language data
        if (window.generator && window.generator.language) {
            window.generator.language.corpus = this.sentencePairs;
        }
        
        // Refresh displays
        this.filteredSentences = [...this.sentencePairs];
        this.updateDisplay();
        this.updateAnalysisDropdown();
        
        this.closeModal();
        if (window.ActivityModule) {
            window.ActivityModule.addActivity('Edited sentence pair', 'corpus');
        }
        showToast('Sentence pair updated successfully!', 'success');
    },

    deleteSentencePair(index) {
        if (index < 0 || index >= this.sentencePairs.length) return;
        
        const pair = this.sentencePairs[index];
        if (confirm(`Are you sure you want to delete this sentence pair?\n\n"${pair.english}"`)) {
            this.sentencePairs.splice(index, 1);
            this.filteredSentences = [...this.sentencePairs];
            
            // Update language data
            if (window.generator && window.generator.language) {
                window.generator.language.corpus = this.sentencePairs;
            }
            
            this.updateDisplay();
            this.updateAnalysisDropdown();
            
            if (window.ActivityModule) {
                window.ActivityModule.addActivity('Deleted sentence pair', 'corpus');
            }
            showToast('Sentence pair deleted', 'success');
        }
    },

    closeModal() {
        document.getElementById('edit-sentence-modal').style.display = 'none';
        this.editingIndex = -1;
    },

    searchSentences() {
        const query = document.getElementById('corpus-search')?.value.toLowerCase() || '';
        
        if (!query) {
            this.filteredSentences = [...this.sentencePairs];
        } else {
            this.filteredSentences = this.sentencePairs.filter(pair => 
                pair.english.toLowerCase().includes(query) ||
                pair.conlang.toLowerCase().includes(query) ||
                pair.category.toLowerCase().includes(query) ||
                (pair.notes && pair.notes.toLowerCase().includes(query))
            );
        }
        
        this.updateSentencePairsDisplay();
    },

    filterByCategory(category) {
        // Update active button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');

        if (category === 'all') {
            this.filteredSentences = [...this.sentencePairs];
        } else {
            this.filteredSentences = this.sentencePairs.filter(pair => pair.category === category);
        }
        
        this.updateSentencePairsDisplay();
    },

    updateAnalysisDropdown() {
        const dropdown = document.getElementById('analyze-sentence');
        if (!dropdown) return;
        
        dropdown.innerHTML = '<option value="">Choose a sentence pair...</option>' +
            this.sentencePairs.map((pair, index) => 
                `<option value="${index}">${pair.english.substring(0, 50)}${pair.english.length > 50 ? '...' : ''}</option>`
            ).join('');
    },

    analyzeGrammar() {
        const selectedIndex = document.getElementById('analyze-sentence')?.value;
        
        if (!selectedIndex || selectedIndex === '') {
            showToast('Please select a sentence pair to analyze!', 'error');
            return;
        }
        
        const pair = this.sentencePairs[parseInt(selectedIndex)];
        if (!pair) {
            showToast('Invalid sentence selection!', 'error');
            return;
        }
        
        this.performGrammarAnalysis(pair);
    },

    performGrammarAnalysis(pair) {
        const analysis = {
            englishWords: pair.english.split(/\s+/),
            conlangWords: pair.conlang.split(/\s+/),
            wordAlignment: this.performWordAlignment(pair.english, pair.conlang),
            morphologicalAnalysis: this.analyzeMorphology(pair.conlang),
            grammarPatterns: this.identifyGrammarPatterns(pair),
            complexity: this.calculateComplexity(pair)
        };
        
        this.displayGrammarAnalysis(analysis, pair);
        this.currentAnalysis = analysis;
        
        if (window.ActivityModule) {
            window.ActivityModule.addActivity(`Analyzed grammar: "${pair.english.substring(0, 30)}..."`, 'corpus');
        }
        showToast('Grammar analysis completed!', 'success');
    },

    performWordAlignment(english, conlang) {
        const englishWords = english.split(/\s+/);
        const conlangWords = conlang.split(/\s+/);
        const allWords = window.appState ? (window.appState.getState('allWords') || []) : [];
        
        const alignment = [];
        
        // Simple alignment based on vocabulary matches
        englishWords.forEach((engWord, engIndex) => {
            const cleanEngWord = engWord.toLowerCase().replace(/[.,!?]/g, '');
            
            // Find corresponding conlang word in dictionary
            const vocabMatch = allWords.find(word => 
                word.english.toLowerCase() === cleanEngWord
            );
            
            if (vocabMatch) {
                // Find this word in the conlang sentence
                const conlangIndex = conlangWords.findIndex((conWord, index) => 
                    conWord.toLowerCase().includes(vocabMatch.conlang.toLowerCase()) ||
                    vocabMatch.conlang.toLowerCase().includes(conWord.toLowerCase())
                );
                
                if (conlangIndex !== -1) {
                    alignment.push({
                        english: engWord,
                        conlang: conlangWords[conlangIndex],
                        confidence: 'high',
                        vocabEntry: vocabMatch
                    });
                } else {
                    alignment.push({
                        english: engWord,
                        conlang: '?',
                        confidence: 'none',
                        vocabEntry: vocabMatch
                    });
                }
            } else {
                alignment.push({
                    english: engWord,
                    conlang: '?',
                    confidence: 'none',
                    vocabEntry: null
                });
            }
        });
        
        return alignment;
    },

    analyzeMorphology(conlangSentence) {
        const words = conlangSentence.split(/\s+/);
        const allWords = window.appState ? (window.appState.getState('allWords') || []) : [];
        const affixes = window.generator?.language?.morphology?.affixes || {};
        
        return words.map(word => {
            const cleanWord = word.toLowerCase().replace(/[.,!?]/g, '');
            
            // Check if it's a known vocabulary word
            const vocabMatch = allWords.find(vw => vw.conlang.toLowerCase() === cleanWord);
            
            if (vocabMatch) {
                return {
                    word: word,
                    analysis: 'root',
                    breakdown: [{ part: vocabMatch.conlang, type: 'root', meaning: vocabMatch.english }],
                    pos: vocabMatch.pos
                };
            }
            
            // Try to identify affixes
            const breakdown = this.breakdownWord(cleanWord, affixes, allWords);
            
            return {
                word: word,
                analysis: breakdown.length > 1 ? 'complex' : 'unknown',
                breakdown: breakdown,
                pos: 'unknown'
            };
        });
    },

    breakdownWord(word, affixes, vocabulary) {
        // Simple affix detection - this could be much more sophisticated
        const breakdown = [];
        let remaining = word;
        
        // Check for prefixes
        Object.entries(affixes).forEach(([name, affix]) => {
            if (affix.type === 'prefix' && remaining.startsWith(affix.morpheme)) {
                breakdown.push({
                    part: affix.morpheme,
                    type: 'prefix',
                    meaning: name,
                    description: affix.description || ''
                });
                remaining = remaining.substring(affix.morpheme.length);
            }
        });
        
        // Check for suffixes (working backwards)
        Object.entries(affixes).forEach(([name, affix]) => {
            if (affix.type === 'suffix' && remaining.endsWith(affix.morpheme)) {
                const suffixBreakdown = {
                    part: affix.morpheme,
                    type: 'suffix',
                    meaning: name,
                    description: affix.description || ''
                };
                remaining = remaining.substring(0, remaining.length - affix.morpheme.length);
                breakdown.push(suffixBreakdown);
            }
        });
        
        // Check if remaining part is a known root
        if (remaining) {
            const rootMatch = vocabulary.find(vw => vw.conlang.toLowerCase() === remaining);
            if (rootMatch) {
                breakdown.splice(-1, 0, {
                    part: remaining,
                    type: 'root',
                    meaning: rootMatch.english
                });
            } else {
                breakdown.splice(-1, 0, {
                    part: remaining,
                    type: 'unknown',
                    meaning: '?'
                });
            }
        }
        
        return breakdown.length > 0 ? breakdown : [{
            part: word,
            type: 'unknown',
            meaning: '?'
        }];
    },

    identifyGrammarPatterns(pair) {
        const patterns = [];
        const wordOrder = window.generator?.language?.syntax?.wordOrder || 'unknown';
        
        // Word order analysis
        patterns.push({
            type: 'Word Order',
            pattern: wordOrder.toUpperCase(),
            description: `This sentence follows ${wordOrder.toUpperCase()} word order`,
            confidence: 'medium'
        });
        
        // Case system analysis
        const morphology = window.generator?.language?.morphology;
        if (morphology?.hasCases && morphology.cases) {
            patterns.push({
                type: 'Case System',
                pattern: `${morphology.cases.length} cases`,
                description: `Uses cases: ${morphology.cases.join(', ')}`,
                confidence: 'high'
            });
        }
        
        // Tense analysis
        if (morphology?.hasTenses && morphology.tenses) {
            patterns.push({
                type: 'Tense System',
                pattern: `${morphology.tenses.length} tenses`,
                description: `Available tenses: ${morphology.tenses.join(', ')}`,
                confidence: 'high'
            });
        }
        
        // Sentence type detection
        if (pair.english.includes('?')) {
            patterns.push({
                type: 'Sentence Type',
                pattern: 'Interrogative',
                description: 'This is a question sentence',
                confidence: 'high'
            });
        } else if (pair.english.includes('!')) {
            patterns.push({
                type: 'Sentence Type',
                pattern: 'Exclamatory',
                description: 'This is an exclamatory sentence',
                confidence: 'high'
            });
        } else {
            patterns.push({
                type: 'Sentence Type',
                pattern: 'Declarative',
                description: 'This is a declarative sentence',
                confidence: 'high'
            });
        }
        
        return patterns;
    },

    calculateComplexity(pair) {
        const englishWords = pair.english.split(/\s+/).length;
        const conlangWords = pair.conlang.split(/\s+/).length;
        const wordRatio = conlangWords / englishWords;
        
        let complexity = 'Simple';
        if (englishWords > 10 || wordRatio > 1.5) {
            complexity = 'Complex';
        } else if (englishWords > 6 || wordRatio > 1.2) {
            complexity = 'Moderate';
        }
        
        return {
            level: complexity,
            englishWords: englishWords,
            conlangWords: conlangWords,
            wordRatio: Math.round(wordRatio * 100) / 100,
            score: Math.round(((englishWords / 20) + (wordRatio / 2)) * 50)
        };
    },

    displayGrammarAnalysis(analysis, pair) {
        const resultDiv = document.getElementById('grammar-analysis-result');
        const contentDiv = document.getElementById('analysis-content');
        
        if (!resultDiv || !contentDiv) return;
        
        let html = `
            <div style="margin-bottom: 20px; padding: 15px; background: white; border-radius: 8px;">
                <strong>📝 Analyzed Sentence:</strong><br>
                <div style="margin: 10px 0;">
                    <strong>English:</strong> ${pair.english}<br>
                    <strong>Conlang:</strong> <span style="color: var(--accent-primary);">${pair.conlang}</span>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr; gap: 15px;">
                <div style="background: white; padding: 15px; border-radius: 8px;">
                    <h5 style="color: var(--accent-primary); margin-bottom: 10px;">🔗 Word Alignment</h5>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; font-size: 0.9em;">
                        <strong>English</strong>
                        <strong>Conlang</strong>
                        <strong>Confidence</strong>
                        ${analysis.wordAlignment.map(align => `
                            <div>${align.english}</div>
                            <div style="color: var(--accent-primary); font-weight: 600;">${align.conlang}</div>
                            <div style="color: ${align.confidence === 'high' ? '#4CAF50' : align.confidence === 'medium' ? '#ff9800' : '#f44336'};">
                                ${align.confidence}
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div style="background: white; padding: 15px; border-radius: 8px;">
                    <h5 style="color: var(--accent-primary); margin-bottom: 10px;">🔧 Morphological Analysis</h5>
                    ${analysis.morphologicalAnalysis.map(wordAnalysis => `
                        <div style="margin-bottom: 10px; padding: 10px; background: #f8f9fa; border-radius: 5px;">
                            <strong>${wordAnalysis.word}</strong> (${wordAnalysis.analysis})
                            <div style="margin-top: 5px; font-size: 0.9em;">
                                ${wordAnalysis.breakdown.map(part => `
                                    <span style="background: var(--accent-primary); color: white; padding: 2px 6px; border-radius: 3px; margin: 2px; display: inline-block; font-size: 0.8em;">
                                        ${part.part} <em>(${part.type}${part.meaning !== '?' ? ': ' + part.meaning : ''})</em>
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div style="background: white; padding: 15px; border-radius: 8px;">
                    <h5 style="color: var(--accent-primary); margin-bottom: 10px;">📊 Grammar Patterns</h5>
                    ${analysis.grammarPatterns.map(pattern => `
                        <div style="margin-bottom: 8px; padding: 8px; background: #f8f9fa; border-radius: 5px;">
                            <strong>${pattern.type}:</strong> ${pattern.pattern}
                            <br><small style="color: #666;">${pattern.description} (${pattern.confidence} confidence)</small>
                        </div>
                    `).join('')}
                </div>
                
                <div style="background: white; padding: 15px; border-radius: 8px;">
                    <h5 style="color: var(--accent-primary); margin-bottom: 10px;">📈 Complexity Analysis</h5>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px;">
                        <div style="text-align: center; padding: 10px; background: #f8f9fa; border-radius: 5px;">
                            <div style="font-size: 1.2em; font-weight: bold; color: var(--accent-primary);">${analysis.complexity.level}</div>
                            <div style="font-size: 0.8em; color: #666;">Complexity</div>
                        </div>
                        <div style="text-align: center; padding: 10px; background: #f8f9fa; border-radius: 5px;">
                            <div style="font-size: 1.2em; font-weight: bold; color: var(--accent-primary);">${analysis.complexity.englishWords}</div>
                            <div style="font-size: 0.8em; color: #666;">EN Words</div>
                        </div>
                        <div style="text-align: center; padding: 10px; background: #f8f9fa; border-radius: 5px;">
                            <div style="font-size: 1.2em; font-weight: bold; color: var(--accent-primary);">${analysis.complexity.conlangWords}</div>
                            <div style="font-size: 0.8em; color: #666;">CL Words</div>
                        </div>
                        <div style="text-align: center; padding: 10px; background: #f8f9fa; border-radius: 5px;">
                            <div style="font-size: 1.2em; font-weight: bold; color: var(--accent-primary);">${analysis.complexity.wordRatio}</div>
                            <div style="font-size: 0.8em; color: #666;">Word Ratio</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        contentDiv.innerHTML = html;
        resultDiv.style.display = 'block';
    },

    suggestTranslation() {
        console.log('Translation button clicked!'); // Debug log
        
        const inputText = document.getElementById('translate-input')?.value.trim();
        
        if (!inputText) {
            showToast('Please enter an English sentence to translate!', 'error');
            return;
        }
        
        try {
            // Use improved translation with error handling
            const translationData = this.createImprovedTranslation(inputText);
            this.displaySimpleTranslation(translationData);
            
            this.currentSuggestion = {
                original: inputText,
                suggestion: translationData.translation,
                confidence: translationData.confidence
            };
            
            if (window.ActivityModule) {
                window.ActivityModule.addActivity(`Generated translation suggestion`, 'corpus');
            }
            showToast('Translation suggestion generated!', 'success');
            
        } catch (error) {
            console.error('Translation error:', error);
            showToast('Error generating translation. Using basic method.', 'warning');
            
            // Fallback to simple translation
            const simpleTranslation = this.translateSentence(inputText);
            this.displaySimpleTranslation({
                translation: simpleTranslation,
                confidence: 50,
                note: 'Basic word-for-word translation'
            });
            
            this.currentSuggestion = {
                original: inputText,
                suggestion: simpleTranslation,
                confidence: 50
            };
        }
    },

intelligentTranslate(englishText) {
    const allWords = window.appState.getState('allWords') || [];
    const morphology = window.generator?.language?.morphology || {};
    const syntax = window.generator?.language?.syntax || {};
    
    // Parse the English sentence
    const parsedSentence = this.parseEnglishSentence(englishText);
    
    // Translate individual words
    const wordTranslations = this.translateWords(parsedSentence.words, allWords);
    
    // Apply morphological rules
    const inflectedWords = this.applyMorphology(wordTranslations, parsedSentence, morphology);
    
    // Apply word order rules
    const orderedWords = this.applyWordOrder(inflectedWords, parsedSentence, syntax);
    
    // Generate the final translation
    const translation = orderedWords.filter(w => w.translated).map(w => w.translated).join(' ');
    
    return {
        translation: translation,
        originalWords: parsedSentence.words,
        wordTranslations: wordTranslations,
        inflectedWords: inflectedWords,
        orderedWords: orderedWords,
        missingWords: wordTranslations.filter(w => !w.found),
        appliedRules: this.getAppliedRules(parsedSentence, morphology, syntax),
        confidence: this.calculateTranslationConfidence(wordTranslations)
    };
},

parseEnglishSentence(text) {
    // Basic sentence parsing
    const cleanText = text.toLowerCase().replace(/[.,!?";]/g, '');
    const words = cleanText.split(/\s+/).filter(word => word.length > 0);
    
    // Detect sentence type
    let sentenceType = 'statement';
    if (text.includes('?')) sentenceType = 'question';
    else if (text.includes('!')) sentenceType = 'exclamation';
    
    // Basic grammatical analysis
    const analysis = {
        words: words,
        sentenceType: sentenceType,
        tense: this.detectTense(text),
        hasNegation: text.toLowerCase().includes('not') || text.toLowerCase().includes("n't"),
        isPlural: this.detectPlural(words)
    };
    
    return analysis;
},

detectTense(text) {
    const lowerText = text.toLowerCase();
    
    // Past tense indicators
    if (lowerText.includes('was') || lowerText.includes('were') || 
        lowerText.includes('had') || lowerText.includes('did') ||
        /\w+ed\b/.test(lowerText)) {
        return 'past';
    }
    
    // Future tense indicators
    if (lowerText.includes('will') || lowerText.includes('shall') || 
        lowerText.includes('going to')) {
        return 'future';
    }
    
    // Present tense (default)
    return 'present';
},

detectPlural(words) {
    // Simple plural detection
    return words.some(word => 
        word.endsWith('s') && !['is', 'was', 'has', 'this', 'us'].includes(word)
    );
},

translateWords(words, vocabulary) {
    return words.map(word => {
        // Skip function words that might not have direct translations
        const functionWords = ['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being'];
        
        if (functionWords.includes(word)) {
            return {
                english: word,
                translated: '',
                found: true,
                type: 'function',
                skip: true
            };
        }
        
        // Look for exact match
        let vocabMatch = vocabulary.find(v => v.english.toLowerCase() === word);
        
        // Try partial matches for inflected forms
        if (!vocabMatch) {
            vocabMatch = vocabulary.find(v => 
                word.includes(v.english.toLowerCase()) || 
                v.english.toLowerCase().includes(word)
            );
        }
        
        if (vocabMatch) {
            return {
                english: word,
                translated: vocabMatch.conlang,
                found: true,
                pos: vocabMatch.pos || 'unknown',
                vocabEntry: vocabMatch
            };
        } else {
            return {
                english: word,
                translated: `[${word}]`, // Mark as missing
                found: false,
                pos: 'unknown'
            };
        }
    });
},

applyMorphology(wordTranslations, parsedSentence, morphology) {
    if (!morphology.affixes) return wordTranslations;
    
    return wordTranslations.map(wordData => {
        if (wordData.skip || !wordData.found) return wordData;
        
        let inflectedWord = wordData.translated;
        const appliedAffixes = [];
        
        // Apply tense affixes to verbs
        if (wordData.pos === 'verb' && morphology.hasTenses && morphology.tenses) {
            const tenseAffix = this.getTenseAffix(parsedSentence.tense, morphology);
            if (tenseAffix) {
                inflectedWord = this.applyAffix(inflectedWord, tenseAffix);
                appliedAffixes.push(`${parsedSentence.tense} tense`);
            }
        }
        
        // Apply number affixes to nouns
        if (wordData.pos === 'noun' && parsedSentence.isPlural && morphology.hasPlurals) {
            const pluralAffix = this.getPluralAffix(morphology);
            if (pluralAffix) {
                inflectedWord = this.applyAffix(inflectedWord, pluralAffix);
                appliedAffixes.push('plural');
            }
        }
        
        // Apply case affixes (simplified - would need more complex analysis)
        if (wordData.pos === 'noun' && morphology.hasCases && morphology.cases) {
            // For now, just apply nominative (subject) case as default
            const caseAffix = this.getCaseAffix('nominative', morphology);
            if (caseAffix) {
                inflectedWord = this.applyAffix(inflectedWord, caseAffix);
                appliedAffixes.push('nominative case');
            }
        }
        
        return {
            ...wordData,
            translated: inflectedWord,
            appliedAffixes: appliedAffixes
        };
    });
},

getTenseAffix(tense, morphology) {
    if (!morphology.affixes || !morphology.tenses?.includes(tense)) return null;
    return morphology.affixes[tense] || null;
},

getPluralAffix(morphology) {
    if (!morphology.affixes) return null;
    // Look for plural affix
    return morphology.affixes['plural'] || morphology.affixes['plural-suffix'] || null;
},

getCaseAffix(caseName, morphology) {
    if (!morphology.affixes || !morphology.cases?.includes(caseName)) return null;
    return morphology.affixes[caseName] || null;
},

applyAffix(word, affix) {
    if (!affix || !affix.morpheme) return word;
    
    switch (affix.type) {
        case 'prefix':
            return affix.morpheme + word;
        case 'suffix':
            return word + affix.morpheme;
        case 'infix':
            // Simple infix - insert in middle
            const middle = Math.floor(word.length / 2);
            return word.slice(0, middle) + affix.morpheme + word.slice(middle);
        default:
            return word + affix.morpheme; // Default to suffix
    }
},

applyWordOrder(wordTranslations, parsedSentence, syntax) {
    const wordOrder = syntax.wordOrder || 'svo';
    
    // Simple word order application
    const contentWords = wordTranslations.filter(w => !w.skip && w.found);
    
    if (contentWords.length < 2) return wordTranslations;
    
    // Identify basic sentence components
    let subject = null, verb = null, object = null, others = [];
    
    contentWords.forEach(word => {
        if (word.pos === 'verb' && !verb) {
            verb = word;
        } else if (word.pos === 'noun' && !subject) {
            subject = word;
        } else if (word.pos === 'noun' && !object && verb) {
            object = word;
        } else {
            others.push(word);
        }
    });
    
    // Apply word order
    let orderedWords = [];
    
    switch (wordOrder.toLowerCase()) {
        case 'svo': // Subject-Verb-Object
            if (subject) orderedWords.push(subject);
            if (verb) orderedWords.push(verb);
            if (object) orderedWords.push(object);
            orderedWords.push(...others);
            break;
        case 'sov': // Subject-Object-Verb
            if (subject) orderedWords.push(subject);
            if (object) orderedWords.push(object);
            if (verb) orderedWords.push(verb);
            orderedWords.push(...others);
            break;
        case 'vso': // Verb-Subject-Object
            if (verb) orderedWords.push(verb);
            if (subject) orderedWords.push(subject);
            if (object) orderedWords.push(object);
            orderedWords.push(...others);
            break;
        case 'vos': // Verb-Object-Subject
            if (verb) orderedWords.push(verb);
            if (object) orderedWords.push(object);
            if (subject) orderedWords.push(subject);
            orderedWords.push(...others);
            break;
        case 'osv': // Object-Subject-Verb
            if (object) orderedWords.push(object);
            if (subject) orderedWords.push(subject);
            if (verb) orderedWords.push(verb);
            orderedWords.push(...others);
            break;
        case 'ovs': // Object-Verb-Subject
            if (object) orderedWords.push(object);
            if (verb) orderedWords.push(verb);
            if (subject) orderedWords.push(subject);
            orderedWords.push(...others);
            break;
        default: // Default to SVO
            if (subject) orderedWords.push(subject);
            if (verb) orderedWords.push(verb);
            if (object) orderedWords.push(object);
            orderedWords.push(...others);
    }
    
    return orderedWords.length > 0 ? orderedWords : contentWords;
},

getAppliedRules(parsedSentence, morphology, syntax) {
    const rules = [];
    
    if (syntax.wordOrder) {
        rules.push(`Word order: ${syntax.wordOrder.toUpperCase()}`);
    }
    
    if (morphology.hasTenses && parsedSentence.tense !== 'present') {
        rules.push(`Tense marking: ${parsedSentence.tense}`);
    }
    
    if (morphology.hasPlurals && parsedSentence.isPlural) {
        rules.push('Plural marking');
    }
    
    if (morphology.hasCases) {
        rules.push('Case marking (basic)');
    }
    
    return rules;
},

calculateTranslationConfidence(wordTranslations) {
    const totalWords = wordTranslations.filter(w => !w.skip).length;
    const foundWords = wordTranslations.filter(w => w.found && !w.skip).length;
    
    if (totalWords === 0) return 0;
    return Math.round((foundWords / totalWords) * 100);
},

displayTranslationSuggestion(translationData) {
    const contentDiv = document.getElementById('translation-content');
    const resultDiv = document.getElementById('translation-result');
    
    if (!contentDiv || !resultDiv) return;
    
    let content = `
        <div class="translation-suggestion">
            <div class="translation-result-box">
                <h5>🌐 Suggested Translation:</h5>
                <div class="generated-word" style="font-size: 1.2em; margin: 10px 0; color: #28a745;">
                    ${translationData.translation}
                </div>
                <div style="color: #666; font-size: 0.9em;">
                    Confidence: ${translationData.confidence}% 
                    ${translationData.confidence > 80 ? '✅' : translationData.confidence > 50 ? '⚠️' : '❌'}
                </div>
            </div>
    `;
    
    // Show applied grammar rules
    if (translationData.appliedRules.length > 0) {
        content += `
            <div style="margin: 15px 0;">
                <h6>📏 Applied Grammar Rules:</h6>
                <ul style="margin: 5px 0; padding-left: 20px;">
                    ${translationData.appliedRules.map(rule => `<li>${rule}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    // Show word-by-word breakdown
    if (translationData.orderedWords.length > 0) {
        content += `
            <div style="margin: 15px 0;">
                <h6>🔍 Word-by-Word Breakdown:</h6>
                <div style="display: grid; gap: 8px; margin: 10px 0;">
                    ${translationData.orderedWords.map(word => `
                        <div style="display: flex; justify-content: space-between; padding: 5px; background: #f8f9fa; border-radius: 4px; font-size: 0.9em;">
                            <span><strong>${word.english}</strong></span>
                            <span>→</span>
                            <span style="color: #28a745;">${word.translated}</span>
                            ${word.appliedAffixes?.length ? `<span style="color: #666; font-size: 0.8em;">(${word.appliedAffixes.join(', ')})</span>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // Show missing words
    if (translationData.missingWords.length > 0) {
        content += `
            <div style="margin: 15px 0; padding: 10px; background: #fff3cd; border-radius: 4px; border-left: 4px solid #ffc107;">
                <h6 style="color: #856404;">⚠️ Missing Vocabulary:</h6>
                <p style="color: #856404; margin: 5px 0; font-size: 0.9em;">
                    Add these words to improve translation quality:
                </p>
                <div style="display: flex; flex-wrap: wrap; gap: 5px; margin: 10px 0;">
                    ${translationData.missingWords.map(word => `
                        <span style="background: #ffc107; color: #212529; padding: 2px 8px; border-radius: 12px; font-size: 0.8em;">
                            ${word.english}
                        </span>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    content += '</div>';
    contentDiv.innerHTML = content;
    resultDiv.style.display = 'block';
},

    generateTranslationSuggestion(englishText) {
        const words = englishText.toLowerCase().replace(/[.,!?]/g, '').split(/\s+/);
        const allWords = window.appState ? (window.appState.getState('allWords') || []) : [];
        const wordOrder = window.generator?.language?.syntax?.wordOrder || 'svo';
        
        // Simple word-by-word translation
        const translatedWords = words.map(word => {
            const match = allWords.find(vw => vw.english.toLowerCase() === word);
            return match ? match.conlang : `[${word}]`;
        });
        
        // Apply basic word order transformation
        let reorderedWords = [...translatedWords];
        if (wordOrder === 'sov' && translatedWords.length >= 3) {
            // Simple SOV reordering: move verb to end
            const verbIndex = this.findVerbIndex(words, allWords);
            if (verbIndex > 0 && verbIndex < words.length - 1) {
                const verb = reorderedWords.splice(verbIndex, 1)[0];
                reorderedWords.push(verb);
            }
        } else if (wordOrder === 'vso' && translatedWords.length >= 3) {
            // Simple VSO reordering: move verb to beginning
            const verbIndex = this.findVerbIndex(words, allWords);
            if (verbIndex > 0) {
                const verb = reorderedWords.splice(verbIndex, 1)[0];
                reorderedWords.unshift(verb);
            }
        }
        
        const suggestion = reorderedWords.join(' ');
        const confidence = this.calculateTranslationConfidence(words, allWords);
        const missingWords = words.filter(word => 
            !allWords.find(vw => vw.english.toLowerCase() === word)
        );
        
        return {
            original: englishText,
            suggestion: suggestion,
            confidence: confidence,
            missingWords: missingWords,
            appliedRules: [
                `Word order: ${wordOrder.toUpperCase()}`,
                `Vocabulary coverage: ${Math.round(confidence)}%`
            ]
        };
    },

    findVerbIndex(words, vocabulary) {
        return words.findIndex(word => {
            const match = vocabulary.find(vw => vw.english.toLowerCase() === word);
            return match && match.pos === 'verb';
        });
    },

    calculateTranslationConfidence(words, vocabulary) {
        const matchedWords = words.filter(word => 
            vocabulary.find(vw => vw.english.toLowerCase() === word)
        );
        return words.length > 0 ? (matchedWords.length / words.length) * 100 : 0;
    },

    displayTranslationSuggestion(suggestion, originalText) {
        const resultDiv = document.getElementById('translation-result');
        const contentDiv = document.getElementById('translation-content');
        
        if (!resultDiv || !contentDiv) return;
        
        const confidenceColor = suggestion.confidence > 70 ? '#4CAF50' : 
                               suggestion.confidence > 40 ? '#ff9800' : '#f44336';
        
        let html = `
            <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <strong>Original:</strong> ${suggestion.original}<br>
                <strong>Suggested Translation:</strong> <span style="color: var(--accent-primary); font-weight: 600; font-size: 1.1em;">${suggestion.suggestion}</span>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div style="background: white; padding: 15px; border-radius: 8px;">
                    <h6 style="color: var(--accent-primary); margin-bottom: 10px;">📊 Translation Quality</h6>
                    <div style="margin-bottom: 10px;">
                        <strong>Confidence:</strong> 
                        <span style="color: ${confidenceColor}; font-weight: bold;">
                            ${Math.round(suggestion.confidence)}%
                        </span>
                    </div>
                    <div style="font-size: 0.9em; color: #666;">
                        ${suggestion.appliedRules.map(rule => `• ${rule}`).join('<br>')}
                    </div>
                </div>
                
                <div style="background: white; padding: 15px; border-radius: 8px;">
                    <h6 style="color: var(--accent-primary); margin-bottom: 10px;">❗ Missing Words</h6>
                    ${suggestion.missingWords.length > 0 ? `
                        <div style="font-size: 0.9em;">
                            ${suggestion.missingWords.map(word => `
                                <span style="background: #ffeb3b; color: #333; padding: 2px 6px; border-radius: 3px; margin: 2px; display: inline-block;">
                                    ${word}
                                </span>
                            `).join('')}
                        </div>
                        <div style="margin-top: 10px; font-size: 0.8em; color: #666;">
                            💡 Add these words to your vocabulary for better translations!
                        </div>
                    ` : `
                        <div style="color: #4CAF50; font-style: italic;">
                            ✅ All words found in vocabulary!
                        </div>
                    `}
                </div>
            </div>
        `;
        
        contentDiv.innerHTML = html;
        resultDiv.style.display = 'block';
        
        // Store for potential addition to corpus
        this.currentSuggestion = suggestion;
    },

    addSuggestedPair() {
        if (!this.currentSuggestion) {
            showToast('No translation suggestion to add!', 'error');
            return;
        }
        
        const newPair = {
            id: Date.now(),
            english: this.currentSuggestion.original,
            conlang: this.currentSuggestion.suggestion,
            category: 'generated',
            notes: `Auto-suggested (${Math.round(this.currentSuggestion.confidence)}% confidence)`,
            dateAdded: new Date().toLocaleDateString(),
            wordCount: this.currentSuggestion.original.split(/\s+/).length,
            conlangWordCount: this.currentSuggestion.suggestion.split(/\s+/).length
        };
        
        this.sentencePairs.push(newPair);
        this.filteredSentences = [...this.sentencePairs];
        
        // Save to language data
        if (window.generator && window.generator.language) {
            window.generator.language.corpus = this.sentencePairs;
        }
        
        this.updateDisplay();
        this.updateAnalysisDropdown();
        
        // Clear translation result
        document.getElementById('translation-result').style.display = 'none';
        document.getElementById('translate-input').value = '';
        this.currentSuggestion = null;
        
        if (window.ActivityModule) {
            window.ActivityModule.addActivity('Added suggested translation to corpus', 'corpus');
        }
        showToast('Translation added to corpus!', 'success');
    },
    
    generateSampleText() {
        const allWords = window.appState.getState('allWords') || [];
        
        if (allWords.length === 0) {
            showToast('No vocabulary available! Generate a language first.', 'error');
            return;
        }

        const type = document.getElementById('sample-type')?.value || 'simple';
        let sampleText = '';
        let englishText = '';

        switch (type) {
            case 'simple':
                const sentences = [
                    'The sun shines brightly.',
                    'People speak this language.',
                    'Water flows in the river.',
                    'Birds fly in the sky.',
                    'Children play happily.'
                ];
                englishText = sentences.join(' ');
                sampleText = sentences.map(s => this.translateSentence(s)).join(' ');
                break;
            case 'story':
                englishText = 'Once upon a time, there was a small village. The people were happy. They lived near the water and the trees. Every day, the sun would shine on their houses. The children would play, and the adults would work.';
                sampleText = this.translateSentence(englishText);
                break;
            case 'dialogue':
                englishText = '"Hello," said the person. "How are you today?" "I am good," came the reply. "The weather is beautiful. The sun shines and the birds sing."';
                sampleText = this.translateSentence(englishText);
                break;
            case 'description':
                englishText = 'The mountain stood tall and proud. Green trees covered its slopes. A clear river flowed at its base. The sky above was blue and peaceful. Small birds flew among the clouds.';
                sampleText = this.translateSentence(englishText);
                break;
            case 'poem':
                englishText = 'The sun rises high,\nBirds sing in the trees,\nWater flows gently,\nLife moves with ease.';
                sampleText = this.translateSentence(englishText);
                break;
        }

        const outputDiv = document.getElementById('sample-text-output');
        const contentDiv = document.getElementById('sample-text-content');
        
        if (contentDiv) {
            contentDiv.innerHTML = `
                <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <strong>English:</strong><br>
                    <span style="white-space: pre-line;">${englishText}</span>
                </div>
                <div style="background: #f0f8f0; padding: 15px; border-radius: 8px; border: 2px solid #4CAF50;">
                    <strong>In your conlang:</strong><br>
                    <em style="font-size: 1.1em; color: #4CAF50; white-space: pre-line;">${sampleText}</em>
                </div>
                <div style="margin-top: 15px; font-size: 0.9em; color: #666;">
                    <strong>Note:</strong> This is a simple word-for-word substitution. A real translation would consider grammar rules and word order.
                </div>
                <div style="margin-top: 10px;">
                    <button class="btn btn-secondary" onclick="CorpusModule.addSampleToCorpus('${englishText.replace(/'/g, "\\'")}', '${sampleText.replace(/'/g, "\\'")}')">
                        ➕ Add to Corpus
                    </button>
                </div>
            `;
        }
        
        if (outputDiv) {
            outputDiv.style.display = 'block';
        }
        
        if (window.ActivityModule) {
            window.ActivityModule.addActivity(`Generated sample ${type} text`, 'corpus');
        }
        showToast('Sample text generated!', 'success');
    },

    translateSentence(englishText) {
        const translationData = this.intelligentTranslate(englishText);
        return translationData.translation;
    },

    addSampleToCorpus(englishText, conlangText) {
        // Set the form fields
        document.getElementById('english-sentence').value = englishText;
        document.getElementById('conlang-sentence').value = conlangText;
        document.getElementById('sentence-category').value = 'general';
        
        // Scroll to the form
        document.getElementById('english-sentence').scrollIntoView({ behavior: 'smooth' });
        
        showToast('Sample text added to form! Click "Add Pair" to save it.', 'info');
    },
    
    createImprovedTranslation(englishText) {
        const allWords = window.appState.getState('allWords') || [];
        const morphology = window.generator?.language?.morphology || {};
        const syntax = window.generator?.language?.syntax || {};
        
        // Basic sentence analysis
        const words = englishText.toLowerCase()
            .replace(/[.,!?";]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 0);
        
        // Detect basic grammar features
        const isPast = englishText.includes('ed ') || englishText.includes('was ') || englishText.includes('were ');
        const isFuture = englishText.includes('will ') || englishText.includes('shall ');
        const isPlural = words.some(word => word.endsWith('s') && !['is', 'was', 'this', 'us'].includes(word));
        
        // Translate words
        const translatedWords = [];
        const missingWords = [];
        
        words.forEach(word => {
            // Skip function words
            if (['the', 'a', 'an', 'is', 'are', 'was', 'were'].includes(word)) {
                return; // Skip these
            }
            
            // Find translation
            const vocabMatch = allWords.find(v => 
                v.english.toLowerCase() === word ||
                v.english.toLowerCase().includes(word) ||
                word.includes(v.english.toLowerCase())
            );
            
            if (vocabMatch) {
                let translatedWord = vocabMatch.conlang;
                
                // Apply basic morphology
                if (vocabMatch.pos === 'verb' && morphology.affixes) {
                    if (isPast && morphology.affixes['past']) {
                        translatedWord = this.applySimpleAffix(translatedWord, morphology.affixes['past']);
                    } else if (isFuture && morphology.affixes['future']) {
                        translatedWord = this.applySimpleAffix(translatedWord, morphology.affixes['future']);
                    }
                }
                
                if (vocabMatch.pos === 'noun' && isPlural && morphology.affixes) {
                    const pluralAffix = morphology.affixes['plural'] || morphology.affixes['plural-suffix'];
                    if (pluralAffix) {
                        translatedWord = this.applySimpleAffix(translatedWord, pluralAffix);
                    }
                }
                
                translatedWords.push(translatedWord);
            } else {
                missingWords.push(word);
                translatedWords.push(`[${word}]`);
            }
        });
        
        // Apply word order
        let finalTranslation = translatedWords.join(' ');
        
        if (syntax.wordOrder && translatedWords.length >= 2) {
            // Very basic word order adjustment
            if (syntax.wordOrder === 'sov' && translatedWords.length >= 3) {
                // Move last word (object) before second-to-last (verb)
                const reordered = [...translatedWords];
                if (reordered.length >= 3) {
                    const lastWord = reordered.pop();
                    reordered.splice(-1, 0, lastWord);
                    finalTranslation = reordered.join(' ');
                }
            }
        }
        
        // Calculate confidence
        const foundWords = words.length - missingWords.length;
        const confidence = words.length > 0 ? Math.round((foundWords / words.length) * 100) : 0;
        
        return {
            translation: finalTranslation,
            confidence: confidence,
            missingWords: missingWords,
            appliedRules: this.getSimpleAppliedRules(isPast, isFuture, isPlural, syntax),
            note: missingWords.length > 0 ? `${missingWords.length} words need to be added to vocabulary` : 'All words found!'
        };
    },

    applySimpleAffix(word, affix) {
        if (!affix || !affix.morpheme) return word;
        
        switch (affix.type) {
            case 'prefix':
                return affix.morpheme + word;
            case 'suffix':
                return word + affix.morpheme;
            default:
                return word + affix.morpheme;
        }
    },

    getSimpleAppliedRules(isPast, isFuture, isPlural, syntax) {
        const rules = [];
        
        if (syntax.wordOrder) {
            rules.push(`Word order: ${syntax.wordOrder.toUpperCase()}`);
        }
        
        if (isPast) rules.push('Past tense marking');
        if (isFuture) rules.push('Future tense marking');
        if (isPlural) rules.push('Plural marking');
        
        return rules;
    },

    displaySimpleTranslation(translationData) {
        const contentDiv = document.getElementById('translation-content');
        const resultDiv = document.getElementById('translation-result');
        
        if (!contentDiv || !resultDiv) {
            console.error('Translation display elements not found');
            return;
        }
        
        let content = `
            <div class="translation-suggestion">
                <div class="translation-result-box">
                    <h5>🌐 Suggested Translation:</h5>
                    <div class="generated-word" style="font-size: 1.2em; margin: 10px 0; color: #28a745;">
                        ${translationData.translation}
                    </div>
                    <div style="color: #666; font-size: 0.9em;">
                        Confidence: ${translationData.confidence}% 
                        ${translationData.confidence > 70 ? '✅' : translationData.confidence > 40 ? '⚠️' : '❌'}
                    </div>
                </div>
        `;
        
        if (translationData.appliedRules && translationData.appliedRules.length > 0) {
            content += `
                <div style="margin: 15px 0;">
                    <h6>📏 Applied Grammar Rules:</h6>
                    <ul style="margin: 5px 0; padding-left: 20px;">
                        ${translationData.appliedRules.map(rule => `<li>${rule}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        if (translationData.note) {
            content += `
                <div style="margin: 10px 0; padding: 10px; background: #f8f9fa; border-radius: 4px; border-left: 4px solid #007bff;">
                    <strong>Note:</strong> ${translationData.note}
                </div>
            `;
        }
        
        if (translationData.missingWords && translationData.missingWords.length > 0) {
            content += `
                <div style="margin: 15px 0; padding: 10px; background: #fff3cd; border-radius: 4px; border-left: 4px solid #ffc107;">
                    <h6 style="color: #856404;">⚠️ Missing Vocabulary:</h6>
                    <div style="display: flex; flex-wrap: wrap; gap: 5px; margin: 10px 0;">
                        ${translationData.missingWords.map(word => `
                            <span style="background: #ffc107; color: #212529; padding: 2px 8px; border-radius: 12px; font-size: 0.8em;">
                                ${word}
                            </span>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        content += '</div>';
        contentDiv.innerHTML = content;
        resultDiv.style.display = 'block';
    }
};