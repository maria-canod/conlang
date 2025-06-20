// Intelligent Vocabulary Gap Analysis System
// js/modules/vocabulary-suggestions.js

class VocabularyGapAnalyzer {
    constructor() {
        this.coreDatabase = null;
        this.userVocabulary = [];
        this.culturalContext = 'all';
        this.analysisResults = null;
    }

    // Initialize with core database and user's current vocabulary
    initialize(coreDatabase, userVocabulary, culture = 'all') {
        this.coreDatabase = coreDatabase;
        this.userVocabulary = userVocabulary || [];
        this.culturalContext = culture;
        console.log(`📊 Gap Analyzer initialized with ${this.userVocabulary.length} user words`);
    }

    // Main gap analysis function
    analyzeVocabularyGaps() {
        if (!this.coreDatabase) {
            throw new Error('Core database not loaded!');
        }

        const analysis = {
            timestamp: new Date(),
            userWordCount: this.userVocabulary.length,
            coreWordCount: this.coreDatabase.getAllWords().length,
            culture: this.culturalContext,
            categories: {},
            priorities: {},
            suggestions: [],
            completionScore: 0
        };

        // 1. Analyze by category
        analysis.categories = this.analyzeCategoryGaps();
        
        // 2. Analyze by priority level
        analysis.priorities = this.analyzePriorityGaps();
        
        // 3. Generate smart suggestions
        analysis.suggestions = this.generateSmartSuggestions();
        
        // 4. Calculate completion score
        analysis.completionScore = this.calculateCompletionScore();
        
        this.analysisResults = analysis;
        return analysis;
    }

    // Analyze gaps by semantic category
    analyzeCategoryGaps() {
        const categoryAnalysis = {};
        const categories = this.coreDatabase.metadata.categories;
        
        categories.forEach(category => {
            const coreWords = this.coreDatabase.getWordsByCategory(category);
            const culturallyRelevant = this.filterByCulture(coreWords);
            const userHasInCategory = this.getUserWordsInCategory(category);
            
            const missing = culturallyRelevant.filter(coreWord => 
                !this.userHasWord(coreWord.english)
            );

            const gapPercentage = culturallyRelevant.length > 0 ? 
                (missing.length / culturallyRelevant.length) * 100 : 0;

            categoryAnalysis[category] = {
                totalAvailable: culturallyRelevant.length,
                userHas: userHasInCategory.length,
                missing: missing.length,
                gapPercentage: Math.round(gapPercentage),
                priority: this.calculateCategoryPriority(category, missing),
                topMissing: missing
                    .sort((a, b) => b.priority - a.priority)
                    .slice(0, 5),
                status: this.getCategoryStatus(gapPercentage)
            };
        });

        return categoryAnalysis;
    }

    // Analyze gaps by priority level
    analyzePriorityGaps() {
        const priorityAnalysis = {};
        
        for (let priority = 10; priority >= 1; priority--) {
            const coreWordsAtPriority = this.coreDatabase.getAllWords()
                .filter(word => word.priority === priority);
            
            const culturallyRelevant = this.filterByCulture(coreWordsAtPriority);
            const missing = culturallyRelevant.filter(word => 
                !this.userHasWord(word.english)
            );

            priorityAnalysis[`priority_${priority}`] = {
                totalAvailable: culturallyRelevant.length,
                missing: missing.length,
                missingWords: missing.slice(0, 10), // Top 10 missing
                completionRate: culturallyRelevant.length > 0 ? 
                    Math.round(((culturallyRelevant.length - missing.length) / culturallyRelevant.length) * 100) : 100
            };
        }

        return priorityAnalysis;
    }

    // Generate intelligent word suggestions
    generateSmartSuggestions(count = 20) {
        const allCoreWords = this.coreDatabase.getAllWords();
        const culturallyRelevant = this.filterByCulture(allCoreWords);
        
        // Filter out words user already has
        const available = culturallyRelevant.filter(word => 
            !this.userHasWord(word.english)
        );

        // Smart scoring algorithm
        const scoredSuggestions = available.map(word => {
            let score = word.priority * 10; // Base score from priority
            
            // Boost for category gaps
            const categoryGap = this.analysisResults?.categories?.[word.category]?.gapPercentage || 0;
            score += (categoryGap / 100) * 30;
            
            // Boost for high frequency words
            if (word.frequency === 'very_high') score += 20;
            else if (word.frequency === 'high') score += 10;
            else if (word.frequency === 'medium') score += 5;
            
            // Boost for essential tags
            if (word.tags?.includes('essential')) score += 25;
            if (word.tags?.includes('universal')) score += 15;
            
            // Boost for communication/social words (always important)
            if (word.tags?.includes('communication')) score += 10;
            if (word.tags?.includes('social')) score += 8;
            
            // Cultural relevance boost
            if (this.isCulturallyImportant(word)) score += 15;
            
            return {
                ...word,
                suggestionScore: Math.round(score),
                reasoning: this.generateReasoning(word, categoryGap)
            };
        });

        // Sort by score and return top suggestions
        return scoredSuggestions
            .sort((a, b) => b.suggestionScore - a.suggestionScore)
            .slice(0, count);
    }

    // Calculate overall completion score
    calculateCompletionScore() {
        const priorities = this.analysisResults?.priorities;
        if (!priorities) return 0;

        let weightedScore = 0;
        let totalWeight = 0;

        // Weight higher priorities more heavily
        for (let priority = 10; priority >= 1; priority--) {
            const data = priorities[`priority_${priority}`];
            if (data && data.totalAvailable > 0) {
                const weight = priority * priority; // Exponential weighting
                weightedScore += data.completionRate * weight;
                totalWeight += weight;
            }
        }

        return totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;
    }

    // Helper functions
    filterByCulture(words) {
        if (this.culturalContext === 'all') return words;
        
        return words.filter(word => 
            word.cultural === 'all' || 
            word.cultural === this.culturalContext ||
            (Array.isArray(word.cultural) && word.cultural.includes(this.culturalContext))
        );
    }

    userHasWord(englishWord) {
        return this.userVocabulary.some(userWord => 
            userWord.english?.toLowerCase() === englishWord.toLowerCase()
        );
    }

    getUserWordsInCategory(category) {
        // This is a simplified version - you might want to tag user words with categories
        return this.userVocabulary.filter(word => word.category === category);
    }

    calculateCategoryPriority(category, missingWords) {
        if (missingWords.length === 0) return 'low';
        
        const avgPriority = missingWords.reduce((sum, word) => sum + word.priority, 0) / missingWords.length;
        const hasEssentials = missingWords.some(word => word.tags?.includes('essential'));
        
        if (avgPriority >= 8 || hasEssentials) return 'critical';
        if (avgPriority >= 6) return 'high';
        if (avgPriority >= 4) return 'medium';
        return 'low';
    }

    getCategoryStatus(gapPercentage) {
        if (gapPercentage >= 80) return 'critical';
        if (gapPercentage >= 60) return 'needs-attention';
        if (gapPercentage >= 40) return 'developing';
        if (gapPercentage >= 20) return 'good';
        return 'excellent';
    }

    isCulturallyImportant(word) {
        if (this.culturalContext === 'all') return false;
        
        const culturalTags = {
            'maritime': ['water', 'sea', 'boat', 'fishing'],
            'desert': ['sand', 'arid', 'camel', 'oasis'],
            'forest': ['tree', 'hunting', 'wood'],
            'agricultural': ['farming', 'grain', 'harvest'],
            'mountain': ['hill', 'climbing', 'stone']
        };

        const relevantTags = culturalTags[this.culturalContext] || [];
        return word.tags?.some(tag => relevantTags.includes(tag));
    }

    generateReasoning(word, categoryGap) {
        const reasons = [];
        
        if (word.priority >= 9) reasons.push('Essential for basic communication');
        else if (word.priority >= 7) reasons.push('Important for daily conversation');
        else if (word.priority >= 5) reasons.push('Useful for expanded vocabulary');
        
        if (categoryGap >= 70) reasons.push(`Major gap in ${word.category} category`);
        else if (categoryGap >= 40) reasons.push(`Filling gap in ${word.category}`);
        
        if (word.tags?.includes('universal')) reasons.push('Universal concept');
        if (this.isCulturallyImportant(word)) reasons.push(`Important for ${this.culturalContext} culture`);
        
        return reasons.slice(0, 2).join('; ');
    }

    // Public methods for UI integration
    getSuggestionsByCategory(category, count = 10) {
        if (!this.analysisResults) this.analyzeVocabularyGaps();
        
        return this.analysisResults.suggestions
            .filter(word => word.category === category)
            .slice(0, count);
    }

    getSuggestionsByPriority(minPriority = 7, count = 15) {
        if (!this.analysisResults) this.analyzeVocabularyGaps();
        
        return this.analysisResults.suggestions
            .filter(word => word.priority >= minPriority)
            .slice(0, count);
    }

    getCriticalGaps() {
        if (!this.analysisResults) this.analyzeVocabularyGaps();
        
        const critical = [];
        
        // Critical priority gaps
        Object.entries(this.analysisResults.priorities).forEach(([key, data]) => {
            if (key.includes('priority_10') || key.includes('priority_9')) {
                if (data.missing > 0) {
                    critical.push(...data.missingWords.slice(0, 5));
                }
            }
        });

        // Critical category gaps
        Object.entries(this.analysisResults.categories).forEach(([category, data]) => {
            if (data.priority === 'critical') {
                critical.push(...data.topMissing.slice(0, 3));
            }
        });

        // Remove duplicates and sort by priority
        const unique = critical.filter((word, index, self) => 
            index === self.findIndex(w => w.english === word.english)
        );

        return unique
            .sort((a, b) => b.priority - a.priority)
            .slice(0, 10);
    }

    // Generate a human-readable analysis report
    generateAnalysisReport() {
        if (!this.analysisResults) this.analyzeVocabularyGaps();
        
        const analysis = this.analysisResults;
        const report = [];
        
        report.push(`📊 Vocabulary Analysis Report`);
        report.push(`Generated: ${analysis.timestamp.toLocaleString()}`);
        report.push(`Current vocabulary: ${analysis.userWordCount} words`);
        report.push(`Completion score: ${analysis.completionScore}%`);
        report.push('');
        
        // Priority analysis
        report.push('🎯 Priority Analysis:');
        const priorities = analysis.priorities;
        for (let p = 10; p >= 7; p--) {
            const data = priorities[`priority_${p}`];
            if (data && data.totalAvailable > 0) {
                report.push(`  Priority ${p}: ${data.completionRate}% complete (${data.missing} missing)`);
            }
        }
        report.push('');
        
        // Category gaps
        report.push('📂 Category Gaps:');
        Object.entries(analysis.categories)
            .sort(([,a], [,b]) => b.gapPercentage - a.gapPercentage)
            .slice(0, 5)
            .forEach(([category, data]) => {
                report.push(`  ${category}: ${data.gapPercentage}% gap (${data.missing} missing)`);
            });
        
        return report.join('\n');
    }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VocabularyGapAnalyzer;
} else if (typeof window !== 'undefined') {
    window.VocabularyGapAnalyzer = VocabularyGapAnalyzer;
}