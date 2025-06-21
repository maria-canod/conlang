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
            
            console.log(`🔍 Analyzing vocabulary: ${userVocab.length} existing words`);
            
            // Get cultural context from generator
            const culture = this.detectCulturalContext();
            
            // Initialize gap analyzer with current data
            this.gapAnalyzer.initialize(CoreVocabularyDatabase, userVocab, culture);
            
            // Run analysis
            this.currentAnalysis = this.gapAnalyzer.analyzeVocabularyGaps();
            
            // Generate filtered suggestions (no duplicates)
            this.currentSuggestions = this.generateFilteredSuggestions(userVocab);
            
            console.log(`📊 Analysis complete: ${this.currentSuggestions.length} unique suggestions available`);
            
            // Update UI
            this.updateSuggestionsUI();
            
        } catch (error) {
            console.error('Error in updateAnalysis:', error);
        }
    }

    generateFilteredSuggestions(userVocab) {
        if (!this.currentAnalysis || !this.currentAnalysis.suggestions) {
            return [];
        }
        
        // Create a Set of existing English words for fast lookup (case-insensitive)
        const existingWords = new Set(
            userVocab.map(word => word.english.toLowerCase().trim())
        );
        
        console.log(`🚫 Filtering out ${existingWords.size} existing words:`, Array.from(existingWords).slice(0, 10));
        
        // Filter out any suggestions that already exist
        const filteredSuggestions = this.currentAnalysis.suggestions.filter(suggestion => {
            const englishWord = suggestion.english.toLowerCase().trim();
            const exists = existingWords.has(englishWord);
            
            if (exists) {
                console.log(`🚫 Skipping existing word: "${suggestion.english}"`);
            }
            
            return !exists;
        });
        
        console.log(`✅ Filtered suggestions: ${this.currentAnalysis.suggestions.length} → ${filteredSuggestions.length}`);
        
        return filteredSuggestions;
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
        if (!this.initialized || !this.currentSuggestions) return [];
        
        // Get critical suggestions and ensure no duplicates
        const critical = this.currentSuggestions
            .filter(word => word.priority >= 9)
            .sort((a, b) => b.priority - a.priority)
            .slice(0, count);
        
        console.log(`🚨 Found ${critical.length} critical suggestions`);
        return critical;
    }


    // Get suggestions by category
    getCategorySuggestions(category, count = 8) {
        return this.getSmartSuggestions(count, { category });
    }

    // Get beginner suggestions (high priority, universal)
    getBeginnerSuggestions(count = 15) {
        if (!this.initialized || !this.currentSuggestions) {
            return [];
        }

        // Get suggestions with variety, ensuring no duplicates
        const suggestions = this.currentSuggestions
            .filter(s => s.priority >= 6)
            .sort((a, b) => {
                // Primary sort by priority
                if (b.priority !== a.priority) {
                    return b.priority - a.priority;
                }
                // Secondary sort by category variety
                return a.category.localeCompare(b.category);
            })
            .slice(0, count);

        console.log(`✨ Found ${suggestions.length} beginner suggestions`);
        return suggestions;
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
                <button class="btn btn-secondary" onclick="vocabularySmartSuggestions.showFullAnalysis()">
                    📊 View Full Analysis
                </button>
                <button class="btn btn-info" onclick="vocabularySmartSuggestions.refreshSuggestions()">
                    🔄 Refresh Suggestions
                </button>
                <button class="btn btn-success" onclick="vocabularySmartSuggestions.addAllVisibleSuggestions()">
                    ➕ Add All
                </button>
            </div>
        `;
    }

    // Render individual suggestion card
    renderSuggestionCard(word, type = 'recommended') {
        // Ensure we have proper data with fallbacks
        const english = word.english || 'unknown';
        const pos = word.pos || 'word';
        const priority = word.priority || 5;
        const category = word.category || 'general';
        
        // Generate proper reasoning text if missing or undefined
        let reasoning = word.reasoning;
        if (!reasoning || reasoning === 'undefined' || reasoning.trim() === '') {
            reasoning = this.generateReasoningText({
                english,
                pos,
                priority,
                category
            });
        }
        
        // Determine CSS classes
        const priorityClass = this.getPriorityClass(priority);
        const typeClass = type === 'critical' ? 'critical' : 'recommended';
        
        // Get display-friendly texts
        const priorityText = this.getPriorityText(priority);
        const categoryText = this.getCategoryDisplayText(category);
        
        return `
            <div class="suggestion-card ${typeClass} ${priorityClass}" data-word="${english}">
                <div class="suggestion-main">
                    <div class="suggestion-english">${english}</div>
                    <div class="suggestion-pos">${pos}</div>
                </div>
                
                <div class="suggestion-meta">
                    <span class="suggestion-priority">${priorityText}</span>
                    <span class="suggestion-category">${categoryText}</span>
                </div>
                
                <div class="suggestion-reasoning">${reasoning}</div>
                
                <button class="suggestion-add-btn" onclick="addSuggestedWordToVocabulary('${english}', '${pos}', '${category}', ${priority})">
                    ➕ Add to Dictionary
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

    addAllVisibleSuggestions() {
        if (window.vocabularySmartSuggestions) {
            window.vocabularySmartSuggestions.addAllVisibleSuggestions();
        } else if (window.VocabularySmartSuggestions) {
            window.VocabularySmartSuggestions.addAllVisibleSuggestions();
        } else {
            if (window.showToast) {
                window.showToast('Suggestions system not available', 'error');
            }
        }
    }

    addAllVisibleSuggestions() {
        console.log('🚀 Adding all visible suggestions...');
        
        // Get all currently displayed suggestions
        const critical = this.getCriticalSuggestions(5);
        const beginner = this.getBeginnerSuggestions(8);
        
        // Combine all visible suggestions (remove duplicates)
        const allVisible = [...critical];
        
        // Add beginner suggestions that aren't already in critical
        beginner.forEach(suggestion => {
            if (!allVisible.some(existing => existing.english === suggestion.english)) {
                allVisible.push(suggestion);
            }
        });
        
        if (allVisible.length === 0) {
            if (window.showToast) {
                window.showToast('No suggestions available to add!', 'warning');
            }
            return;
        }
        
        // Ask for confirmation
        const confirmMessage = `Add all ${allVisible.length} visible suggestions to your vocabulary?\n\n` +
            `This will add: ${allVisible.slice(0, 5).map(w => w.english).join(', ')}` +
            `${allVisible.length > 5 ? ` and ${allVisible.length - 5} more...` : ''}`;
        
        if (!confirm(confirmMessage)) {
            return;
        }
        
        console.log(`📝 Adding ${allVisible.length} suggestions...`);
        
        // Track success and failures
        let successCount = 0;
        let skipCount = 0;
        
        // Get existing words to check for duplicates
        const allWords = window.appState?.getState('allWords') || [];
        const existingWords = new Set(allWords.map(w => w.english.toLowerCase().trim()));
        
        // Add each suggestion
        allVisible.forEach((suggestion, index) => {
            // Check if word already exists
            if (existingWords.has(suggestion.english.toLowerCase().trim())) {
                console.log(`⏭️ Skipping existing word: ${suggestion.english}`);
                skipCount++;
                return;
            }
            
            try {
                // Generate conlang word
                const conlangWord = window.generator?.generateWord?.() || this.generateConlangForm(suggestion.english);
                
                const newWord = {
                    english: suggestion.english,
                    conlang: conlangWord,
                    pos: suggestion.pos,
                    type: 'bulk-suggestion',
                    notes: `Bulk suggestion (${suggestion.category}, priority ${suggestion.priority})`,
                    category: suggestion.category,
                    priority: suggestion.priority,
                    dateAdded: new Date().toISOString()
                };
                
                // Add to vocabulary
                allWords.push(newWord);
                
                // Track as existing for subsequent checks
                existingWords.add(suggestion.english.toLowerCase().trim());
                
                successCount++;
                console.log(`✅ Added: ${suggestion.english} → ${conlangWord}`);
                
            } catch (error) {
                console.error(`❌ Failed to add ${suggestion.english}:`, error);
            }
        });
        
        // Update state
        window.appState?.setState('allWords', allWords);
        
        // Update displays
        if (window.VocabularyModule) {
            window.VocabularyModule.updateDictionary();
            window.VocabularyModule.updateVocabularyStats();
        }
        
        // Track activity
        if (window.ActivityModule) {
            window.ActivityModule.addActivity(
                `Added ${successCount} words via bulk suggestions`, 
                'vocabulary'
            );
        }
        
        // Show results
        let message = `Successfully added ${successCount} words!`;
        if (skipCount > 0) {
            message += ` (${skipCount} already existed and were skipped)`;
        }
        
        if (window.showToast) {
            window.showToast(message, 'success');
        }
        
        // Refresh suggestions to update the display
        setTimeout(() => {
            console.log('🔄 Refreshing suggestions after bulk add...');
            this.updateAnalysis();
        }, 1000);
        
        console.log(`📊 Bulk add complete: ${successCount} added, ${skipCount} skipped`);
    }

    // Generate meaningful reasoning text
    generateReasoningText(word) {
        const priority = word.priority || 5;
        const category = word.category || 'general';
        const pos = word.pos || 'word';
        
        if (priority >= 9) {
            return `Critical ${category} word - Essential for basic communication`;
        } else if (priority >= 7) {
            return `Important ${category} ${pos} - Frequently used in daily conversation`;
        } else if (priority >= 5) {
            return `Useful ${category} vocabulary - Fills gap in ${pos} collection`;
        } else {
            return `Additional ${category} word - Enhances vocabulary depth`;
        }
    }

    // Get CSS class based on priority
    getPriorityClass(priority) {
        if (priority >= 9) return 'critical';
        if (priority >= 7) return 'high-priority';
        if (priority >= 5) return 'medium-priority';
        return 'low-priority';
    }

    // Get human-readable priority text
    getPriorityText(priority) {
        if (priority === 10) return 'Critical';
        if (priority === 9) return 'Essential';
        if (priority >= 7) return 'Important';
        if (priority >= 5) return 'Useful';
        return 'Optional';
    }

    // Get user-friendly category names
    getCategoryDisplayText(category) {
        const categoryMap = {
            'family': 'Family',
            'actions': 'Actions',
            'pronouns': 'Pronouns',
            'nature': 'Nature',
            'animals': 'Animals',
            'basic': 'Basic',
            'social': 'Social',
            'abstract': 'Abstract',
            'numbers': 'Numbers',
            'time': 'Time',
            'spatial': 'Location',
            'emotions': 'Emotions',
            'general': 'General'
        };
        
        return categoryMap[category] || category.charAt(0).toUpperCase() + category.slice(1);
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
// Export for global access
if (typeof window !== 'undefined') {
    window.VocabularySmartSuggestions = vocabularySmartSuggestions;  // Capital version
    window.vocabularySmartSuggestions = vocabularySmartSuggestions; // Lowercase version
}

// IMPROVED SUGGESTION CARD GENERATION
// Add this to your vocabulary-suggestions-integration.js file or replace the existing generateSuggestionCard function

// Enhanced suggestion card rendering function
function generateSuggestionCard(word) {
    // Ensure we have proper data
    const english = word.english || 'unknown';
    const pos = word.pos || 'word';
    const priority = word.priority || 5;
    const category = word.category || 'general';
    
    // Generate proper reasoning text
    let reasoning = word.reasoning;
    if (!reasoning || reasoning === 'undefined') {
        reasoning = generateReasoningText(word);
    }
    
    // Determine priority class and text
    const priorityClass = getPriorityClass(priority);
    const priorityText = getPriorityText(priority);
    
    // Generate category display text
    const categoryText = getCategoryDisplayText(category);
    
    return `
        <div class="suggestion-card ${priorityClass}" data-word="${english}">
            <div class="suggestion-main">
                <div class="suggestion-english">${english}</div>
                <div class="suggestion-pos">${pos}</div>
            </div>
            
            <div class="suggestion-meta">
                <span class="suggestion-priority">${priorityText}</span>
                <span class="suggestion-category">${categoryText}</span>
            </div>
            
            <div class="suggestion-reasoning">${reasoning}</div>
            
            <button class="suggestion-add-btn" onclick="addSuggestedWordToVocabulary('${english}', '${pos}', '${category}', ${priority})">
                ➕ Add to Dictionary
            </button>
        </div>
    `;
}

// Generate meaningful reasoning text based on word properties
function generateReasoningText(word) {
    const priority = word.priority || 5;
    const category = word.category || 'general';
    const pos = word.pos || 'word';
    
    // Priority-based reasoning
    if (priority >= 9) {
        return `Critical ${category} word - Essential for basic communication`;
    } else if (priority >= 7) {
        return `Important ${category} ${pos} - Frequently used in daily conversation`;
    } else if (priority >= 5) {
        return `Useful ${category} vocabulary - Fills gap in ${pos} collection`;
    } else {
        return `Additional ${category} word - Enhances vocabulary depth`;
    }
}

// Get CSS class based on priority
function getPriorityClass(priority) {
    if (priority >= 9) return 'critical';
    if (priority >= 7) return 'high-priority';
    if (priority >= 5) return 'medium-priority';
    return 'low-priority';
}

// Get human-readable priority text
function getPriorityText(priority) {
    if (priority === 10) return 'Critical';
    if (priority === 9) return 'Essential';
    if (priority >= 7) return 'Important';
    if (priority >= 5) return 'Useful';
    return 'Optional';
}

// Get user-friendly category names
function getCategoryDisplayText(category) {
    const categoryMap = {
        'family': 'Family',
        'actions': 'Actions',
        'pronouns': 'Pronouns',
        'nature': 'Nature',
        'animals': 'Animals',
        'basic': 'Basic',
        'social': 'Social',
        'abstract': 'Abstract',
        'numbers': 'Numbers',
        'time': 'Time',
        'spatial': 'Location',
        'emotions': 'Emotions',
        'general': 'General'
    };
    
    return categoryMap[category] || category.charAt(0).toUpperCase() + category.slice(1);
}

// Improved function to add suggested words
function addSuggestedWordToVocabulary(english, pos, category, priority) {
    try {
        // Generate conlang word using existing system
        const conlangWord = window.generator?.generateWord?.() || generateSimpleConlangWord(english);
        
        const newWord = {
            english: english,
            conlang: conlangWord,
            pos: pos,
            type: 'suggested',
            notes: `Smart suggestion (${category}, priority ${priority})`,
            category: category,
            priority: priority,
            dateAdded: new Date().toISOString()
        };

        // Add to vocabulary using existing system
        const allWords = window.appState?.getState('allWords') || [];
        allWords.push(newWord);
        window.appState?.setState('allWords', allWords);

        // Update displays
        if (window.VocabularyModule) {
            window.VocabularyModule.updateDictionary();
            window.VocabularyModule.updateVocabularyStats();
        }

        // Show success message
        if (window.showToast) {
            window.showToast(`Added "${conlangWord}" (${english}) to your vocabulary!`, 'success');
        }

        // Track activity
        if (window.ActivityModule) {
            window.ActivityModule.addActivity(
                `Added smart suggestion: ${english} → ${conlangWord}`, 
                'vocabulary'
            );
        }

        // Refresh suggestions
        if (window.vocabularySmartSuggestions) {
            setTimeout(() => {
                window.vocabularySmartSuggestions.updateAnalysis();
            }, 500);
        }

    } catch (error) {
        console.error('Error adding suggested word:', error);
        if (window.showToast) {
            window.showToast('Failed to add word: ' + error.message, 'error');
        }
    }
}

// Simple fallback word generator
function generateSimpleConlangWord(englishWord) {
    const consonants = ['p', 't', 'k', 'm', 'n', 's', 'l', 'r', 'w', 'j'];
    const vowels = ['a', 'e', 'i', 'o', 'u'];
    
    let word = '';
    const syllableCount = englishWord.length <= 4 ? 2 : 3;
    
    for (let i = 0; i < syllableCount; i++) {
        word += consonants[Math.floor(Math.random() * consonants.length)];
        word += vowels[Math.floor(Math.random() * vowels.length)];
    }
    
    return word;
}

// Update the showTestSuggestions function to use the new format
function showTestSuggestions() {
    const panel = document.getElementById('smart-suggestions-panel');
    if (panel) {
        panel.innerHTML = `
            <div class="suggestions-header">
                <h3>🧠 Smart Vocabulary Suggestions</h3>
                <div class="completion-score">
                    <span>Completion: <strong>25%</strong></span>
                    <div class="score-bar">
                        <div class="score-fill" style="width: 25%"></div>
                    </div>
                </div>
            </div>
            <div class="suggestion-grid">
                ${generateSuggestionCard({
                    english: 'mother',
                    pos: 'noun',
                    priority: 9,
                    category: 'family',
                    reasoning: 'Essential family word - Critical for basic communication'
                })}
                ${generateSuggestionCard({
                    english: 'water',
                    pos: 'noun',
                    priority: 10,
                    category: 'nature',
                    reasoning: 'Fundamental survival concept - Highest priority'
                })}
                ${generateSuggestionCard({
                    english: 'do',
                    pos: 'verb',
                    priority: 10,
                    category: 'actions',
                    reasoning: 'Essential action verb - Required for basic sentences'
                })}
                ${generateSuggestionCard({
                    english: 'good',
                    pos: 'adjective',
                    priority: 8,
                    category: 'basic',
                    reasoning: 'Common descriptive word - Important for daily conversation'
                })}
            </div>
            <div style="text-align:center;margin-top:20px;">
                <button class="btn btn-info" onclick="alert('This would show full vocabulary analysis')">📊 View Full Analysis</button>
            </div>
        `;
    }
}