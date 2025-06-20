// Vocabulary Suggestions Integration Module
// js/modules/vocabulary-suggestions-integration.js

class VocabularySmartSuggestions {
    constructor() {
        this.gapAnalyzer = null;
        this.initialized = false;
        this.currentSuggestions = [];
        this.currentAnalysis = null;
    }

    // Initialize the system
    async initialize() {
        try {
            // Load the gap analyzer
            this.gapAnalyzer = new VocabularyGapAnalyzer();
            
            // Check if core database is available
            if (typeof CoreVocabularyDatabase === 'undefined') {
                throw new Error('Core vocabulary database not loaded');
            }

            this.initialized = true;
            console.log('✅ Vocabulary Smart Suggestions initialized');
            
            // Auto-analyze if user has vocabulary
            this.updateAnalysis();
            
        } catch (error) {
            console.error('❌ Failed to initialize suggestions:', error);
            showToast('Smart suggestions unavailable: ' + error.message, 'warning');
        }
    }

    // Update analysis when vocabulary changes
    updateAnalysis() {
        if (!this.initialized) return;

        try {
            // Get current user vocabulary
            const userVocab = window.appState?.getState('allWords') || [];
            
            // Get cultural context from generator
            const culture = this.detectCulturalContext();
            
            // Initialize gap analyzer with current data
            this.gapAnalyzer.initialize(CoreVocabularyDatabase, userVocab, culture);
            
            // Run analysis
            this.currentAnalysis = this.gapAnalyzer.analyzeVocabularyGaps();
            this.currentSuggestions = this.currentAnalysis.suggestions;
            
            console.log(`📊 Analysis updated: ${userVocab.length} words, ${this.currentSuggestions.length} suggestions`);
            
            // Update UI if suggestions panel is visible
            this.updateSuggestionsUI();
            
        } catch (error) {
            console.error('Error updating analysis:', error);
        }
    }

    // Detect cultural context from generator settings
    detectCulturalContext() {
        try {
            const culture = window.generator?.language?.culture;
            if (culture?.environment) {
                // Map environment to our cultural contexts
                const envMapping = {
                    'coastal': 'maritime',
                    'island': 'maritime', 
                    'ocean': 'maritime',
                    'desert': 'desert',
                    'arid': 'desert',
                    'forest': 'forest',
                    'woodland': 'forest',
                    'mountain': 'mountain',
                    'highland': 'mountain',
                    'agricultural': 'agricultural',
                    'farming': 'agricultural',
                    'plains': 'agricultural'
                };
                
                return envMapping[culture.environment] || 'all';
            }
        } catch (error) {
            console.log('No cultural context detected, using "all"');
        }
        
        return 'all';
    }

    // Get suggestions for different scenarios
    getSmartSuggestions(count = 10, options = {}) {
        if (!this.initialized || !this.currentSuggestions) {
            return [];
        }

        let suggestions = [...this.currentSuggestions];

        // Filter by options
        if (options.category) {
            suggestions = suggestions.filter(s => s.category === options.category);
        }
        
        if (options.minPriority) {
            suggestions = suggestions.filter(s => s.priority >= options.minPriority);
        }
        
        if (options.tags) {
            suggestions = suggestions.filter(s => 
                options.tags.some(tag => s.tags?.includes(tag))
            );
        }

        return suggestions.slice(0, count);
    }

    // Get critical suggestions (highest priority)
    getCriticalSuggestions(count = 5) {
        if (!this.initialized) return [];
        return this.gapAnalyzer.getCriticalGaps().slice(0, count);
    }

    // Get suggestions by category
    getCategorySuggestions(category, count = 8) {
        return this.getSmartSuggestions(count, { category });
    }

    // Get beginner suggestions (high priority, universal)
    getBeginnerSuggestions(count = 15) {
        return this.getSmartSuggestions(count, { 
            minPriority: 7,
            tags: ['essential', 'universal']
        });
    }

    // Add suggested word to vocabulary
    async addSuggestedWord(suggestion) {
        try {
            // Generate conlang form using existing word generation
            const conlangWord = window.generator?.generateWord?.() || this.generateConlangForm(suggestion.english);
            
            const newWord = {
                english: suggestion.english,
                conlang: conlangWord,
                pos: suggestion.pos,
                type: 'suggested',
                notes: suggestion.reasoning || 'Smart suggestion',
                category: suggestion.category,
                priority: suggestion.priority,
                dateAdded: new Date().toISOString()
            };

            // Add to vocabulary using existing system
            const allWords = window.appState.getState('allWords') || [];
            allWords.push(newWord);
            window.appState.setState('allWords', allWords);

            // Update vocabulary display
            if (window.VocabularyModule) {
                window.VocabularyModule.updateDictionary();
                window.VocabularyModule.updateVocabularyStats();
            }

            // Refresh analysis
            this.updateAnalysis();

            showToast(`Added "${newWord.conlang}" (${newWord.english}) to vocabulary!`, 'success');
            
            // Track activity
            if (window.ActivityModule) {
                window.ActivityModule.addActivity(
                    `Added smart suggestion: ${newWord.english} → ${newWord.conlang}`, 
                    'vocabulary'
                );
            }

            return newWord;

        } catch (error) {
            console.error('Error adding suggested word:', error);
            showToast('Failed to add word: ' + error.message, 'error');
        }
    }

    // Generate conlang form for suggested word (fallback)
    generateConlangForm(englishWord) {
        // Simple fallback word generation if main generator unavailable
        const consonants = ['p', 't', 'k', 'm', 'n', 's', 'l', 'r'];
        const vowels = ['a', 'e', 'i', 'o', 'u'];
        
        let word = '';
        const length = 2 + Math.floor(Math.random() * 3); // 2-4 syllables
        
        for (let i = 0; i < length; i++) {
            word += consonants[Math.floor(Math.random() * consonants.length)];
            word += vowels[Math.floor(Math.random() * vowels.length)];
        }
        
        return word;
    }

    // Update suggestions UI
    updateSuggestionsUI() {
        // Update suggestions panel if it exists
        const panel = document.getElementById('smart-suggestions-panel');
        if (panel && this.currentAnalysis) {
            this.renderSuggestionsPanel();
        }

        // Update any suggestion counts in the UI
        this.updateSuggestionCounts();
    }

    // Update suggestion counts in navigation/buttons
    updateSuggestionCounts() {
        const criticalCount = this.getCriticalSuggestions().length;
        const totalSuggestions = this.currentSuggestions?.length || 0;

        // Update any UI elements that show suggestion counts
        const criticalBadge = document.getElementById('critical-suggestions-count');
        if (criticalBadge) {
            criticalBadge.textContent = criticalCount;
            criticalBadge.style.display = criticalCount > 0 ? 'inline' : 'none';
        }

        const totalBadge = document.getElementById('total-suggestions-count');
        if (totalBadge) {
            totalBadge.textContent = totalSuggestions;
        }
    }

    // Get analysis summary for dashboard
    getAnalysisSummary() {
        if (!this.currentAnalysis) return null;

        const analysis = this.currentAnalysis;
        return {
            completionScore: analysis.completionScore,
            totalWords: analysis.userWordCount,
            criticalGaps: this.getCriticalSuggestions().length,
            topCategory: this.getTopCategoryGap(),
            suggestion: this.currentSuggestions[0] // Top suggestion
        };
    }

    // Get category with biggest gap
    getTopCategoryGap() {
        if (!this.currentAnalysis?.categories) return null;

        return Object.entries(this.currentAnalysis.categories)
            .sort(([,a], [,b]) => b.gapPercentage - a.gapPercentage)[0];
    }

    // Render the suggestions panel
    renderSuggestionsPanel() {
        const panel = document.getElementById('smart-suggestions-panel');
        if (!panel || !this.currentAnalysis) return;

        const critical = this.getCriticalSuggestions(5);
        const beginner = this.getBeginnerSuggestions(10);
        const completion = this.currentAnalysis.completionScore;

        panel.innerHTML = `
            <div class="suggestions-header">
                <h3>🧠 Smart Vocabulary Suggestions</h3>
                <div class="completion-score">
                    <span class="score-label">Completion:</span>
                    <span class="score-value">${completion}%</span>
                    <div class="score-bar">
                        <div class="score-fill" style="width: ${completion}%"></div>
                    </div>
                </div>
            </div>

            ${critical.length > 0 ? `
                <div class="suggestion-section critical">
                    <h4>🚨 Critical Gaps (Priority ${critical[0]?.priority || 10})</h4>
                    <div class="suggestion-grid">
                        ${critical.map(word => this.renderSuggestionCard(word, 'critical')).join('')}
                    </div>
                </div>
            ` : ''}

            <div class="suggestion-section recommended">
                <h4>✨ Recommended Next Words</h4>
                <div class="suggestion-grid">
                    ${beginner.slice(0, 8).map(word => this.renderSuggestionCard(word, 'recommended')).join('')}
                </div>
            </div>

            <div class="suggestions-footer">
                <button class="btn btn-secondary" onclick="VocabularySmartSuggestions.showFullAnalysis()">
                    📊 View Full Analysis
                </button>
                <button class="btn btn-info" onclick="VocabularySmartSuggestions.refreshSuggestions()">
                    🔄 Refresh Suggestions
                </button>
            </div>
        `;
    }

    // Render individual suggestion card
    renderSuggestionCard(word, type = 'recommended') {
        const priorityClass = `priority-${word.priority}`;
        const typeClass = type === 'critical' ? 'critical' : 'recommended';
        
        return `
            <div class="suggestion-card ${typeClass} ${priorityClass}" data-word="${word.english}">
                <div class="suggestion-main">
                    <span class="suggestion-english">${word.english}</span>
                    <span class="suggestion-pos">${word.pos}</span>
                </div>
                <div class="suggestion-meta">
                    <span class="suggestion-priority">P${word.priority}</span>
                    <span class="suggestion-category">${word.category}</span>
                </div>
                <div class="suggestion-reasoning">${word.reasoning}</div>
                <button class="suggestion-add-btn" onclick="vocabularySmartSuggestions.addSuggestedWord(${JSON.stringify(word).replace(/"/g, '&quot;')})">
                    ➕ Add
                </button>
            </div>
        `;
    }

    // Public methods for UI
    showFullAnalysis() {
        if (!this.currentAnalysis) return;
        
        const report = this.gapAnalyzer.generateAnalysisReport();
        
        // Show in modal or new window
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h3>📊 Complete Vocabulary Analysis</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <pre style="background: #f5f5f5; padding: 20px; border-radius: 6px; line-height: 1.5;">${report}</pre>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    refreshSuggestions() {
        this.updateAnalysis();
        showToast('Suggestions refreshed!', 'success');
    }
}

// Create global instance
const vocabularySmartSuggestions = new VocabularySmartSuggestions();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    vocabularySmartSuggestions.initialize();
});

// Hook into vocabulary changes
document.addEventListener('vocabularyUpdated', () => {
    vocabularySmartSuggestions.updateAnalysis();
});

// Export for global access
if (typeof window !== 'undefined') {
    window.VocabularySmartSuggestions = vocabularySmartSuggestions;
}