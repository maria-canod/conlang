// Cultural Context Module - Rich Cultural Background Generator
window.CulturalModule = {
    currentCulture: {
        type: 'tribal',
        socialStructure: 'egalitarian',
        namingPatterns: {},
        concepts: [],
        socialSystem: 'council',
        calendar: {},
        values: []
    },
    generatedNames: [],
    generatedConcepts: [],
    generatedSocialTerms: {},
    generatedCalendarTerms: [],
    generatedMythology: {},
    generatedTraditions: {},

    init() {
        console.log('CulturalModule initialized');
        this.bindEvents();
        this.loadCulturalData();
    },

    bindEvents() {
        // Generate culture button
        const generateCultureBtn = document.getElementById('generate-culture-btn');
        if (generateCultureBtn) {
            generateCultureBtn.onclick = () => this.generateCulture();
        }

        // Generate names button
        const generateNamesBtn = document.getElementById('generate-names-btn');
        if (generateNamesBtn) {
            generateNamesBtn.onclick = () => this.generateNames();
        }

        // Add pattern button
        const addPatternBtn = document.getElementById('add-name-pattern-btn');
        if (addPatternBtn) {
            addPatternBtn.onclick = () => this.showAddPatternModal();
        }

        // Generate concepts button
        const generateConceptsBtn = document.getElementById('generate-concepts-btn');
        if (generateConceptsBtn) {
            generateConceptsBtn.onclick = () => this.generateConcepts();
        }

        // Generate social structure button (UPDATED - replaces kinship)
        const generateSocialBtn = document.getElementById('generate-social-btn');
        if (generateSocialBtn) {
            generateSocialBtn.onclick = () => this.generateSocialStructure();
        }

        // Generate calendar button
        const generateCalendarBtn = document.getElementById('generate-calendar-btn');
        if (generateCalendarBtn) {
            generateCalendarBtn.onclick = () => this.generateCalendar();
        }

        // Generate mythology button
        const generateMythologyBtn = document.getElementById('generate-mythology-btn');
        if (generateMythologyBtn) {
            generateMythologyBtn.onclick = () => this.generateMythology();
        }

        // Generate traditions button  
        const generateTraditionsBtn = document.getElementById('generate-traditions-btn');
        if (generateTraditionsBtn) {
            generateTraditionsBtn.onclick = () => this.generateTraditions();
        }

        // Export names button
        const exportNamesBtn = document.getElementById('export-names-btn');
        if (exportNamesBtn) {
            exportNamesBtn.onclick = () => this.exportNames();
        }

        console.log('Cultural events bound');
    },

    loadCulturalData() {
        // Load from language data if it exists
        if (window.generator && window.generator.language && window.generator.language.culture) {
            this.currentCulture = { ...this.currentCulture, ...window.generator.language.culture };
        }
    },

    generateCulture() {
        const cultureType = document.getElementById('culture-type')?.value || 'tribal';
        const socialStructure = document.getElementById('social-structure')?.value || 'egalitarian';
        
        this.currentCulture.type = cultureType;
        this.currentCulture.socialStructure = socialStructure;
        
        // Generate cultural profile
        const profile = this.createCulturalProfile(cultureType, socialStructure);
        this.displayCulturalOverview(profile);
        
        // Generate basic naming patterns
        this.generateBasicNamingPatterns(cultureType, socialStructure);
        
        // Save to language data
        if (window.generator && window.generator.language) {
            window.generator.language.culture = { ...window.generator.language.culture, ...this.currentCulture };
        }
        
        if (window.ActivityModule) {
            window.ActivityModule.addActivity(`Generated ${cultureType} culture with ${socialStructure} structure`, 'culture');
        }
        
        showToast('Cultural foundation created!', 'success');
    },

    createCulturalProfile(cultureType, socialStructure) {
        const profiles = {
            tribal: {
                description: 'Small, tight-knit communities with strong oral traditions',
                lifestyle: 'Semi-nomadic with seasonal migrations',
                leadership: 'Elder councils and respected warriors',
                values: ['loyalty', 'tradition', 'courage', 'unity']
            },
            agricultural: {
                description: 'Settled farming communities with seasonal rhythms',
                lifestyle: 'Sedentary with deep connection to land',
                leadership: 'Land-owners and harvest coordinators',
                values: ['patience', 'hard work', 'community', 'seasons']
            },
            nomadic: {
                description: 'Mobile groups following herds or trade routes',
                lifestyle: 'Constantly moving with portable possessions',
                leadership: 'Path-finders and resource managers',
                values: ['adaptability', 'freedom', 'survival', 'movement']
            },
            maritime: {
                description: 'Coastal peoples dependent on sea and rivers',
                lifestyle: 'Fishing, trading, and boat-building focused',
                leadership: 'Ship captains and tide-readers',
                values: ['navigation', 'tides', 'cooperation', 'weather']
            },
            urban: {
                description: 'Dense settlements with specialized occupations',
                lifestyle: 'Complex social interactions and trade',
                leadership: 'Merchant guilds and city councils',
                values: ['innovation', 'trade', 'specialization', 'progress']
            },
            mountain: {
                description: 'High-altitude communities adapted to harsh terrain',
                lifestyle: 'Terraced farming and mining focused',
                leadership: 'Mountain guides and weather-watchers',
                values: ['endurance', 'heights', 'stone', 'perseverance']
            },
            desert: {
                description: 'Arid-adapted peoples with water-conservation focus',
                lifestyle: 'Oasis-centered with careful resource management',
                leadership: 'Water-keepers and sun-readers',
                values: ['conservation', 'sun', 'survival', 'scarcity']
            },
            forest: {
                description: 'Woodland peoples with deep plant knowledge',
                lifestyle: 'Tree-centered with seasonal gathering',
                leadership: 'Grove-keepers and animal-speakers',
                values: ['growth', 'seasons', 'balance', 'nature']
            }
        };

        const structureModifiers = {
            egalitarian: {
                emphasis: 'equality and shared decision-making',
                power: 'distributed among all members'
            },
            hierarchical: {
                emphasis: 'clear ranks and structured authority',
                power: 'concentrated in leadership tiers'
            },
            'clan-based': {
                emphasis: 'family lineages and inherited roles',
                power: 'held by prominent family lines'
            },
            'age-based': {
                emphasis: 'respect for elders and life experience',
                power: 'increases with age and wisdom'
            },
            'merit-based': {
                emphasis: 'achievement and demonstrated skill',
                power: 'earned through accomplishment'
            },
            'caste-system': {
                emphasis: 'fixed social roles and ritual purity',
                power: 'determined by birth and tradition'
            }
        };

        const baseProfile = profiles[cultureType] || profiles.tribal;
        const structureMod = structureModifiers[socialStructure] || structureModifiers.egalitarian;

        return {
            ...baseProfile,
            socialEmphasis: structureMod.emphasis,
            powerStructure: structureMod.power,
            cultureType,
            socialStructure
        };
    },

    displayCulturalOverview(profile) {
        const summaryDiv = document.getElementById('culture-summary');
        const overviewDiv = document.getElementById('cultural-overview');
        
        if (!summaryDiv || !overviewDiv) return;
        
        summaryDiv.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                    <h5 style="color: var(--accent-primary); margin-bottom: 10px;">Cultural Foundation</h5>
                    <p style="margin-bottom: 15px;"><strong>Type:</strong> ${profile.cultureType} society</p>
                    <p style="margin-bottom: 15px;"><strong>Structure:</strong> ${profile.socialStructure}</p>
                    <p style="margin-bottom: 15px;"><strong>Description:</strong> ${profile.description}</p>
                    <p style="margin-bottom: 15px;"><strong>Lifestyle:</strong> ${profile.lifestyle}</p>
                </div>
                <div>
                    <h5 style="color: var(--accent-primary); margin-bottom: 10px;">Social Organization</h5>
                    <p style="margin-bottom: 15px;"><strong>Leadership:</strong> ${profile.leadership}</p>
                    <p style="margin-bottom: 15px;"><strong>Power Structure:</strong> ${profile.powerStructure}</p>
                    <p style="margin-bottom: 15px;"><strong>Social Emphasis:</strong> ${profile.socialEmphasis}</p>
                </div>
            </div>
            
            <div style="margin-top: 20px;">
                <h5 style="color: var(--accent-primary); margin-bottom: 10px;">Core Values</h5>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                    ${profile.values.map(value => `<span class="morpheme-tag">${value}</span>`).join('')}
                </div>
            </div>
        `;
        
        overviewDiv.style.display = 'block';
        
        // Save cultural profile
        this.currentCulture.profile = profile;
    },

    generateBasicNamingPatterns(cultureType, socialStructure) {
        const patterns = {
            tribal: ['[vowel][consonant][vowel]', '[consonant][vowel][consonant][vowel]'],
            agricultural: ['[consonant][vowel][consonant]', '[vowel][consonant][vowel][consonant]'],
            nomadic: ['[consonant][consonant][vowel]', '[vowel][consonant][consonant][vowel]'],
            maritime: ['[vowel][vowel][consonant]', '[consonant][vowel][vowel]'],
            urban: ['[consonant][vowel][consonant][consonant]', '[vowel][consonant][vowel][consonant]'],
            mountain: ['[consonant][consonant][vowel][consonant]', '[vowel][consonant][consonant]'],
            desert: ['[vowel][consonant][vowel][vowel]', '[consonant][vowel][vowel][consonant]'],
            forest: ['[consonant][vowel][consonant][vowel][consonant]', '[vowel][consonant][vowel]']
        };

        this.currentCulture.namingPatterns = {
            personal: patterns[cultureType] || patterns.tribal,
            place: patterns[cultureType] || patterns.tribal
        };
    },

    generateNames() {
        const nameType = document.getElementById('name-type')?.value || 'personal';
        const nameCount = parseInt(document.getElementById('name-count')?.value) || 10;
        
        const names = [];
        const patterns = this.currentCulture.namingPatterns[nameType] || ['[consonant][vowel][consonant][vowel]'];
        
        for (let i = 0; i < nameCount; i++) {
            const pattern = patterns[Math.floor(Math.random() * patterns.length)];
            const name = this.generateNameFromPattern(pattern);
            names.push({
                name: name,
                type: nameType,
                meaning: this.generateNameMeaning(name, nameType),
                culturalContext: this.getNameContext(nameType)
            });
        }
        
        this.generatedNames = names;
        this.displayNames(names);
        
        if (window.ActivityModule) {
            window.ActivityModule.addActivity(`Generated ${nameCount} ${nameType} names`, 'culture');
        }
        
        showToast(`Generated ${nameCount} ${nameType} names!`, 'success');
    },

    generateNameFromPattern(pattern) {
        if (!window.generator || !window.generator.language.phonology) {
            // Fallback if no phonology exists
            return this.generateBasicName();
        }
        
        const vowels = window.generator.language.phonology.vowels || ['a', 'e', 'i', 'o', 'u'];
        const consonants = window.generator.language.phonology.consonants || ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z'];
        
        return pattern.replace(/\[vowel\]/g, () => vowels[Math.floor(Math.random() * vowels.length)])
                     .replace(/\[consonant\]/g, () => consonants[Math.floor(Math.random() * consonants.length)])
                     .replace(/^./, match => match.toUpperCase());
    },

    generateBasicName() {
        const syllables = ['ka', 'la', 'ma', 'na', 'ra', 'sa', 'ta', 'va', 'za', 'do', 'go', 'ho', 'ko', 'lo', 'mo', 'no', 'po', 'ro', 'so', 'to'];
        const length = Math.floor(Math.random() * 3) + 2;
        let name = '';
        
        for (let i = 0; i < length; i++) {
            name += syllables[Math.floor(Math.random() * syllables.length)];
        }
        
        return name.charAt(0).toUpperCase() + name.slice(1);
    },

    generateNameMeaning(name, type) {
        const personalMeanings = ['bright star', 'swift wind', 'strong heart', 'wise one', 'gentle spirit', 'mountain peak', 'flowing water', 'dancing flame', 'quiet dawn', 'brave soul'];
        const placeMeanings = ['hidden valley', 'crystal lake', 'ancient grove', 'windy hill', 'sacred spring', 'stone circle', 'sunset ridge', 'misty hollow', 'golden meadow', 'deep well'];
        
        const meanings = type === 'personal' ? personalMeanings : placeMeanings;
        return meanings[Math.floor(Math.random() * meanings.length)];
    },

    getNameContext(type) {
        const contexts = {
            personal: 'Given at birth ceremonies based on natural omens',
            place: 'Named by early settlers for distinctive features'
        };
        return contexts[type] || 'Traditional naming practices';
    },

    displayNames(names) {
        const namesDisplay = document.getElementById('names-display');
        const namesSection = document.getElementById('generated-names');
        const namesCount = document.getElementById('names-count');
        
        if (!namesDisplay || !namesSection) return;
        
        // Update the count display
        if (namesCount) {
            namesCount.textContent = `${names.length} names generated`;
        }
        
        // Only populate the grid with names, don't add another export button
        namesDisplay.innerHTML = names.map(name => `
            <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid var(--border-light); box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <h6 style="color: var(--accent-primary); margin-bottom: 8px; font-weight: 700;">${name.name}</h6>
                <p style="margin-bottom: 8px; font-weight: 600; color: var(--text-primary);">${name.meaning}</p>
                <p style="margin-bottom: 10px; font-size: 0.9em; color: var(--text-secondary); line-height: 1.4;">${name.culturalContext}</p>
                <span style="background: var(--accent-primary); color: white; padding: 3px 8px; border-radius: 12px; font-size: 0.75em; text-transform: uppercase; font-weight: 600;">${name.type}</span>
            </div>
        `).join('');
        
        // Show the section (the export button is already in the HTML template)
        namesSection.style.display = 'block';
    },

    generateConcepts() {
        const selectedConcepts = [];
        
        // Check which concept types are selected
        const emotionCheck = document.getElementById('concept-emotions')?.checked;
        const relationshipCheck = document.getElementById('concept-relationships')?.checked;
        const timeCheck = document.getElementById('concept-time')?.checked;
        const spaceCheck = document.getElementById('concept-space')?.checked;
        const honorCheck = document.getElementById('concept-honor')?.checked;
        const natureCheck = document.getElementById('concept-nature')?.checked;
        
        if (emotionCheck) selectedConcepts.push('emotions');
        if (relationshipCheck) selectedConcepts.push('relationships');
        if (timeCheck) selectedConcepts.push('time');
        if (spaceCheck) selectedConcepts.push('space');
        if (honorCheck) selectedConcepts.push('honor');
        if (natureCheck) selectedConcepts.push('nature');
        
        if (selectedConcepts.length === 0) {
            showToast('Please select at least one concept category!', 'error');
            return;
        }
        
        const concepts = this.createCulturalConcepts(selectedConcepts);
        this.generatedConcepts = concepts;
        this.displayConcepts(concepts);
        
        if (window.ActivityModule) {
            window.ActivityModule.addActivity(`Generated cultural concepts: ${selectedConcepts.join(', ')}`, 'culture');
        }
        
        showToast('Cultural concepts generated!', 'success');
    },

    createCulturalConcepts(categories) {
        const conceptLibrary = {
            emotions: [
                { concept: 'melancholy for distant places', example: 'A specific sadness felt when thinking of faraway lands' },
                { concept: 'joy from shared work', example: 'Happiness derived from communal tasks' },
                { concept: 'anticipation of seasons', example: 'Excitement for the changing of seasons' },
                { concept: 'contentment with simplicity', example: 'Peace found in basic pleasures' },
                { concept: 'pride in craftsmanship', example: 'Deep satisfaction from skilled work' }
            ],
            relationships: [
                { concept: 'bond between rivals', example: 'Respectful connection with competitors' },
                { concept: 'duty to strangers', example: 'Obligation to help unknown travelers' },
                { concept: 'friendship through hardship', example: 'Bonds forged during difficult times' },
                { concept: 'kinship with nature', example: 'Feeling of family connection to natural world' },
                { concept: 'loyalty beyond death', example: 'Commitment that transcends mortality' }
            ],
            time: [
                { concept: 'circular time', example: 'Time as endless cycles rather than linear progression' },
                { concept: 'ancestor time', example: 'Past events existing simultaneously with present' },
                { concept: 'ritual time', example: 'Sacred moments outside normal time flow' },
                { concept: 'seasonal memory', example: 'Collective memory tied to seasonal cycles' },
                { concept: 'dream time', example: 'Time that exists in sleep and visions' }
            ],
            space: [
                { concept: 'sacred directions', example: 'Cardinal directions with spiritual significance' },
                { concept: 'threshold spaces', example: 'Places between worlds or states of being' },
                { concept: 'invisible boundaries', example: 'Unseen lines that define territories' },
                { concept: 'ancestral places', example: 'Locations where ancestors still dwell' },
                { concept: 'harmony geography', example: 'Landscape arranged for spiritual balance' }
            ],
            honor: [
                { concept: 'earned respect', example: 'Honor gained through specific achievements' },
                { concept: 'inherited shame', example: 'Dishonor passed down through generations' },
                { concept: 'collective dignity', example: 'Honor belonging to entire community' },
                { concept: 'quiet heroism', example: 'Valor in everyday acts rather than grand gestures' },
                { concept: 'redemptive sacrifice', example: 'Regaining honor through selfless acts' }
            ],
            nature: [
                { concept: 'plant consciousness', example: 'Belief that plants have awareness and feelings' },
                { concept: 'weather emotions', example: 'Attribution of moods and intentions to weather' },
                { concept: 'stone memory', example: 'Rocks as keepers of ancient knowledge' },
                { concept: 'river speech', example: 'Running water as a form of communication' },
                { concept: 'forest parliament', example: 'Trees as a council that makes decisions' }
            ]
        };
        
        const allConcepts = [];
        
        categories.forEach(category => {
            const concepts = conceptLibrary[category] || [];
            concepts.forEach(concept => {
                allConcepts.push({
                    ...concept,
                    category: category,
                    word: this.generateWordForConcept()
                });
            });
        });
        
        return allConcepts;
    },

    generateWordForConcept() {
        if (!window.generator || !window.generator.language.phonology) {
            return this.generateBasicName();
        }
        
        const vowels = window.generator.language.phonology.vowels || ['a', 'e', 'i', 'o', 'u'];
        const consonants = window.generator.language.phonology.consonants || ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z'];
        
        const syllableCount = Math.floor(Math.random() * 2) + 2; // 2-3 syllables
        let word = '';
        
        for (let i = 0; i < syllableCount; i++) {
            const consonant = consonants[Math.floor(Math.random() * consonants.length)];
            const vowel = vowels[Math.floor(Math.random() * vowels.length)];
            word += consonant + vowel;
        }
        
        return word;
    },

    displayConcepts(concepts) {
        const conceptsDisplay = document.getElementById('concepts-display');
        const conceptsSection = document.getElementById('cultural-concepts');
        
        if (!conceptsDisplay || !conceptsSection) return;
        
        // Group by category
        const groupedConcepts = {};
        concepts.forEach(concept => {
            if (!groupedConcepts[concept.category]) {
                groupedConcepts[concept.category] = [];
            }
            groupedConcepts[concept.category].push(concept);
        });
        
        const categoryColors = {
            emotions: '#ff9800',
            relationships: '#2196F3',
            time: '#9c27b0',
            space: '#4CAF50',
            honor: '#f44336',
            nature: '#8bc34a'
        };
        
        let displayHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h6 style="color: var(--accent-primary); margin: 0;">Cultural Concepts</h6>
                <button class="btn btn-success" onclick="CulturalModule.addConceptsToVocabulary()">
                    ➕ Add Concepts to Dictionary
                </button>
            </div>
        `;
        
        Object.entries(groupedConcepts).forEach(([category, categoryConcepts]) => {
            const color = categoryColors[category] || '#666';
            displayHTML += `
                <div style="margin-bottom: 25px;">
                    <h6 style="color: ${color}; margin-bottom: 15px; text-transform: capitalize;">🧠 ${category}</h6>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px;">
                        ${categoryConcepts.map(concept => `
                            <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid var(--border-light);">
                                <h6 style="color: var(--accent-primary); margin-bottom: 8px;">${concept.word}</h6>
                                <p style="margin-bottom: 8px; font-weight: 600;">${concept.concept}</p>
                                <p style="margin-bottom: 8px; font-size: 0.9em; color: #666;">${concept.example}</p>
                                <span style="background: ${color}; color: white; padding: 2px 6px; border-radius: 10px; font-size: 0.8em;">${category}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        });
        
        conceptsDisplay.innerHTML = displayHTML;
        conceptsSection.style.display = 'block';
        
        // Save concepts to culture data
        this.currentCulture.concepts = concepts;
        if (window.generator && window.generator.language) {
            window.generator.language.culture = { ...window.generator.language.culture, ...this.currentCulture };
        }
    },

    addConceptsToVocabulary() {
        if (!this.generatedConcepts || this.generatedConcepts.length === 0) {
            showToast('No cultural concepts to add! Generate some concepts first.', 'error');
            return;
        }
        
        const categoryAdjectives = {
            emotions: 'adjective',
            relationships: 'noun',
            time: 'noun',
            space: 'noun',
            honor: 'noun',
            nature: 'noun'
        };
        
        const wordsAdded = [];
        
        this.generatedConcepts.forEach(concept => {
            const newWord = {
                conlang: concept.word,
                english: concept.concept,
                pos: categoryAdjectives[concept.category] || 'noun',
                notes: `Cultural concept: ${concept.example}`,
                type: 'cultural',
                dateAdded: new Date().toLocaleDateString()
            };
            
            // Check for duplicates
            const allWords = window.appState.getState('allWords') || [];
            const duplicate = allWords.find(w => w.conlang.toLowerCase() === newWord.conlang.toLowerCase());
            
            if (!duplicate) {
                // Add to language data
                if (!window.generator.language.customWords) {
                    window.generator.language.customWords = [];
                }
                window.generator.language.customWords.push(newWord);
                
                // Update state
                window.appState.addWord(newWord);
                wordsAdded.push(newWord);
            }
        });
        
        // Update displays
        if (window.VocabularyModule) {
            window.VocabularyModule.updateDisplay();
        }
        
        if (window.ActivityModule) {
            window.ActivityModule.addActivity(`Added ${wordsAdded.length} cultural concepts to vocabulary`, 'culture');
        }
        
        showToast(`Added ${wordsAdded.length} cultural concepts to dictionary!`, 'success');
    },

    // NEW: Generate Social Structure vocabulary (replaces kinship)
    generateSocialStructure() {
        const governanceType = document.getElementById('governance-type')?.value || 'council';
        const socialFocus = document.getElementById('social-focus')?.value || 'community';
        
        const socialTerms = this.createSocialStructureSystem(governanceType, socialFocus);
        
        this.generatedSocialTerms = socialTerms; // Store for dictionary addition
        this.displaySocialStructure(socialTerms);
        
        if (window.ActivityModule) {
            window.ActivityModule.addActivity(`Generated ${governanceType} governance with ${socialFocus} focus`, 'culture');
        }
        
        showToast(`Generated social structure vocabulary!`, 'success');
    },

    createSocialStructureSystem(governanceType, socialFocus) {
        const governanceTerms = {
            council: [
                'council', 'councilor', 'assembly', 'deliberation', 'consensus', 'decision-maker',
                'spokesperson', 'mediator', 'representative', 'voting', 'agreement', 'discussion'
            ],
            elder: [
                'elder', 'wisdom-keeper', 'advisor', 'guidance', 'tradition-bearer', 'respected-one',
                'life-experience', 'storyteller', 'mentor', 'sage', 'elder-council', 'ancient-knowledge'
            ],
            democratic: [
                'citizen', 'vote', 'election', 'majority', 'minority', 'candidate', 'representative',
                'democracy', 'freedom', 'equality', 'rights', 'participation', 'public-will'
            ],
            autocratic: [
                'ruler', 'authority', 'command', 'obedience', 'decree', 'sovereign', 'subject',
                'loyalty', 'power', 'hierarchy', 'order', 'discipline', 'absolute-rule'
            ],
            tribal: [
                'chief', 'war-leader', 'peace-keeper', 'tribe', 'band', 'leader', 'follower',
                'tribal-law', 'custom', 'tradition', 'unity', 'loyalty', 'tribal-bond'
            ],
            meritocratic: [
                'achievement', 'skill', 'talent', 'competence', 'expertise', 'mastery', 'recognition',
                'merit', 'earned-position', 'ability', 'excellence', 'accomplishment', 'worthiness'
            ],
            spiritual: [
                'spiritual-leader', 'divine-guidance', 'sacred-duty', 'ritual-keeper', 'blessed-one',
                'spiritual-wisdom', 'ceremony', 'sacred-law', 'divine-will', 'spiritual-community', 'faith', 'devotion'
            ]
        };

        const socialFocusTerms = {
            community: [
                'cooperation', 'togetherness', 'collective', 'unity', 'shared-purpose', 'common-good',
                'mutual-aid', 'solidarity', 'belonging', 'community-spirit', 'working-together', 'support'
            ],
            individual: [
                'self-reliance', 'independence', 'personal-achievement', 'individual-rights', 'freedom',
                'self-determination', 'personal-responsibility', 'autonomy', 'self-improvement', 'ambition', 'initiative', 'self-worth'
            ],
            honor: [
                'honor', 'dignity', 'respect', 'reputation', 'integrity', 'noble-conduct',
                'honorable', 'shame', 'dishonor', 'pride', 'moral-standing', 'virtue'
            ],
            duty: [
                'duty', 'obligation', 'responsibility', 'service', 'commitment', 'dedication',
                'loyalty', 'faithfulness', 'sacrifice', 'devotion', 'sworn-oath', 'moral-duty'
            ],
            wisdom: [
                'wisdom', 'knowledge', 'understanding', 'insight', 'learning', 'teaching',
                'education', 'enlightenment', 'study', 'intellectual', 'scholar', 'truth-seeker'
            ],
            harmony: [
                'harmony', 'balance', 'peace', 'tranquility', 'stability', 'equilibrium',
                'peaceful-coexistence', 'calm', 'serenity', 'social-balance', 'gentle-ways', 'non-conflict'
            ],
            strength: [
                'strength', 'courage', 'bravery', 'warrior-spirit', 'resilience', 'fortitude',
                'endurance', 'determination', 'fearlessness', 'bold', 'mighty', 'powerful'
            ]
        };

        const govTerms = governanceTerms[governanceType] || governanceTerms.council;
        const focusTerms = socialFocusTerms[socialFocus] || socialFocusTerms.community;
        
        // Combine and create vocabulary
        const allTerms = [...govTerms, ...focusTerms];
        const socialStructure = {};
        
        allTerms.forEach(term => {
            socialStructure[term] = {
                word: this.generateWordForConcept(),
                meaning: term.replace(/-/g, ' '),
                category: govTerms.includes(term) ? 'governance' : 'social-values',
                description: this.getSocialDescription(term, governanceType, socialFocus),
                importance: this.getSocialImportance(term)
            };
        });
        
        return socialStructure;
    },

    getSocialDescription(term, governanceType, socialFocus) {
        const descriptions = {
            'council': 'A group of people who meet to discuss and make decisions',
            'elder': 'Respected older person whose experience guides the community',
            'consensus': 'Agreement reached by discussion until everyone agrees',
            'wisdom-keeper': 'Person who preserves and shares important knowledge',
            'cooperation': 'Working together toward common goals',
            'honor': 'Respect earned through virtuous behavior',
            'duty': 'Moral obligation to fulfill responsibilities',
            'spiritual-leader': 'Person who guides others in matters of faith and spirit',
            'merit': 'Worth based on actual achievements and abilities',
            'courage': 'Bravery in the face of danger or difficulty',
            'harmony': 'Peaceful balance between different elements'
        };
        
        return descriptions[term] || `Important ${term.includes('governance') ? 'leadership' : 'social'} concept in ${governanceType} society`;
    },

    getSocialImportance(term) {
        const highImportance = ['leader', 'elder', 'chief', 'ruler', 'council', 'wisdom', 'honor', 'duty'];
        const mediumImportance = ['respect', 'cooperation', 'unity', 'tradition', 'service', 'loyalty'];
        
        if (highImportance.some(important => term.includes(important))) return 'Core Value';
        if (mediumImportance.some(important => term.includes(important))) return 'Important';
        return 'Supporting';
    },

    displaySocialStructure(socialTerms) {
        const socialDisplay = document.getElementById('social-display');
        const socialSection = document.getElementById('social-terms');
        
        if (!socialDisplay || !socialSection) return;
        
        // Group by category
        const governance = Object.entries(socialTerms).filter(([_, data]) => data.category === 'governance');
        const socialValues = Object.entries(socialTerms).filter(([_, data]) => data.category === 'social-values');
        
        socialDisplay.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h6 style="color: var(--accent-primary); margin: 0;">Social Structure Terms</h6>
                <button class="btn btn-success" onclick="CulturalModule.addSocialTermsToVocabulary()">
                    ➕ Add Social Terms to Dictionary
                </button>
            </div>
            
            <div style="margin-bottom: 25px;">
                <h6 style="color: #2196F3; margin-bottom: 15px;">🏛️ Governance & Leadership</h6>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px;">
                    ${governance.map(([term, data]) => `
                        <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid var(--border-light);">
                            <h6 style="color: var(--accent-primary); margin-bottom: 8px;">${data.word}</h6>
                            <p style="margin-bottom: 8px; font-weight: 600;">${data.meaning}</p>
                            <p style="margin-bottom: 8px; font-size: 0.9em; color: #666;">${data.description}</p>
                            <span style="background: #2196F3; color: white; padding: 2px 6px; border-radius: 10px; font-size: 0.8em;">${data.importance}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div>
                <h6 style="color: #9c27b0; margin-bottom: 15px;">💫 Social Values & Concepts</h6>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px;">
                    ${socialValues.map(([term, data]) => `
                        <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid var(--border-light);">
                            <h6 style="color: var(--accent-primary); margin-bottom: 8px;">${data.word}</h6>
                            <p style="margin-bottom: 8px; font-weight: 600;">${data.meaning}</p>
                            <p style="margin-bottom: 8px; font-size: 0.9em; color: #666;">${data.description}</p>
                            <span style="background: #9c27b0; color: white; padding: 2px 6px; border-radius: 10px; font-size: 0.8em;">${data.importance}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        socialSection.style.display = 'block';
        
        // Save to culture data
        this.currentCulture.socialTerms = socialTerms;
        if (window.generator && window.generator.language) {
            window.generator.language.culture = { ...window.generator.language.culture, ...this.currentCulture };
        }
    },

    addSocialTermsToVocabulary() {
        if (!this.generatedSocialTerms || Object.keys(this.generatedSocialTerms).length === 0) {
            showToast('No social terms to add! Generate social structure first.', 'error');
            return;
        }
        
        const wordsAdded = [];
        
        Object.entries(this.generatedSocialTerms).forEach(([term, data]) => {
            const newWord = {
                conlang: data.word,
                english: data.meaning,
                pos: data.category === 'governance' ? 'noun' : 'noun',
                notes: `Social concept: ${data.description} (${data.importance})`,
                type: 'social-structure',
                dateAdded: new Date().toLocaleDateString()
            };
            
            // Check for duplicates
            const allWords = window.appState.getState('allWords') || [];
            const duplicate = allWords.find(w => w.conlang.toLowerCase() === newWord.conlang.toLowerCase());
            
            if (!duplicate) {
                // Add to language data
                if (!window.generator.language.customWords) {
                    window.generator.language.customWords = [];
                }
                window.generator.language.customWords.push(newWord);
                
                // Update state
                window.appState.addWord(newWord);
                wordsAdded.push(newWord);
            }
        });
        
        // Update displays
        if (window.VocabularyModule) {
            window.VocabularyModule.updateDisplay();
        }
        
        if (window.ActivityModule) {
            window.ActivityModule.addActivity(`Added ${wordsAdded.length} social structure terms to vocabulary`, 'culture');
        }
        
        showToast(`Added ${wordsAdded.length} social structure terms to dictionary!`, 'success');
    },

    generateCalendar() {
        const calendarBase = document.getElementById('calendar-base')?.value || 'solar';
        const timeFocus = document.getElementById('time-focus')?.value || 'cyclical';
        
        const calendar = this.createCalendarSystem(calendarBase, timeFocus);
        this.generatedCalendarTerms = calendar.culturalEvents; // Store for dictionary addition
        this.displayCalendar(calendar);
        
        if (window.ActivityModule) {
            window.ActivityModule.addActivity(`Generated ${calendarBase} calendar with ${timeFocus} time concept`, 'culture');
        }
        
        showToast('Calendar system generated!', 'success');
    },

    createCalendarSystem(base, focus) {
        const calendarSystems = {
            solar: {
                name: 'Solar Observation Calendar',
                description: 'A calendar that tracks the sun\'s journey across the sky, marking sacred moments of light and shadow',
                divisions: ['Dawn Season', 'Zenith Season', 'Twilight Season', 'Shadow Season'],
                timeTerms: {
                    day: 'light-cycle',
                    week: 'sun-pattern',
                    month: 'brightness-turn',
                    year: 'great-circle',
                    hour: 'shadow-mark'
                },
                culturalEvents: {
                    'sun-awakening': { name: 'sun-awakening', meaning: 'first dawn ceremony when winter ends' },
                    'light-triumph': { name: 'light-triumph', meaning: 'summer solstice victory of day over night' },
                    'balance-dance': { name: 'balance-dance', meaning: 'equinox celebration of equal light and dark' },
                    'sun-farewell': { name: 'sun-farewell', meaning: 'winter preparation ritual as daylight wanes' },
                    'shadow-wisdom': { name: 'shadow-wisdom', meaning: 'midnight ceremony honoring darkness' }
                }
            },
            lunar: {
                name: 'Lunar Phase Calendar',
                description: 'A calendar following the moon\'s eternal dance, marking cycles of renewal and reflection',
                divisions: ['Dark Time', 'Growing Light', 'Full Brightness', 'Fading Light'],
                timeTerms: {
                    day: 'moon-breath',
                    week: 'phase-turn',
                    month: 'full-dance',
                    year: 'moon-journey',
                    hour: 'tide-moment'
                },
                culturalEvents: {
                    'void-silence': { name: 'void-silence', meaning: 'new moon meditation in complete darkness' },
                    'silver-rising': { name: 'silver-rising', meaning: 'first crescent celebration of new beginnings' },
                    'pearl-glory': { name: 'pearl-glory', meaning: 'full moon festival of illumination and dreams' },
                    'fade-wisdom': { name: 'fade-wisdom', meaning: 'waning moon ceremony of release and letting go' },
                    'tide-calling': { name: 'tide-calling', meaning: 'ritual honoring moon\'s pull on waters' }
                }
            },
            stellar: {
                name: 'Stellar Navigation Calendar',
                description: 'A calendar based on star patterns, treating constellations as cosmic guides and storytellers',
                divisions: ['Star-Rise Era', 'Constellation Peak', 'Star-Fall Era', 'Void Season'],
                timeTerms: {
                    day: 'star-turn',
                    week: 'constellation-shift',
                    month: 'sky-story',
                    year: 'star-wheel',
                    hour: 'celestial-beat'
                },
                culturalEvents: {
                    'star-birth': { name: 'star-birth', meaning: 'ceremony welcoming new visible constellations' },
                    'sky-reading': { name: 'sky-reading', meaning: 'astronomical divination and prophecy night' },
                    'star-song': { name: 'star-song', meaning: 'musical storytelling following constellation myths' },
                    'void-journey': { name: 'void-journey', meaning: 'spiritual quest during starless cloudy periods' },
                    'comet-blessing': { name: 'comet-blessing', meaning: 'rare celebration when comets appear' }
                }
            },
            tidal: {
                name: 'Tidal Flow Calendar',
                description: 'A calendar synchronized with ocean rhythms, honoring the eternal push and pull of waters',
                divisions: ['High Flow', 'Ebb Current', 'Low Rest', 'Rising Surge'],
                timeTerms: {
                    day: 'tide-cycle',
                    week: 'flow-pattern',
                    month: 'great-tide',
                    year: 'ocean-breath',
                    hour: 'water-pulse'
                },
                culturalEvents: {
                    'spring-surge': { name: 'spring-surge', meaning: 'celebration of the year\'s highest tides' },
                    'calm-gathering': { name: 'calm-gathering', meaning: 'peaceful ceremony during lowest tides' },
                    'storm-dancing': { name: 'storm-dancing', meaning: 'wild ritual honoring tempestuous seas' },
                    'pearl-diving': { name: 'pearl-diving', meaning: 'ceremonial underwater treasure seeking' },
                    'salt-blessing': { name: 'salt-blessing', meaning: 'purification ritual using sacred seawater' }
                }
            },
            agricultural: {
                name: 'Harvest Cycle Calendar',
                description: 'A calendar rooted in the sacred relationship between people and the growing earth',
                divisions: ['Seed Time', 'Growth Time', 'Harvest Time', 'Rest Time'],
                timeTerms: {
                    day: 'growth-turn',
                    week: 'plant-cycle',
                    month: 'crop-stage',
                    year: 'earth-circle',
                    hour: 'soil-moment'
                },
                culturalEvents: {
                    'seed-blessing': { name: 'seed-blessing', meaning: 'ceremony consecrating seeds before planting' },
                    'first-sprout': { name: 'first-sprout', meaning: 'celebration when first crops emerge' },
                    'grain-joy': { name: 'grain-joy', meaning: 'harvest festival of abundance and gratitude' },
                    'field-rest': { name: 'field-rest', meaning: 'ritual honoring fallow land and soil renewal' },
                    'tool-sharpening': { name: 'tool-sharpening', meaning: 'ceremony preparing implements for next cycle' }
                }
            },
            animal: {
                name: 'Migration Rhythm Calendar',
                description: 'A calendar following animal movements, treating creatures as messengers of seasonal change',
                divisions: ['Arrival Season', 'Dwelling Season', 'Journey Season', 'Absence Season'],
                timeTerms: {
                    day: 'animal-path',
                    week: 'pack-journey',
                    month: 'migration-arc',
                    year: 'great-return',
                    hour: 'creature-sign'
                },
                culturalEvents: {
                    'wing-welcome': { name: 'wing-welcome', meaning: 'ceremony greeting returning migratory birds' },
                    'herd-thunder': { name: 'herd-thunder', meaning: 'festival celebrating mass animal migrations' },
                    'hunt-honor': { name: 'hunt-honor', meaning: 'respectful ritual before seasonal hunting' },
                    'den-quiet': { name: 'den-quiet', meaning: 'peaceful observance during animal hibernation' },
                    'track-reading': { name: 'track-reading', meaning: 'divination ceremony interpreting animal signs' }
                }
            },
            weather: {
                name: 'Storm Pattern Calendar',
                description: 'A calendar reading the sky\'s moods, treating weather as the breath of divine forces',
                divisions: ['Storm Season', 'Clear Season', 'Wind Season', 'Mist Season'],
                timeTerms: {
                    day: 'sky-mood',
                    week: 'weather-turn',
                    month: 'storm-cycle',
                    year: 'climate-wheel',
                    hour: 'wind-whisper'
                },
                culturalEvents: {
                    'thunder-calling': { name: 'thunder-calling', meaning: 'ritual summoning rain during dry periods' },
                    'wind-dancing': { name: 'wind-dancing', meaning: 'ceremony celebrating powerful storm winds' },
                    'mist-walking': { name: 'mist-walking', meaning: 'spiritual journey through morning fog' },
                    'sun-breaking': { name: 'sun-breaking', meaning: 'celebration when storms clear to reveal sunshine' },
                    'snow-silence': { name: 'snow-silence', meaning: 'meditative ceremony during first snowfall' }
                }
            },
            geological: {
                name: 'Earth Pulse Calendar',
                description: 'A calendar attuned to the deep rhythms of stone and earth, marking geological time',
                divisions: ['Stone Sleep', 'Earth Shift', 'Mountain Wake', 'Valley Dream'],
                timeTerms: {
                    day: 'stone-breath',
                    week: 'earth-pulse',
                    month: 'rock-age',
                    year: 'mountain-lifetime',
                    hour: 'crystal-moment'
                },
                culturalEvents: {
                    'stone-singing': { name: 'stone-singing', meaning: 'ceremony honoring ancient rocks and crystals' },
                    'earth-shaking': { name: 'earth-shaking', meaning: 'ritual marking earthquakes and tremors' },
                    'cave-seeking': { name: 'cave-seeking', meaning: 'underground pilgrimage to sacred caverns' },
                    'metal-forging': { name: 'metal-forging', meaning: 'ceremony working with metals from deep earth' },
                    'fossil-remembering': { name: 'fossil-remembering', meaning: 'ritual honoring ancient life preserved in stone' }
                }
            }
        };

        const timeConceptMods = {
            cyclical: ' with emphasis on recurring patterns',
            linear: ' with focus on progressive advancement',
            spiral: ' viewing time as upward spiraling cycles',
            layered: ' with multiple simultaneous time streams'
        };

        const system = calendarSystems[base] || calendarSystems.solar;
        
        // Generate conlang words for cultural events
        Object.values(system.culturalEvents).forEach(event => {
            event.conlangName = this.generateWordForConcept();
        });

        return {
            ...system,
            timeConcept: focus + timeConceptMods[focus]
        };
    },

    displayCalendar(calendar) {
        const calendarDisplay = document.getElementById('calendar-display');
        const calendarSection = document.getElementById('calendar-system');
        
        if (!calendarDisplay || !calendarSection) return;
        
        calendarDisplay.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h6 style="color: var(--accent-primary); margin: 0;">${calendar.name}</h6>
                <button class="btn btn-success" onclick="CulturalModule.addCalendarToVocabulary()">
                    ➕ Add Calendar Terms to Dictionary
                </button>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h6 style="color: var(--accent-secondary); margin-bottom: 10px;">Calendar Description</h6>
                <p style="margin-bottom: 10px;">${calendar.description}</p>
                <p style="color: #666; font-style: italic;">${calendar.timeConcept}</p>
                
                <h6 style="color: var(--accent-secondary); margin: 20px 0 10px 0;">Cultural Time Divisions</h6>
                <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 15px;">
                    ${calendar.divisions.map(division => `<span class="morpheme-tag">${division}</span>`).join('')}
                </div>

                <h6 style="color: var(--accent-secondary); margin: 20px 0 10px 0;">Time Terminology</h6>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-bottom: 15px;">
                    ${Object.entries(calendar.timeTerms || {}).map(([english, cultural]) => `
                        <div style="background: #f8f9fa; padding: 8px; border-radius: 4px; border-left: 3px solid var(--accent-primary);">
                            <strong>${english}:</strong><br>
                            <span style="color: var(--accent-primary); font-style: italic;">${cultural}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div>
                <h6 style="color: var(--accent-primary); margin-bottom: 15px;">🎭 Cultural Events & Festivals</h6>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px;">
                    ${Object.values(calendar.culturalEvents).map(event => `
                        <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid var(--border-light);">
                            <h6 style="color: var(--accent-primary); margin-bottom: 8px;">${event.conlangName}</h6>
                            <p style="margin-bottom: 8px; font-weight: 600;">${event.name}</p>
                            <p style="margin-bottom: 8px; font-size: 0.9em; color: #666;">${event.meaning}</p>
                            <span style="background: var(--accent-tertiary); color: white; padding: 2px 6px; border-radius: 10px; font-size: 0.8em;">festival</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        calendarSection.style.display = 'block';
        
        // Save calendar to culture data
        this.currentCulture.calendar = calendar;
        if (window.generator && window.generator.language) {
            window.generator.language.culture = { ...window.generator.language.culture, ...this.currentCulture };
        }
    },

    addCalendarToVocabulary() {
        if (!this.generatedCalendarTerms || Object.keys(this.generatedCalendarTerms).length === 0) {
            showToast('No calendar terms to add! Generate calendar system first.', 'error');
            return;
        }
        
        const wordsAdded = [];
        
        Object.values(this.generatedCalendarTerms).forEach(event => {
            const newWord = {
                conlang: event.conlangName,
                english: event.name,
                pos: 'noun',
                notes: `Cultural event: ${event.meaning}`,
                type: 'calendar',
                dateAdded: new Date().toLocaleDateString()
            };
            
            // Check for duplicates
            const allWords = window.appState.getState('allWords') || [];
            const duplicate = allWords.find(w => w.conlang.toLowerCase() === newWord.conlang.toLowerCase());
            
            if (!duplicate) {
                // Add to language data
                if (!window.generator.language.customWords) {
                    window.generator.language.customWords = [];
                }
                window.generator.language.customWords.push(newWord);
                
                // Update state
                window.appState.addWord(newWord);
                wordsAdded.push(newWord);
            }
        });
        
        // Update displays
        if (window.VocabularyModule) {
            window.VocabularyModule.updateDisplay();
        }
        
        if (window.ActivityModule) {
            window.ActivityModule.addActivity(`Added ${wordsAdded.length} calendar terms to vocabulary`, 'culture');
        }
        
        showToast(`Added ${wordsAdded.length} calendar terms to dictionary!`, 'success');
    },

    exportNames() {
        if (!this.generatedNames || this.generatedNames.length === 0) {
            showToast('No names to export! Generate names first.', 'error');
            return;
        }
        
        let exportText = `CULTURAL NAMES\n`;
        exportText += `Generated: ${new Date().toLocaleDateString()}\n`;
        exportText += `Culture: ${this.currentCulture.type} (${this.currentCulture.socialStructure})\n\n`;
        
        // Group by type
        const namesByType = {};
        this.generatedNames.forEach(name => {
            if (!namesByType[name.type]) namesByType[name.type] = [];
            namesByType[name.type].push(name);
        });
        
        Object.entries(namesByType).forEach(([type, names]) => {
            exportText += `${type.toUpperCase()} NAMES\n`;
            exportText += `${'='.repeat(30)}\n`;
            names.forEach(name => {
                exportText += `${name.name} - "${name.meaning}"\n`;
                exportText += `  Context: ${name.culturalContext}\n\n`;
            });
            exportText += `\n`;
        });
        
        // Create and download file
        const blob = new Blob([exportText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cultural_names.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast('Names exported successfully!', 'success');
    },

    showAddPatternModal() {
    // Implementation for adding custom naming patterns
    showToast('Custom pattern modal not yet implemented.', 'info');
    },

    // Mythology Generation Functions
    generateMythology() {
        const mythologyType = document.getElementById('mythology-type')?.value || 'creation';
        const spiritualPower = document.getElementById('spiritual-power')?.value || 'elemental';
        
        const mythology = this.createMythologySystem(mythologyType, spiritualPower);
        this.generatedMythology = mythology;
        this.displayMythology(mythology);
        
        if (window.ActivityModule) {
            window.ActivityModule.addActivity(`Generated ${mythologyType} mythology with ${spiritualPower} power source`, 'culture');
        }
        
        showToast('Mythology system generated!', 'success');
    },

    createMythologySystem(type, powerSource) {
        const mythologyTypes = {
            creation: {
                name: 'Creation Mythology',
                description: 'Stories explaining how the world and life began',
                pantheon: this.generateCreationPantheon(powerSource),
                myths: this.generateCreationMyths(powerSource),
                rituals: this.generateCreationRituals(powerSource),
                sacredObjects: this.generateSacredObjects(powerSource, 'creation')
            },
            nature: {
                name: 'Nature Spirit Tradition',
                description: 'Beliefs in spirits inhabiting natural features',
                pantheon: this.generateNaturePantheon(powerSource),
                myths: this.generateNatureMyths(powerSource),
                rituals: this.generateNatureRituals(powerSource),
                sacredObjects: this.generateSacredObjects(powerSource, 'nature')
            },
            ancestor: {
                name: 'Ancestral Worship',
                description: 'Veneration of deceased family and cultural heroes',
                pantheon: this.generateAncestorPantheon(powerSource),
                myths: this.generateAncestorMyths(powerSource),
                rituals: this.generateAncestorRituals(powerSource),
                sacredObjects: this.generateSacredObjects(powerSource, 'ancestor')
            },
            cosmic: {
                name: 'Cosmic Force Religion',
                description: 'Worship of universal principles and celestial powers',
                pantheon: this.generateCosmicPantheon(powerSource),
                myths: this.generateCosmicMyths(powerSource),
                rituals: this.generateCosmicRituals(powerSource),
                sacredObjects: this.generateSacredObjects(powerSource, 'cosmic')
            },
            heroic: {
                name: 'Heroic Legend Tradition',
                description: 'Stories of great champions and legendary figures',
                pantheon: this.generateHeroicPantheon(powerSource),
                myths: this.generateHeroicMyths(powerSource),
                rituals: this.generateHeroicRituals(powerSource),
                sacredObjects: this.generateSacredObjects(powerSource, 'heroic')
            },
            trickster: {
                name: 'Trickster Tale Culture',
                description: 'Stories featuring clever, chaotic divine figures',
                pantheon: this.generateTricksterPantheon(powerSource),
                myths: this.generateTricksterMyths(powerSource),
                rituals: this.generateTricksterRituals(powerSource),
                sacredObjects: this.generateSacredObjects(powerSource, 'trickster')
            },
            moral: {
                name: 'Moral Parable System',
                description: 'Teaching stories that convey ethical principles',
                pantheon: this.generateMoralPantheon(powerSource),
                myths: this.generateMoralMyths(powerSource),
                rituals: this.generateMoralRituals(powerSource),
                sacredObjects: this.generateSacredObjects(powerSource, 'moral')
            }
        };

        return mythologyTypes[type] || mythologyTypes.creation;
    },

    // Pantheon Generation Functions
    generateCreationPantheon(powerSource) {
        const powerMappings = {
            elemental: [
                { name: 'The First Flame', role: 'Creator of fire and passion', domain: 'Fire, Creation, Energy' },
                { name: 'Deep Waters', role: 'Shaper of seas and emotions', domain: 'Water, Life, Flow' },
                { name: 'Stone Mother', role: 'Builder of land and bones', domain: 'Earth, Stability, Growth' },
                { name: 'Wind Walker', role: 'Bringer of breath and thought', domain: 'Air, Mind, Movement' }
            ],
            celestial: [
                { name: 'Dawn Weaver', role: 'Creator of light and time', domain: 'Sun, Day, Order' },
                { name: 'Night Keeper', role: 'Guardian of dreams and mysteries', domain: 'Moon, Night, Secrets' },
                { name: 'Star Sower', role: 'Planter of distant lights', domain: 'Stars, Destiny, Navigation' },
                { name: 'Void Dancer', role: 'Shaper of space between worlds', domain: 'Space, Potential, Silence' }
            ],
            natural: [
                { name: 'Tree Speaker', role: 'First voice of the forest', domain: 'Trees, Growth, Wisdom' },
                { name: 'Mountain Heart', role: 'Keeper of stone and strength', domain: 'Mountains, Endurance, Memory' },
                { name: 'River Voice', role: 'Singer of flowing paths', domain: 'Rivers, Change, Journey' },
                { name: 'Storm Caller', role: 'Bringer of rain and renewal', domain: 'Weather, Power, Cleansing' }
            ],
            ancestral: [
                { name: 'First Walker', role: 'The original ancestor', domain: 'Leadership, Tradition, Guidance' },
                { name: 'Memory Keeper', role: 'Holder of ancient knowledge', domain: 'Wisdom, History, Stories' },
                { name: 'Path Finder', role: 'Guide through difficulties', domain: 'Direction, Courage, Discovery' },
                { name: 'Spirit Bridge', role: 'Connection between worlds', domain: 'Death, Afterlife, Communication' }
            ],
            abstract: [
                { name: 'Truth Bearer', role: 'Embodiment of reality', domain: 'Truth, Justice, Clarity' },
                { name: 'Love Weaver', role: 'Creator of bonds and connections', domain: 'Love, Unity, Harmony' },
                { name: 'Fear Stalker', role: 'Teacher through challenge', domain: 'Fear, Growth, Strength' },
                { name: 'Hope Singer', role: 'Keeper of future possibilities', domain: 'Hope, Dreams, Inspiration' }
            ],
            totemic: [
                { name: 'Great Bear', role: 'Protector of the clan', domain: 'Strength, Protection, Family' },
                { name: 'Wise Raven', role: 'Messenger and teacher', domain: 'Intelligence, Communication, Mystery' },
                { name: 'Swift Eagle', role: 'Guardian of the sky', domain: 'Freedom, Vision, Heights' },
                { name: 'Patient Turtle', role: 'Keeper of ancient wisdom', domain: 'Longevity, Patience, Endurance' }
            ],
            mystical: [
                { name: 'Energy Weaver', role: 'Manipulator of mystical forces', domain: 'Magic, Transformation, Power' },
                { name: 'Dream Walker', role: 'Guardian of the spirit realm', domain: 'Dreams, Visions, Prophecy' },
                { name: 'Shadow Dancer', role: 'Master of hidden knowledge', domain: 'Secrets, Hidden Things, Mystery' },
                { name: 'Light Bringer', role: 'Illuminator of truth', domain: 'Enlightenment, Knowledge, Revelation' }
            ]
        };

        return (powerMappings[powerSource] || powerMappings.elemental).map(deity => ({
            ...deity,
            conlangName: this.generateWordForConcept(),
            epithets: this.generateEpithets(deity.domain),
            symbols: this.generateSymbols(deity.domain)
        }));
    },

    generateNaturePantheon(powerSource) {
        // Similar structure but focused on nature spirits
        const spirits = [
            { name: 'Forest Heart', role: 'Guardian of woodlands', domain: 'Trees, Animals, Growth' },
            { name: 'River Spirit', role: 'Keeper of flowing waters', domain: 'Rivers, Fish, Journey' },
            { name: 'Mountain Soul', role: 'Ancient stone guardian', domain: 'Peaks, Caves, Endurance' },
            { name: 'Field Watcher', role: 'Protector of crops', domain: 'Agriculture, Seasons, Abundance' }
        ];

        return spirits.map(spirit => ({
            ...spirit,
            conlangName: this.generateWordForConcept(),
            epithets: this.generateEpithets(spirit.domain),
            symbols: this.generateSymbols(spirit.domain)
        }));
    },

    generateAncestorPantheon(powerSource) {
        const ancestors = [
            { name: 'The First Chief', role: 'Original leader of the people', domain: 'Leadership, Law, Unity' },
            { name: 'The Great Crafter', role: 'Teacher of skills and arts', domain: 'Crafting, Knowledge, Innovation' },
            { name: 'The War Leader', role: 'Protector in times of conflict', domain: 'War, Strategy, Protection' },
            { name: 'The Wise Elder', role: 'Keeper of ancient wisdom', domain: 'Wisdom, Healing, Guidance' }
        ];

        return ancestors.map(ancestor => ({
            ...ancestor,
            conlangName: this.generateWordForConcept(),
            epithets: this.generateEpithets(ancestor.domain),
            symbols: this.generateSymbols(ancestor.domain)
        }));
    },

    generateCosmicPantheon(powerSource) {
        const forces = [
            { name: 'The Eternal Cycle', role: 'Force of death and rebirth', domain: 'Life, Death, Renewal' },
            { name: 'The Great Order', role: 'Maintainer of cosmic law', domain: 'Order, Balance, Justice' },
            { name: 'The Wild Chaos', role: 'Bringer of change and growth', domain: 'Change, Chaos, Creativity' },
            { name: 'The Silent Void', role: 'Space between all things', domain: 'Emptiness, Potential, Peace' }
        ];

        return forces.map(force => ({
            ...force,
            conlangName: this.generateWordForConcept(),
            epithets: this.generateEpithets(force.domain),
            symbols: this.generateSymbols(force.domain)
        }));
    },

    generateHeroicPantheon(powerSource) {
        const heroes = [
            { name: 'The Dragon Slayer', role: 'Vanquisher of great evils', domain: 'Courage, Victory, Protection' },
            { name: 'The Bridge Builder', role: 'Uniter of divided peoples', domain: 'Unity, Communication, Peace' },
            { name: 'The Sky Walker', role: 'Explorer of impossible realms', domain: 'Adventure, Discovery, Freedom' },
            { name: 'The Flame Keeper', role: 'Preserver of sacred fire', domain: 'Duty, Tradition, Sacrifice' }
        ];

        return heroes.map(hero => ({
            ...hero,
            conlangName: this.generateWordForConcept(),
            epithets: this.generateEpithets(hero.domain),
            symbols: this.generateSymbols(hero.domain)
        }));
    },

    generateTricksterPantheon(powerSource) {
        const tricksters = [
            { name: 'The Laughing Shadow', role: 'Bringer of unexpected wisdom', domain: 'Humor, Chaos, Learning' },
            { name: 'The Shape Shifter', role: 'Master of transformation', domain: 'Change, Illusion, Adaptation' },
            { name: 'The Riddle Keeper', role: 'Guardian of hidden knowledge', domain: 'Puzzles, Secrets, Intelligence' },
            { name: 'The Boundary Crosser', role: 'Traveler between worlds', domain: 'Travel, Boundaries, Freedom' }
        ];

        return tricksters.map(trickster => ({
            ...trickster,
            conlangName: this.generateWordForConcept(),
            epithets: this.generateEpithets(trickster.domain),
            symbols: this.generateSymbols(trickster.domain)
        }));
    },

    generateMoralPantheon(powerSource) {
        const teachers = [
            { name: 'The Just Judge', role: 'Teacher of fairness', domain: 'Justice, Fairness, Truth' },
            { name: 'The Kind Heart', role: 'Example of compassion', domain: 'Kindness, Mercy, Love' },
            { name: 'The Brave Soul', role: 'Model of courage', domain: 'Bravery, Honor, Sacrifice' },
            { name: 'The Wise Mind', role: 'Guide to understanding', domain: 'Wisdom, Learning, Patience' }
        ];

        return teachers.map(teacher => ({
            ...teacher,
            conlangName: this.generateWordForConcept(),
            epithets: this.generateEpithets(teacher.domain),
            symbols: this.generateSymbols(teacher.domain)
        }));
    },

    // Helper functions for deity details
    generateEpithets(domain) {
        const epithetTemplates = [
            'The ${adjective} ${noun}',
            '${adjective} of the ${noun}',
            'The ${noun} ${verb}',
            '${adjective} ${noun} Walker'
        ];

        const adjectives = ['Ancient', 'Wise', 'Mighty', 'Gentle', 'Fierce', 'Sacred', 'Eternal', 'Hidden'];
        const nouns = domain.split(', ').concat(['One', 'Spirit', 'Guardian', 'Keeper', 'Walker', 'Bearer']);
        const verbs = ['Bearer', 'Keeper', 'Walker', 'Singer', 'Dancer', 'Speaker', 'Watcher'];

        return epithetTemplates.slice(0, 2).map(template => {
            return template
                .replace('${adjective}', adjectives[Math.floor(Math.random() * adjectives.length)])
                .replace('${noun}', nouns[Math.floor(Math.random() * nouns.length)])
                .replace('${verb}', verbs[Math.floor(Math.random() * verbs.length)]);
        });
    },

    generateSymbols(domain) {
        const symbolMappings = {
            'Fire': '🔥', 'Water': '🌊', 'Earth': '🏔️', 'Air': '💨',
            'Sun': '☀️', 'Moon': '🌙', 'Stars': '⭐', 'Space': '🌌',
            'Trees': '🌳', 'Mountains': '⛰️', 'Rivers': '🏞️', 'Weather': '⛈️',
            'Leadership': '👑', 'Wisdom': '📚', 'Death': '💀', 'Life': '🌱',
            'Order': '⚖️', 'Chaos': '🌀', 'Courage': '⚔️', 'Love': '💝'
        };

        const domainKeys = domain.split(', ');
        return domainKeys.map(key => symbolMappings[key] || '✨').slice(0, 3);
    },

    // Myth generation functions
    generateCreationMyths(powerSource) {
        const mythTemplates = [
            'In the beginning, there was only void. ${deity} spoke the first word, and from that sound came all of creation.',
            'Long ago, ${deity} gathered the scattered elements and wove them into the fabric of the world.',
            'The world was born when ${deity} sacrificed part of themselves to give life to the empty cosmos.',
            'Ancient stories tell how ${deity} danced the world into existence, each step creating mountains, seas, and sky.'
        ];

        return mythTemplates.slice(0, 3).map(template => ({
            title: this.generateWordForConcept(),
            englishTitle: this.generateMythTitle(),
            story: template.replace('${deity}', 'the Creator'),
            significance: 'Explains the origin of the world and establishes divine authority',
            conlangTerms: [
                { term: this.generateWordForConcept(), meaning: 'primordial void' },
                { term: this.generateWordForConcept(), meaning: 'first creation' },
                { term: this.generateWordForConcept(), meaning: 'divine word' }
            ]
        }));
    },

    generateNatureMyths(powerSource) {
        return [
            {
                title: this.generateWordForConcept(),
                englishTitle: 'The Awakening of the Forest',
                story: 'When the first spirits entered the trees, they brought consciousness to the woodland. Every rustle of leaves speaks their ancient language.',
                significance: 'Explains why forests seem alive and conscious',
                conlangTerms: [
                    { term: this.generateWordForConcept(), meaning: 'tree spirit' },
                    { term: this.generateWordForConcept(), meaning: 'forest language' }
                ]
            },
            {
                title: this.generateWordForConcept(),
                englishTitle: 'The River\'s Gift',
                story: 'The great river spirit saw the people\'s thirst and carved channels through the earth, bringing water to all who needed it.',
                significance: 'Teaches gratitude for natural resources',
                conlangTerms: [
                    { term: this.generateWordForConcept(), meaning: 'river blessing' },
                    { term: this.generateWordForConcept(), meaning: 'water gift' }
                ]
            }
        ];
    },

    generateAncestorMyths(powerSource) {
        return [
            {
                title: this.generateWordForConcept(),
                englishTitle: 'The First Journey',
                story: 'The great ancestor led the people through the wilderness to find their homeland, marking the path with sacred stones.',
                significance: 'Establishes territorial claims and migration history',
                conlangTerms: [
                    { term: this.generateWordForConcept(), meaning: 'sacred journey' },
                    { term: this.generateWordForConcept(), meaning: 'pathway stone' }
                ]
            }
        ];
    },

    generateCosmicMyths(powerSource) {
        return [
            {
                title: this.generateWordForConcept(),
                englishTitle: 'The Great Balance',
                story: 'Order and Chaos dance eternally, their steps creating the rhythm of existence. When one grows too strong, the other rises to restore balance.',
                significance: 'Explains why good and bad times alternate',
                conlangTerms: [
                    { term: this.generateWordForConcept(), meaning: 'cosmic balance' },
                    { term: this.generateWordForConcept(), meaning: 'eternal dance' }
                ]
            }
        ];
    },

    generateHeroicMyths(powerSource) {
        return [
            {
                title: this.generateWordForConcept(),
                englishTitle: 'The Dragon\'s Last Stand',
                story: 'When the great dragon threatened to devour the sun, the hero climbed the highest mountain and challenged it to single combat.',
                significance: 'Teaches courage in facing overwhelming odds',
                conlangTerms: [
                    { term: this.generateWordForConcept(), meaning: 'dragon slayer' },
                    { term: this.generateWordForConcept(), meaning: 'mountain duel' }
                ]
            }
        ];
    },

    generateTricksterMyths(powerSource) {
        return [
            {
                title: this.generateWordForConcept(),
                englishTitle: 'The Stolen Fire',
                story: 'The trickster disguised themselves as a bird and flew to the realm of the gods, stealing fire in their beak to bring to mortals.',
                significance: 'Explains how humans gained knowledge or technology',
                conlangTerms: [
                    { term: this.generateWordForConcept(), meaning: 'clever disguise' },
                    { term: this.generateWordForConcept(), meaning: 'stolen flame' }
                ]
            }
        ];
    },

    generateMoralMyths(powerSource) {
        return [
            {
                title: this.generateWordForConcept(),
                englishTitle: 'The Selfish Spring',
                story: 'A village hoarded their spring water, refusing to share with travelers. The spring dried up until they learned to welcome strangers.',
                significance: 'Teaches the importance of hospitality and sharing',
                conlangTerms: [
                    { term: this.generateWordForConcept(), meaning: 'generous heart' },
                    { term: this.generateWordForConcept(), meaning: 'dried spring' }
                ]
            }
        ];
    },

    generateMythTitle() {
        const titleFormats = [
            'The ${adjective} ${noun}',
            'How the ${noun} came to be',
            'The Legend of ${adjective} ${noun}',
            'The ${noun}\'s ${action}'
        ];

        const adjectives = ['Great', 'First', 'Last', 'Hidden', 'Sacred', 'Ancient', 'Wise', 'Brave'];
        const nouns = ['Journey', 'Battle', 'Gift', 'Dance', 'Song', 'Dream', 'Fire', 'Stone'];
        const actions = ['Quest', 'Sacrifice', 'Return', 'Awakening', 'Choice', 'Victory'];

        const format = titleFormats[Math.floor(Math.random() * titleFormats.length)];
        return format
            .replace('${adjective}', adjectives[Math.floor(Math.random() * adjectives.length)])
            .replace('${noun}', nouns[Math.floor(Math.random() * nouns.length)])
            .replace('${action}', actions[Math.floor(Math.random() * actions.length)]);
    },

    // Ritual generation functions
    generateCreationRituals(powerSource) {
        return [
            {
                name: this.generateWordForConcept(),
                englishName: 'World Renewal Ceremony',
                purpose: 'Annual ritual to thank the creator and ensure continued existence',
                participants: 'Entire community',
                timing: 'Beginning of each year',
                actions: 'Lighting of sacred fires, recitation of creation myths, community feast',
                materials: 'Sacred fire, blessed food, ceremonial robes'
            },
            {
                name: this.generateWordForConcept(),
                englishName: 'New Life Blessing',
                purpose: 'Welcome newborns into the cosmic order',
                participants: 'Family and spiritual leaders',
                timing: 'Within seven days of birth',
                actions: 'Naming ceremony, blessing with elements, protection charms',
                materials: 'Four elements (fire, water, earth, air), protective amulets'
            }
        ];
    },

    generateNatureRituals(powerSource) {
        return [
            {
                name: this.generateWordForConcept(),
                englishName: 'Spirit Greeting',
                purpose: 'Introduce oneself to nature spirits when entering wild areas',
                participants: 'Individual travelers',
                timing: 'Upon entering forests, mountains, or rivers',
                actions: 'Leave offering, speak name and purpose, request safe passage',
                materials: 'Small food offering, flowers or stones'
            }
        ];
    },

    generateAncestorRituals(powerSource) {
        return [
            {
                name: this.generateWordForConcept(),
                englishName: 'Ancestor Calling',
                purpose: 'Seek guidance from deceased family members',
                participants: 'Family groups',
                timing: 'Times of major decisions or crises',
                actions: 'Light candles, share stories, ask for signs',
                materials: 'Ancestor portraits, candles, favorite foods of deceased'
            }
        ];
    },

    generateCosmicRituals(powerSource) {
        return [
            {
                name: this.generateWordForConcept(),
                englishName: 'Balance Meditation',
                purpose: 'Align personal energy with cosmic forces',
                participants: 'Individuals or small groups',
                timing: 'Daily at sunrise and sunset',
                actions: 'Meditation, breathing exercises, silent contemplation',
                materials: 'Meditation space, cushions, incense'
            }
        ];
    },

    generateHeroicRituals(powerSource) {
        return [
            {
                name: this.generateWordForConcept(),
                englishName: 'Courage Calling',
                purpose: 'Invoke heroic strength before challenges',
                participants: 'Warriors and leaders',
                timing: 'Before battles, competitions, or trials',
                actions: 'Recite heroic deeds, weapon blessing, courage oaths',
                materials: 'Weapons, hero relics, battle paint'
            }
        ];
    },

    generateTricksterRituals(powerSource) {
        return [
            {
                name: this.generateWordForConcept(),
                englishName: 'Wisdom Through Laughter',
                purpose: 'Use humor to gain insight and release tension',
                participants: 'Community groups',
                timing: 'After conflicts or during celebrations',
                actions: 'Storytelling, jokes, playful competitions',
                materials: 'Masks, musical instruments, props for stories'
            }
        ];
    },

    generateMoralRituals(powerSource) {
        return [
            {
                name: this.generateWordForConcept(),
                englishName: 'Truth Speaking',
                purpose: 'Resolve conflicts through honest dialogue',
                participants: 'Disputing parties and mediators',
                timing: 'When serious conflicts arise',
                actions: 'Formal truth-telling, listening, seeking forgiveness',
                materials: 'Speaking staff, circle of stones, witness tokens'
            }
        ];
    },

    // Sacred objects generation
    generateSacredObjects(powerSource, mythologyType) {
        const objectTypes = {
            creation: [
                { name: 'World Seed', description: 'A crystalline sphere said to contain the essence of creation' },
                { name: 'First Fire Brand', description: 'An eternally burning torch from the original flame' },
                { name: 'Creation Tablet', description: 'Stone tablets inscribed with the words that shaped reality' }
            ],
            nature: [
                { name: 'Spirit Mirror', description: 'A pool of water that shows the true nature of spirits' },
                { name: 'Living Branch', description: 'A staff that grows leaves according to the seasons' },
                { name: 'Beast Tongue Amulet', description: 'Allows communication with animals' }
            ],
            ancestor: [
                { name: 'Memory Stones', description: 'Carved stones that preserve ancestral wisdom' },
                { name: 'Lineage Scroll', description: 'Records of family lines and their achievements' },
                { name: 'Ancestor Mask', description: 'Worn to channel the spirit of deceased leaders' }
            ],
            cosmic: [
                { name: 'Balance Scales', description: 'Cosmic scales that weigh the harmony of actions' },
                { name: 'Infinity Knot', description: 'An endless rope representing eternal cycles' },
                { name: 'Void Crystal', description: 'A black crystal containing pure potential' }
            ],
            heroic: [
                { name: 'Champion\'s Blade', description: 'The sword of the greatest legendary hero' },
                { name: 'Victory Crown', description: 'Crown worn by triumphant leaders' },
                { name: 'Honor Shield', description: 'Shield that glows when carried by the worthy' }
            ],
            trickster: [
                { name: 'Riddle Box', description: 'A container that poses puzzles to those who open it' },
                { name: 'Shape-shift Cloak', description: 'Cloak that changes appearance with the wearer\'s mood' },
                { name: 'Truth Coins', description: 'Coins that reveal lies when flipped' }
            ],
            moral: [
                { name: 'Justice Stone', description: 'A stone that grows warm when truth is spoken' },
                { name: 'Compassion Bowl', description: 'A bowl that never empties when feeding the hungry' },
                { name: 'Wisdom Staff', description: 'Staff that guides holders toward right decisions' }
            ]
        };

        const objects = objectTypes[mythologyType] || objectTypes.creation;
        return objects.map(obj => ({
            ...obj,
            conlangName: this.generateWordForConcept(),
            power: this.generateObjectPower(obj.name),
            origin: this.generateObjectOrigin(obj.name, mythologyType)
        }));
    },

    generateObjectPower(objectName) {
        const powers = [
            'Grants wisdom to those who touch it',
            'Protects bearer from harm',
            'Reveals hidden truths',
            'Strengthens resolve in difficult times',
            'Connects user to divine realm',
            'Heals spiritual wounds',
            'Guides lost travelers',
            'Brings good fortune'
        ];
        return powers[Math.floor(Math.random() * powers.length)];
    },

    generateObjectOrigin(objectName, mythologyType) {
        const origins = {
            creation: 'Formed during the first moments of creation',
            nature: 'Blessed by ancient nature spirits',
            ancestor: 'Carried by the first great leader',
            cosmic: 'Fell from the celestial realm',
            heroic: 'Forged in legendary battles',
            trickster: 'Created through divine mischief',
            moral: 'Manifested from pure virtue'
        };
        return origins[mythologyType] + ' and passed down through generations';
    },

    // Display mythology system
    displayMythology(mythology) {
        const mythologyDisplay = document.getElementById('mythology-display');
        const mythologySection = document.getElementById('mythology-system');
        
        if (!mythologyDisplay || !mythologySection) return;
        
        mythologyDisplay.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h6 style="color: var(--accent-primary); margin: 0;">${mythology.name}</h6>
                <button class="btn btn-success" onclick="CulturalModule.addMythologyToVocabulary()">
                    ➕ Add Mythology Terms to Dictionary
                </button>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h6 style="color: var(--accent-secondary); margin-bottom: 10px;">Belief System Description</h6>
                <p style="margin-bottom: 15px;">${mythology.description}</p>
            </div>
            
            <div style="margin-bottom: 25px;">
                <h6 style="color: var(--accent-primary); margin-bottom: 15px;">🌟 Pantheon & Divine Beings</h6>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px;">
                    ${mythology.pantheon.map(deity => `
                        <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid var(--border-light);">
                            <h6 style="color: var(--accent-primary); margin-bottom: 8px;">
                                ${deity.conlangName} <span style="font-size: 0.9em; color: #666;">• ${deity.name}</span>
                            </h6>
                            <p style="margin-bottom: 8px; font-weight: 600; font-size: 0.9em;">${deity.role}</p>
                            <p style="margin-bottom: 8px; font-size: 0.85em; color: #666;"><strong>Domain:</strong> ${deity.domain}</p>
                            <div style="margin-bottom: 8px;">
                                <strong style="font-size: 0.85em;">Epithets:</strong>
                                <div style="margin-top: 4px;">
                                    ${deity.epithets.map(epithet => `<span style="background: #f8f9fa; padding: 2px 6px; border-radius: 4px; font-size: 0.8em; margin-right: 4px; display: inline-block; margin-bottom: 2px;">${epithet}</span>`).join('')}
                                </div>
                            </div>
                            <div style="font-size: 1.2em;">${deity.symbols.join(' ')}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div style="margin-bottom: 25px;">
                <h6 style="color: var(--accent-primary); margin-bottom: 15px;">📖 Sacred Stories & Myths</h6>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 15px;">
                    ${mythology.myths.map(myth => `
                        <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid var(--border-light);">
                            <h6 style="color: var(--accent-primary); margin-bottom: 8px;">
                                ${myth.title} <span style="font-size: 0.9em; color: #666;">• ${myth.englishTitle}</span>
                            </h6>
                            <p style="margin-bottom: 10px; font-size: 0.9em; line-height: 1.4;">${myth.story}</p>
                            <p style="margin-bottom: 10px; font-size: 0.85em; color: #666; font-style: italic;"><strong>Significance:</strong> ${myth.significance}</p>
                            <div>
                                <strong style="font-size: 0.85em;">Key Terms:</strong>
                                <div style="margin-top: 4px;">
                                    ${myth.conlangTerms.map(term => `<span style="background: var(--accent-tertiary); color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.8em; margin-right: 4px; display: inline-block; margin-bottom: 2px;" title="${term.meaning}">${term.term}</span>`).join('')}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div style="margin-bottom: 25px;">
                <h6 style="color: var(--accent-primary); margin-bottom: 15px;">🕯️ Sacred Rituals & Ceremonies</h6>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 15px;">
                    ${mythology.rituals.map(ritual => `
                        <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid var(--border-light);">
                            <h6 style="color: var(--accent-primary); margin-bottom: 8px;">
                                ${ritual.name} <span style="font-size: 0.9em; color: #666;">• ${ritual.englishName}</span>
                            </h6>
                            <p style="margin-bottom: 8px; font-size: 0.9em;"><strong>Purpose:</strong> ${ritual.purpose}</p>
                            <p style="margin-bottom: 6px; font-size: 0.85em;"><strong>Participants:</strong> ${ritual.participants}</p>
                            <p style="margin-bottom: 6px; font-size: 0.85em;"><strong>Timing:</strong> ${ritual.timing}</p>
                            <p style="margin-bottom: 6px; font-size: 0.85em;"><strong>Actions:</strong> ${ritual.actions}</p>
                            <p style="margin-bottom: 0; font-size: 0.85em; color: #666;"><strong>Materials:</strong> ${ritual.materials}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div>
                <h6 style="color: var(--accent-primary); margin-bottom: 15px;">✨ Sacred Objects & Artifacts</h6>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px;">
                    ${mythology.sacredObjects.map(obj => `
                        <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid var(--border-light);">
                            <h6 style="color: var(--accent-primary); margin-bottom: 8px;">
                                ${obj.conlangName} <span style="font-size: 0.9em; color: #666;">• ${obj.name}</span>
                            </h6>
                            <p style="margin-bottom: 8px; font-size: 0.9em;">${obj.description}</p>
                            <p style="margin-bottom: 6px; font-size: 0.85em;"><strong>Power:</strong> ${obj.power}</p>
                            <p style="margin-bottom: 0; font-size: 0.85em; color: #666; font-style: italic;"><strong>Origin:</strong> ${obj.origin}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        mythologySection.style.display = 'block';
        
        // Save mythology to culture data
        this.currentCulture.mythology = mythology;
        if (window.generator && window.generator.language) {
            window.generator.language.culture = { ...window.generator.language.culture, ...this.currentCulture };
        }
    },

    // Add mythology terms to vocabulary
    addMythologyToVocabulary() {
        if (!this.generatedMythology || Object.keys(this.generatedMythology).length === 0) {
            showToast('No mythology terms to add! Generate mythology system first.', 'error');
            return;
        }
        
        const wordsAdded = [];
        
        // Add pantheon terms
        if (this.generatedMythology.pantheon) {
            this.generatedMythology.pantheon.forEach(deity => {
                const newWord = {
                    conlang: deity.conlangName,
                    english: deity.name,
                    pos: 'noun',
                    notes: `Deity: ${deity.role} - Domain: ${deity.domain}`,
                    type: 'mythology-deity',
                    dateAdded: new Date().toLocaleDateString()
                };
                
                // Check for duplicates
                const allWords = window.appState.getState('allWords') || [];
                const duplicate = allWords.find(w => w.conlang.toLowerCase() === newWord.conlang.toLowerCase());
                
                if (!duplicate) {
                    if (!window.generator.language.customWords) {
                        window.generator.language.customWords = [];
                    }
                    window.generator.language.customWords.push(newWord);
                    window.appState.addWord(newWord);
                    wordsAdded.push(newWord);
                }
            });
        }
        
        // Add myth terms
        if (this.generatedMythology.myths) {
            this.generatedMythology.myths.forEach(myth => {
                // Add myth title
                const mythWord = {
                    conlang: myth.title,
                    english: myth.englishTitle,
                    pos: 'noun',
                    notes: `Sacred story: ${myth.significance}`,
                    type: 'mythology-story',
                    dateAdded: new Date().toLocaleDateString()
                };
                
                const allWords = window.appState.getState('allWords') || [];
                if (!allWords.find(w => w.conlang.toLowerCase() === mythWord.conlang.toLowerCase())) {
                    if (!window.generator.language.customWords) {
                        window.generator.language.customWords = [];
                    }
                    window.generator.language.customWords.push(mythWord);
                    window.appState.addWord(mythWord);
                    wordsAdded.push(mythWord);
                }
                
                // Add mythological terms
                if (myth.conlangTerms) {
                    myth.conlangTerms.forEach(term => {
                        const termWord = {
                            conlang: term.term,
                            english: term.meaning,
                            pos: 'noun',
                            notes: `Mythological concept from: ${myth.englishTitle}`,
                            type: 'mythology-concept',
                            dateAdded: new Date().toLocaleDateString()
                        };
                        
                        if (!allWords.find(w => w.conlang.toLowerCase() === termWord.conlang.toLowerCase())) {
                            if (!window.generator.language.customWords) {
                                window.generator.language.customWords = [];
                            }
                            window.generator.language.customWords.push(termWord);
                            window.appState.addWord(termWord);
                            wordsAdded.push(termWord);
                        }
                    });
                }
            });
        }
        
        // Add ritual terms
        if (this.generatedMythology.rituals) {
            this.generatedMythology.rituals.forEach(ritual => {
                const ritualWord = {
                    conlang: ritual.name,
                    english: ritual.englishName,
                    pos: 'noun',
                    notes: `Sacred ritual: ${ritual.purpose}`,
                    type: 'mythology-ritual',
                    dateAdded: new Date().toLocaleDateString()
                };
                
                const allWords = window.appState.getState('allWords') || [];
                if (!allWords.find(w => w.conlang.toLowerCase() === ritualWord.conlang.toLowerCase())) {
                    if (!window.generator.language.customWords) {
                        window.generator.language.customWords = [];
                    }
                    window.generator.language.customWords.push(ritualWord);
                    window.appState.addWord(ritualWord);
                    wordsAdded.push(ritualWord);
                }
            });
        }
        
        // Add sacred object terms
        if (this.generatedMythology.sacredObjects) {
            this.generatedMythology.sacredObjects.forEach(obj => {
                const objWord = {
                    conlang: obj.conlangName,
                    english: obj.name,
                    pos: 'noun',
                    notes: `Sacred object: ${obj.description}`,
                    type: 'mythology-artifact',
                    dateAdded: new Date().toLocaleDateString()
                };
                
                const allWords = window.appState.getState('allWords') || [];
                if (!allWords.find(w => w.conlang.toLowerCase() === objWord.conlang.toLowerCase())) {
                    if (!window.generator.language.customWords) {
                        window.generator.language.customWords = [];
                    }
                    window.generator.language.customWords.push(objWord);
                    window.appState.addWord(objWord);
                    wordsAdded.push(objWord);
                }
            });
        }
        
        // Update displays
        if (window.VocabularyModule) {
            window.VocabularyModule.updateDisplay();
        }
        
        if (window.ActivityModule) {
            window.ActivityModule.addActivity(`Added ${wordsAdded.length} mythology terms to vocabulary`, 'culture');
        }
        
        showToast(`Added ${wordsAdded.length} mythology terms to dictionary!`, 'success');
    },
    // Traditions Generation Functions
    generateTraditions() {
        const selectedTraditions = [];
        
        // Check which tradition types are selected
        const lifeCheck = document.getElementById('tradition-life')?.checked;
        const seasonalCheck = document.getElementById('tradition-seasonal')?.checked;
        const socialCheck = document.getElementById('tradition-social')?.checked;
        const craftCheck = document.getElementById('tradition-craft')?.checked;
        const foodCheck = document.getElementById('tradition-food')?.checked;
        const artsCheck = document.getElementById('tradition-arts')?.checked;
        
        if (lifeCheck) selectedTraditions.push('life');
        if (seasonalCheck) selectedTraditions.push('seasonal');
        if (socialCheck) selectedTraditions.push('social');
        if (craftCheck) selectedTraditions.push('craft');
        if (foodCheck) selectedTraditions.push('food');
        if (artsCheck) selectedTraditions.push('arts');
        
        if (selectedTraditions.length === 0) {
            showToast('Please select at least one tradition category!', 'error');
            return;
        }
        
        const traditions = this.createTraditionsSystem(selectedTraditions);
        this.generatedTraditions = traditions;
        this.displayTraditions(traditions);
        
        if (window.ActivityModule) {
            window.ActivityModule.addActivity(`Generated traditions: ${selectedTraditions.join(', ')}`, 'culture');
        }
        
        showToast('Cultural traditions generated!', 'success');
    },

    createTraditionsSystem(categories) {
        const traditionSystems = {
            life: {
                name: 'Life Cycle Traditions',
                description: 'Rituals and customs marking important life transitions',
                color: '#e91e63',
                traditions: [
                    {
                        name: 'Birth Welcome',
                        purpose: 'Celebrating new life and welcoming children into the community',
                        timing: 'Within seven days of birth',
                        participants: 'Extended family and close community members',
                        activities: 'Naming ceremony, blessing rituals, gift-giving, feast preparation',
                        materials: 'Sacred oils, protective charms, traditional foods, ceremonial clothing',
                        significance: 'Establishes the child\'s place in society and invokes protection',
                        customTerms: [
                            { concept: 'first breath blessing', meaning: 'ritual performed when baby first cries' },
                            { concept: 'name-song', meaning: 'melody sung during naming ceremony' },
                            { concept: 'protection circle', meaning: 'symbolic barrier against harmful influences' }
                        ]
                    },
                    {
                        name: 'Coming of Age',
                        purpose: 'Marking the transition from childhood to adulthood',
                        timing: 'Usually between ages 14-16, varies by gender and role',
                        participants: 'Youth undergoing transition, mentors, family, community elders',
                        activities: 'Skill demonstrations, endurance tests, spiritual quests, teaching of adult responsibilities',
                        materials: 'Adult clothing, tools of trade, sacred objects, ceremonial markings',
                        significance: 'Grants full membership in society with accompanying rights and duties',
                        customTerms: [
                            { concept: 'adult-name', meaning: 'new name received upon reaching maturity' },
                            { concept: 'skill-proving', meaning: 'demonstration of mastery in essential abilities' },
                            { concept: 'wisdom-sharing', meaning: 'receiving knowledge previously restricted to adults' }
                        ]
                    },
                    {
                        name: 'Bond Ceremony',
                        purpose: 'Uniting individuals in marriage or partnership',
                        timing: 'Usually during favorable seasons, often aligned with cultural calendar',
                        participants: 'Partners, families, community witnesses, spiritual officiants',
                        activities: 'Vow exchange, symbolic binding rituals, community celebration, gift exchange',
                        materials: 'Binding cords, ceremonial vessels, traditional garments, unity symbols',
                        significance: 'Creates new family units and strengthens community bonds',
                        customTerms: [
                            { concept: 'soul-weaving', meaning: 'ritual binding of life forces' },
                            { concept: 'family-joining', meaning: 'ceremony uniting two family groups' },
                            { concept: 'future-blessing', meaning: 'invocation of prosperity for the union' }
                        ]
                    },
                    {
                        name: 'Elder Honoring',
                        purpose: 'Recognizing wisdom and contribution of aging community members',
                        timing: 'When someone reaches significant age milestones',
                        participants: 'The honored elder, family, community members, younger generations',
                        activities: 'Story-telling, wisdom-sharing, special seating, consultation on important matters',
                        materials: 'Honor marks, comfortable furnishings, special foods, memory objects',
                        significance: 'Ensures knowledge preservation and maintains respect for experience',
                        customTerms: [
                            { concept: 'wisdom-keeper', meaning: 'elder who preserves important knowledge' },
                            { concept: 'story-treasury', meaning: 'collection of tales held by elders' },
                            { concept: 'honor-seat', meaning: 'special place reserved for respected elders' }
                        ]
                    },
                    {
                        name: 'Final Journey',
                        purpose: 'Honoring the deceased and helping transition to afterlife',
                        timing: 'Begins immediately after death, continues for culturally determined period',
                        participants: 'Immediate family, extended community, spiritual guides',
                        activities: 'Body preparation, vigil keeping, memorial recitation, burial or other disposition',
                        materials: 'Burial goods, ceremonial wrappings, memorial markers, food offerings',
                        significance: 'Ensures proper spiritual transition and provides community support for grieving',
                        customTerms: [
                            { concept: 'spirit-guide', meaning: 'ritual helper for souls transitioning to afterlife' },
                            { concept: 'memory-weaving', meaning: 'creating lasting remembrance of the deceased' },
                            { concept: 'grief-sharing', meaning: 'community support for those in mourning' }
                        ]
                    }
                ]
            },
            seasonal: {
                name: 'Seasonal Celebrations',
                description: 'Festivals and customs following natural cycles and agricultural rhythms',
                color: '#4caf50',
                traditions: [
                    {
                        name: 'Spring Awakening',
                        purpose: 'Celebrating renewal, new growth, and return of life',
                        timing: 'First signs of spring - budding trees, returning animals, warming weather',
                        participants: 'Entire community, especially farmers and gardeners',
                        activities: 'Seed blessing, cleaning rituals, flower gathering, fertility ceremonies',
                        materials: 'Seeds, fresh flowers, spring water, cleaning tools, bright colors',
                        significance: 'Ensures good harvests and marks beginning of active season',
                        customTerms: [
                            { concept: 'green-blessing', meaning: 'ritual to encourage plant growth' },
                            { concept: 'earth-waking', meaning: 'ceremony marking end of winter dormancy' },
                            { concept: 'first-bloom', meaning: 'celebration of season\'s first flowers' }
                        ]
                    },
                    {
                        name: 'Summer Abundance',
                        purpose: 'Celebrating peak life force and community strength',
                        timing: 'Summer solstice or when crops are fully growing',
                        participants: 'All community members, with emphasis on young adults',
                        activities: 'Athletic competitions, skill demonstrations, long feasts, sun ceremonies',
                        materials: 'Bright decorations, competition prizes, abundant food, solar symbols',
                        significance: 'Reinforces community bonds and celebrates life at its peak',
                        customTerms: [
                            { concept: 'sun-strength', meaning: 'power drawn from peak sunlight' },
                            { concept: 'life-height', meaning: 'moment when vitality reaches maximum' },
                            { concept: 'community-fire', meaning: 'central bonfire representing unified spirit' }
                        ]
                    },
                    {
                        name: 'Harvest Gratitude',
                        purpose: 'Giving thanks for the year\'s bounty and preparing for winter',
                        timing: 'When main crops are gathered and stored',
                        participants: 'All community members, led by farmers and food preparers',
                        activities: 'Crop gathering ceremonies, preservation rituals, gratitude expressions, sharing feasts',
                        materials: 'Harvested crops, storage containers, preservation tools, thanksgiving offerings',
                        significance: 'Ensures food security and acknowledges dependence on natural cycles',
                        customTerms: [
                            { concept: 'earth-gift', meaning: 'crops seen as presents from nature' },
                            { concept: 'storage-blessing', meaning: 'ritual ensuring food preservation' },
                            { concept: 'gratitude-song', meaning: 'musical thanks for successful harvest' }
                        ]
                    },
                    {
                        name: 'Winter Reflection',
                        purpose: 'Honoring rest, reflection, and community bonds during dormant season',
                        timing: 'Winter solstice and throughout coldest months',
                        participants: 'All community members, especially storytellers and crafters',
                        activities: 'Story-telling, indoor crafting, contemplation, light ceremonies',
                        materials: 'Candles, warm clothing, preserved foods, crafting materials, comfort items',
                        significance: 'Maintains community connection during isolation and preserves cultural knowledge',
                        customTerms: [
                            { concept: 'inner-light', meaning: 'spiritual illumination during dark times' },
                            { concept: 'story-fire', meaning: 'gathering around fire for tale-telling' },
                            { concept: 'craft-wisdom', meaning: 'knowledge passed through making things' }
                        ]
                    }
                ]
            },
            social: {
                name: 'Social Customs',
                description: 'Daily practices and etiquette governing community interactions',
                color: '#2196f3',
                traditions: [
                    {
                        name: 'Greeting Rituals',
                        purpose: 'Establishing social connection and showing respect',
                        timing: 'Daily encounters, formal meetings, reunion situations',
                        participants: 'All community members in various combinations',
                        activities: 'Specific gestures, verbal exchanges, gift offerings, status acknowledgments',
                        materials: 'Small gifts, ceremonial items, appropriate clothing, status markers',
                        significance: 'Maintains social harmony and reinforces community structure',
                        customTerms: [
                            { concept: 'honor-gesture', meaning: 'movement showing respect for another person' },
                            { concept: 'meeting-gift', meaning: 'small present offered when encountering others' },
                            { concept: 'status-sign', meaning: 'indicator of social position and role' }
                        ]
                    },
                    {
                        name: 'Conflict Resolution',
                        purpose: 'Addressing disputes and restoring community harmony',
                        timing: 'When disagreements arise or relationships become strained',
                        participants: 'Disputing parties, mediators, community witnesses, affected families',
                        activities: 'Formal discussion, truth-telling, compensation negotiation, reconciliation ceremonies',
                        materials: 'Speaking tokens, peace symbols, compensation goods, witness markers',
                        significance: 'Prevents feuds and maintains social stability',
                        customTerms: [
                            { concept: 'truth-speaking', meaning: 'formal testimony under community oath' },
                            { concept: 'peace-weaving', meaning: 'process of rebuilding damaged relationships' },
                            { concept: 'balance-making', meaning: 'creating fair resolution to disputes' }
                        ]
                    },
                    {
                        name: 'Hospitality Laws',
                        purpose: 'Ensuring proper treatment of guests and strangers',
                        timing: 'Whenever visitors arrive in the community',
                        participants: 'Hosts, guests, community leaders, families taking turns',
                        activities: 'Welcome ceremonies, food sharing, protection offering, gift exchange',
                        materials: 'Guest quarters, ceremonial foods, protective charms, farewell gifts',
                        significance: 'Builds reputation and creates networks with other communities',
                        customTerms: [
                            { concept: 'guest-bond', meaning: 'sacred relationship between host and visitor' },
                            { concept: 'hearth-sharing', meaning: 'offering of food and warmth to strangers' },
                            { concept: 'path-blessing', meaning: 'protection given to departing travelers' }
                        ]
                    },
                    {
                        name: 'Work Cooperation',
                        purpose: 'Organizing community labor and shared responsibilities',
                        timing: 'During major projects, seasonal work, emergency situations',
                        participants: 'All able community members according to skills and availability',
                        activities: 'Task organization, skill sharing, collective effort, celebration of completion',
                        materials: 'Shared tools, common supplies, coordination tokens, completion markers',
                        significance: 'Ensures community survival and reinforces mutual dependence',
                        customTerms: [
                            { concept: 'shared-effort', meaning: 'work done together for common benefit' },
                            { concept: 'skill-pooling', meaning: 'combining different abilities for complex tasks' },
                            { concept: 'task-bond', meaning: 'relationships formed through working together' }
                        ]
                    }
                ]
            },
            craft: {
                name: 'Craft Traditions',
                description: 'Practices surrounding the creation of objects, tools, and artworks',
                color: '#ff9800',
                traditions: [
                    {
                        name: 'Apprentice Binding',
                        purpose: 'Formally beginning craft training and establishing mentor relationships',
                        timing: 'When young people show aptitude and interest in specific crafts',
                        participants: 'Apprentice, master craftsperson, families, craft guild or community',
                        activities: 'Skill assessment, oath-taking, tool presentation, first project assignment',
                        materials: 'Training tools, practice materials, ceremonial items, apprentice markers',
                        significance: 'Ensures skill preservation and maintains craft quality standards',
                        customTerms: [
                            { concept: 'skill-bond', meaning: 'relationship between master and apprentice' },
                            { concept: 'craft-oath', meaning: 'promise to learn and preserve traditional methods' },
                            { concept: 'tool-blessing', meaning: 'ceremony consecrating implements to their purpose' }
                        ]
                    },
                    {
                        name: 'Master Recognition',
                        purpose: 'Acknowledging achievement of full craftsmanship and teaching ability',
                        timing: 'When apprentice demonstrates complete skill mastery',
                        participants: 'Candidate, current masters, community representatives, former teachers',
                        activities: 'Skill demonstration, masterwork creation, peer evaluation, celebration feast',
                        materials: 'Testing materials, masterwork display, ceremonial tools, recognition symbols',
                        significance: 'Maintains craft standards and authorizes teaching of others',
                        customTerms: [
                            { concept: 'master-mark', meaning: 'symbol indicating achieved expertise' },
                            { concept: 'skill-crown', meaning: 'recognition of complete craft mastery' },
                            { concept: 'teaching-right', meaning: 'authority to train others in the craft' }
                        ]
                    },
                    {
                        name: 'Tool Consecration',
                        purpose: 'Blessing implements and establishing spiritual connection with craft',
                        timing: 'When new tools are acquired or major projects begin',
                        participants: 'Craftsperson, spiritual advisor, craft community, tool maker',
                        activities: 'Purification rituals, blessing ceremonies, first use celebration, dedication vows',
                        materials: 'Sacred substances, ceremonial cloths, blessing implements, offering materials',
                        significance: 'Ensures tool effectiveness and maintains spiritual aspects of creation',
                        customTerms: [
                            { concept: 'tool-spirit', meaning: 'spiritual essence residing in well-made implements' },
                            { concept: 'craft-blessing', meaning: 'divine favor for creative work' },
                            { concept: 'maker-bond', meaning: 'connection between craftsperson and their tools' }
                        ]
                    },
                    {
                        name: 'Creation Circles',
                        purpose: 'Community gatherings for collaborative crafting and skill sharing',
                        timing: 'Regular intervals, often during less busy seasons',
                        participants: 'Craftspeople of various skills, apprentices, community members',
                        activities: 'Collaborative projects, technique sharing, problem solving, social crafting',
                        materials: 'Shared supplies, community workspace, refreshments, display areas',
                        significance: 'Preserves knowledge, builds relationships, and creates community identity items',
                        customTerms: [
                            { concept: 'skill-weaving', meaning: 'combining different craft abilities in one project' },
                            { concept: 'knowledge-sharing', meaning: 'open exchange of techniques and secrets' },
                            { concept: 'community-making', meaning: 'creating items that belong to everyone' }
                        ]
                    }
                ]
            },
            food: {
                name: 'Food Customs',
                description: 'Traditions surrounding food preparation, sharing, and consumption',
                color: '#795548',
                traditions: [
                    {
                        name: 'Sacred Cooking',
                        purpose: 'Preparing food with spiritual significance and community blessing',
                        timing: 'Religious holidays, major celebrations, healing situations',
                        participants: 'Designated cooks, spiritual leaders, recipe keepers, community elders',
                        activities: 'Ingredient blessing, ritual preparation, ceremonial cooking, sacred serving',
                        materials: 'Blessed ingredients, ceremonial cookware, sacred fires, special serving vessels',
                        significance: 'Connects food to spiritual realm and enhances its nourishing power',
                        customTerms: [
                            { concept: 'blessed-meal', meaning: 'food prepared with spiritual intention' },
                            { concept: 'sacred-fire', meaning: 'cooking flame consecrated for ritual use' },
                            { concept: 'spirit-nourishment', meaning: 'food that feeds both body and soul' }
                        ]
                    },
                    {
                        name: 'Sharing Protocols',
                        purpose: 'Governing how food is distributed and consumed in community settings',
                        timing: 'All communal meals, celebrations, and emergency food distribution',
                        participants: 'All community members according to age, status, and need',
                        activities: 'Portion allocation, serving order, blessing recitation, gratitude expression',
                        materials: 'Serving implements, portion markers, blessing cups, sharing vessels',
                        significance: 'Ensures fair distribution and reinforces social bonds through shared nourishment',
                        customTerms: [
                            { concept: 'fair-portion', meaning: 'equitable distribution of available food' },
                            { concept: 'elder-first', meaning: 'custom of serving oldest members before others' },
                            { concept: 'hunger-sharing', meaning: 'ensuring no one goes without when food is scarce' }
                        ]
                    },
                    {
                        name: 'Preservation Rites',
                        purpose: 'Ensuring food storage success and preventing waste',
                        timing: 'During harvest seasons and food preparation periods',
                        participants: 'Food preparers, storage keepers, preservation specialists, blessing givers',
                        activities: 'Preservation blessing, storage ceremonies, quality checking, protection rituals',
                        materials: 'Preservation materials, storage containers, protective charms, quality markers',
                        significance: 'Prevents food spoilage and ensures community survival during lean periods',
                        customTerms: [
                            { concept: 'keeping-magic', meaning: 'traditional knowledge for food preservation' },
                            { concept: 'storage-blessing', meaning: 'ritual ensuring preserved food remains good' },
                            { concept: 'future-feeding', meaning: 'preparing food to nourish community later' }
                        ]
                    },
                    {
                        name: 'Recipe Inheritance',
                        purpose: 'Passing down traditional food knowledge through generations',
                        timing: 'When young people show cooking aptitude or family recipes are endangered',
                        participants: 'Recipe holders, chosen inheritors, family members, community witnesses',
                        activities: 'Secret sharing, demonstration cooking, taste testing, knowledge verification',
                        materials: 'Traditional ingredients, family cookware, recipe tokens, inheritance markers',
                        significance: 'Preserves cultural food identity and maintains traditional flavors',
                        customTerms: [
                            { concept: 'taste-memory', meaning: 'ability to recreate traditional flavors exactly' },
                            { concept: 'recipe-keeping', meaning: 'responsibility for preserving food knowledge' },
                            { concept: 'flavor-heritage', meaning: 'traditional tastes that define cultural identity' }
                        ]
                    }
                ]
            },
            arts: {
                name: 'Artistic Traditions',
                description: 'Customs surrounding creative expression, performance, and cultural aesthetics',
                color: '#9c27b0',
                traditions: [
                    {
                        name: 'Story Cycles',
                        purpose: 'Preserving cultural memory and entertaining community through narrative',
                        timing: 'Regular gatherings, seasonal celebrations, educational sessions',
                        participants: 'Storytellers, community members, children, cultural keepers',
                        activities: 'Tale recitation, audience participation, moral instruction, memory training',
                        materials: 'Story props, memory aids, seating arrangements, atmospheric elements',
                        significance: 'Maintains cultural knowledge and provides moral instruction through narrative',
                        customTerms: [
                            { concept: 'tale-weaving', meaning: 'art of crafting compelling narratives' },
                            { concept: 'memory-song', meaning: 'stories told in musical format for easier remembering' },
                            { concept: 'wisdom-story', meaning: 'tales specifically designed to teach important lessons' }
                        ]
                    },
                    {
                        name: 'Music Gatherings',
                        purpose: 'Creating community bonds through shared musical expression',
                        timing: 'Celebrations, work sessions, spiritual ceremonies, social gatherings',
                        participants: 'Musicians, singers, dancers, all community members',
                        activities: 'Song sharing, instrument playing, dance performance, musical improvisation',
                        materials: 'Musical instruments, rhythm markers, dance accessories, acoustic spaces',
                        significance: 'Builds emotional connections and expresses cultural identity through sound',
                        customTerms: [
                            { concept: 'harmony-making', meaning: 'creating music together as a community' },
                            { concept: 'rhythm-bond', meaning: 'connection formed through shared musical timing' },
                            { concept: 'song-memory', meaning: 'musical preservation of important cultural information' }
                        ]
                    },
                    {
                        name: 'Visual Creation',
                        purpose: 'Expressing cultural values and beauty through visual arts',
                        timing: 'Ongoing creation with special displays during celebrations',
                        participants: 'Visual artists, decorators, community patrons, aesthetic judges',
                        activities: 'Painting, carving, weaving, decorating, symbolic creation, beauty competitions',
                        materials: 'Art supplies, display spaces, judging criteria, preservation materials',
                        significance: 'Creates lasting cultural artifacts and expresses community aesthetic values',
                        customTerms: [
                            { concept: 'beauty-making', meaning: 'creation of aesthetically pleasing objects' },
                            { concept: 'symbol-craft', meaning: 'art that carries cultural meaning beyond appearance' },
                            { concept: 'eye-pleasure', meaning: 'visual satisfaction derived from well-made objects' }
                        ]
                    },
                    {
                        name: 'Performance Ceremonies',
                        purpose: 'Combining multiple arts for powerful cultural expression',
                        timing: 'Major celebrations, spiritual events, important community gatherings',
                        participants: 'Performers, directors, costume makers, audience members, cultural leaders',
                        activities: 'Theatrical performance, ceremonial dance, musical drama, ritual enactment',
                        materials: 'Costumes, props, performance space, lighting, musical instruments',
                        significance: 'Provides intense cultural experience and reinforces important values through spectacle',
                        customTerms: [
                            { concept: 'art-joining', meaning: 'combination of multiple artistic forms in one performance' },
                            { concept: 'culture-showing', meaning: 'performance that displays community identity' },
                            { concept: 'experience-making', meaning: 'creating memorable events through artistic presentation' }
                        ]
                    }
                ]
            }
        };

        // Collect all selected tradition categories
        const allTraditions = {};
        categories.forEach(category => {
            if (traditionSystems[category]) {
                allTraditions[category] = traditionSystems[category];
                // Generate conlang names for each tradition and its terms
                allTraditions[category].traditions.forEach(tradition => {
                    tradition.conlangName = this.generateWordForConcept();
                    tradition.customTerms.forEach(term => {
                        term.conlangWord = this.generateWordForConcept();
                    });
                });
            }
        });

        return allTraditions;
    },

    displayTraditions(traditions) {
        const traditionsDisplay = document.getElementById('traditions-display');
        const traditionsSection = document.getElementById('traditions-system');
        
        if (!traditionsDisplay || !traditionsSection) return;
        
        let displayHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h6 style="color: var(--accent-primary); margin: 0;">Cultural Traditions</h6>
                <button class="btn btn-success" onclick="CulturalModule.addTraditionsToVocabulary()">
                    ➕ Add Tradition Terms to Dictionary
                </button>
            </div>
        `;

        Object.entries(traditions).forEach(([category, categoryData]) => {
            displayHTML += `
                <div style="margin-bottom: 30px;">
                    <h5 style="color: ${categoryData.color}; margin-bottom: 15px; display: flex; align-items: center;">
                        <span style="margin-right: 10px;">🎭</span>
                        ${categoryData.name}
                    </h5>
                    <p style="margin-bottom: 20px; color: #666; font-style: italic;">${categoryData.description}</p>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 20px;">
                        ${categoryData.traditions.map(tradition => `
                            <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid var(--border-light); box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                <h6 style="color: var(--accent-primary); margin-bottom: 10px; font-size: 1.1em;">
                                    ${tradition.conlangName} <span style="font-size: 0.9em; color: #666;">• ${tradition.name}</span>
                                </h6>
                                
                                <div style="margin-bottom: 12px;">
                                    <strong style="color: ${categoryData.color}; font-size: 0.9em;">Purpose:</strong>
                                    <p style="margin: 4px 0 0 0; font-size: 0.9em; line-height: 1.4;">${tradition.purpose}</p>
                                </div>
                                
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px; font-size: 0.85em;">
                                    <div>
                                        <strong>Timing:</strong><br>
                                        <span style="color: #666;">${tradition.timing}</span>
                                    </div>
                                    <div>
                                        <strong>Participants:</strong><br>
                                        <span style="color: #666;">${tradition.participants}</span>
                                    </div>
                                </div>
                                
                                <div style="margin-bottom: 12px;">
                                    <strong style="font-size: 0.85em;">Activities:</strong>
                                    <p style="margin: 4px 0 0 0; font-size: 0.85em; color: #666; line-height: 1.3;">${tradition.activities}</p>
                                </div>
                                
                                <div style="margin-bottom: 12px;">
                                    <strong style="font-size: 0.85em;">Materials:</strong>
                                    <p style="margin: 4px 0 0 0; font-size: 0.85em; color: #666; line-height: 1.3;">${tradition.materials}</p>
                                </div>
                                
                                <div style="margin-bottom: 12px;">
                                    <strong style="font-size: 0.85em;">Cultural Significance:</strong>
                                    <p style="margin: 4px 0 0 0; font-size: 0.85em; color: #666; font-style: italic; line-height: 1.3;">${tradition.significance}</p>
                                </div>
                                
                                <div>
                                    <strong style="font-size: 0.85em; color: ${categoryData.color};">Traditional Terms:</strong>
                                    <div style="margin-top: 6px; display: flex; flex-wrap: wrap; gap: 4px;">
                                        ${tradition.customTerms.map(term => `
                                            <span style="background: ${categoryData.color}; color: white; padding: 3px 8px; border-radius: 12px; font-size: 0.75em; cursor: help;" title="${term.meaning}">
                                                ${term.conlangWord}
                                            </span>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        });

        traditionsDisplay.innerHTML = displayHTML;
        traditionsSection.style.display = 'block';
        
        // Save traditions to culture data
        this.currentCulture.traditions = traditions;
        if (window.generator && window.generator.language) {
            window.generator.language.culture = { ...window.generator.language.culture, ...this.currentCulture };
        }
    },

    // Add traditions vocabulary to dictionary
    addTraditionsToVocabulary() {
        if (!this.generatedTraditions || Object.keys(this.generatedTraditions).length === 0) {
            showToast('No tradition terms to add! Generate traditions first.', 'error');
            return;
        }
        
        const wordsAdded = [];
        
        Object.entries(this.generatedTraditions).forEach(([category, categoryData]) => {
            categoryData.traditions.forEach(tradition => {
                // Add tradition name
                const traditionWord = {
                    conlang: tradition.conlangName,
                    english: tradition.name,
                    pos: 'noun',
                    notes: `Cultural tradition: ${tradition.purpose}`,
                    type: `tradition-${category}`,
                    dateAdded: new Date().toLocaleDateString()
                };
                
                const allWords = window.appState.getState('allWords') || [];
                if (!allWords.find(w => w.conlang.toLowerCase() === traditionWord.conlang.toLowerCase())) {
                    if (!window.generator.language.customWords) {
                        window.generator.language.customWords = [];
                    }
                    window.generator.language.customWords.push(traditionWord);
                    window.appState.addWord(traditionWord);
                    wordsAdded.push(traditionWord);
                }
                
                // Add custom terms from this tradition
                tradition.customTerms.forEach(term => {
                    const termWord = {
                        conlang: term.conlangWord,
                        english: term.concept,
                        pos: 'noun',
                        notes: `Traditional concept: ${term.meaning}`,
                        type: `tradition-${category}-term`,
                        dateAdded: new Date().toLocaleDateString()
                    };
                    
                    if (!allWords.find(w => w.conlang.toLowerCase() === termWord.conlang.toLowerCase())) {
                        if (!window.generator.language.customWords) {
                            window.generator.language.customWords = [];
                        }
                        window.generator.language.customWords.push(termWord);
                        window.appState.addWord(termWord);
                        wordsAdded.push(termWord);
                    }
                });
            });
        });
        
        // Update displays
        if (window.VocabularyModule) {
            window.VocabularyModule.updateDisplay();
        }
        
        if (window.ActivityModule) {
            window.ActivityModule.addActivity(`Added ${wordsAdded.length} tradition terms to vocabulary`, 'culture');
        }
        
        showToast(`Added ${wordsAdded.length} tradition terms to dictionary!`, 'success');
    }
};