// AI Assistant Module - Main coordinator for intelligent language assistance
window.AIAssistant = {
    // Core state
    initialized: false,
    localAI: null,
    cloudAI: null,
    settings: {
        provider: 'local',
        autoApply: true,
        culturalFiltering: true,
        learningMode: true
    },
    stats: {
        totalSuggestions: 0,
        acceptedSuggestions: 0,
        aiAddedWords: 0,
        accuracyRate: 0
    },

    async init() {
        console.log('Initializing AI Assistant...');
        
        // Always re-initialize to fix tab switching issues
        this.initialized = false;

        try {
            // Initialize local AI first (always available)
            if (window.LocalAI) {
                this.localAI = window.LocalAI;
                if (!this.localAI.initialized) {
                    await this.localAI.init();
                    console.log('Local AI initialized successfully');
                }
            }

            // Load settings from localStorage
            this.loadSettings();
            this.loadStats();

            // Bind events every time (important for tab switching)
            this.bindEvents();

            // Update UI
            this.updateAnalysisOverview();
            this.updateUIState();
            
            // Note: updateDebugInfo will be called when the tab is actually loaded
            // since the DOM elements might not be available yet during init

            this.initialized = true;
            console.log('AI Assistant initialized successfully');

        } catch (error) {
            console.error('Failed to initialize AI Assistant:', error);
            showToast('AI Assistant initialization failed', 'error');
        }
    },

    bindEvents() {
        console.log('Binding AI Assistant events...');
        
        // Update debug info and bind events with a longer delay to ensure DOM is ready
        setTimeout(() => {
            if (this.updateDebugInfo) {
                this.updateDebugInfo();
            }
            // Also refresh the analysis overview in case vocabulary was loaded after init
            this.updateAnalysisOverview();
            
            // Re-bind critical events that might have failed
            this.rebindCriticalEvents();
            
            // Force initial UI state update
            this.updateUIState();
        }, 1000); // Even longer delay to ensure DOM is fully loaded
        
        // Vocabulary expansion events
        const generateBtn = document.getElementById('generate-suggestions-btn');
        if (generateBtn) {
            generateBtn.onclick = () => this.generateVocabularySuggestions();
            console.log('Generate suggestions button bound');
        } else {
            console.warn('Generate suggestions button not found');
        }

        const analyzeBtn = document.getElementById('analyze-gaps-btn');
        if (analyzeBtn) {
            analyzeBtn.onclick = () => this.analyzeVocabularyGaps();
            console.log('Analyze gaps button bound');
        } else {
            console.warn('Analyze gaps button not found');
        }

        // Translation events
        const translateBtn = document.getElementById('translate-text-btn');
        if (translateBtn) {
            translateBtn.onclick = () => this.translateText();
        } else {
            console.warn('Translate button not found');
        }

        const identifyBtn = document.getElementById('identify-missing-btn');
        if (identifyBtn) {
            identifyBtn.onclick = () => this.identifyMissingWords();
        } else {
            console.warn('Identify missing button not found');
        }

        // Morphological events
        const derivativesBtn = document.getElementById('generate-derivatives-btn');
        if (derivativesBtn) {
            derivativesBtn.onclick = () => this.generateDerivatives();
        } else {
            console.warn('Generate derivatives button not found');
        }

        const compoundsBtn = document.getElementById('generate-compounds-btn');
        if (compoundsBtn) {
            compoundsBtn.onclick = () => this.generateCompounds();
        } else {
            console.warn('Generate compounds button not found');
        }

        const wordFamilyBtn = document.getElementById('expand-word-family-btn');
        if (wordFamilyBtn) {
            wordFamilyBtn.onclick = () => this.expandWordFamily();
        } else {
            console.warn('Expand word family button not found');
        }

        // Cultural analysis events
        const consistencyBtn = document.getElementById('check-consistency-btn');
        if (consistencyBtn) {
            consistencyBtn.onclick = () => this.checkCulturalConsistency();
        } else {
            console.warn('Check consistency button not found');
        }

        const culturalVocabBtn = document.getElementById('suggest-cultural-vocab-btn');
        if (culturalVocabBtn) {
            culturalVocabBtn.onclick = () => this.suggestCulturalVocabulary();
        } else {
            console.warn('Suggest cultural vocab button not found');
        }

        // Settings events
        const providerSelect = document.getElementById('ai-provider');
        if (providerSelect) {
            providerSelect.onchange = (e) => this.changeProvider(e.target.value);
        } else {
            console.warn('AI provider select not found');
        }

        // API key input
        const apiKeyInput = document.getElementById('api-key-input');
        if (apiKeyInput) {
            apiKeyInput.onchange = (e) => this.updateApiKey(e.target.value);
        }

        // Remote Ollama inputs
        const remoteEndpointInput = document.getElementById('remote-endpoint-input');
        if (remoteEndpointInput) {
            remoteEndpointInput.onchange = (e) => this.updateRemoteEndpoint(e.target.value);
        }

        const remoteModelInput = document.getElementById('remote-model-input');
        if (remoteModelInput) {
            remoteModelInput.onchange = (e) => this.updateRemoteModel(e.target.value);
        }

        const testRemoteBtn = document.getElementById('test-remote-connection-btn');
        if (testRemoteBtn) {
            testRemoteBtn.onclick = () => this.testRemoteConnection();
        }

        // Debug refresh button
        const refreshBtn = document.getElementById('refresh-ai-status-btn');
        if (refreshBtn) {
            refreshBtn.onclick = () => this.refreshAIStatus();
        } else {
            console.warn('Refresh AI status button not found');
        }

        // Suggestion control events
        const acceptAllBtn = document.getElementById('accept-all-btn');
        if (acceptAllBtn) {
            acceptAllBtn.onclick = () => this.acceptAllSuggestions();
        } else {
            console.warn('Accept all button not found');
        }

        const rejectAllBtn = document.getElementById('reject-all-btn');
        if (rejectAllBtn) {
            rejectAllBtn.onclick = () => this.rejectAllSuggestions();
        } else {
            console.warn('Reject all button not found');
        }

        console.log('AI Assistant events binding completed');
    },

    async generateVocabularySuggestions() {
        const category = document.getElementById('suggestion-category')?.value || 'auto';
        const count = parseInt(document.getElementById('suggestion-count')?.value) || 10;

        this.showLoading('generate-suggestions-btn');

        try {
            // Check if AI is available
            if (!this.localAI || !this.localAI.initialized) {
                throw new Error('AI engine not initialized');
            }

            if (!this.localAI.apiEndpoint) {
                throw new Error('No AI provider available. Please check Ollama setup or configure cloud API.');
            }

            console.log('Generating vocabulary suggestions with AI...');
            
            // Get current language context
            const context = this.getLanguageContext();
            console.log('Language context:', context);
            
            // Generate suggestions using local AI
            const rawSuggestions = await this.localAI.generateVocabularySuggestions(context, category, count);
            console.log('Raw suggestions from AI:', rawSuggestions);
            
            // Let the vocabulary system handle duplicate checking now
            // Just do basic filtering for obviously bad suggestions
            const suggestions = rawSuggestions.filter(suggestion => {
                return suggestion.english && suggestion.english.trim().length > 0;
            });
            
            console.log(`Filtered suggestions (removed ${rawSuggestions.length - suggestions.length} invalid):`, suggestions);
            
            if (!suggestions || suggestions.length === 0) {
                showToast('AI returned no new suggestions (all were duplicates or invalid)', 'warning');
                return;
            }
            
            // Display suggestions
            this.displaySuggestions(suggestions);
            
            // Update stats
            this.stats.totalSuggestions += suggestions.length;
            this.updateStats();

            showToast(`Generated ${suggestions.length} vocabulary suggestions!`, 'success');

        } catch (error) {
            console.error('Error generating vocabulary suggestions:', error);
            showToast(`Failed to generate suggestions: ${error.message}`, 'error');
            
            // Show debug info
            console.log('AI Debug Info:');
            console.log('- LocalAI initialized:', this.localAI?.initialized);
            console.log('- API endpoint:', this.localAI?.apiEndpoint);
            console.log('- Available models:', this.localAI?.availableModels);
            console.log('- Selected model:', this.localAI?.selectedModel);
        }

        this.hideLoading('generate-suggestions-btn');
    },

    async analyzeVocabularyGaps() {
        this.showLoading('analyze-gaps-btn');

        try {
            const context = this.getLanguageContext();
            const analysis = await this.localAI.analyzeVocabularyGaps(context);
            
            this.displayGapAnalysis(analysis);
            showToast('Vocabulary gap analysis completed!', 'success');

        } catch (error) {
            console.error('Error analyzing vocabulary gaps:', error);
            showToast('Failed to analyze vocabulary gaps', 'error');
        }

        this.hideLoading('analyze-gaps-btn');
    },

    displayGapAnalysis(analysis) {
        // Hide suggestions section and show gap analysis
        const suggestionsSection = document.getElementById('vocabulary-suggestions');
        if (suggestionsSection) {
            suggestionsSection.style.display = 'none';
        }

        // Create or update gap analysis section
        let gapSection = document.getElementById('gap-analysis-section');
        if (!gapSection) {
            const container = document.querySelector('.section-card:has(#generate-suggestions-btn)');
            if (container) {
                gapSection = document.createElement('div');
                gapSection.id = 'gap-analysis-section';
                gapSection.className = 'result-card';
                gapSection.style.display = 'none';
                gapSection.innerHTML = `
                    <div class="suggestions-header">
                        <h4>📊 Vocabulary Gap Analysis Report</h4>
                        <button class="btn btn-sm btn-secondary" onclick="document.getElementById('gap-analysis-section').style.display='none'">
                            ✖️ Close
                        </button>
                    </div>
                    <div id="gap-analysis-content"></div>
                `;
                container.appendChild(gapSection);
            }
        }

        const contentDiv = document.getElementById('gap-analysis-content');
        if (!contentDiv || !analysis) return;

        // Display the comprehensive analysis
        contentDiv.innerHTML = `
            <div class="gap-analysis-report">
                ${analysis.overall_assessment ? `
                    <div class="analysis-section">
                        <h5>🎯 Overall Assessment</h5>
                        <div class="assessment-grid">
                            <div class="assessment-item">
                                <span class="assessment-label">Completion:</span>
                                <span class="assessment-value">${analysis.overall_assessment.completion_percentage || 0}%</span>
                            </div>
                            <div class="assessment-item">
                                <span class="assessment-label">Level:</span>
                                <span class="assessment-value">${analysis.overall_assessment.vocabulary_level || 'Unknown'}</span>
                            </div>
                            <div class="assessment-item">
                                <span class="assessment-label">Stage:</span>
                                <span class="assessment-value">${analysis.overall_assessment.development_stage || 'Developing'}</span>
                            </div>
                        </div>
                        ${analysis.overall_assessment.critical_gaps?.length > 0 ? `
                            <div class="gap-list">
                                <strong>Critical Gaps:</strong> ${analysis.overall_assessment.critical_gaps.join(', ')}
                            </div>
                        ` : ''}
                        ${analysis.overall_assessment.strengths?.length > 0 ? `
                            <div class="strength-list">
                                <strong>Strengths:</strong> ${analysis.overall_assessment.strengths.join(', ')}
                            </div>
                        ` : ''}
                    </div>
                ` : ''}

                ${analysis.pos_analysis ? `
                    <div class="analysis-section">
                        <h5>📝 Part-of-Speech Analysis</h5>
                        ${analysis.pos_analysis.balanced?.length > 0 ? `
                            <div class="pos-status balanced">
                                <strong>Well Balanced:</strong> ${analysis.pos_analysis.balanced.join(', ')}
                            </div>
                        ` : ''}
                        ${analysis.pos_analysis.underrepresented?.length > 0 ? `
                            <div class="pos-status underrepresented">
                                <strong>Underrepresented:</strong> ${analysis.pos_analysis.underrepresented.join(', ')}
                            </div>
                        ` : ''}
                        ${analysis.pos_analysis.missing?.length > 0 ? `
                            <div class="pos-status missing">
                                <strong>Missing:</strong> ${analysis.pos_analysis.missing.join(', ')}
                            </div>
                        ` : ''}
                        ${analysis.pos_analysis.recommendations ? `
                            <div class="pos-recommendations">
                                <strong>Recommendation:</strong> ${analysis.pos_analysis.recommendations}
                            </div>
                        ` : ''}
                    </div>
                ` : ''}

                ${analysis.semantic_analysis ? `
                    <div class="analysis-section">
                        <h5>🧠 Semantic Coverage</h5>
                        ${analysis.semantic_analysis.well_covered?.length > 0 ? `
                            <div class="semantic-status good">
                                <strong>Well Covered:</strong> ${analysis.semantic_analysis.well_covered.join(', ')}
                            </div>
                        ` : ''}
                        ${analysis.semantic_analysis.partially_covered?.length > 0 ? `
                            <div class="semantic-status partial">
                                <strong>Partially Covered:</strong> ${analysis.semantic_analysis.partially_covered.join(', ')}
                            </div>
                        ` : ''}
                        ${analysis.semantic_analysis.missing_categories?.length > 0 ? `
                            <div class="semantic-status missing">
                                <strong>Missing Categories:</strong> ${analysis.semantic_analysis.missing_categories.join(', ')}
                            </div>
                        ` : ''}
                        ${analysis.semantic_analysis.priority_categories?.length > 0 ? `
                            <div class="semantic-priorities">
                                <strong>Priority Areas:</strong> ${analysis.semantic_analysis.priority_categories.join(', ')}
                            </div>
                        ` : ''}
                    </div>
                ` : ''}

                ${analysis.cultural_analysis ? `
                    <div class="analysis-section">
                        <h5>🏛️ Cultural Alignment</h5>
                        <div class="cultural-score">
                            <strong>Consistency Score:</strong> ${analysis.cultural_analysis.consistency_score || 0}%
                        </div>
                        ${analysis.cultural_analysis.cultural_alignment ? `
                            <div class="cultural-alignment">
                                <strong>Assessment:</strong> ${analysis.cultural_analysis.cultural_alignment}
                            </div>
                        ` : ''}
                        ${analysis.cultural_analysis.missing_cultural_domains?.length > 0 ? `
                            <div class="cultural-gaps">
                                <strong>Missing Cultural Areas:</strong> ${analysis.cultural_analysis.missing_cultural_domains.join(', ')}
                            </div>
                        ` : ''}
                        ${analysis.cultural_analysis.suggestions ? `
                            <div class="cultural-suggestions">
                                <strong>Suggestions:</strong> ${analysis.cultural_analysis.suggestions}
                            </div>
                        ` : ''}
                    </div>
                ` : ''}

                ${analysis.development_recommendations?.length > 0 ? `
                    <div class="analysis-section">
                        <h5>🚀 Development Recommendations</h5>
                        <div class="recommendations-list">
                            ${analysis.development_recommendations.map(rec => `
                                <div class="recommendation-item priority-${rec.priority || 'medium'}">
                                    <div class="rec-header">
                                        <strong>${rec.area || 'General'}</strong>
                                        <span class="priority-badge">${rec.priority || 'medium'} priority</span>
                                    </div>
                                    <div class="rec-rationale">${rec.rationale || ''}</div>
                                    ${rec.suggested_approach ? `
                                        <div class="rec-approach"><strong>Approach:</strong> ${rec.suggested_approach}</div>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        gapSection.style.display = 'block';
    },

    async translateText() {
        const input = document.getElementById('translation-input')?.value?.trim();
        if (!input) {
            showToast('Please enter text to translate', 'warning');
            return;
        }

        this.showLoading('translate-text-btn');

        try {
            const context = this.getLanguageContext();
            
            // Try AI translation first, with fallback to mechanical
            let result;
            if (this.localAI && this.localAI.apiEndpoint) {
                try {
                    console.log('Attempting AI translation...');
                    result = await this.localAI.translateText(context, input);
                    
                    // Validate AI result - make sure it didn't invent words
                    result = this.validateTranslationResult(result, context);
                } catch (error) {
                    console.log('AI translation failed, using mechanical fallback:', error.message);
                    result = this.mechanicalTranslation(context, input);
                }
            } else {
                console.log('No AI available, using mechanical translation');
                result = this.mechanicalTranslation(context, input);
            }
            
            this.displayTranslationResult(result);
            showToast('Translation completed!', 'success');

        } catch (error) {
            console.error('Error translating text:', error);
            showToast(`Translation failed: ${error.message}`, 'error');
        }

        this.hideLoading('translate-text-btn');
    },

    validateTranslationResult(aiResult, context) {
        console.log('AI result BEFORE validation:', aiResult);
        
        // Create vocabulary lookup for validation
        const vocabularyMap = new Map();
        context.vocabulary.forEach(word => {
            vocabularyMap.set(word.english.toLowerCase(), word.conlang);
        });

        console.log('Vocabulary map for validation:', Array.from(vocabularyMap.entries()).slice(0, 5), '...');

        // Validate word-by-word breakdown but TRUST the AI's intelligence
        if (aiResult.translation && aiResult.translation.word_by_word) {
            console.log('Original word_by_word:', aiResult.translation.word_by_word);
            
            aiResult.translation.word_by_word = aiResult.translation.word_by_word.map(wordPair => {
                // If AI says word is available AND provides a conlang word that exists in our vocabulary
                if (wordPair.available && wordPair.conlang && Array.from(vocabularyMap.values()).includes(wordPair.conlang)) {
                    console.log(`✅ AI mapping accepted: "${wordPair.english}" → "${wordPair.conlang}"`);
                    return wordPair; // Trust the AI
                } else if (wordPair.available && wordPair.base_form && vocabularyMap.has(wordPair.base_form.toLowerCase())) {
                    // AI identified a base form that exists
                    const conlang = vocabularyMap.get(wordPair.base_form.toLowerCase());
                    console.log(`✅ AI base form mapping: "${wordPair.english}" → "${conlang}" (base: ${wordPair.base_form})`);
                    return {
                        english: wordPair.english,
                        conlang: conlang,
                        available: true,
                        base_form: wordPair.base_form
                    };
                } else {
                    // AI couldn't find a mapping or mapping is invalid
                    console.log(`❌ No valid mapping for "${wordPair.english}"`);
                    return {
                        english: wordPair.english,
                        conlang: `[${wordPair.english}]`,
                        available: false
                    };
                }
            });

            console.log('AFTER smart validation:', aiResult.translation.word_by_word);
            
            // Rebuild translation text using validated words
            aiResult.translation.conlang_text = aiResult.translation.word_by_word.map(w => w.conlang).join(' ');
            
            // Recalculate confidence
            const available = aiResult.translation.word_by_word.filter(w => w.available).length;
            const total = aiResult.translation.word_by_word.length;
            aiResult.translation.confidence = total > 0 ? available / total : 0;
        }

        return aiResult;
    },

    mechanicalTranslation(context, englishText) {
        // Fallback mechanical translation (same as before)
        const words = englishText.toLowerCase()
            .replace(/[.,!?;:"()]/g, '') 
            .split(/\s+/)
            .filter(word => word.length > 0);
        
        const vocabularyMap = new Map();
        context.vocabulary.forEach(word => {
            vocabularyMap.set(word.english.toLowerCase(), word.conlang);
        });

        const wordByWord = words.map(word => {
            const conlang = vocabularyMap.get(word);
            return {
                english: word,
                conlang: conlang || `[${word}]`,
                available: !!conlang
            };
        });

        const missingWords = words.filter(word => !vocabularyMap.has(word));
        const availableWords = words.filter(word => vocabularyMap.has(word));
        const confidence = words.length > 0 ? availableWords.length / words.length : 0;

        return {
            original: englishText,
            analysis: {
                available_words: availableWords,
                missing_words: missingWords,
                grammar_applied: 'Mechanical word substitution (no AI intelligence)'
            },
            translation: {
                conlang_text: wordByWord.map(w => w.conlang).join(' '),
                word_by_word: wordByWord,
                confidence: confidence,
                notes: 'Basic mechanical translation - AI unavailable for intelligent analysis'
            },
            missing_word_suggestions: missingWords.map(word => ({
                english: word,
                pos: this.guessPartOfSpeech(word),
                priority: 8,
                reasoning: 'Required for complete translation',
                meaning: word
            }))
        };
    },

    async identifyMissingWords() {
        const input = document.getElementById('translation-input')?.value?.trim();
        if (!input) {
            showToast('Please enter text to analyze', 'warning');
            return;
        }

        this.showLoading('identify-missing-btn');

        try {
            const context = this.getLanguageContext();
            
            // Simple word extraction and checking
            const words = input.toLowerCase()
                .replace(/[.,!?;:"()]/g, '') // Remove punctuation
                .split(/\s+/)
                .filter(word => word.length > 0);
            
            // Create a map of existing words (case-insensitive)
            const existingWords = new Map();
            context.vocabulary.forEach(word => {
                existingWords.set(word.english.toLowerCase(), word);
            });
            
            console.log('Checking words:', words);
            console.log('Against vocabulary:', Array.from(existingWords.keys()).slice(0, 10), '...');
            
            // Find truly missing words
            const missingWords = [];
            const availableWords = [];
            
            words.forEach(word => {
                if (existingWords.has(word)) {
                    availableWords.push(word);
                } else {
                    missingWords.push(word);
                }
            });
            
            console.log('Available:', availableWords);
            console.log('Missing:', missingWords);
            
            if (missingWords.length === 0) {
                showToast('All words in this text already exist in your vocabulary!', 'info');
                this.displayMissingWordsSimple([], availableWords, words);
            } else {
                // Create suggestions for missing words
                const suggestions = missingWords.map(word => ({
                    english: word,
                    pos: this.guessPartOfSpeech(word),
                    meaning: word,
                    priority: 7,
                    reasoning: 'Required for translation',
                    confidence: 0.8
                }));
                
                this.displayMissingWordsSimple(suggestions, availableWords, words);
                showToast(`Found ${missingWords.length} missing words`, 'info');
            }

        } catch (error) {
            console.error('Error identifying missing words:', error);
            showToast(`Analysis failed: ${error.message}`, 'error');
        }

        this.hideLoading('identify-missing-btn');
    },

    guessPartOfSpeech(word) {
        // Simple heuristics for POS guessing
        const word_lower = word.toLowerCase();
        
        // Common function words
        if (['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by'].includes(word_lower)) {
            return 'function';
        }
        
        // Pronouns
        if (['i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their'].includes(word_lower)) {
            return 'pronoun';
        }
        
        // Common verb endings
        if (word_lower.endsWith('ing') || word_lower.endsWith('ed') || word_lower.endsWith('es')) {
            return 'verb';
        }
        
        // Common adjective endings
        if (word_lower.endsWith('ly')) {
            return 'adverb';
        }
        
        if (word_lower.endsWith('ful') || word_lower.endsWith('less') || word_lower.endsWith('ous') || word_lower.endsWith('ive')) {
            return 'adjective';
        }
        
        // Common verbs
        const commonVerbs = ['is', 'are', 'was', 'were', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'can', 'could', 'should', 'may', 'might'];
        if (commonVerbs.includes(word_lower)) {
            return 'verb';
        }
        
        // Default to noun for most content words
        return 'noun';
    },

    displayMissingWordsSimple(suggestions, availableWords, allWords) {
        const resultDiv = document.getElementById('translation-results');
        const contentDiv = document.getElementById('translation-content');
        
        if (!resultDiv || !contentDiv) return;

        if (suggestions.length === 0) {
            contentDiv.innerHTML = `
                <div class="translation-analysis">
                    <div class="translation-section">
                        <h5>✅ Complete Coverage</h5>
                        <p>All words in the text already exist in your vocabulary!</p>
                        <div class="word-coverage">
                            <h6>Available words (${availableWords.length}):</h6>
                            <div class="available-words">
                                ${availableWords.map(word => `<span class="available-word">${word}</span>`).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            contentDiv.innerHTML = `
                <div class="translation-analysis">
                    <div class="translation-section">
                        <h5>📊 Word Coverage Analysis</h5>
                        <div class="coverage-stats">
                            <div class="coverage-item available">
                                <span class="coverage-number">${availableWords.length}</span>
                                <span class="coverage-label">Available</span>
                            </div>
                            <div class="coverage-item missing">
                                <span class="coverage-number">${suggestions.length}</span>
                                <span class="coverage-label">Missing</span>
                            </div>
                            <div class="coverage-item total">
                                <span class="coverage-number">${Math.round((availableWords.length / allWords.length) * 100)}%</span>
                                <span class="coverage-label">Coverage</span>
                            </div>
                        </div>
                    </div>

                    <div class="translation-section">
                        <h5>🎯 Missing Words</h5>
                        <p>These words need to be added to your vocabulary for translation:</p>
                        <div class="missing-words-grid">
                            ${suggestions.map((word, index) => `
                                <div class="missing-word-card">
                                    <div class="missing-word-header">
                                        <strong>${word.english}</strong>
                                        <span class="word-pos-tag">${word.pos}</span>
                                    </div>
                                    <div class="missing-word-meaning">${word.meaning}</div>
                                    <div class="missing-word-actions">
                                        <button class="btn btn-sm btn-success" onclick="AIAssistant.addMissingWordInteractive(${index})">
                                            ➕ Add to Vocabulary
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    ${availableWords.length > 0 ? `
                        <div class="translation-section">
                            <h5>✅ Available Words</h5>
                            <div class="available-words">
                                ${availableWords.map(word => `<span class="available-word">${word}</span>`).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
        }

        // Store suggestions for adding
        this.currentMissingWords = suggestions;
        resultDiv.style.display = 'block';
    },

    addMissingWordInteractive(index) {
        const word = this.currentMissingWords[index];
        if (!word) return;

        // Create a simple dialog for adding the word
        const englishWord = word.english;
        const suggestedPos = word.pos;
        
        // Ask user for confirmation and conlang word
        const conlangWord = prompt(`Add "${englishWord}" to vocabulary.\n\nEnter the conlang word (or leave empty to auto-generate):`, '');
        
        if (conlangWord === null) {
            return; // User cancelled
        }
        
        let finalConlangWord;
        if (conlangWord.trim() === '') {
            // Auto-generate
            if (window.generator && window.generator.generateWord) {
                finalConlangWord = window.generator.generateWord();
            } else {
                finalConlangWord = this.generateFallbackWord();
            }
        } else {
            finalConlangWord = conlangWord.trim();
        }

        // Create new word object
        const newWord = {
            english: englishWord,
            conlang: finalConlangWord,
            pos: suggestedPos,
            meaning: englishWord,
            source: 'ai_translation',
            type: 'custom',
            dateAdded: new Date().toLocaleDateString()
        };

        // Add to vocabulary using the same system as manual entry
        if (window.appState) {
            const allWords = window.appState.getState('allWords') || [];
            allWords.push(newWord);
            window.appState.setState('allWords', allWords);
            
            // Also add to generator if it exists
            if (window.generator && window.generator.language) {
                if (!window.generator.language.customWords) {
                    window.generator.language.customWords = [];
                }
                window.generator.language.customWords.push(newWord);
            }
        }

        // Update displays
        if (window.VocabularyModule && window.VocabularyModule.updateDisplay) {
            window.VocabularyModule.updateDisplay();
        }

        if (window.OverviewModule && window.OverviewModule.updateOverview) {
            window.OverviewModule.updateOverview();
        }

        // Update the card to show it was added
        const card = document.querySelector(`.missing-word-card:nth-child(${index + 1})`);
        if (card) {
            const actionsDiv = card.querySelector('.missing-word-actions');
            if (actionsDiv) {
                actionsDiv.innerHTML = `<span style="color: #28a745; font-weight: bold;">✅ Added: ${finalConlangWord}</span>`;
            }
        }

        // Update stats
        this.stats.aiAddedWords++;
        this.updateStats();
        this.updateAnalysisOverview();

        showToast(`Added "${englishWord}" → "${finalConlangWord}" to vocabulary!`, 'success');
    },

    displayTranslationResult(result) {
        const resultDiv = document.getElementById('translation-results');
        const contentDiv = document.getElementById('translation-content');
        
        if (!resultDiv || !contentDiv || !result) return;

        contentDiv.innerHTML = `
            <div class="translation-analysis">
                ${result.analysis ? `
                    <div class="translation-section">
                        <h5>📊 Translation Analysis</h5>
                        <div class="analysis-stats">
                            <div class="stat-item">
                                <span>Available words:</span>
                                <span>${result.analysis.available_words?.length || 0}</span>
                            </div>
                            <div class="stat-item">
                                <span>Missing words:</span>
                                <span>${result.analysis.missing_words?.length || 0}</span>
                            </div>
                            <div class="stat-item">
                                <span>Coverage:</span>
                                <span>${Math.round(((result.analysis.available_words?.length || 0) / ((result.analysis.available_words?.length || 0) + (result.analysis.missing_words?.length || 0))) * 100) || 0}%</span>
                            </div>
                        </div>
                    </div>
                ` : ''}

                ${result.translation ? `
                    <div class="translation-section">
                        <h5>🔄 Translation Result</h5>
                        <div class="translation-attempt">
                            <div class="translation-original">
                                <strong>English:</strong> ${result.original || 'Original text'}
                            </div>
                            <div class="translation-result">
                                <strong>Conlang:</strong> ${result.translation.conlang_text || 'Translation unavailable'}
                            </div>
                            <div class="confidence-display">
                                <strong>Confidence:</strong> ${Math.round((result.translation.confidence || 0) * 100)}%
                            </div>
                            ${result.translation.notes ? `
                                <div class="translation-notes">
                                    <strong>Notes:</strong> ${result.translation.notes}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                ` : ''}

                ${result.translation?.word_by_word?.length > 0 ? `
                    <div class="translation-section">
                        <h5>🔍 Word-by-Word Breakdown</h5>
                        <div class="word-breakdown">
                            ${result.translation.word_by_word.map(word => `
                                <div class="word-mapping">
                                    <span class="english-word">${word.english}</span>
                                    <span class="mapping-arrow">→</span>
                                    <span class="conlang-word ${word.available ? 'available' : 'missing'}">
                                        ${word.conlang}
                                    </span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                ${result.missing_word_suggestions?.length > 0 ? `
                    <div class="translation-section">
                        <h5>➕ Add Missing Words</h5>
                        <p>Click to add these missing words to your vocabulary:</p>
                        <div class="missing-words-grid">
                            ${result.missing_word_suggestions.map((word, index) => `
                                <div class="missing-word-card">
                                    <div class="missing-word-header">
                                        <strong>${word.english}</strong>
                                        <span class="word-pos-tag">${word.pos}</span>
                                    </div>
                                    <div class="missing-word-meaning">${word.meaning || word.english}</div>
                                    <div class="missing-word-actions">
                                        <button class="btn btn-sm btn-success" onclick="AIAssistant.addTranslationWord(${index})">
                                            ➕ Add to Vocabulary
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        // Store suggestions for adding
        this.currentTranslationWords = result.missing_word_suggestions || [];
        resultDiv.style.display = 'block';
    },

    addTranslationWord(index) {
        const word = this.currentTranslationWords[index];
        if (!word) return;

        // Use the same interactive method as missing words
        this.addWordInteractively(word, index, 'translation');
    },

    addWordInteractively(word, index, source) {
        const englishWord = word.english;
        const suggestedPos = word.pos;
        
        // Ask user for confirmation and conlang word
        const conlangWord = prompt(`Add "${englishWord}" to vocabulary.\n\nEnter the conlang word (or leave empty to auto-generate):`, '');
        
        if (conlangWord === null) {
            return; // User cancelled
        }
        
        let finalConlangWord;
        if (conlangWord.trim() === '') {
            // Auto-generate
            if (window.generator && window.generator.generateWord) {
                finalConlangWord = window.generator.generateWord();
            } else {
                finalConlangWord = this.generateFallbackWord();
            }
        } else {
            finalConlangWord = conlangWord.trim();
        }

        // Check for duplicates
        const allWords = window.appState ? window.appState.getState('allWords') || [] : [];
        const duplicateConlang = allWords.find(w => w.conlang.toLowerCase() === finalConlangWord.toLowerCase());
        if (duplicateConlang) {
            showToast('A word with that spelling already exists!', 'error');
            return;
        }

        const duplicateEnglish = allWords.find(w => 
            w.english.toLowerCase() === englishWord.toLowerCase() && 
            w.pos === suggestedPos
        );
        if (duplicateEnglish) {
            showToast(`The meaning "${englishWord}" as a ${suggestedPos} already exists!`, 'error');
            return;
        }

        // Create new word object
        const newWord = {
            english: englishWord,
            conlang: finalConlangWord,
            pos: suggestedPos,
            meaning: englishWord,
            source: `ai_${source}`,
            type: 'custom',
            dateAdded: new Date().toLocaleDateString()
        };

        // Add to vocabulary
        if (window.appState) {
            allWords.push(newWord);
            window.appState.setState('allWords', allWords);
            
            // Also add to generator
            if (window.generator && window.generator.language) {
                if (!window.generator.language.customWords) {
                    window.generator.language.customWords = [];
                }
                window.generator.language.customWords.push(newWord);
            }
        }

        // Update displays
        if (window.VocabularyModule && window.VocabularyModule.updateDisplay) {
            window.VocabularyModule.updateDisplay();
        }

        if (window.OverviewModule && window.OverviewModule.updateOverview) {
            window.OverviewModule.updateOverview();
        }

        // Update the card to show it was added
        const card = document.querySelector(`.missing-word-card:nth-child(${index + 1})`);
        if (card) {
            const actionsDiv = card.querySelector('.missing-word-actions');
            if (actionsDiv) {
                actionsDiv.innerHTML = `<span style="color: #28a745; font-weight: bold;">✅ Added: ${finalConlangWord}</span>`;
            }
        }

        // Update stats
        this.stats.aiAddedWords++;
        this.updateStats();
        this.updateAnalysisOverview();

        showToast(`Added "${englishWord}" → "${finalConlangWord}" to vocabulary!`, 'success');
        
        // Log activity
        if (window.ActivityModule) {
            window.ActivityModule.addActivity(`Added word "${finalConlangWord}" meaning "${englishWord}" via AI translation`, 'vocabulary');
        }
    },

    displayMissingWords(suggestions) {
        const resultDiv = document.getElementById('translation-results');
        const contentDiv = document.getElementById('translation-content');
        
        if (!resultDiv || !contentDiv) return;

        if (suggestions.length === 0) {
            contentDiv.innerHTML = `
                <div class="translation-analysis">
                    <div class="translation-section">
                        <h5>✅ Complete Coverage</h5>
                        <p>All words in the text already exist in your vocabulary!</p>
                    </div>
                </div>
            `;
        } else {
            contentDiv.innerHTML = `
                <div class="translation-analysis">
                    <div class="translation-section">
                        <h5>🎯 Missing Words Analysis</h5>
                        <p>Found ${suggestions.length} words that need to be added to your vocabulary:</p>
                        <div class="missing-words-grid">
                            ${suggestions.map((word, index) => `
                                <div class="missing-word-card">
                                    <div class="missing-word-header">
                                        <strong>${word.english}</strong>
                                        <span class="word-pos-tag">${word.pos}</span>
                                    </div>
                                    <div class="missing-word-meaning">${word.meaning || word.english}</div>
                                    <div class="missing-word-priority">Priority: ${word.priority || 5}/10</div>
                                    <div class="missing-word-actions">
                                        <button class="btn btn-sm btn-success" onclick="AIAssistant.addMissingWord(${index})">
                                            ➕ Add to Vocabulary
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        }

        // Store suggestions for adding
        this.currentMissingWords = suggestions;
        resultDiv.style.display = 'block';
    },

    addMissingWord(index) {
        const word = this.currentMissingWords[index];
        if (!word) return;

        // Generate conlang word
        let conlangWord;
        if (window.generator && window.generator.generateWord) {
            conlangWord = window.generator.generateWord();
        } else {
            conlangWord = this.generateFallbackWord();
        }

        // Create new word object
        const newWord = {
            english: word.english,
            conlang: conlangWord,
            pos: word.pos,
            meaning: word.meaning || word.english,
            source: 'ai_translation',
            category: 'translation'
        };

        // Add to vocabulary
        if (window.appState) {
            const allWords = window.appState.getState('allWords') || [];
            allWords.push(newWord);
            window.appState.setState('allWords', allWords);
            
            if (window.generator && window.generator.language && window.generator.language.vocabulary) {
                window.generator.language.vocabulary.push(newWord);
            }
        }

        // Update displays
        if (window.VocabularyModule && window.VocabularyModule.updateDisplay) {
            window.VocabularyModule.updateDisplay();
        }

        // Update the card to show it was added
        const card = document.querySelector(`.missing-word-card:nth-child(${index + 1})`);
        if (card) {
            const actionsDiv = card.querySelector('.missing-word-actions');
            if (actionsDiv) {
                actionsDiv.innerHTML = `<span style="color: #28a745; font-weight: bold;">✅ Added: ${conlangWord}</span>`;
            }
        }

        // Update stats
        this.stats.aiAddedWords++;
        this.updateStats();

        showToast(`Added "${word.english}" → "${conlangWord}" to vocabulary!`, 'success');
    },

    async generateDerivatives() {
        const baseWord = document.getElementById('base-word-select')?.value;
        if (!baseWord) {
            showToast('Please select a base word', 'warning');
            return;
        }

        this.showLoading('generate-derivatives-btn');

        try {
            const context = this.getLanguageContext();
            const derivatives = await this.localAI.generateDerivatives(context, baseWord);
            
            this.displayMorphologicalResults(derivatives, 'Derivatives');
            showToast(`Generated ${derivatives.length} derivatives!`, 'success');

        } catch (error) {
            console.error('Error generating derivatives:', error);
            showToast('Failed to generate derivatives', 'error');
        }

        this.hideLoading('generate-derivatives-btn');
    },

    async generateCompounds() {
        this.showLoading('generate-compounds-btn');

        try {
            const context = this.getLanguageContext();
            const compounds = await this.localAI.generateCompounds(context);
            
            this.displayMorphologicalResults(compounds, 'Compound Words');
            showToast(`Generated ${compounds.length} compound words!`, 'success');

        } catch (error) {
            console.error('Error generating compounds:', error);
            showToast('Failed to generate compounds', 'error');
        }

        this.hideLoading('generate-compounds-btn');
    },

    async checkCulturalConsistency() {
        this.showLoading('check-consistency-btn');

        try {
            const context = this.getLanguageContext();
            const analysis = await this.localAI.analyzeCulturalConsistency(context);
            
            this.displayConsistencyAnalysis(analysis);
            showToast('Cultural consistency analysis completed!', 'success');

        } catch (error) {
            console.error('Error checking cultural consistency:', error);
            showToast('Failed to analyze cultural consistency', 'error');
        }

        this.hideLoading('check-consistency-btn');
    },

    // Helper methods
    getLanguageContext() {
        // Get vocabulary from multiple possible sources
        let vocabulary = [];
        
        // Try app state first (most likely location)
        if (window.appState) {
            const allWords = window.appState.getState('allWords');
            if (allWords && Array.isArray(allWords)) {
                vocabulary = allWords;
                console.log(`Found ${vocabulary.length} words in appState`);
            }
        }
        
        // If no words in app state, try other locations
        if (vocabulary.length === 0) {
            // Try vocabulary module
            if (window.VocabularyModule && window.VocabularyModule.words) {
                vocabulary = window.VocabularyModule.words;
                console.log(`Found ${vocabulary.length} words in VocabularyModule`);
            }
            
            // Try generator state
            if (vocabulary.length === 0 && window.generator && window.generator.generatedWords) {
                vocabulary = window.generator.generatedWords;
                console.log(`Found ${vocabulary.length} words in generator`);
            }
        }

        // Ensure vocabulary has the right format
        vocabulary = vocabulary.map(word => {
            if (typeof word === 'string') {
                return { english: word, conlang: word, pos: 'unknown' };
            }
            return {
                english: word.english || word.word || 'unknown',
                conlang: word.conlang || word.generated || word.english || 'unknown',
                pos: word.pos || word.partOfSpeech || 'unknown',
                meaning: word.meaning || word.english || 'unknown'
            };
        });

        console.log('Final vocabulary context:', vocabulary.length, 'words');
        
        return {
            phonology: window.generator?.language?.phonology || {},
            morphology: window.generator?.language?.morphology || {},
            syntax: window.generator?.language?.syntax || {},
            culture: window.generator?.language?.culture || {},
            vocabulary: vocabulary,
            grammarRules: window.generator?.language?.grammarRules || []
        };
    },

    displaySuggestions(suggestions) {
        const container = document.getElementById('suggestions-container');
        const section = document.getElementById('vocabulary-suggestions');
        
        if (!container || !section) return;

        if (suggestions.length === 0) {
            container.innerHTML = '<p class="text-center">No suggestions available for this category.</p>';
            section.style.display = 'block';
            return;
        }

        container.innerHTML = suggestions.map((suggestion, index) => `
            <div class="suggestion-card" data-index="${index}">
                <div class="suggestion-header">
                    <h5 class="suggestion-word">${suggestion.english}</h5>
                    <div class="suggestion-actions">
                        <button class="btn btn-sm btn-success" onclick="AIAssistant.acceptSuggestion(${index})">
                            ✅ Accept
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="AIAssistant.rejectSuggestion(${index})">
                            ❌ Reject
                        </button>
                    </div>
                </div>
                
                <div class="suggestion-meta">
                    <span class="suggestion-tag pos">${suggestion.pos}</span>
                    <span class="suggestion-tag category">${suggestion.category}</span>
                    <span class="suggestion-tag priority priority-${this.getPriorityClass(suggestion.priority)}">
                        Priority ${suggestion.priority}/10
                    </span>
                </div>
                
                <div class="suggestion-reasoning">
                    ${suggestion.reasoning}
                </div>
                
                <div class="confidence-bar">
                    <div class="confidence-label">Confidence: ${Math.round(suggestion.confidence * 100)}%</div>
                    <div class="confidence-progress">
                        <div class="confidence-fill" style="width: ${suggestion.confidence * 100}%"></div>
                    </div>
                </div>
            </div>
        `).join('');

        // Store suggestions for later use
        this.currentSuggestions = suggestions;
        section.style.display = 'block';
    },

    acceptSuggestion(index) {
        const suggestion = this.currentSuggestions[index];
        if (!suggestion) return;

        // Generate conlang word using the generator
        let conlangWord;
        if (window.generator && window.generator.generateWord) {
            conlangWord = window.generator.generateWord();
        } else {
            // Fallback word generation if generator not available
            conlangWord = this.generateFallbackWord();
        }
        
        // Create new word object
        const newWord = {
            english: suggestion.english,
            conlang: conlangWord,
            pos: suggestion.pos,
            meaning: suggestion.meaning || suggestion.english,
            derivedFrom: suggestion.baseWord || null,
            source: 'ai_suggestion',
            category: suggestion.category || 'general'
        };

        // Add to vocabulary using the same method as other parts of the app
        if (window.appState) {
            const allWords = window.appState.getState('allWords') || [];
            allWords.push(newWord);
            window.appState.setState('allWords', allWords);
            
            // Also update the generator's vocabulary if it exists
            if (window.generator && window.generator.language && window.generator.language.vocabulary) {
                window.generator.language.vocabulary.push(newWord);
            }
        }

        // Update vocabulary display
        if (window.VocabularyModule && window.VocabularyModule.updateDisplay) {
            window.VocabularyModule.updateDisplay();
        }

        // Update overview display
        if (window.OverviewModule && window.OverviewModule.updateOverview) {
            window.OverviewModule.updateOverview();
        }

        // Mark as accepted in UI
        const card = document.querySelector(`[data-index="${index}"]`);
        if (card) {
            card.classList.add('accepted');
            const actionsDiv = card.querySelector('.suggestion-actions');
            if (actionsDiv) {
                actionsDiv.innerHTML = `
                    <span style="color: #28a745; font-weight: bold;">✅ Added: ${conlangWord}</span>
                    <button class="btn btn-sm btn-secondary" onclick="AIAssistant.editAcceptedWord(${index})" style="margin-left: 10px;">
                        ✏️ Edit
                    </button>
                `;
            }
        }

        // Update stats
        this.stats.acceptedSuggestions++;
        this.stats.aiAddedWords++;
        this.updateStats();

        // Update the analysis overview to reflect new word count
        this.updateAnalysisOverview();

        showToast(`Added "${suggestion.english}" → "${conlangWord}" to vocabulary!`, 'success');
        
        // Log for debugging
        console.log('Added word:', newWord);
    },

    generateFallbackWord() {
        // Simple fallback word generation if main generator isn't available
        const consonants = ['p', 't', 'k', 'm', 'n', 'l', 'r', 's', 'h'];
        const vowels = ['a', 'e', 'i', 'o', 'u'];
        
        let word = '';
        const length = 2 + Math.floor(Math.random() * 3); // 2-4 syllables
        
        for (let i = 0; i < length; i++) {
            word += consonants[Math.floor(Math.random() * consonants.length)];
            word += vowels[Math.floor(Math.random() * vowels.length)];
        }
        
        return word;
    },

    editAcceptedWord(index) {
        const suggestion = this.currentSuggestions[index];
        if (!suggestion) return;

        // Find the word in vocabulary
        const allWords = window.appState ? window.appState.getState('allWords') || [] : [];
        const wordToEdit = allWords.find(w => w.english === suggestion.english && w.source === 'ai_suggestion');
        
        if (!wordToEdit) {
            showToast('Word not found in vocabulary', 'error');
            return;
        }

        // Create edit dialog
        const newConlang = prompt(`Edit the conlang word for "${suggestion.english}":`, wordToEdit.conlang);
        
        if (newConlang && newConlang.trim() !== '') {
            // Update the word
            wordToEdit.conlang = newConlang.trim();
            
            // Save to state
            if (window.appState) {
                window.appState.setState('allWords', allWords);
            }
            
            // Update displays
            if (window.VocabularyModule && window.VocabularyModule.updateDisplay) {
                window.VocabularyModule.updateDisplay();
            }
            
            // Update the suggestion card
            const card = document.querySelector(`[data-index="${index}"]`);
            if (card) {
                const actionsDiv = card.querySelector('.suggestion-actions');
                if (actionsDiv) {
                    actionsDiv.innerHTML = `
                        <span style="color: #28a745; font-weight: bold;">✅ Added: ${newConlang}</span>
                        <button class="btn btn-sm btn-secondary" onclick="AIAssistant.editAcceptedWord(${index})" style="margin-left: 10px;">
                            ✏️ Edit
                        </button>
                    `;
                }
            }
            
            showToast(`Updated "${suggestion.english}" → "${newConlang}"`, 'success');
        }
    },

    rejectSuggestion(index) {
        const card = document.querySelector(`[data-index="${index}"]`);
        if (card) {
            card.classList.add('rejected');
            card.querySelector('.suggestion-actions').innerHTML = '❌ Rejected';
        }
    },

    acceptAllSuggestions() {
        if (!this.currentSuggestions) return;
        
        this.currentSuggestions.forEach((_, index) => {
            const card = document.querySelector(`[data-index="${index}"]`);
            if (card && !card.classList.contains('accepted') && !card.classList.contains('rejected')) {
                this.acceptSuggestion(index);
            }
        });
    },

    rejectAllSuggestions() {
        if (!this.currentSuggestions) return;
        
        this.currentSuggestions.forEach((_, index) => {
            const card = document.querySelector(`[data-index="${index}"]`);
            if (card && !card.classList.contains('accepted') && !card.classList.contains('rejected')) {
                this.rejectSuggestion(index);
            }
        });
    },

    updateAnalysisOverview() {
        console.log('Updating analysis overview...');
        const context = this.getLanguageContext();
        console.log('Context for analysis:', context);
        
        // Update vocabulary count
        const vocabCountEl = document.getElementById('ai-vocab-count');
        if (vocabCountEl) {
            vocabCountEl.textContent = context.vocabulary.length;
            console.log(`Updated vocab count to: ${context.vocabulary.length}`);
        }

        // Calculate missing categories (simplified)
        const missingCategoriesEl = document.getElementById('ai-missing-categories');
        if (missingCategoriesEl && this.localAI) {
            const analysis = this.localAI.quickGapAnalysis(context);
            missingCategoriesEl.textContent = analysis.missingCategories || 0;
        }

        // Calculate completion percentage
        const completionEl = document.getElementById('ai-completion-percent');
        if (completionEl) {
            const completion = Math.min(100, Math.round((context.vocabulary.length / 500) * 100));
            completionEl.textContent = `${completion}%`;
        }

        // Cultural consistency score
        const culturalEl = document.getElementById('ai-cultural-consistency');
        if (culturalEl && this.localAI) {
            const score = this.localAI.quickCulturalCheck(context);
            culturalEl.textContent = score;
        }
    },

    updateStats() {
        // Update accuracy rate
        if (this.stats.totalSuggestions > 0) {
            this.stats.accuracyRate = Math.round((this.stats.acceptedSuggestions / this.stats.totalSuggestions) * 100);
        }

        // Update UI elements
        const elements = {
            'total-suggestions': this.stats.totalSuggestions,
            'accepted-suggestions': this.stats.acceptedSuggestions,
            'ai-added-words': this.stats.aiAddedWords,
            'accuracy-rate': this.stats.accuracyRate + '%'
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });

        // Save stats
        this.saveStats();
    },

    getPriorityClass(priority) {
        if (priority >= 8) return 'high';
        if (priority >= 5) return 'medium';
        return 'low';
    },

    showLoading(buttonId) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.disabled = true;
            button.innerHTML = '<div class="loading"></div> Processing...';
        }
    },

    hideLoading(buttonId) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.disabled = false;
            // Restore original text based on button ID
            const originalTexts = {
                'generate-suggestions-btn': '✨ Generate Smart Suggestions',
                'analyze-gaps-btn': '🔍 Analyze Vocabulary Gaps',
                'translate-text-btn': '🔄 Analyze & Translate',
                'identify-missing-btn': '🎯 Identify Missing Words Only',
                'generate-derivatives-btn': '📊 Generate Derivatives',
                'generate-compounds-btn': '🔗 Generate Compounds',
                'expand-word-family-btn': '👨‍👩‍👧‍👦 Expand Word Family',
                'check-consistency-btn': '🔍 Check Cultural Consistency',
                'suggest-cultural-vocab-btn': '🌟 Suggest Cultural Vocabulary'
            };
            button.innerHTML = originalTexts[buttonId] || '✨ Generate';
        }
    },

    // Settings management
    loadSettings() {
        const saved = localStorage.getItem('ai_assistant_settings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
    },

    saveSettings() {
        localStorage.setItem('ai_assistant_settings', JSON.stringify(this.settings));
    },

    loadStats() {
        const saved = localStorage.getItem('ai_assistant_stats');
        if (saved) {
            this.stats = { ...this.stats, ...JSON.parse(saved) };
        }
    },

    saveStats() {
        localStorage.setItem('ai_assistant_stats', JSON.stringify(this.stats));
    },

    updateUIState() {
        // Update provider selection
        const providerSelect = document.getElementById('ai-provider');
        if (providerSelect) {
            providerSelect.value = this.settings.provider;
        }

        // Update checkboxes
        const checkboxes = {
            'auto-apply-suggestions': this.settings.autoApply,
            'cultural-filtering': this.settings.culturalFiltering,
            'learning-mode': this.settings.learningMode
        };

        Object.entries(checkboxes).forEach(([id, checked]) => {
            const checkbox = document.getElementById(id);
            if (checkbox) checkbox.checked = checked;
        });

        // Show/hide API key section
        const apiKeySection = document.getElementById('api-key-section');
        if (apiKeySection) {
            apiKeySection.style.display = 
                (this.settings.provider === 'openai' || this.settings.provider === 'anthropic' || this.settings.provider === 'openrouter') 
                ? 'block' : 'none';
        }

        // Show/hide remote Ollama section
        const remoteSection = document.getElementById('remote-ollama-section');
        if (remoteSection) {
            remoteSection.style.display = 
                (this.settings.provider === 'remote_ollama') ? 'block' : 'none';
        }

        // Update remote inputs if they exist
        const remoteEndpointInput = document.getElementById('remote-endpoint-input');
        const remoteModelInput = document.getElementById('remote-model-input');
        if (remoteEndpointInput && this.settings.remoteEndpoint) {
            remoteEndpointInput.value = this.settings.remoteEndpoint;
        }
        if (remoteModelInput && this.settings.remoteModel) {
            remoteModelInput.value = this.settings.remoteModel;
        }
    }
};