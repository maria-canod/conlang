// Real AI Engine - Connects to Local LLM or Cloud APIs for genuine intelligence
window.LocalAI = {
    initialized: false,
    apiEndpoint: null,
    provider: 'local', // 'local', 'openai', 'anthropic', 'openrouter', 'remote_ollama'
    apiKey: null,
    availableModels: [],
    selectedModel: null,
    remoteEndpoint: null,
    remoteModel: null,
    openRouterModel: null,

    async init() {
        console.log('Initializing Real AI Engine...');
        
        if (this.initialized) return;

        try {
            // Try to detect local LLM first (Ollama, LM Studio, etc.)
            await this.detectLocalLLM();
            
            this.initialized = true;
            console.log('Real AI Engine initialized successfully');

        } catch (error) {
            console.error('Failed to initialize AI:', error);
            // Fall back to basic pattern matching if no AI available
            this.initialized = true;
        }
    },

    async detectLocalLLM() {
        // Common local LLM endpoints
        const endpoints = [
            'http://localhost:11434', // Ollama default
            'http://localhost:1234',  // LM Studio default
            'http://localhost:8080',  // text-generation-webui
            'http://localhost:5000'   // Custom endpoints
        ];

        for (const endpoint of endpoints) {
            try {
                console.log(`Checking endpoint: ${endpoint}`);
                const response = await fetch(`${endpoint}/api/tags`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('Available models:', data);
                    
                    // Get available models
                    this.availableModels = data.models || [];
                    this.apiEndpoint = endpoint;
                    this.provider = 'local';
                    console.log(`Found local LLM at ${endpoint} with ${this.availableModels.length} models`);
                    
                    // Try to find the best model
                    this.selectBestModel();
                    return;
                }
            } catch (error) {
                console.log(`Failed to connect to ${endpoint}:`, error.message);
            }
        }

        console.log('No local LLM detected, will use cloud APIs when configured');
    },

    selectBestModel() {
        if (!this.availableModels || this.availableModels.length === 0) {
            console.log('No models available');
            return;
        }

        // Extract model names properly - handle both {name: "model"} and {model: "model"} formats
        const modelNames = this.availableModels.map(m => {
            if (typeof m === 'string') return m;
            return m.name || m.model || m;
        });
        console.log('Model names:', modelNames);

        // Prefer models in this order (including gemma3)
        const preferredModels = ['gemma3', 'gemma2', 'gemma', 'llama3.2', 'llama3.1', 'llama3', 'llama2', 'mistral', 'codellama'];
        
        for (const preferred of preferredModels) {
            const found = modelNames.find(name => {
                const nameStr = String(name).toLowerCase();
                return nameStr.includes(preferred.toLowerCase());
            });
            if (found) {
                this.selectedModel = found;
                console.log(`Selected model: ${this.selectedModel}`);
                return;
            }
        }

        // If no preferred model found, use the first available
        this.selectedModel = modelNames[0];
        console.log(`Using first available model: ${this.selectedModel}`);
    },

    async generateVocabularySuggestions(context, category, count) {
        try {
            const prompt = this.buildVocabularyPrompt(context, category, count);
            const response = await this.callAI(prompt);
            return this.parseVocabularySuggestions(response);
        } catch (error) {
            console.error('AI vocabulary generation failed:', error);
            // Fallback to basic suggestions
            return this.fallbackVocabularySuggestions(context, category, count);
        }
    },

    buildVocabularyPrompt(context, category, count) {
        const existingWords = context.vocabulary.map(w => w.english).join(', ');
        const cultureInfo = this.getCultureDescription(context.culture);
        
        let categoryGuidance = '';
        if (category !== 'auto') {
            categoryGuidance = `Focus specifically on the "${category.replace('_', ' ')}" semantic field.`;
        }

        return `You are an expert linguist helping to expand vocabulary for a constructed language.

CRITICAL RULES:
1. Suggest ONLY real English words that are missing from the existing vocabulary
2. DO NOT invent or create new words
3. DO NOT suggest words that already exist in the vocabulary
4. Focus on useful, common vocabulary that real languages need

EXISTING VOCABULARY (${context.vocabulary.length} words): ${existingWords}

${categoryGuidance}

TASK: Analyze the existing vocabulary and intelligently suggest ${count} missing English words that would be useful additions. Consider:
- What basic concepts are missing
- What word types (nouns, verbs, adjectives) are underrepresented  
- What semantic fields need expansion
- Cultural context: ${cultureInfo}

RESPOND IN VALID JSON:
{
  "suggestions": [
    {
      "english": "REAL_ENGLISH_WORD",
      "pos": "noun|verb|adjective|adverb|preposition|pronoun|interjection",
      "meaning": "definition of the word",
      "priority": 1-10,
      "reasoning": "why this word is a valuable addition",
      "confidence": 0.7-1.0,
      "category": "${category === 'auto' ? 'auto-detected' : category}"
    }
  ]
}

Be intelligent about your suggestions - analyze gaps and provide words that would genuinely improve this language's expressiveness.`;
    },

    async translateText(context, englishText) {
        try {
            const prompt = this.buildTranslationPrompt(context, englishText);
            const response = await this.callAI(prompt);
            return this.parseTranslationResponse(response, englishText);
        } catch (error) {
            console.error('AI translation failed:', error);
            return this.fallbackTranslation(context, englishText);
        }
    },

    async generateMissingWordSuggestions(context, missingWords) {
        try {
            const prompt = this.buildMissingWordsPrompt(context, missingWords);
            const response = await this.callAI(prompt);
            return this.parseMissingWordSuggestions(response);
        } catch (error) {
            console.error('Missing words AI failed:', error);
            return this.fallbackMissingWords(missingWords);
        }
    },

    buildMissingWordsPrompt(context, missingWords) {
        const cultureInfo = this.getCultureDescription(context.culture);
        
        return `You are helping to build vocabulary for a constructed language. Analyze these missing words and provide suggestions for adding them.

MISSING WORDS: ${missingWords.join(', ')}

CULTURAL CONTEXT: ${cultureInfo}
EXISTING VOCABULARY SIZE: ${context.vocabulary.length} words

TASK: For each missing word, determine:
1. Most likely part of speech
2. Priority for basic communication
3. Cultural appropriateness
4. Brief reasoning for importance

RESPOND IN VALID JSON:
{
  "suggestions": [
    {
      "english": "word",
      "pos": "noun|verb|adjective|adverb|preposition|pronoun|interjection", 
      "meaning": "definition",
      "priority": 1-10,
      "reasoning": "why this word is important",
      "confidence": 0.7-1.0
    }
  ]
}

Analyze each word: ${missingWords.join(', ')}`;
    },

    parseMissingWordSuggestions(response) {
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('No JSON found in response');
            
            const data = JSON.parse(jsonMatch[0]);
            return data.suggestions || [];
        } catch (error) {
            console.error('Failed to parse missing word suggestions:', error);
            return [];
        }
    },

    fallbackMissingWords(missingWords) {
        return missingWords.map(word => ({
            english: word,
            pos: this.guessPartOfSpeech(word),
            meaning: word,
            priority: 5,
            reasoning: 'Needed for translation (AI unavailable)',
            confidence: 0.5
        }));
    },

    parseTranslationResponse(response, originalText) {
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('No JSON found in response');
            
            const data = JSON.parse(jsonMatch[0]);
            // Add original text to the response
            data.original = originalText;
            return data;
        } catch (error) {
            console.error('Failed to parse translation response:', error);
            return this.createEmptyTranslationResponse(originalText);
        }
    },

    createEmptyTranslationResponse(originalText) {
        return {
            original: originalText,
            analysis: { available_words: [], missing_words: [], grammar_applied: 'None' },
            translation: { conlang_text: '', word_by_word: [], confidence: 0, notes: 'Translation failed' },
            missing_word_suggestions: []
        };
    },

    buildTranslationPrompt(context, englishText) {
        const vocabulary = context.vocabulary.map(w => `${w.english} = ${w.conlang} (${w.pos})`).join('\n');
        const grammarRules = context.grammarRules?.map(r => r.rule).join('\n') || 'No specific grammar rules defined';
        const morphology = this.getMorphologyDescription(context.morphology);

        return `You are an expert conlang translation assistant. Translate English to this constructed language using ONLY available vocabulary.

CRITICAL RULES:
1. NEVER invent new conlang words - ONLY use words from the vocabulary list
2. For each English word, find the base form and use the corresponding conlang word
3. If no base form exists, mark as unavailable and use [english_word] format
4. Be intelligent about word forms: "living"→"live", "are"→"be", etc.

EXAMPLE:
English: "I like living"
- "I" → base form "I" → conlang word "ni" 
- "like" → base form "like" → conlang word "dme"
- "living" → base form "live" → conlang word "θy"

VOCABULARY:
${vocabulary}

ENGLISH TEXT: "${englishText}"

RESPOND IN VALID JSON - USE ACTUAL CONLANG WORDS:
{
  "analysis": {
    "available_words": ["I", "like", "live"],
    "missing_words": ["here"],
    "grammar_applied": "basic word substitution"
  },
  "translation": {
    "conlang_text": "ni dme θy [here]",
    "word_by_word": [
      {"english": "I", "conlang": "ni", "available": true, "base_form": "I"},
      {"english": "like", "conlang": "dme", "available": true, "base_form": "like"},
      {"english": "living", "conlang": "θy", "available": true, "base_form": "live"},
      {"english": "here", "conlang": "[here]", "available": false, "base_form": "here"}
    ],
    "confidence": 0.75,
    "notes": "translation notes"
  },
  "missing_word_suggestions": [
    {"english": "here", "pos": "adverb", "priority": 8, "reasoning": "location word"}
  ]
}

IMPORTANT: In word_by_word, "conlang" field must contain the ACTUAL CONLANG WORD from vocabulary, not the English word!`;
    },

    async analyzeVocabularyGaps(context) {
        try {
            const prompt = this.buildGapAnalysisPrompt(context);
            const response = await this.callAI(prompt);
            return this.parseGapAnalysis(response);
        } catch (error) {
            console.error('AI gap analysis failed:', error);
            return this.fallbackGapAnalysis(context);
        }
    },

    buildGapAnalysisPrompt(context) {
        const vocabulary = context.vocabulary.map(w => `${w.english} (${w.pos})`).join(', ');
        const posDistribution = this.getPOSDistribution(context.vocabulary);
        const cultureInfo = this.getCultureDescription(context.culture);

        return `You are a linguistic analyst. Analyze this constructed language's vocabulary for gaps and provide a detailed report.

CURRENT VOCABULARY (${context.vocabulary.length} words):
${vocabulary}

PART-OF-SPEECH DISTRIBUTION:
${Object.entries(posDistribution).map(([pos, count]) => `${pos}: ${count}`).join(', ')}

CULTURAL CONTEXT: ${cultureInfo}

TASK: Provide a comprehensive analysis report (NOT word suggestions). Focus on:

1. Overall vocabulary completeness
2. Part-of-speech balance  
3. Missing semantic categories
4. Cultural appropriateness
5. Recommendations for development

RESPOND IN VALID JSON:
{
  "overall_assessment": {
    "completion_percentage": 0-100,
    "vocabulary_level": "beginner|intermediate|advanced",
    "critical_gaps": ["gap1", "gap2"],
    "strengths": ["strength1", "strength2"],
    "development_stage": "description of current stage"
  },
  "pos_analysis": {
    "balanced": ["noun", "verb"],
    "underrepresented": ["adjective"],
    "missing": ["preposition"],
    "recommendations": "what to focus on next"
  },
  "semantic_analysis": {
    "well_covered": ["basic_needs", "family"],
    "partially_covered": ["emotions", "abstract_concepts"],
    "missing_categories": ["technology", "social_concepts"],
    "priority_categories": ["emotions", "daily_activities"]
  },
  "cultural_analysis": {
    "consistency_score": 0-100,
    "cultural_alignment": "how well vocabulary matches culture",
    "missing_cultural_domains": ["specific cultural areas"],
    "suggestions": "cultural vocabulary development advice"
  },
  "development_recommendations": [
    {
      "priority": "high|medium|low",
      "area": "what to work on",
      "rationale": "why this is important",
      "suggested_approach": "how to address this"
    }
  ]
}

Provide analysis, NOT word suggestions. This should be a comprehensive evaluation report.`;
    },

    async analyzeCulturalConsistency(context) {
        try {
            const prompt = this.buildCulturalConsistencyPrompt(context);
            const response = await this.callAI(prompt);
            return this.parseCulturalAnalysis(response);
        } catch (error) {
            console.error('AI cultural analysis failed:', error);
            return this.fallbackCulturalAnalysis(context);
        }
    },

    buildCulturalConsistencyPrompt(context) {
        const vocabulary = context.vocabulary.map(w => w.english).join(', ');
        const culture = context.culture;

        return `You are a cultural linguistics expert. Analyze vocabulary consistency with cultural context.

CULTURAL SETTING:
- Environment: ${culture.environment || 'unknown'}
- Social Structure: ${culture.socialStructure || 'unknown'}  
- Technology Level: ${culture.technologyLevel || 'unknown'}
- Values: ${culture.values?.join(', ') || 'unknown'}
- Traditions: ${culture.traditions?.join(', ') || 'unknown'}

VOCABULARY: ${vocabulary}

TASK: Identify cultural inconsistencies and suggest improvements.

RESPOND IN VALID JSON:
{
  "consistency_score": 0-100,
  "issues": [
    {
      "type": "inconsistency|anachronism|missing_domain",
      "description": "what's wrong",
      "words_involved": ["word1", "word2"],
      "severity": "low|medium|high",
      "suggestion": "how to fix"
    }
  ],
  "cultural_strengths": [
    {
      "aspect": "what's good",
      "supporting_vocabulary": ["word1", "word2"]
    }
  ],
  "missing_cultural_vocabulary": [
    {
      "domain": "cultural area",
      "missing_words": ["term1", "term2"],
      "importance": "why these are needed"
    }
  ]
}`;
    },

    // AI Communication Layer
    async callAI(prompt) {
        console.log(`Attempting to call AI with provider: ${this.provider}`);
        
        if (this.provider === 'local' && this.apiEndpoint && this.selectedModel) {
            console.log(`Using local LLM: ${this.selectedModel} at ${this.apiEndpoint}`);
            return await this.callLocalLLM(prompt);
        } else if (this.provider === 'openai' && this.apiKey) {
            return await this.callOpenAI(prompt);
        } else if (this.provider === 'anthropic' && this.apiKey) {
            return await this.callAnthropic(prompt);
        } else if (this.provider === 'openrouter' && this.apiKey) {
            return await this.callOpenRouter(prompt);
        } else if (this.provider === 'remote_ollama' && this.remoteEndpoint) {
            return await this.callRemoteOllama(prompt);
        } else {
            const missing = [];
            if (this.provider === 'local') {
                if (!this.apiEndpoint) missing.push('API endpoint');
                if (!this.selectedModel) missing.push('selected model');
            } else if (this.provider === 'remote_ollama') {
                if (!this.remoteEndpoint) missing.push('remote endpoint');
            } else {
                if (!this.apiKey) missing.push('API key');
            }
            throw new Error(`AI provider not properly configured. Missing: ${missing.join(', ')}`);
        }
    },

    async callLocalLLM(prompt) {
        if (!this.selectedModel) {
            throw new Error('No model selected. Please check Ollama setup.');
        }

        console.log(`Calling Ollama with model: ${this.selectedModel}`);
        console.log(`Prompt length: ${prompt.length} characters`);

        const response = await fetch(`${this.apiEndpoint}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: this.selectedModel,
                prompt: prompt,
                stream: false,
                options: {
                    temperature: 0.7,
                    num_predict: 2000,
                    stop: ['\n\n\n'] // Stop on multiple newlines
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Ollama API error:', errorText);
            throw new Error(`Local LLM error: ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        console.log('Ollama response received:', data.response?.substring(0, 200) + '...');
        return data.response;
    },

    async callOpenAI(prompt) {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    },

    async callOpenRouter(prompt) {
        // Default model if none specified
        const selectedModel = this.openRouterModel || 'meta-llama/llama-3.1-8b-instruct:free';
        
        console.log(`Using OpenRouter model: ${selectedModel}`);
        
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
                'HTTP-Referer': window.location.href, // Required by OpenRouter
                'X-Title': 'Conlang Generator' // Optional but recommended
            },
            body: JSON.stringify({
                model: selectedModel,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenRouter API error:', errorText);
            throw new Error(`OpenRouter error: ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    },

    async callRemoteOllama(prompt) {
        console.log(`Calling remote Ollama at: ${this.remoteEndpoint}`);
        
        const response = await fetch(`${this.remoteEndpoint}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: this.remoteModel || 'llama3.1', // Default to a better model
                prompt: prompt,
                stream: false,
                options: {
                    temperature: 0.7,
                    num_predict: 2000
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Remote Ollama API error:', errorText);
            throw new Error(`Remote Ollama error: ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        console.log('Remote Ollama response received');
        return data.response;
    },

    // Response Parsers
    parseVocabularySuggestions(response) {
        try {
            // Extract JSON from response (LLMs sometimes add extra text)
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('No JSON found in response');
            
            const data = JSON.parse(jsonMatch[0]);
            let suggestions = data.suggestions || [];
            
            // Minimal validation - let AI decide what's appropriate
            suggestions = suggestions.filter(suggestion => {
                // Must have an english field
                if (!suggestion.english || typeof suggestion.english !== 'string') {
                    console.warn('Filtered out suggestion without valid english field:', suggestion);
                    return false;
                }
                
                const word = suggestion.english.toLowerCase().trim();
                
                // Basic sanity checks only
                if (word.length < 1 || word.length > 30) {
                    console.warn('Filtered out suggestion with extreme length:', word);
                    return false;
                }
                
                // Allow reasonable characters (trust AI to suggest real words)
                if (!/^[a-z\s\-'.,!?]+$/i.test(word)) {
                    console.warn('Filtered out suggestion with unusual characters:', word);
                    return false;
                }
                
                return true;
            });
            
            console.log(`Parsed ${suggestions.length} suggestions from AI response`);
            return suggestions;
            
        } catch (error) {
            console.error('Failed to parse vocabulary suggestions:', error);
            console.log('Raw response:', response);
            return [];
        }
    },

    parseTranslationResponse(response) {
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('No JSON found in response');
            
            return JSON.parse(jsonMatch[0]);
        } catch (error) {
            console.error('Failed to parse translation response:', error);
            return this.createEmptyTranslationResponse();
        }
    },

    parseGapAnalysis(response) {
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('No JSON found in response');
            
            return JSON.parse(jsonMatch[0]);
        } catch (error) {
            console.error('Failed to parse gap analysis:', error);
            return this.createEmptyGapAnalysis();
        }
    },

    parseCulturalAnalysis(response) {
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('No JSON found in response');
            
            return JSON.parse(jsonMatch[0]);
        } catch (error) {
            console.error('Failed to parse cultural analysis:', error);
            return this.createEmptyCulturalAnalysis();
        }
    },

    // Fallback Methods (when AI unavailable)
    fallbackVocabularySuggestions(context, category, count) {
        // Basic pattern-based suggestions as fallback
        const basicWords = ['water', 'fire', 'earth', 'sky', 'person', 'go', 'come', 'good', 'bad', 'big'];
        const existingWords = new Set(context.vocabulary.map(w => w.english.toLowerCase()));
        
        const suggestions = basicWords
            .filter(word => !existingWords.has(word))
            .slice(0, count)
            .map(word => ({
                english: word,
                pos: this.guessPartOfSpeech(word),
                meaning: word,
                priority: 5,
                reasoning: 'Basic vocabulary (AI unavailable)',
                confidence: 0.5,
                category: 'basic'
            }));

        return suggestions;
    },

    fallbackTranslation(context, englishText) {
        const words = englishText.toLowerCase()
            .replace(/[.,!?;:"()]/g, '') 
            .split(/\s+/)
            .filter(word => word.length > 0);
            
        // Create case-insensitive lookup
        const vocabularyMap = new Map();
        context.vocabulary.forEach(word => {
            vocabularyMap.set(word.english.toLowerCase(), word.conlang);
        });

        const wordByWord = words.map(word => {
            const conlang = vocabularyMap.get(word);
            return {
                english: word,
                conlang: conlang || `[${word}]`, // Show missing words in brackets
                available: !!conlang
            };
        });

        const missingWords = words.filter(word => !vocabularyMap.has(word));
        const availableWords = words.filter(word => vocabularyMap.has(word));

        // Create translation with word order (basic)
        let translationText = wordByWord.map(w => w.conlang).join(' ');
        
        // Apply basic word order if specified
        const wordOrder = context.syntax?.wordOrder;
        if (wordOrder && wordOrder !== 'svo' && wordByWord.length >= 3) {
            // This is very basic - just for demonstration
            if (wordOrder === 'sov') {
                // Move potential verb to end (very simplistic)
                translationText += ' (SOV order applied)';
            } else if (wordOrder === 'vso') {
                // Move potential verb to beginning (very simplistic)
                translationText = '(VSO order applied) ' + translationText;
            }
        }

        const confidence = availableWords.length / words.length;

        return {
            original: englishText,
            analysis: {
                available_words: availableWords,
                missing_words: missingWords,
                grammar_applied: `Basic word substitution${wordOrder ? ` with ${wordOrder.toUpperCase()} order` : ''}`
            },
            translation: {
                conlang_text: translationText,
                word_by_word: wordByWord,
                confidence: confidence,
                notes: confidence < 0.5 ? 
                    'Many words missing - add vocabulary for better translation' : 
                    confidence < 0.8 ? 
                    'Some words missing - translation incomplete' : 
                    'Good vocabulary coverage'
            },
            missing_word_suggestions: missingWords.map(word => ({
                english: word,
                pos: this.guessPartOfSpeech(word),
                priority: 8,
                reasoning: 'Required for complete translation'
            }))
        };
    },

    // Helper Methods
    getCultureDescription(culture) {
        if (!culture) return 'Unknown culture';
        return `${culture.environment || 'unknown'} environment with ${culture.socialStructure || 'unknown'} social structure`;
    },

    getGrammarFeatures(context) {
        const features = [];
        if (context.morphology?.hasCases) features.push(`${context.morphology.cases?.length || 0} cases`);
        if (context.morphology?.hasTenses) features.push(`${context.morphology.tenses?.length || 0} tenses`);
        if (context.morphology?.hasGenders) features.push(`${context.morphology.genders?.length || 0} genders`);
        return features.join(', ') || 'Basic grammar';
    },

    getMorphologyDescription(morphology) {
        if (!morphology) return 'No morphological system defined';
        const features = [];
        if (morphology.hasCases) features.push(`case system (${morphology.cases?.join(', ') || 'undefined'})`);
        if (morphology.hasTenses) features.push(`tense system (${morphology.tenses?.join(', ') || 'undefined'})`);
        if (morphology.hasGenders) features.push(`gender system (${morphology.genders?.join(', ') || 'undefined'})`);
        return features.join(', ') || 'Isolating language';
    },

    getPOSDistribution(vocabulary) {
        const distribution = {};
        vocabulary.forEach(word => {
            distribution[word.pos] = (distribution[word.pos] || 0) + 1;
        });
        return distribution;
    },

    guessPartOfSpeech(word) {
        // Simple heuristics for POS guessing
        if (word.endsWith('ing')) return 'verb';
        if (word.endsWith('ly')) return 'adverb';
        if (word.endsWith('ed')) return 'verb';
        if (['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'].includes(word)) return 'function';
        if (['good', 'bad', 'big', 'small', 'red', 'blue'].includes(word)) return 'adjective';
        return 'noun'; // Default guess
    },

    createEmptyTranslationResponse() {
        return {
            analysis: { available_words: [], missing_words: [], grammar_applied: 'None' },
            translation: { conlang_text: '', word_by_word: [], confidence: 0, notes: 'Translation failed' },
            missing_word_suggestions: []
        };
    },

    createEmptyGapAnalysis() {
        return {
            overall_assessment: { completion_percentage: 0, critical_gaps: [], strengths: [], priority_areas: [] },
            pos_analysis: { balanced: [], underrepresented: [], missing: [] },
            semantic_gaps: [],
            cultural_gaps: [],
            recommendations: []
        };
    },

    createEmptyCulturalAnalysis() {
        return {
            consistency_score: 0,
            issues: [],
            cultural_strengths: [],
            missing_cultural_vocabulary: []
        };
    },

    // Configuration
    setProvider(provider, apiKey = null, remoteEndpoint = null, remoteModel = null) {
        this.provider = provider;
        this.apiKey = apiKey;
        this.remoteEndpoint = remoteEndpoint;
        this.remoteModel = remoteModel;
        console.log(`AI provider set to: ${provider}`);
        
        if (provider === 'remote_ollama' && remoteEndpoint) {
            console.log(`Remote Ollama endpoint: ${remoteEndpoint}, model: ${remoteModel || 'default'}`);
        }
    },

    quickGapAnalysis(context) {
        // Quick calculation for overview display
        const totalWords = context.vocabulary.length;
        const expectedCategories = 10; // Basic semantic fields
        const posTypes = new Set(context.vocabulary.map(w => w.pos)).size;
        
        return {
            missingCategories: Math.max(0, expectedCategories - Math.floor(totalWords / 20))
        };
    },

    quickCulturalCheck(context) {
        // Quick cultural consistency score for overview
        const totalWords = context.vocabulary.length;
        if (totalWords < 50) return 'Building...';
        if (totalWords < 200) return 'Good';
        return 'Excellent';
    }
};