// AI Assistant Module - Simplified for Vocabulary Expansion Only
window.AIAssistantModule = {
    stats: {
        aiSuggestedWords: 0,
        aiAddedWords: 0,
        aiSessions: 0,
        acceptanceRate: 0
    },

    init() {
        console.log('AI Assistant Module initialized (simplified version)');
        this.bindEvents();
        this.updateStats();
        this.populateBaseWordDropdowns();
    },

    bindEvents() {
        // Vocabulary expansion buttons
        const generateVocabBtn = document.getElementById('generate-vocabulary-btn');
        if (generateVocabBtn) {
            generateVocabBtn.onclick = () => this.generateVocabulary();
        }

        const fillGapsBtn = document.getElementById('fill-gaps-btn');
        if (fillGapsBtn) {
            fillGapsBtn.onclick = () => this.fillVocabularyGaps();
        }

        const culturalVocabBtn = document.getElementById('cultural-vocab-btn');
        if (culturalVocabBtn) {
            culturalVocabBtn.onclick = () => this.generateCulturalVocab();
        }

        // Batch operations
        const generateFamiliesBtn = document.getElementById('generate-word-families-btn');
        if (generateFamiliesBtn) {
            generateFamiliesBtn.onclick = () => this.generateWordFamilies();
        }

        const analyzeGapsBtn = document.getElementById('analyze-gaps-btn');
        if (analyzeGapsBtn) {
            analyzeGapsBtn.onclick = () => this.analyzeVocabularyGaps();
        }

        console.log('AI Assistant events bound');
    },

    async generateVocabulary() {
        const category = document.getElementById('suggestion-category')?.value || 'basic';
        const count = parseInt(document.getElementById('suggestion-count')?.value) || 10;

        this.showLoading('generate-vocabulary-btn');

        try {
            const context = this.getLanguageContext();
            const suggestions = await this.localGenerateVocabulary(context, category, count);
            
            this.displayVocabularySuggestions(suggestions);
            this.stats.aiSuggestedWords += suggestions.length;
            this.stats.aiSessions++;
            this.updateStats();
            
            showToast(`Generated ${suggestions.length} vocabulary suggestions!`, 'success');

        } catch (error) {
            console.error('Error generating vocabulary:', error);
            showToast('Failed to generate vocabulary suggestions', 'error');
        }

        this.hideLoading('generate-vocabulary-btn');
    },

    async fillVocabularyGaps() {
        this.showLoading('fill-gaps-btn');

        try {
            const context = this.getLanguageContext();
            const gapWords = await this.identifyVocabularyGaps(context);
            
            this.displayVocabularySuggestions(gapWords);
            this.stats.aiSuggestedWords += gapWords.length;
            this.stats.aiSessions++;
            this.updateStats();
            
            showToast(`Identified ${gapWords.length} critical missing words!`, 'success');

        } catch (error) {
            console.error('Error identifying gaps:', error);
            showToast('Failed to identify vocabulary gaps', 'error');
        }

        this.hideLoading('fill-gaps-btn');
    },

    async generateCulturalVocab() {
        this.showLoading('cultural-vocab-btn');

        try {
            const context = this.getLanguageContext();
            const culturalWords = await this.generateCulturallyRelevantVocab(context);
            
            this.displayVocabularySuggestions(culturalWords);
            this.stats.aiSuggestedWords += culturalWords.length;
            this.stats.aiSessions++;
            this.updateStats();
            
            showToast(`Generated ${culturalWords.length} culturally relevant words!`, 'success');

        } catch (error) {
            console.error('Error generating cultural vocabulary:', error);
            showToast('Failed to generate cultural vocabulary', 'error');
        }

        this.hideLoading('cultural-vocab-btn');
    },

    async generateWordFamilies() {
        this.showLoading('generate-word-families-btn');

        try {
            const context = this.getLanguageContext();
            const families = await this.localGenerateWordFamilies(context);
            
            this.displayBatchResults(families, 'Word Families');
            showToast(`Generated ${families.length} word families!`, 'success');

        } catch (error) {
            console.error('Error generating word families:', error);
            showToast('Failed to generate word families', 'error');
        }

        this.hideLoading('generate-word-families-btn');
    },

    async analyzeVocabularyGaps() {
        this.showLoading('analyze-gaps-btn');

        try {
            const context = this.getLanguageContext();
            const analysis = await this.performGapAnalysis(context);
            
            this.displayBatchResults([analysis], 'Gap Analysis');
            showToast('Vocabulary gap analysis completed!', 'success');

        } catch (error) {
            console.error('Error analyzing gaps:', error);
            showToast('Failed to analyze vocabulary gaps', 'error');
        }

        this.hideLoading('analyze-gaps-btn');
    },

    // Local vocabulary generation methods
    async localGenerateVocabulary(context, category, count) {
        // Basic vocabulary suggestions based on category
        const categories = {
            basic: ['water', 'fire', 'earth', 'sky', 'sun', 'moon', 'tree', 'stone', 'wind', 'rain'],
            nature: ['mountain', 'river', 'forest', 'flower', 'animal', 'bird', 'fish', 'grass', 'leaf', 'root'],
            social: ['family', 'friend', 'leader', 'community', 'tradition', 'law', 'peace', 'conflict', 'alliance', 'honor'],
            emotions: ['love', 'hate', 'fear', 'joy', 'anger', 'sadness', 'hope', 'despair', 'trust', 'doubt'],
            actions: ['walk', 'run', 'speak', 'listen', 'see', 'hear', 'touch', 'smell', 'taste', 'think'],
            objects: ['tool', 'weapon', 'container', 'clothing', 'shelter', 'food', 'drink', 'medicine', 'rope', 'fire'],
            abstract: ['time', 'space', 'truth', 'beauty', 'wisdom', 'strength', 'power', 'freedom', 'justice', 'knowledge'],
            cultural: ['god', 'spirit', 'ritual', 'ceremony', 'art', 'music', 'dance', 'story', 'legend', 'sacred']
        };

        const baseWords = category === 'all' ? 
            Object.values(categories).flat() : 
            categories[category] || categories.basic;

        // Filter out words that already exist
        const existingWords = context.vocabulary.map(v => v.english.toLowerCase());
        const newWords = baseWords.filter(word => !existingWords.includes(word.toLowerCase()));

        // Take only the requested count
        const selectedWords = newWords.slice(0, count);

        return selectedWords.map(word => ({
            english: word,
            priority: Math.floor(Math.random() * 10) + 1,
            category: category,
            reasoning: `Essential ${category} vocabulary for basic communication`,
            culturalNote: this.getCulturalNote(word, context.culture)
        }));
    },

    async identifyVocabularyGaps(context) {
        // Essential words every language should have
        const essentialWords = [
            'I', 'you', 'he', 'she', 'we', 'they', 'this', 'that',
            'what', 'where', 'when', 'why', 'how', 'who',
            'yes', 'no', 'good', 'bad', 'big', 'small',
            'one', 'two', 'three', 'many', 'few', 'all', 'none'
        ];

        const existingWords = context.vocabulary.map(v => v.english.toLowerCase());
        const missingEssential = essentialWords.filter(word => !existingWords.includes(word.toLowerCase()));

        return missingEssential.map(word => ({
            english: word,
            priority: 10,
            category: 'essential',
            reasoning: 'Critical gap - essential for basic communication',
            culturalNote: 'Universal concept needed in all languages'
        }));
    },

    async generateCulturallyRelevantVocab(context) {
        const culture = context.culture || {};
        const environment = culture.environment || 'temperate';
        const socialStructure = culture.socialStructure || 'tribal';

        let culturalWords = [];

        // Environment-based vocabulary
        switch (environment.toLowerCase()) {
            case 'desert':
                culturalWords = ['oasis', 'dune', 'sand', 'drought', 'mirage', 'camel', 'nomad', 'caravan'];
                break;
            case 'arctic':
                culturalWords = ['ice', 'snow', 'blizzard', 'seal', 'igloo', 'tundra', 'aurora', 'frost'];
                break;
            case 'tropical':
                culturalWords = ['jungle', 'vine', 'monsoon', 'humidity', 'coconut', 'palm', 'coral', 'lagoon'];
                break;
            case 'mountain':
                culturalWords = ['peak', 'valley', 'cliff', 'avalanche', 'altitude', 'echo', 'cave', 'glacier'];
                break;
            case 'forest':
                culturalWords = ['canopy', 'undergrowth', 'clearing', 'moss', 'mushroom', 'deer', 'oak', 'pine'];
                break;
            default:
                culturalWords = ['field', 'meadow', 'stream', 'hill', 'grove', 'meadow', 'harvest', 'season'];
        }

        // Social structure vocabulary
        switch (socialStructure.toLowerCase()) {
            case 'monarchy':
                culturalWords.push('king', 'queen', 'crown', 'throne', 'royal', 'noble', 'peasant', 'court');
                break;
            case 'tribal':
                culturalWords.push('chief', 'elder', 'tribe', 'clan', 'warrior', 'shaman', 'council', 'ritual');
                break;
            case 'democracy':
                culturalWords.push('vote', 'citizen', 'assembly', 'representative', 'law', 'freedom', 'equality', 'debate');
                break;
            case 'nomadic':
                culturalWords.push('wanderer', 'journey', 'camp', 'herd', 'migration', 'path', 'guide', 'traveler');
                break;
        }

        const existingWords = context.vocabulary.map(v => v.english.toLowerCase());
        const newCulturalWords = culturalWords.filter(word => !existingWords.includes(word.toLowerCase()));

        return newCulturalWords.slice(0, 15).map(word => ({
            english: word,
            priority: 8,
            category: 'cultural',
            reasoning: `Important for ${environment} ${socialStructure} culture`,
            culturalNote: `Reflects the ${environment} environment and ${socialStructure} social structure`
        }));
    },

    async localGenerateWordFamilies(context) {
        const vocabulary = context.vocabulary.filter(v => v.pos === 'noun' || v.pos === 'verb');
        const families = [];

        for (let i = 0; i < Math.min(5, vocabulary.length); i++) {
            const baseWord = vocabulary[i];
            const family = {
                root: baseWord.english,
                members: [
                    {
                        word: baseWord.english + 'er',
                        meaning: `one who ${baseWord.english}s`,
                        type: 'agent noun'
                    },
                    {
                        word: baseWord.english + 'ing',
                        meaning: `the act of ${baseWord.english}ing`,
                        type: 'gerund'
                    },
                    {
                        word: baseWord.english + 'able',
                        meaning: `capable of being ${baseWord.english}ed`,
                        type: 'adjective'
                    }
                ]
            };
            families.push(family);
        }

        return families;
    },

    async performGapAnalysis(context) {
        const vocabulary = context.vocabulary;
        const posCount = {};
        
        vocabulary.forEach(word => {
            const pos = word.pos || 'unknown';
            posCount[pos] = (posCount[pos] || 0) + 1;
        });

        const totalWords = vocabulary.length;
        const recommendations = [];

        // Analyze part-of-speech distribution
        if ((posCount.verb || 0) < totalWords * 0.25) {
            recommendations.push('Add more verbs - they make up less than 25% of your vocabulary');
        }
        if ((posCount.noun || 0) < totalWords * 0.4) {
            recommendations.push('Add more nouns - they should be about 40% of your vocabulary');
        }
        if ((posCount.adjective || 0) < totalWords * 0.15) {
            recommendations.push('Add more adjectives for descriptive richness');
        }

        return {
            analysis: 'Vocabulary Gap Analysis',
            totalWords: totalWords,
            posDistribution: posCount,
            recommendations: recommendations,
            completionEstimate: Math.min(100, Math.floor((totalWords / 1000) * 100)) + '%'
        };
    },

    // Display methods
    displayVocabularySuggestions(suggestions) {
        const container = document.getElementById('suggestions-content');
        const resultsDiv = document.getElementById('vocabulary-suggestions');
        
        if (!container || !resultsDiv) return;

        container.innerHTML = suggestions.map((suggestion, index) => `
            <div class="suggestion-item" style="border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin-bottom: 10px; background: white;">
                <div style="display: flex; justify-content: between; align-items: center;">
                    <div style="flex: 1;">
                        <div style="font-weight: bold; color: #2196F3; font-size: 1.1em;">${suggestion.english}</div>
                        <div style="color: #666; margin: 5px 0;">${suggestion.reasoning}</div>
                        ${suggestion.culturalNote ? `<div style="color: #ff9800; font-style: italic; font-size: 0.9em;">${suggestion.culturalNote}</div>` : ''}
                        <div style="margin-top: 8px;">
                            <span style="background: #e3f2fd; color: #1976d2; padding: 2px 8px; border-radius: 12px; font-size: 0.8em; margin-right: 8px;">
                                Priority: ${suggestion.priority}/10
                            </span>
                            <span style="background: #f3e5f5; color: #7b1fa2; padding: 2px 8px; border-radius: 12px; font-size: 0.8em;">
                                ${suggestion.category}
                            </span>
                        </div>
                    </div>
                    <div style="margin-left: 15px;">
                        <button class="btn btn-success btn-sm" onclick="AIAssistantModule.acceptSuggestion(${index}, '${suggestion.english}')">
                            ✅ Add
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        resultsDiv.style.display = 'block';
    },

    displayBatchResults(results, title) {
        const container = document.getElementById('batch-content');
        const resultsDiv = document.getElementById('batch-results');
        
        if (!container || !resultsDiv) return;

        let content = `<h4>${title}</h4>`;
        
        results.forEach(result => {
            if (result.analysis) {
                // Gap analysis result
                content += `
                    <div style="margin-bottom: 20px;">
                        <h5>${result.analysis}</h5>
                        <p><strong>Total Words:</strong> ${result.totalWords}</p>
                        <p><strong>Estimated Completion:</strong> ${result.completionEstimate}</p>
                        <h6>Part of Speech Distribution:</h6>
                        <ul>
                            ${Object.entries(result.posDistribution).map(([pos, count]) => 
                                `<li>${pos}: ${count} words (${Math.round((count/result.totalWords)*100)}%)</li>`
                            ).join('')}
                        </ul>
                        <h6>Recommendations:</h6>
                        <ul>
                            ${result.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                        </ul>
                    </div>
                `;
            } else if (result.root) {
                // Word family result
                content += `
                    <div style="margin-bottom: 20px; border: 1px solid #ddd; padding: 15px; border-radius: 8px;">
                        <h5>Family: "${result.root}"</h5>
                        ${result.members.map(member => `
                            <div style="margin: 8px 0; padding: 8px; background: #f5f5f5; border-radius: 4px;">
                                <strong>${member.word}</strong> (${member.type}): ${member.meaning}
                            </div>
                        `).join('')}
                    </div>
                `;
            }
        });

        container.innerHTML = content;
        resultsDiv.style.display = 'block';
    },

    acceptSuggestion(index, englishWord) {
        // Generate a conlang word for this suggestion
        const conlangWord = window.generator ? window.generator.generateWord() : this.generateSimpleWord();
        
        // Add to vocabulary
        const newWord = {
            english: englishWord,
            conlang: conlangWord,
            pos: 'unknown',
            addedBy: 'AI Assistant'
        };

        // Add to the vocabulary through the proper channels
        if (window.VocabularyModule && window.VocabularyModule.addWord) {
            window.VocabularyModule.addWord(newWord);
        } else if (window.appState) {
            const allWords = window.appState.getState('allWords') || [];
            allWords.push(newWord);
            window.appState.setState('allWords', allWords);
        }

        // Update the suggestion display
        const suggestionItems = document.querySelectorAll('.suggestion-item');
        if (suggestionItems[index]) {
            suggestionItems[index].innerHTML = `
                <div style="text-align: center; color: #4caf50; padding: 20px;">
                    <span style="font-weight: bold;">✅ Added: ${conlangWord}</span>
                </div>
            `;
        }

        // Update stats
        this.stats.aiAddedWords++;
        this.updateStats();

        showToast(`Added "${englishWord}" → "${conlangWord}" to vocabulary!`, 'success');
    },

    generateSimpleWord() {
        // Simple word generator if the main generator is not available
        const consonants = 'ptkbdgmnlrsf';
        const vowels = 'aiueo';
        let word = '';
        
        const length = Math.random() > 0.5 ? 2 : 3; // 2-3 syllables
        
        for (let i = 0; i < length; i++) {
            word += consonants[Math.floor(Math.random() * consonants.length)];
            word += vowels[Math.floor(Math.random() * vowels.length)];
        }
        
        return word;
    },

    getCulturalNote(word, culture) {
        if (!culture) return '';
        
        const environment = culture.environment || '';
        const socialStructure = culture.socialStructure || '';
        
        // Add contextual notes based on culture
        const notes = {
            'water': environment === 'desert' ? 'Extremely precious in desert cultures' : '',
            'fire': environment === 'arctic' ? 'Essential for survival in cold climates' : '',
            'leader': socialStructure === 'democracy' ? 'Elected representative' : socialStructure === 'monarchy' ? 'Hereditary ruler' : '',
            'family': socialStructure === 'tribal' ? 'Extended clan relationships important' : ''
        };
        
        return notes[word] || '';
    },

    // Helper methods
    getLanguageContext() {
        // Get vocabulary from multiple possible sources
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

        return {
            vocabulary: vocabulary,
            culture: window.generator?.language?.culture || {},
            phonology: window.generator?.language?.phonology || {},
            morphology: window.generator?.language?.morphology || {}
        };
    },

    populateBaseWordDropdowns() {
        // This method would populate dropdowns with existing vocabulary
        // Implementation depends on your existing vocabulary system
        console.log('Populating vocabulary dropdowns...');
    },

    updateStats() {
        // Update statistics display
        document.getElementById('ai-vocab-count').textContent = this.getLanguageContext().vocabulary.length;
        document.getElementById('ai-suggested-words').textContent = this.stats.aiSuggestedWords;
        document.getElementById('ai-words-added').textContent = this.stats.aiAddedWords;
        document.getElementById('ai-sessions').textContent = this.stats.aiSessions;
        
        const acceptanceRate = this.stats.aiSuggestedWords > 0 ? 
            Math.round((this.stats.aiAddedWords / this.stats.aiSuggestedWords) * 100) : 0;
        document.getElementById('ai-acceptance-rate').textContent = acceptanceRate + '%';
        
        // Update missing categories (simplified calculation)
        const vocab = this.getLanguageContext().vocabulary;
        const categories = ['basic', 'nature', 'social', 'emotions', 'actions'];
        const missingCount = categories.length - Math.min(categories.length, Math.floor(vocab.length / 50));
        document.getElementById('ai-missing-categories').textContent = Math.max(0, missingCount);
        
        // Update completion percentage
        const completionPercent = Math.min(100, Math.floor((vocab.length / 200) * 100));
        document.getElementById('ai-completion-percent').textContent = completionPercent + '%';
    },

    showLoading(buttonId) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.disabled = true;
            button.innerHTML = button.innerHTML.replace(/^[^a-zA-Z]*/, '⏳ ');
        }
    },

    hideLoading(buttonId) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.disabled = false;
            // Restore original text (this is simplified - you might want to store original text)
            button.innerHTML = button.innerHTML.replace('⏳ ', '✨ ');
        }
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (window.AIAssistantModule) window.AIAssistantModule.init();
    });
} else {
    if (window.AIAssistantModule) window.AIAssistantModule.init();
}