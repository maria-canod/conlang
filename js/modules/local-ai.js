// Local AI Vocabulary Generator - Smart pattern-based suggestions
// File: js/modules/local-ai.js

class LocalVocabularyAI {
    constructor() {
        this.semanticFields = {};
        this.derivationRules = [];
        this.compoundPatterns = {};
        this.priorityWords = {};
        this.culturalMappings = {};
        this.isInitialized = false;
    }

    async init() {
        console.log('🧠 Initializing Local AI...');
        
        try {
            await this.loadSemanticFields();
            await this.loadDerivationRules();
            await this.loadCompoundPatterns();
            await this.loadPriorityWords();
            await this.loadCulturalMappings();
            
            this.isInitialized = true;
            console.log('✅ Local AI initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize Local AI:', error);
            throw error;
        }
    }

    async generateSuggestions(request) {
        if (!this.isInitialized) {
            throw new Error('Local AI not initialized');
        }

        const { type, context, targetCount = 10 } = request;
        
        switch (type) {
            case 'basic_suggestions':
                return await this.generateBasicSuggestions(context, targetCount);
            
            case 'cultural_words':
                return await this.generateCulturalVocabulary(context, targetCount);
            
            case 'morphological':
                return await this.generateMorphologicalDerivations(context, request.baseWord, targetCount);
            
            case 'semantic_field':
                return await this.generateSemanticField(context, request.category, targetCount);
            
            case 'translation_support':
                return await this.generateTranslationSupport(context, request.targetWords);
                
            default:
                console.warn(`Unknown request type: ${type}`);
                return await this.generateBasicSuggestions(context, targetCount);
        }
    }

    // Generate essential missing vocabulary
    async generateBasicSuggestions(context, count) {
        const suggestions = [];
        const existingWords = new Set(context.vocabulary.map(w => w.english.toLowerCase()));
        const analysis = context.vocabularyAnalysis;

        // Prioritize by missing categories and urgency
        const prioritizedCategories = this.getPrioritizedCategories(analysis);
        
        for (const categoryData of prioritizedCategories) {
            if (suggestions.length >= count) break;
            
            const categoryWords = this.semanticFields[categoryData.category] || [];
            const availableWords = categoryWords.filter(word => 
                !existingWords.has(word.english.toLowerCase()) &&
                this.isCulturallyAppropriate(word, context.culture)
            );

            // Add top words from this category
            const wordsToAdd = Math.min(
                categoryData.needed,
                availableWords.length,
                count - suggestions.length
            );

            for (let i = 0; i < wordsToAdd; i++) {
                const word = availableWords[i];
                suggestions.push({
                    english: word.english,
                    meaning: word.meaning || word.english,
                    pos: word.pos || 'noun',
                    category: categoryData.category,
                    priority: categoryData.priority,
                    reasoning: `Essential ${categoryData.category.replace('_', ' ')} vocabulary`,
                    confidence: 0.9,
                    source: 'local_ai_basic'
                });
            }
        }

        return suggestions;
    }

    // Generate culturally appropriate vocabulary
    async generateCulturalVocabulary(context, count) {
        const suggestions = [];
        const culture = context.culture || {};
        const existingWords = new Set(context.vocabulary.map(w => w.english.toLowerCase()));

        // Get culture-specific word lists
        const cultureType = culture.type || 'generic';
        const culturalWords = this.culturalMappings[cultureType] || [];

        // Add mythology-related terms
        if (context.mythology) {
            const mythologyTerms = this.extractMythologyTerms(context.mythology);
            culturalWords.push(...mythologyTerms);
        }

        // Add tradition-related terms
        if (context.traditions) {
            const traditionTerms = this.extractTraditionTerms(context.traditions);
            culturalWords.push(...traditionTerms);
        }

        // Filter and prioritize
        const availableWords = culturalWords.filter(word => 
            !existingWords.has(word.english.toLowerCase())
        );

        // Sort by cultural relevance
        availableWords.sort((a, b) => (b.culturalRelevance || 0.5) - (a.culturalRelevance || 0.5));

        // Take top suggestions
        for (let i = 0; i < Math.min(count, availableWords.length); i++) {
            const word = availableWords[i];
            suggestions.push({
                english: word.english,
                meaning: word.meaning || word.english,
                pos: word.pos || 'noun',
                category: 'cultural',
                priority: 8,
                reasoning: `Important for ${cultureType} culture`,
                confidence: word.culturalRelevance || 0.8,
                culturalRelevance: word.culturalRelevance || 0.8,
                source: 'local_ai_cultural'
            });
        }

        return suggestions;
    }

    // Generate morphological derivations from existing words
    async generateMorphologicalDerivations(context, baseWord, count) {
        const suggestions = [];
        
        if (!baseWord) {
            // Select a good base word from existing vocabulary
            baseWord = this.selectBaseWordForDerivation(context.vocabulary);
        }

        if (!baseWord) {
            return suggestions; // No suitable base word found
        }

        // Apply derivation rules
        for (const rule of this.derivationRules) {
            if (suggestions.length >= count) break;
            
            if (rule.appliesTo(baseWord)) {
                const derived = rule.apply(baseWord, context);
                if (derived && this.isValidDerivation(derived, context)) {
                    suggestions.push({
                        english: derived.english,
                        meaning: derived.meaning,
                        pos: derived.pos,
                        category: 'morphological',
                        priority: 7,
                        reasoning: `Derived from "${baseWord.english}" using ${rule.description}`,
                        confidence: 0.85,
                        derivedFrom: baseWord.english,
                        morphology: rule.morphology,
                        source: 'local_ai_morphological'
                    });
                }
            }
        }

        return suggestions;
    }

    // Generate words for a specific semantic field
    async generateSemanticField(context, category, count) {
        const suggestions = [];
        const existingWords = new Set(context.vocabulary.map(w => w.english.toLowerCase()));
        
        const fieldWords = this.semanticFields[category] || [];
        const culture = context.culture || {};

        // Filter for cultural appropriateness and novelty
        const availableWords = fieldWords.filter(word => 
            !existingWords.has(word.english.toLowerCase()) &&
            this.isCulturallyAppropriate(word, culture)
        );

        // Sort by usefulness within the category
        availableWords.sort((a, b) => (b.frequency || 0.5) - (a.frequency || 0.5));

        // Generate suggestions
        for (let i = 0; i < Math.min(count, availableWords.length); i++) {
            const word = availableWords[i];
            suggestions.push({
                english: word.english,
                meaning: word.meaning || word.english,
                pos: word.pos || 'noun',
                category: category,
                priority: 6,
                reasoning: `Essential ${category.replace('_', ' ')} vocabulary`,
                confidence: 0.8,
                source: 'local_ai_semantic'
            });
        }

        return suggestions;
    }

    // Generate words needed for translation
    async generateTranslationSupport(context, targetWords) {
        const suggestions = [];
        const existingWords = new Set(context.vocabulary.map(w => w.english.toLowerCase()));

        for (const word of targetWords) {
            if (!existingWords.has(word.toLowerCase())) {
                // Try to find the word in our semantic fields
                const found = this.findWordInSemanticFields(word);
                if (found) {
                    suggestions.push({
                        english: found.english,
                        meaning: found.meaning || found.english,
                        pos: found.pos || this.guessPartOfSpeech(word),
                        category: found.category || 'translation',
                        priority: 9, // High priority for translation
                        reasoning: `Required for translation`,
                        confidence: 0.9,
                        source: 'local_ai_translation'
                    });
                } else {
                    // Create a basic suggestion
                    suggestions.push({
                        english: word,
                        meaning: word,
                        pos: this.guessPartOfSpeech(word),
                        category: 'translation',
                        priority: 9,
                        reasoning: `Required for translation (basic word)`,
                        confidence: 0.7,
                        source: 'local_ai_translation'
                    });
                }
            }
        }

        return suggestions;
    }

    // Data loading methods
    async loadSemanticFields() {
        this.semanticFields = {
            basic_actions: [
                { english: 'be', meaning: 'to exist', pos: 'verb', frequency: 1.0 },
                { english: 'have', meaning: 'to possess', pos: 'verb', frequency: 1.0 },
                { english: 'do', meaning: 'to perform', pos: 'verb', frequency: 1.0 },
                { english: 'say', meaning: 'to speak', pos: 'verb', frequency: 0.9 },
                { english: 'go', meaning: 'to move', pos: 'verb', frequency: 0.9 },
                { english: 'get', meaning: 'to obtain', pos: 'verb', frequency: 0.9 },
                { english: 'make', meaning: 'to create', pos: 'verb', frequency: 0.9 },
                { english: 'see', meaning: 'to perceive with eyes', pos: 'verb', frequency: 0.8 },
                { english: 'know', meaning: 'to understand', pos: 'verb', frequency: 0.8 },
                { english: 'take', meaning: 'to grasp', pos: 'verb', frequency: 0.8 },
                { english: 'come', meaning: 'to arrive', pos: 'verb', frequency: 0.8 },
                { english: 'think', meaning: 'to contemplate', pos: 'verb', frequency: 0.7 },
                { english: 'look', meaning: 'to observe', pos: 'verb', frequency: 0.7 },
                { english: 'want', meaning: 'to desire', pos: 'verb', frequency: 0.7 },
                { english: 'give', meaning: 'to offer', pos: 'verb', frequency: 0.7 },
                { english: 'use', meaning: 'to employ', pos: 'verb', frequency: 0.7 },
                { english: 'find', meaning: 'to discover', pos: 'verb', frequency: 0.6 },
                { english: 'tell', meaning: 'to inform', pos: 'verb', frequency: 0.6 },
                { english: 'ask', meaning: 'to question', pos: 'verb', frequency: 0.6 },
                { english: 'work', meaning: 'to labor', pos: 'verb', frequency: 0.6 },
                { english: 'feel', meaning: 'to sense', pos: 'verb', frequency: 0.6 }
            ],
            
            family: [
                { english: 'mother', meaning: 'female parent', pos: 'noun', frequency: 1.0 },
                { english: 'father', meaning: 'male parent', pos: 'noun', frequency: 1.0 },
                { english: 'child', meaning: 'offspring', pos: 'noun', frequency: 0.9 },
                { english: 'son', meaning: 'male child', pos: 'noun', frequency: 0.8 },
                { english: 'daughter', meaning: 'female child', pos: 'noun', frequency: 0.8 },
                { english: 'brother', meaning: 'male sibling', pos: 'noun', frequency: 0.8 },
                { english: 'sister', meaning: 'female sibling', pos: 'noun', frequency: 0.8 },
                { english: 'grandfather', meaning: 'father\'s father', pos: 'noun', frequency: 0.7 },
                { english: 'grandmother', meaning: 'father\'s mother', pos: 'noun', frequency: 0.7 },
                { english: 'uncle', meaning: 'parent\'s brother', pos: 'noun', frequency: 0.6 },
                { english: 'aunt', meaning: 'parent\'s sister', pos: 'noun', frequency: 0.6 },
                { english: 'cousin', meaning: 'child of aunt/uncle', pos: 'noun', frequency: 0.5 },
                { english: 'spouse', meaning: 'marriage partner', pos: 'noun', frequency: 0.7 },
                { english: 'husband', meaning: 'male spouse', pos: 'noun', frequency: 0.7 },
                { english: 'wife', meaning: 'female spouse', pos: 'noun', frequency: 0.7 },
                { english: 'family', meaning: 'related group', pos: 'noun', frequency: 0.9 },
                { english: 'parent', meaning: 'father or mother', pos: 'noun', frequency: 0.8 },
                { english: 'sibling', meaning: 'brother or sister', pos: 'noun', frequency: 0.6 },
                { english: 'relative', meaning: 'family member', pos: 'noun', frequency: 0.5 },
                { english: 'ancestor', meaning: 'forefather', pos: 'noun', frequency: 0.4 }
            ],
            
            body_parts: [
                { english: 'head', meaning: 'top of body', pos: 'noun', frequency: 1.0 },
                { english: 'eye', meaning: 'organ of sight', pos: 'noun', frequency: 1.0 },
                { english: 'hand', meaning: 'end of arm', pos: 'noun', frequency: 1.0 },
                { english: 'foot', meaning: 'end of leg', pos: 'noun', frequency: 0.9 },
                { english: 'mouth', meaning: 'opening for eating', pos: 'noun', frequency: 0.9 },
                { english: 'nose', meaning: 'organ of smell', pos: 'noun', frequency: 0.8 },
                { english: 'ear', meaning: 'organ of hearing', pos: 'noun', frequency: 0.8 },
                { english: 'arm', meaning: 'upper limb', pos: 'noun', frequency: 0.8 },
                { english: 'leg', meaning: 'lower limb', pos: 'noun', frequency: 0.8 },
                { english: 'finger', meaning: 'digit of hand', pos: 'noun', frequency: 0.7 },
                { english: 'toe', meaning: 'digit of foot', pos: 'noun', frequency: 0.6 },
                { english: 'hair', meaning: 'strands on head', pos: 'noun', frequency: 0.7 },
                { english: 'face', meaning: 'front of head', pos: 'noun', frequency: 0.8 },
                { english: 'back', meaning: 'rear of body', pos: 'noun', frequency: 0.7 },
                { english: 'chest', meaning: 'front torso', pos: 'noun', frequency: 0.6 },
                { english: 'stomach', meaning: 'belly', pos: 'noun', frequency: 0.6 },
                { english: 'heart', meaning: 'organ of circulation', pos: 'noun', frequency: 0.7 },
                { english: 'blood', meaning: 'red fluid', pos: 'noun', frequency: 0.6 },
                { english: 'bone', meaning: 'hard tissue', pos: 'noun', frequency: 0.5 },
                { english: 'skin', meaning: 'outer covering', pos: 'noun', frequency: 0.6 }
            ],
            
            nature: [
                { english: 'tree', meaning: 'tall plant', pos: 'noun', frequency: 0.9 },
                { english: 'water', meaning: 'clear liquid', pos: 'noun', frequency: 1.0 },
                { english: 'fire', meaning: 'burning flame', pos: 'noun', frequency: 0.9 },
                { english: 'earth', meaning: 'ground, soil', pos: 'noun', frequency: 0.8 },
                { english: 'air', meaning: 'atmosphere', pos: 'noun', frequency: 0.7 },
                { english: 'stone', meaning: 'hard mineral', pos: 'noun', frequency: 0.8 },
                { english: 'rock', meaning: 'large stone', pos: 'noun', frequency: 0.7 },
                { english: 'mountain', meaning: 'high elevation', pos: 'noun', frequency: 0.7 },
                { english: 'river', meaning: 'flowing water', pos: 'noun', frequency: 0.8 },
                { english: 'forest', meaning: 'many trees', pos: 'noun', frequency: 0.7 },
                { english: 'grass', meaning: 'green plant', pos: 'noun', frequency: 0.6 },
                { english: 'flower', meaning: 'plant bloom', pos: 'noun', frequency: 0.6 },
                { english: 'leaf', meaning: 'tree part', pos: 'noun', frequency: 0.6 },
                { english: 'branch', meaning: 'tree limb', pos: 'noun', frequency: 0.5 },
                { english: 'root', meaning: 'plant base', pos: 'noun', frequency: 0.5 },
                { english: 'seed', meaning: 'plant beginning', pos: 'noun', frequency: 0.5 },
                { english: 'lake', meaning: 'body of water', pos: 'noun', frequency: 0.6 },
                { english: 'sea', meaning: 'large water body', pos: 'noun', frequency: 0.7 },
                { english: 'ocean', meaning: 'vast water', pos: 'noun', frequency: 0.6 },
                { english: 'island', meaning: 'land in water', pos: 'noun', frequency: 0.4 }
            ],
            
            food: [
                { english: 'food', meaning: 'edible substance', pos: 'noun', frequency: 1.0 },
                { english: 'water', meaning: 'drinking liquid', pos: 'noun', frequency: 1.0 },
                { english: 'bread', meaning: 'baked grain', pos: 'noun', frequency: 0.8 },
                { english: 'meat', meaning: 'animal flesh', pos: 'noun', frequency: 0.8 },
                { english: 'fish', meaning: 'water animal', pos: 'noun', frequency: 0.7 },
                { english: 'fruit', meaning: 'sweet plant food', pos: 'noun', frequency: 0.7 },
                { english: 'vegetable', meaning: 'plant food', pos: 'noun', frequency: 0.6 },
                { english: 'grain', meaning: 'seed food', pos: 'noun', frequency: 0.6 },
                { english: 'milk', meaning: 'animal drink', pos: 'noun', frequency: 0.6 },
                { english: 'egg', meaning: 'oval food', pos: 'noun', frequency: 0.6 },
                { english: 'salt', meaning: 'flavor crystal', pos: 'noun', frequency: 0.7 },
                { english: 'honey', meaning: 'bee product', pos: 'noun', frequency: 0.5 },
                { english: 'oil', meaning: 'cooking fat', pos: 'noun', frequency: 0.5 },
                { english: 'soup', meaning: 'liquid meal', pos: 'noun', frequency: 0.6 },
                { english: 'meal', meaning: 'eating time', pos: 'noun', frequency: 0.7 },
                { english: 'drink', meaning: 'beverage', pos: 'noun', frequency: 0.7 },
                { english: 'cook', meaning: 'prepare food', pos: 'verb', frequency: 0.7 },
                { english: 'eat', meaning: 'consume food', pos: 'verb', frequency: 0.9 },
                { english: 'taste', meaning: 'sense flavor', pos: 'verb', frequency: 0.6 },
                { english: 'hungry', meaning: 'wanting food', pos: 'adjective', frequency: 0.6 }
            ],
            
            tools: [
                { english: 'tool', meaning: 'work implement', pos: 'noun', frequency: 0.8 },
                { english: 'knife', meaning: 'cutting blade', pos: 'noun', frequency: 0.8 },
                { english: 'spear', meaning: 'pointed weapon', pos: 'noun', frequency: 0.6 },
                { english: 'bow', meaning: 'arrow launcher', pos: 'noun', frequency: 0.5 },
                { english: 'arrow', meaning: 'pointed projectile', pos: 'noun', frequency: 0.5 },
                { english: 'axe', meaning: 'cutting tool', pos: 'noun', frequency: 0.6 },
                { english: 'hammer', meaning: 'pounding tool', pos: 'noun', frequency: 0.6 },
                { english: 'rope', meaning: 'twisted cord', pos: 'noun', frequency: 0.7 },
                { english: 'basket', meaning: 'woven container', pos: 'noun', frequency: 0.7 },
                { english: 'pot', meaning: 'cooking vessel', pos: 'noun', frequency: 0.7 },
                { english: 'bowl', meaning: 'round container', pos: 'noun', frequency: 0.6 },
                { english: 'cup', meaning: 'drinking vessel', pos: 'noun', frequency: 0.6 },
                { english: 'plate', meaning: 'flat dish', pos: 'noun', frequency: 0.5 },
                { english: 'net', meaning: 'mesh trap', pos: 'noun', frequency: 0.5 },
                { english: 'hook', meaning: 'curved fastener', pos: 'noun', frequency: 0.4 },
                { english: 'needle', meaning: 'sewing tool', pos: 'noun', frequency: 0.5 },
                { english: 'thread', meaning: 'thin cord', pos: 'noun', frequency: 0.4 },
                { english: 'cloth', meaning: 'woven material', pos: 'noun', frequency: 0.6 },
                { english: 'leather', meaning: 'animal hide', pos: 'noun', frequency: 0.5 },
                { english: 'wood', meaning: 'tree material', pos: 'noun', frequency: 0.7 }
            ],
            
            emotions: [
                { english: 'happy', meaning: 'feeling joy', pos: 'adjective', frequency: 0.9 },
                { english: 'sad', meaning: 'feeling sorrow', pos: 'adjective', frequency: 0.9 },
                { english: 'angry', meaning: 'feeling rage', pos: 'adjective', frequency: 0.8 },
                { english: 'afraid', meaning: 'feeling fear', pos: 'adjective', frequency: 0.8 },
                { english: 'surprised', meaning: 'feeling shock', pos: 'adjective', frequency: 0.7 },
                { english: 'calm', meaning: 'feeling peace', pos: 'adjective', frequency: 0.7 },
                { english: 'excited', meaning: 'feeling energy', pos: 'adjective', frequency: 0.6 },
                { english: 'worried', meaning: 'feeling concern', pos: 'adjective', frequency: 0.6 },
                { english: 'confused', meaning: 'feeling unclear', pos: 'adjective', frequency: 0.5 },
                { english: 'proud', meaning: 'feeling accomplished', pos: 'adjective', frequency: 0.6 },
                { english: 'ashamed', meaning: 'feeling guilty', pos: 'adjective', frequency: 0.5 },
                { english: 'lonely', meaning: 'feeling isolated', pos: 'adjective', frequency: 0.5 },
                { english: 'grateful', meaning: 'feeling thankful', pos: 'adjective', frequency: 0.5 },
                { english: 'love', meaning: 'deep affection', pos: 'noun', frequency: 0.8 },
                { english: 'hate', meaning: 'strong dislike', pos: 'noun', frequency: 0.6 },
                { english: 'joy', meaning: 'feeling of happiness', pos: 'noun', frequency: 0.7 },
                { english: 'sorrow', meaning: 'feeling of sadness', pos: 'noun', frequency: 0.6 },
                { english: 'fear', meaning: 'feeling of danger', pos: 'noun', frequency: 0.7 },
                { english: 'anger', meaning: 'feeling of rage', pos: 'noun', frequency: 0.6 },
                { english: 'hope', meaning: 'feeling of possibility', pos: 'noun', frequency: 0.6 }
            ],
            
            time: [
                { english: 'time', meaning: 'duration', pos: 'noun', frequency: 1.0 },
                { english: 'day', meaning: 'light period', pos: 'noun', frequency: 1.0 },
                { english: 'night', meaning: 'dark period', pos: 'noun', frequency: 0.9 },
                { english: 'morning', meaning: 'early day', pos: 'noun', frequency: 0.8 },
                { english: 'evening', meaning: 'late day', pos: 'noun', frequency: 0.7 },
                { english: 'noon', meaning: 'middle day', pos: 'noun', frequency: 0.6 },
                { english: 'dawn', meaning: 'first light', pos: 'noun', frequency: 0.5 },
                { english: 'dusk', meaning: 'last light', pos: 'noun', frequency: 0.4 },
                { english: 'season', meaning: 'time period', pos: 'noun', frequency: 0.7 },
                { english: 'year', meaning: 'long cycle', pos: 'noun', frequency: 0.8 },
                { english: 'month', meaning: 'moon cycle', pos: 'noun', frequency: 0.7 },
                { english: 'week', meaning: 'seven days', pos: 'noun', frequency: 0.6 },
                { english: 'moment', meaning: 'brief time', pos: 'noun', frequency: 0.6 },
                { english: 'hour', meaning: 'time unit', pos: 'noun', frequency: 0.6 },
                { english: 'past', meaning: 'before now', pos: 'noun', frequency: 0.6 },
                { english: 'present', meaning: 'now', pos: 'noun', frequency: 0.5 },
                { english: 'future', meaning: 'after now', pos: 'noun', frequency: 0.6 },
                { english: 'ancient', meaning: 'very old', pos: 'adjective', frequency: 0.5 },
                { english: 'new', meaning: 'recently made', pos: 'adjective', frequency: 0.8 },
                { english: 'old', meaning: 'aged', pos: 'adjective', frequency: 0.8 }
            ],
            
            social: [
                { english: 'person', meaning: 'human being', pos: 'noun', frequency: 1.0 },
                { english: 'people', meaning: 'multiple humans', pos: 'noun', frequency: 0.9 },
                { english: 'friend', meaning: 'close person', pos: 'noun', frequency: 0.8 },
                { english: 'enemy', meaning: 'hostile person', pos: 'noun', frequency: 0.6 },
                { english: 'stranger', meaning: 'unknown person', pos: 'noun', frequency: 0.6 },
                { english: 'neighbor', meaning: 'nearby person', pos: 'noun', frequency: 0.6 },
                { english: 'leader', meaning: 'guiding person', pos: 'noun', frequency: 0.7 },
                { english: 'follower', meaning: 'guided person', pos: 'noun', frequency: 0.5 },
                { english: 'teacher', meaning: 'instructing person', pos: 'noun', frequency: 0.6 },
                { english: 'student', meaning: 'learning person', pos: 'noun', frequency: 0.6 },
                { english: 'worker', meaning: 'laboring person', pos: 'noun', frequency: 0.6 },
                { english: 'helper', meaning: 'assisting person', pos: 'noun', frequency: 0.5 },
                { english: 'guest', meaning: 'visiting person', pos: 'noun', frequency: 0.5 },
                { english: 'host', meaning: 'welcoming person', pos: 'noun', frequency: 0.5 },
                { english: 'group', meaning: 'collection of people', pos: 'noun', frequency: 0.7 },
                { english: 'community', meaning: 'local society', pos: 'noun', frequency: 0.6 },
                { english: 'tribe', meaning: 'related group', pos: 'noun', frequency: 0.5 },
                { english: 'village', meaning: 'small settlement', pos: 'noun', frequency: 0.6 },
                { english: 'city', meaning: 'large settlement', pos: 'noun', frequency: 0.6 },
                { english: 'home', meaning: 'dwelling place', pos: 'noun', frequency: 0.8 }
            ],
            
            weather: [
                { english: 'sun', meaning: 'bright star', pos: 'noun', frequency: 0.9 },
                { english: 'moon', meaning: 'night light', pos: 'noun', frequency: 0.8 },
                { english: 'star', meaning: 'distant light', pos: 'noun', frequency: 0.7 },
                { english: 'cloud', meaning: 'sky vapor', pos: 'noun', frequency: 0.7 },
                { english: 'rain', meaning: 'falling water', pos: 'noun', frequency: 0.8 },
                { english: 'snow', meaning: 'frozen rain', pos: 'noun', frequency: 0.6 },
                { english: 'wind', meaning: 'moving air', pos: 'noun', frequency: 0.8 },
                { english: 'storm', meaning: 'violent weather', pos: 'noun', frequency: 0.6 },
                { english: 'lightning', meaning: 'sky electricity', pos: 'noun', frequency: 0.5 },
                { english: 'thunder', meaning: 'sky sound', pos: 'noun', frequency: 0.5 },
                { english: 'fog', meaning: 'thick mist', pos: 'noun', frequency: 0.4 },
                { english: 'ice', meaning: 'frozen water', pos: 'noun', frequency: 0.6 },
                { english: 'hot', meaning: 'high temperature', pos: 'adjective', frequency: 0.8 },
                { english: 'cold', meaning: 'low temperature', pos: 'adjective', frequency: 0.8 },
                { english: 'warm', meaning: 'mild heat', pos: 'adjective', frequency: 0.7 },
                { english: 'cool', meaning: 'mild cold', pos: 'adjective', frequency: 0.6 },
                { english: 'dry', meaning: 'without water', pos: 'adjective', frequency: 0.6 },
                { english: 'wet', meaning: 'with water', pos: 'adjective', frequency: 0.6 },
                { english: 'bright', meaning: 'full of light', pos: 'adjective', frequency: 0.6 },
                { english: 'dark', meaning: 'without light', pos: 'adjective', frequency: 0.7 }
            ]
        };
    }
    async loadDerivationRules() {
        this.derivationRules = [
            {
                type: 'agent',
                description: 'person who does action',
                morphology: 'agentive suffix',
                appliesTo: (word) => word.pos === 'verb',
                apply: (word, context) => ({
                    english: word.english + 'er',
                    meaning: `one who ${word.english}s`,
                    pos: 'noun'
                })
            },
            {
                type: 'instrument',
                description: 'tool for action',
                morphology: 'instrumental suffix',
                appliesTo: (word) => word.pos === 'verb',
                apply: (word, context) => ({
                    english: word.english + 'ing tool',
                    meaning: `tool for ${word.english}ing`,
                    pos: 'noun'
                })
            },
            {
                type: 'result',
                description: 'result of action',
                morphology: 'result suffix',
                appliesTo: (word) => word.pos === 'verb',
                apply: (word, context) => ({
                    english: word.english + 'ment',
                    meaning: `result of ${word.english}ing`,
                    pos: 'noun'
                })
            },
            {
                type: 'adjective',
                description: 'quality related to noun',
                morphology: 'adjectival suffix',
                appliesTo: (word) => word.pos === 'noun',
                apply: (word, context) => ({
                    english: word.english + 'like',
                    meaning: `resembling ${word.english}`,
                    pos: 'adjective'
                })
            },
            {
                type: 'diminutive',
                description: 'small version',
                morphology: 'diminutive suffix',
                appliesTo: (word) => word.pos === 'noun',
                apply: (word, context) => ({
                    english: 'little ' + word.english,
                    meaning: `small ${word.english}`,
                    pos: 'noun'
                })
            },
            {
                type: 'augmentative',
                description: 'large version',
                morphology: 'augmentative suffix',
                appliesTo: (word) => word.pos === 'noun',
                apply: (word, context) => ({
                    english: 'big ' + word.english,
                    meaning: `large ${word.english}`,
                    pos: 'noun'
                })
            },
            {
                type: 'causative',
                description: 'to cause action',
                morphology: 'causative prefix',
                appliesTo: (word) => word.pos === 'verb',
                apply: (word, context) => ({
                    english: 'make ' + word.english,
                    meaning: `to cause to ${word.english}`,
                    pos: 'verb'
                })
            },
            {
                type: 'location',
                description: 'place for activity',
                morphology: 'locative suffix',
                appliesTo: (word) => word.pos === 'verb' || word.pos === 'noun',
                apply: (word, context) => ({
                    english: word.english + ' place',
                    meaning: `place for ${word.english}${word.pos === 'verb' ? 'ing' : 's'}`,
                    pos: 'noun'
                })
            }
        ];
    }

    async loadCompoundPatterns() {
        this.compoundPatterns = {
            'fire_place': 'fireplace',
            'water_container': 'bucket',
            'food_maker': 'cook',
            'tree_fruit': 'apple',
            'stone_tool': 'hammer',
            'water_crosser': 'bridge',
            'fire_maker': 'lighter',
            'food_place': 'kitchen',
            'sleep_place': 'bedroom',
            'water_place': 'well',
            'animal_keeper': 'herder',
            'plant_grower': 'farmer',
            'metal_worker': 'smith',
            'wood_worker': 'carpenter',
            'cloth_maker': 'weaver',
            'song_maker': 'singer',
            'story_teller': 'narrator',
            'path_finder': 'guide',
            'star_watcher': 'astronomer',
            'rain_bringer': 'shaman'
        };
    }

    async loadPriorityWords() {
        this.priorityWords = {
            // Core pronouns and articles - highest priority
            pronouns: [
                { english: 'I', meaning: 'first person singular', pos: 'pronoun', priority: 10 },
                { english: 'you', meaning: 'second person', pos: 'pronoun', priority: 10 },
                { english: 'he', meaning: 'third person male', pos: 'pronoun', priority: 9 },
                { english: 'she', meaning: 'third person female', pos: 'pronoun', priority: 9 },
                { english: 'it', meaning: 'third person neuter', pos: 'pronoun', priority: 9 },
                { english: 'we', meaning: 'first person plural', pos: 'pronoun', priority: 9 },
                { english: 'they', meaning: 'third person plural', pos: 'pronoun', priority: 9 },
                { english: 'this', meaning: 'near demonstrative', pos: 'pronoun', priority: 8 },
                { english: 'that', meaning: 'far demonstrative', pos: 'pronoun', priority: 8 },
                { english: 'what', meaning: 'interrogative thing', pos: 'pronoun', priority: 8 },
                { english: 'who', meaning: 'interrogative person', pos: 'pronoun', priority: 8 },
                { english: 'where', meaning: 'interrogative place', pos: 'pronoun', priority: 7 },
                { english: 'when', meaning: 'interrogative time', pos: 'pronoun', priority: 7 },
                { english: 'why', meaning: 'interrogative reason', pos: 'pronoun', priority: 7 },
                { english: 'how', meaning: 'interrogative manner', pos: 'pronoun', priority: 7 }
            ],
            
            // Basic qualities and descriptors
            qualities: [
                { english: 'good', meaning: 'positive quality', pos: 'adjective', priority: 9 },
                { english: 'bad', meaning: 'negative quality', pos: 'adjective', priority: 9 },
                { english: 'big', meaning: 'large size', pos: 'adjective', priority: 8 },
                { english: 'small', meaning: 'little size', pos: 'adjective', priority: 8 },
                { english: 'long', meaning: 'extended length', pos: 'adjective', priority: 7 },
                { english: 'short', meaning: 'brief length', pos: 'adjective', priority: 7 },
                { english: 'high', meaning: 'elevated', pos: 'adjective', priority: 7 },
                { english: 'low', meaning: 'beneath', pos: 'adjective', priority: 7 },
                { english: 'strong', meaning: 'powerful', pos: 'adjective', priority: 6 },
                { english: 'weak', meaning: 'fragile', pos: 'adjective', priority: 6 },
                { english: 'fast', meaning: 'quick speed', pos: 'adjective', priority: 6 },
                { english: 'slow', meaning: 'low speed', pos: 'adjective', priority: 6 },
                { english: 'hard', meaning: 'solid', pos: 'adjective', priority: 6 },
                { english: 'soft', meaning: 'yielding', pos: 'adjective', priority: 6 },
                { english: 'heavy', meaning: 'weighty', pos: 'adjective', priority: 5 },
                { english: 'light', meaning: 'not heavy', pos: 'adjective', priority: 5 }
            ],
            
            // Numbers - essential for basic communication
            numbers: [
                { english: 'one', meaning: 'single unit', pos: 'number', priority: 10 },
                { english: 'two', meaning: 'pair', pos: 'number', priority: 10 },
                { english: 'three', meaning: 'triple', pos: 'number', priority: 9 },
                { english: 'four', meaning: 'quartet', pos: 'number', priority: 8 },
                { english: 'five', meaning: 'quintuple', pos: 'number', priority: 8 },
                { english: 'many', meaning: 'large quantity', pos: 'adjective', priority: 7 },
                { english: 'few', meaning: 'small quantity', pos: 'adjective', priority: 7 },
                { english: 'all', meaning: 'entire amount', pos: 'adjective', priority: 8 },
                { english: 'some', meaning: 'partial amount', pos: 'adjective', priority: 8 },
                { english: 'none', meaning: 'zero amount', pos: 'adjective', priority: 7 }
            ]
        };
    }

    async loadCulturalMappings() {
        this.culturalMappings = {
            agricultural: [
                { english: 'farm', meaning: 'cultivated land', pos: 'noun', culturalRelevance: 0.9 },
                { english: 'crop', meaning: 'grown plants', pos: 'noun', culturalRelevance: 0.9 },
                { english: 'harvest', meaning: 'gathering crops', pos: 'verb', culturalRelevance: 0.9 },
                { english: 'plow', meaning: 'soil turner', pos: 'noun', culturalRelevance: 0.8 },
                { english: 'seed', meaning: 'plant beginning', pos: 'noun', culturalRelevance: 0.8 },
                { english: 'grain', meaning: 'food seeds', pos: 'noun', culturalRelevance: 0.8 },
                { english: 'field', meaning: 'open farmland', pos: 'noun', culturalRelevance: 0.8 },
                { english: 'barn', meaning: 'crop storage', pos: 'noun', culturalRelevance: 0.7 },
                { english: 'sow', meaning: 'plant seeds', pos: 'verb', culturalRelevance: 0.7 },
                { english: 'reap', meaning: 'cut crops', pos: 'verb', culturalRelevance: 0.7 },
                { english: 'fertile', meaning: 'good for growing', pos: 'adjective', culturalRelevance: 0.7 },
                { english: 'drought', meaning: 'no rain period', pos: 'noun', culturalRelevance: 0.6 },
                { english: 'abundance', meaning: 'plenty of food', pos: 'noun', culturalRelevance: 0.6 },
                { english: 'storage', meaning: 'keeping place', pos: 'noun', culturalRelevance: 0.6 },
                { english: 'seasonal', meaning: 'time-based', pos: 'adjective', culturalRelevance: 0.8 }
            ],
            
            nomadic: [
                { english: 'journey', meaning: 'long travel', pos: 'noun', culturalRelevance: 0.9 },
                { english: 'caravan', meaning: 'travel group', pos: 'noun', culturalRelevance: 0.9 },
                { english: 'desert', meaning: 'dry wasteland', pos: 'noun', culturalRelevance: 0.8 },
                { english: 'oasis', meaning: 'water in desert', pos: 'noun', culturalRelevance: 0.8 },
                { english: 'tent', meaning: 'portable shelter', pos: 'noun', culturalRelevance: 0.8 },
                { english: 'camel', meaning: 'desert animal', pos: 'noun', culturalRelevance: 0.8 },
                { english: 'horse', meaning: 'riding animal', pos: 'noun', culturalRelevance: 0.8 },
                { english: 'guide', meaning: 'path shower', pos: 'noun', culturalRelevance: 0.7 },
                { english: 'wander', meaning: 'travel without goal', pos: 'verb', culturalRelevance: 0.7 },
                { english: 'migration', meaning: 'seasonal movement', pos: 'noun', culturalRelevance: 0.7 },
                { english: 'portable', meaning: 'easily moved', pos: 'adjective', culturalRelevance: 0.7 },
                { english: 'direction', meaning: 'way to go', pos: 'noun', culturalRelevance: 0.6 },
                { english: 'distance', meaning: 'far apart', pos: 'noun', culturalRelevance: 0.6 },
                { english: 'rest', meaning: 'stop traveling', pos: 'verb', culturalRelevance: 0.6 },
                { english: 'freedom', meaning: 'no constraints', pos: 'noun', culturalRelevance: 0.8 }
            ],
            
            maritime: [
                { english: 'ship', meaning: 'water vessel', pos: 'noun', culturalRelevance: 0.9 },
                { english: 'sail', meaning: 'wind catcher', pos: 'noun', culturalRelevance: 0.9 },
                { english: 'fish', meaning: 'water animal', pos: 'noun', culturalRelevance: 0.9 },
                { english: 'net', meaning: 'fishing tool', pos: 'noun', culturalRelevance: 0.8 },
                { english: 'tide', meaning: 'water level change', pos: 'noun', culturalRelevance: 0.8 },
                { english: 'harbor', meaning: 'safe water place', pos: 'noun', culturalRelevance: 0.8 },
                { english: 'anchor', meaning: 'ship stopper', pos: 'noun', culturalRelevance: 0.7 },
                { english: 'wave', meaning: 'water movement', pos: 'noun', culturalRelevance: 0.7 },
                { english: 'shore', meaning: 'land edge', pos: 'noun', culturalRelevance: 0.7 },
                { english: 'captain', meaning: 'ship leader', pos: 'noun', culturalRelevance: 0.7 },
                { english: 'crew', meaning: 'ship workers', pos: 'noun', culturalRelevance: 0.6 },
                { english: 'voyage', meaning: 'sea journey', pos: 'noun', culturalRelevance: 0.6 },
                { english: 'navigate', meaning: 'find direction', pos: 'verb', culturalRelevance: 0.6 },
                { english: 'storm', meaning: 'bad weather', pos: 'noun', culturalRelevance: 0.6 },
                { english: 'deep', meaning: 'far down', pos: 'adjective', culturalRelevance: 0.6 }
            ],
            
            tribal: [
                { english: 'tribe', meaning: 'family group', pos: 'noun', culturalRelevance: 0.9 },
                { english: 'chief', meaning: 'group leader', pos: 'noun', culturalRelevance: 0.9 },
                { english: 'warrior', meaning: 'fighter', pos: 'noun', culturalRelevance: 0.8 },
                { english: 'ceremony', meaning: 'ritual event', pos: 'noun', culturalRelevance: 0.8 },
                { english: 'ancestor', meaning: 'dead family', pos: 'noun', culturalRelevance: 0.8 },
                { english: 'elder', meaning: 'old wise person', pos: 'noun', culturalRelevance: 0.8 },
                { english: 'tradition', meaning: 'old custom', pos: 'noun', culturalRelevance: 0.8 },
                { english: 'clan', meaning: 'related families', pos: 'noun', culturalRelevance: 0.7 },
                { english: 'ritual', meaning: 'sacred act', pos: 'noun', culturalRelevance: 0.7 },
                { english: 'hunt', meaning: 'find animals', pos: 'verb', culturalRelevance: 0.7 },
                { english: 'honor', meaning: 'respect', pos: 'noun', culturalRelevance: 0.7 },
                { english: 'spirit', meaning: 'soul force', pos: 'noun', culturalRelevance: 0.7 },
                { english: 'sacred', meaning: 'holy', pos: 'adjective', culturalRelevance: 0.6 },
                { english: 'wisdom', meaning: 'deep knowledge', pos: 'noun', culturalRelevance: 0.6 },
                { english: 'loyalty', meaning: 'faithful devotion', pos: 'noun', culturalRelevance: 0.6 }
            ]
        };
    }
    // Helper methods
    getPrioritizedCategories(analysis) {
        const categories = [];
        const priorities = analysis.priorities || {};
        
        // Add high-priority missing categories
        Object.entries(priorities).forEach(([category, priority]) => {
            if (priority > 0.5) { // Significant gap
                categories.push({
                    category: category,
                    priority: priority * 10,
                    needed: Math.ceil(priority * 5) // Words needed
                });
            }
        });
        
        // Sort by priority
        categories.sort((a, b) => b.priority - a.priority);
        
        // If no gaps found, add some basic categories
        if (categories.length === 0) {
            categories.push(
                { category: 'basic_actions', priority: 5, needed: 3 },
                { category: 'emotions', priority: 4, needed: 2 },
                { category: 'social', priority: 4, needed: 2 }
            );
        }
        
        return categories;
    }

    isCulturallyAppropriate(word, culture) {
        const cultureType = culture?.type || 'generic';
        
        // Modern words inappropriate for traditional cultures
        const modernWords = ['computer', 'internet', 'car', 'airplane', 'television', 'radio', 'telephone'];
        const traditionalCultures = ['tribal', 'agricultural', 'nomadic'];
        
        if (traditionalCultures.includes(cultureType) && modernWords.includes(word.english?.toLowerCase())) {
            return false;
        }
        
        // Sea-related words inappropriate for desert cultures
        const seaWords = ['ship', 'sail', 'anchor', 'harbor', 'tide'];
        if (cultureType === 'nomadic' && seaWords.includes(word.english?.toLowerCase())) {
            return false;
        }
        
        // Desert words inappropriate for maritime cultures
        const desertWords = ['desert', 'oasis', 'camel', 'sand'];
        if (cultureType === 'maritime' && desertWords.includes(word.english?.toLowerCase())) {
            return false;
        }
        
        return true;
    }

    selectBaseWordForDerivation(vocabulary) {
        // Prefer verbs and nouns for derivation
        const suitable = vocabulary.filter(word => 
            ['verb', 'noun'].includes(word.pos) && 
            word.english.length > 2
        );
        
        if (suitable.length === 0) return null;
        
        // Return a random suitable word
        return suitable[Math.floor(Math.random() * suitable.length)];
    }

    isValidDerivation(derived, context) {
        const existingWords = new Set(context.vocabulary.map(w => w.english.toLowerCase()));
        return !existingWords.has(derived.english.toLowerCase());
    }

    findWordInSemanticFields(targetWord) {
        for (const [category, words] of Object.entries(this.semanticFields)) {
            const found = words.find(word => 
                word.english.toLowerCase() === targetWord.toLowerCase()
            );
            if (found) {
                return { ...found, category };
            }
        }
        return null;
    }

    guessPartOfSpeech(word) {
        // Simple heuristics for POS guessing
        const verbEndings = ['ed', 'ing', 'ize', 'ate'];
        const nounEndings = ['tion', 'ness', 'ment', 'er', 'or'];
        const adjEndings = ['ful', 'less', 'ous', 'ive', 'able'];
        
        const lowerWord = word.toLowerCase();
        
        if (verbEndings.some(ending => lowerWord.endsWith(ending))) {
            return 'verb';
        }
        
        if (nounEndings.some(ending => lowerWord.endsWith(ending))) {
            return 'noun';
        }
        
        if (adjEndings.some(ending => lowerWord.endsWith(ending))) {
            return 'adjective';
        }
        
        // Default to noun for unknown words
        return 'noun';
    }

    extractMythologyTerms(mythology) {
        const terms = [];
        
        if (mythology.pantheon) {
            mythology.pantheon.forEach(deity => {
                const domains = deity.domain?.split(', ') || [];
                domains.forEach(domain => {
                    terms.push({
                        english: domain.toLowerCase(),
                        meaning: `related to ${deity.name}`,
                        pos: 'noun',
                        culturalRelevance: 0.8
                    });
                });
            });
        }
        
        if (mythology.sacredObjects) {
            mythology.sacredObjects.forEach(obj => {
                terms.push({
                    english: obj.name.toLowerCase(),
                    meaning: obj.description,
                    pos: 'noun',
                    culturalRelevance: 0.7
                });
            });
        }
        
        return terms;
    }

    extractTraditionTerms(traditions) {
        const terms = [];
        
        Object.values(traditions).forEach(traditionCategory => {
            if (traditionCategory.traditions) {
                traditionCategory.traditions.forEach(tradition => {
                    // Extract key terms from tradition activities
                    const activities = tradition.activities?.split(', ') || [];
                    activities.forEach(activity => {
                        const cleanActivity = activity.trim().toLowerCase();
                        if (cleanActivity.length > 3) {
                            terms.push({
                                english: cleanActivity,
                                meaning: `traditional activity`,
                                pos: 'noun',
                                culturalRelevance: 0.6
                            });
                        }
                    });
                    
                    // Extract materials
                    const materials = tradition.materials?.split(', ') || [];
                    materials.forEach(material => {
                        const cleanMaterial = material.trim().toLowerCase();
                        if (cleanMaterial.length > 3) {
                            terms.push({
                                english: cleanMaterial,
                                meaning: `traditional material`,
                                pos: 'noun',
                                culturalRelevance: 0.5
                            });
                        }
                    });
                });
            }
        });
        
        return terms;
    }
}

// Fallback Generator - Simple backup when AI fails
class FallbackGenerator {
    generateBasicSuggestions() {
        return [
            { english: 'good', meaning: 'positive quality', pos: 'adjective', priority: 8, reasoning: 'Essential basic word', confidence: 0.9, source: 'fallback' },
            { english: 'bad', meaning: 'negative quality', pos: 'adjective', priority: 8, reasoning: 'Essential basic word', confidence: 0.9, source: 'fallback' },
            { english: 'person', meaning: 'human being', pos: 'noun', priority: 9, reasoning: 'Essential basic word', confidence: 0.9, source: 'fallback' },
            { english: 'place', meaning: 'location', pos: 'noun', priority: 7, reasoning: 'Essential basic word', confidence: 0.9, source: 'fallback' },
            { english: 'time', meaning: 'duration', pos: 'noun', priority: 7, reasoning: 'Essential basic word', confidence: 0.9, source: 'fallback' }
        ];
    }
}

// Export for use in main module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LocalVocabularyAI, FallbackGenerator };
}

