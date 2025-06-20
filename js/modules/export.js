// Enhanced Export Module with Professional PDF
window.ExportModule = {
    pendingImportData: null,

    init() {
        console.log('Enhanced ExportModule initialized');
        this.bindEvents();
    },

    bindEvents() {
        console.log('Binding export events...');
        
        // Dictionary export
        const exportDictBtn = document.getElementById('export-dictionary-btn');
        if (exportDictBtn) {
            exportDictBtn.onclick = () => this.exportDictionary();
        }

        // Grammar export
        const exportGrammarBtn = document.getElementById('export-grammar-btn');
        if (exportGrammarBtn) {
            exportGrammarBtn.onclick = () => this.exportGrammar();
        }

        // Complete language export
        const exportCompleteBtn = document.getElementById('export-complete-btn');
        if (exportCompleteBtn) {
            exportCompleteBtn.onclick = () => this.exportComplete();
        }

        // Word list export
        const exportWordListBtn = document.getElementById('export-wordlist-btn');
        if (exportWordListBtn) {
            exportWordListBtn.onclick = () => this.exportWordList();
        }

        // PDF Language Book export - FIXED
        const exportPDFBtn = document.getElementById('export-pdf-btn');
        if (exportPDFBtn) {
            console.log('PDF button found, binding event');
            exportPDFBtn.onclick = () => {
                console.log('PDF button clicked!');
                this.exportProfessionalPDF();
            };
        } else {
            console.error('PDF button not found!');
        }

        // Anki flashcards export
        const exportAnkiBtn = document.getElementById('export-anki-btn');
        if (exportAnkiBtn) {
            exportAnkiBtn.onclick = () => this.exportAnkiDeck();
        }

        // HTML dictionary export
        const exportHTMLBtn = document.getElementById('export-html-btn');
        if (exportHTMLBtn) {
            exportHTMLBtn.onclick = () => this.exportHTMLDictionary();
        }

        // Local storage functions
        const saveLocalBtn = document.getElementById('save-local-btn');
        if (saveLocalBtn) {
            saveLocalBtn.onclick = () => this.saveToLocalStorage();
        }

        const loadLocalBtn = document.getElementById('load-local-btn');
        if (loadLocalBtn) {
            loadLocalBtn.onclick = () => this.loadFromLocalStorage();
        }

        // Import functionality
        const importLanguageBtn = document.getElementById('import-language-btn');
        if (importLanguageBtn) {
            importLanguageBtn.onclick = () => this.importLanguage();
        }

        console.log('Export events bound successfully');
    },

    // Load PDF-lib library
    async loadPDFLib() {
        if (!window.PDFLib) {
            console.log('Loading PDF-lib...');
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js';
            return new Promise((resolve, reject) => {
                script.onload = () => {
                    console.log('PDF-lib loaded successfully');
                    resolve();
                };
                script.onerror = (error) => {
                    console.error('Failed to load PDF-lib:', error);
                    reject(error);
                };
                document.head.appendChild(script);
            });
        }
    },

    // Helper function to wrap text
    wrapText(text, font, size, maxWidth) {
        const words = text.split(' ');
        let lines = [];
        let currentLine = '';

        for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const testWidth = font.widthOfTextAtSize(testLine, size);
            
            if (testWidth <= maxWidth) {
                currentLine = testLine;
            } else {
                if (currentLine) {
                    lines.push(currentLine);
                    currentLine = word;
                } else {
                    lines.push(word);
                }
            }
        }
        if (currentLine) lines.push(currentLine);
        return lines;
    },

    // MODERN PDF Export with Unicode Support
    // Replace the exportProfessionalPDF function in export.js with this version

    async exportProfessionalPDF() {
    console.log('Starting modern PDF export with Unicode support...');
    
    try {
        // Use jsPDF instead of PDF-lib for better Unicode support
        await this.loadJsPDF();
        
        const allWords = window.appState.getState('allWords') || [];
        const language = window.generator ? window.generator.language : {};
        const culture = language.culture || {};
        const languageName = language.name || 'Conlang';
        
        if (allWords.length === 0) {
            showToast('No vocabulary to export!', 'error');
            return;
        }
        
        console.log(`Exporting ${allWords.length} words for ${languageName}`);
        
        // Create PDF with Unicode support
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            putOnlyUsedFonts: true,
            floatPrecision: 16
        });
        
        // Set up for Unicode support
        doc.setFont('helvetica');
        let yPosition = 20;
        const pageHeight = 297;
        const pageWidth = 210;
        const margin = 20;
        const contentWidth = pageWidth - (margin * 2);
        
        // Helper functions
        const addNewPage = () => {
            doc.addPage();
            yPosition = 20;
        };
        
        const checkPageBreak = (neededSpace = 20) => {
            if (yPosition + neededSpace > pageHeight - margin) {
                addNewPage();
            }
        };
        
        // Safe text function that handles Unicode characters
        const addText = (text, x, y, options = {}) => {
            const fontSize = options.fontSize || 10;
            const fontStyle = options.fontStyle || 'normal';
            const align = options.align || 'left';
            
            doc.setFontSize(fontSize);
            doc.setFont('helvetica', fontStyle);
            
            // Convert any problematic characters to safe equivalents
            const safeText = this.sanitizeTextForPDF(text);
            
            try {
                if (align === 'center') {
                    doc.text(safeText, pageWidth / 2, y, { align: 'center' });
                } else {
                    doc.text(safeText, x, y);
                }
            } catch (error) {
                console.warn('Text rendering issue:', error);
                // Fallback: remove all non-ASCII characters
                const fallbackText = text.replace(/[^\x00-\x7F]/g, '?');
                doc.text(fallbackText, x, y);
            }
        };
        
        const addSectionHeader = (title) => {
            checkPageBreak(25);
            yPosition += 10;
            addText(title, margin, yPosition, { fontSize: 16, fontStyle: 'bold' });
            yPosition += 15;
        };
        
        // COVER PAGE
        console.log('Creating cover page...');
        
        // Title
        addText(languageName, 0, 80, { fontSize: 24, fontStyle: 'bold', align: 'center' });
        
        // Subtitle
        addText('Complete Language Reference', 0, 100, { fontSize: 14, align: 'center' });
        
        // Details
        const cultureType = culture.type || 'Developed';
        addText(`${allWords.length} words • ${cultureType} culture`, 0, 120, { fontSize: 12, align: 'center' });
        addText(`Generated on ${new Date().toLocaleDateString()}`, 0, 135, { fontSize: 10, align: 'center' });
        
        // LANGUAGE OVERVIEW
        addNewPage();
        addSectionHeader('Language Overview');
        
        addText(`Language Name: ${languageName}`, margin, yPosition, { fontStyle: 'bold' });
        yPosition += 8;
        addText(`Total Vocabulary: ${allWords.length} words`, margin, yPosition);
        yPosition += 8;
        addText(`Culture Type: ${cultureType}`, margin, yPosition);
        yPosition += 8;
        
        if (culture.socialStructure) {
            addText(`Social Structure: ${culture.socialStructure}`, margin, yPosition);
            yPosition += 8;
        }


        
        // ENHANCED PHONOLOGY WITH ORTHOGRAPHY
        addSectionHeader('Phonological System');
        
        const phonology = language.phonology || {};
        
        if (phonology.vowels && phonology.vowels.length > 0) {
            addText('Vowel Inventory:', margin, yPosition, { fontStyle: 'bold' });
            yPosition += 6;
            // Split vowels into chunks to avoid line overflow
            const vowelChunks = this.chunkArray(phonology.vowels, 15);
            vowelChunks.forEach(chunk => {
                addText(chunk.join(', '), margin + 5, yPosition);
                yPosition += 6;
            });
            yPosition += 5;
        }
        
        if (phonology.consonants && phonology.consonants.length > 0) {
            addText('Consonant Inventory:', margin, yPosition, { fontStyle: 'bold' });
            yPosition += 6;
            // Split consonants into chunks to avoid line overflow
            const consonantChunks = this.chunkArray(phonology.consonants, 12);
            consonantChunks.forEach(chunk => {
                addText(chunk.join(', '), margin + 5, yPosition);
                yPosition += 6;
            });
            yPosition += 5;
        }
        
        if (phonology.syllableStructures && phonology.syllableStructures.length > 0) {
            addText('Syllable Structures:', margin, yPosition, { fontStyle: 'bold' });
            yPosition += 6;
            addText(phonology.syllableStructures.join(', '), margin + 5, yPosition);
            yPosition += 6;
            addText('(C = Consonant, V = Vowel)', margin + 5, yPosition, { fontSize: 8 });
            yPosition += 15;
        }

        // ORTHOGRAPHY SECTION (NEW!)
        if (window.PhonologyModule && window.PhonologyModule.getOrthographyMap) {
            const orthographyMap = window.PhonologyModule.getOrthographyMap();
            
            if (Object.keys(orthographyMap).length > 0) {
                addText('Writing System (Orthography):', margin, yPosition, { fontStyle: 'bold', fontSize: 12 });
                yPosition += 8;
                
                addText('Sound-to-Letter Correspondences:', margin, yPosition, { fontStyle: 'bold' });
                yPosition += 6;
                
                // Group by vowels and consonants
                const vowelMappings = [];
                const consonantMappings = [];
                
                Object.entries(orthographyMap).forEach(([ipa, ortho]) => {
                    if (phonology.vowels && phonology.vowels.includes(ipa)) {
                        vowelMappings.push(`${ipa} = ${ortho}`);
                    } else if (phonology.consonants && phonology.consonants.includes(ipa)) {
                        consonantMappings.push(`${ipa} = ${ortho}`);
                    }
                });
                
                if (vowelMappings.length > 0) {
                    addText('Vowels: ' + vowelMappings.join(', '), margin + 5, yPosition, { fontSize: 9 });
                    yPosition += 6;
                }
                
                if (consonantMappings.length > 0) {
                    // Split long consonant lists
                    const consonantChunks = this.chunkArray(consonantMappings, 8);
                    consonantChunks.forEach((chunk, index) => {
                        const prefix = index === 0 ? 'Consonants: ' : '           ';
                        addText(prefix + chunk.join(', '), margin + 5, yPosition, { fontSize: 9 });
                        yPosition += 6;
                    });
                }
                
                yPosition += 5;
                
                // Example words in both systems
                checkPageBreak(20);
                addText('Pronunciation Examples:', margin, yPosition, { fontStyle: 'bold' });
                yPosition += 6;
                
                // Generate sample words showing both IPA and orthography
                const sampleWords = this.generateOrthographyExamples(phonology, orthographyMap);
                sampleWords.forEach(example => {
                    addText(`${example.orthography} [${example.ipa}] - "${example.meaning}"`, margin + 5, yPosition, { fontSize: 9 });
                    yPosition += 5;
                });
                
                yPosition += 10;
            }
        }
        
        // GRAMMAR & MORPHOLOGY
        addSectionHeader('Grammar & Morphology');
        
        const morphology = language.morphology || {};
        const syntax = language.syntax || {};
        
        if (syntax.wordOrder) {
            addText(`Basic Word Order: ${syntax.wordOrder.toUpperCase()}`, margin, yPosition, { fontStyle: 'bold' });
            yPosition += 10;
        }
        
        if (morphology.hasCases && morphology.cases && morphology.cases.length > 0) {
            addText('Case System:', margin, yPosition, { fontStyle: 'bold' });
            yPosition += 6;
            morphology.cases.forEach(caseType => {
                addText(`• ${caseType}`, margin + 5, yPosition);
                yPosition += 5;
            });
            yPosition += 5;
        }
        
        if (morphology.hasTenses && morphology.tenses && morphology.tenses.length > 0) {
            addText('Tense System:', margin, yPosition, { fontStyle: 'bold' });
            yPosition += 6;
            morphology.tenses.forEach(tense => {
                addText(`• ${tense}`, margin + 5, yPosition);
                yPosition += 5;
            });
            yPosition += 5;
        }
        
        if (morphology.hasGenders && morphology.genders && morphology.genders.length > 0) {
            addText('Gender System:', margin, yPosition, { fontStyle: 'bold' });
            yPosition += 6;
            morphology.genders.forEach(gender => {
                addText(`• ${gender}`, margin + 5, yPosition);
                yPosition += 5;
            });
            yPosition += 5;
        }
        
        if (morphology.hasPlurals && morphology.pluralTypes && morphology.pluralTypes.length > 0) {
            addText('Plural Formation:', margin, yPosition, { fontStyle: 'bold' });
            yPosition += 6;
            morphology.pluralTypes.forEach(type => {
                addText(`• ${type}`, margin + 5, yPosition);
                yPosition += 5;
            });
            yPosition += 5;
        }
        
        // MORPHOLOGICAL AFFIXES
        if (morphology.affixes && Object.keys(morphology.affixes).length > 0) {
            checkPageBreak(30);
            addText('Morphological Affixes:', margin, yPosition, { fontStyle: 'bold', fontSize: 12 });
            yPosition += 8;
            
            // Group affixes by category
            const affixesByCategory = {};
            Object.entries(morphology.affixes).forEach(([name, affix]) => {
                const category = affix.originalCategory || affix.category || 'other';
                if (!affixesByCategory[category]) affixesByCategory[category] = [];
                affixesByCategory[category].push({ name, ...affix });
            });
            
            // Display affixes by category
            Object.entries(affixesByCategory).forEach(([category, affixes]) => {
                checkPageBreak(15);
                addText(`${category.charAt(0).toUpperCase() + category.slice(1)} Affixes:`, margin + 5, yPosition, { fontStyle: 'bold' });
                yPosition += 6;
                
                affixes.forEach(affix => {
                    checkPageBreak(8);
                    const affixText = `• ${affix.morpheme} (${affix.type}): ${affix.description || affix.name}`;
                    addText(affixText, margin + 10, yPosition, { fontSize: 9 });
                    yPosition += 5;
                });
                yPosition += 3;
            });
            yPosition += 5;
        }
        
        // CUSTOM AFFIXES
        if (language.customAffixes && language.customAffixes.length > 0) {
            checkPageBreak(20);
            addText('Custom Derivational Affixes:', margin, yPosition, { fontStyle: 'bold', fontSize: 12 });
            yPosition += 8;
            
            language.customAffixes.forEach(affix => {
                checkPageBreak(8);
                const affixText = `• ${affix.morpheme} (${affix.type}): ${affix.description}`;
                addText(affixText, margin + 5, yPosition, { fontSize: 9 });
                yPosition += 5;
            });
            yPosition += 10;
        }
        
        // CULTURAL INFORMATION
        if (culture.calendar || window.CulturalModule?.generatedCalendarTerms) {
            addSectionHeader('Cultural Background');
            
            if (culture.calendar && culture.calendar.name) {
                addText(`Calendar System: ${culture.calendar.name}`, margin, yPosition, { fontStyle: 'bold' });
                yPosition += 6;
                if (culture.calendar.description) {
                    const wrappedDesc = this.wrapText(culture.calendar.description, contentWidth - 10);
                    wrappedDesc.forEach(line => {
                        addText(line, margin + 5, yPosition);
                        yPosition += 5;
                    });
                }
                yPosition += 5;
            }
            
            // Cultural events
            if (window.CulturalModule?.generatedCalendarTerms) {
                addText('Cultural Events:', margin, yPosition, { fontStyle: 'bold' });
                yPosition += 6;
                Object.values(window.CulturalModule.generatedCalendarTerms).forEach(event => {
                    if (event && event.name && event.meaning) {
                        checkPageBreak(10);
                        addText(`• ${event.conlangName || event.name}: ${event.meaning}`, margin + 5, yPosition);
                        yPosition += 5;
                    }
                });
                yPosition += 5;
            }
        }
        
        // ENHANCED DICTIONARY WITH ORTHOGRAPHY
        addSectionHeader('Complete Dictionary');
        
        addText(`Total vocabulary: ${allWords.length} words`, margin, yPosition, { fontStyle: 'bold' });
        yPosition += 6;
        
        // Check if orthography is available
        const hasOrthography = window.PhonologyModule && 
                              window.PhonologyModule.getOrthographyMap && 
                              Object.keys(window.PhonologyModule.getOrthographyMap()).length > 0;
        
        if (hasOrthography) {
            addText('Format: Written Form [IPA] - English Meaning', margin, yPosition, { fontSize: 8, fontStyle: 'italic' });
            yPosition += 10;
        } else {
            addText('Format: Conlang Word - English Meaning', margin, yPosition, { fontSize: 8, fontStyle: 'italic' });
            yPosition += 10;
        }
        
        // Group words by part of speech
        const wordsByPOS = {};
        allWords.forEach(word => {
            const pos = word.pos || 'other';
            if (!wordsByPOS[pos]) wordsByPOS[pos] = [];
            wordsByPOS[pos].push(word);
        });
        
        const posOrder = ['noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition', 'conjunction', 'interjection', 'other'];
        const sortedPOS = Object.keys(wordsByPOS).sort((a, b) => {
            const aIndex = posOrder.indexOf(a);
            const bIndex = posOrder.indexOf(b);
            return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
        });
        
        sortedPOS.forEach(pos => {
            const words = wordsByPOS[pos].sort((a, b) => a.conlang.localeCompare(b.conlang));
            
            checkPageBreak(20);
            addText(`${pos.toUpperCase()}S (${words.length} words)`, margin, yPosition, { 
                fontSize: 12, 
                fontStyle: 'bold' 
            });
            yPosition += 8;
            
            words.forEach(word => {
                checkPageBreak(8);
                
                let wordText;
                if (hasOrthography && window.PhonologyModule.convertToOrthography) {
                    // Show both orthography and IPA
                    const orthography = window.PhonologyModule.convertToOrthography(word.conlang);
                    const ipa = word.conlang;
                    
                    // Only show IPA if it's different from orthography
                    if (orthography !== ipa) {
                        wordText = `${orthography} [${ipa}] - ${word.english}`;
                    } else {
                        wordText = `${orthography} - ${word.english}`;
                    }
                } else {
                    // Fallback to original format
                    wordText = `${this.sanitizeTextForPDF(word.conlang)} - ${word.english}`;
                }
                
                if (word.notes) {
                    wordText += ` (${word.notes})`;
                }
                
                addText(wordText, margin + 5, yPosition, { fontSize: 9 });
                yPosition += 5;
            });
            
            yPosition += 5;
        });
        
        // STATISTICS
        addSectionHeader('Language Statistics');
        
        addText(`Total Words: ${allWords.length}`, margin, yPosition, { fontStyle: 'bold' });
        yPosition += 6;
        addText(`Parts of Speech: ${Object.keys(wordsByPOS).length}`, margin, yPosition);
        yPosition += 6;
        
        if (phonology.vowels) {
            addText(`Vowel Phonemes: ${phonology.vowels.length}`, margin, yPosition);
            yPosition += 6;
        }
        if (phonology.consonants) {
            addText(`Consonant Phonemes: ${phonology.consonants.length}`, margin, yPosition);
            yPosition += 6;
        }
        
        yPosition += 5;
        addText('Vocabulary Distribution:', margin, yPosition, { fontStyle: 'bold' });
        yPosition += 6;
        
        Object.entries(wordsByPOS).forEach(([pos, words]) => {
            const percentage = Math.round((words.length / allWords.length) * 100);
            addText(`${pos}: ${words.length} words (${percentage}%)`, margin + 5, yPosition);
            yPosition += 5;
        });
        
        // Save the PDF
        console.log('Saving modern PDF...');
        const fileName = `${languageName.replace(/[^a-zA-Z0-9]/g, '_')}_Language_Reference.pdf`;
        doc.save(fileName);
        
        if (window.ActivityModule) {
            window.ActivityModule.addActivity('Generated professional PDF with Unicode support', 'export');
        }
        
        showToast('Professional PDF generated successfully!', 'success');
        
    } catch (error) {
        console.error('PDF export error:', error);
        showToast('Error generating PDF: ' + error.message, 'error');
    }
},

// Helper function to load jsPDF
async loadJsPDF() {
    if (!window.jspdf) {
        console.log('Loading jsPDF...');
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        return new Promise((resolve, reject) => {
            script.onload = () => {
                console.log('jsPDF loaded successfully');
                resolve();
            };
            script.onerror = (error) => {
                console.error('Failed to load jsPDF:', error);
                reject(error);
            };
            document.head.appendChild(script);
        });
    }
},

generateOrthographyExamples(phonology, orthographyMap) {
    const examples = [];
    const vowels = phonology.vowels || ['a'];
    const consonants = phonology.consonants || ['k'];
    
    // Sample meanings for demonstration
    const meanings = ['water', 'fire', 'mountain', 'tree', 'stone', 'wind', 'sun', 'moon'];
    
    for (let i = 0; i < Math.min(5, meanings.length); i++) {
        // Generate a simple word structure (CV or CVC)
        const structure = Math.random() > 0.5 ? 'CVC' : 'CV';
        let ipaWord = '';
        let orthoWord = '';
        
        for (let char of structure) {
            if (char === 'C') {
                const consonant = consonants[Math.floor(Math.random() * consonants.length)];
                ipaWord += consonant;
                orthoWord += orthographyMap[consonant] || consonant;
            } else if (char === 'V') {
                const vowel = vowels[Math.floor(Math.random() * vowels.length)];
                ipaWord += vowel;
                orthoWord += orthographyMap[vowel] || vowel;
            }
        }
        
        examples.push({
            ipa: ipaWord,
            orthography: orthoWord,
            meaning: meanings[i]
        });
    }
    
    return examples;
},

// Helper function to sanitize text for PDF
sanitizeTextForPDF(text) {
    if (!text) return '';
    
    // Map of IPA and special characters to safe alternatives
    const characterMap = {
        'ŋ': 'ng',
        'ʃ': 'sh',
        'ʒ': 'zh',
        'θ': 'th',
        'ð': 'dh',
        'χ': 'x',
        'ɸ': 'f',
        'β': 'b',
        'ɣ': 'g',
        'ʔ': "'",
        'ə': 'e',
        'ɛ': 'e',
        'ɔ': 'o',
        'ɑ': 'a',
        'ɪ': 'i',
        'ʊ': 'u',
        'ʌ': 'u',
        'æ': 'ae',
        'ø': 'o',
        'œ': 'oe',
        'ɨ': 'i',
        'ɯ': 'u',
        'ɤ': 'o',
        'ɐ': 'a',
        'ħ': 'h',
        'ʕ': "'",
        'ɲ': 'ny',
        'ʎ': 'ly',
        'ɬ': 'lh',
        'ɮ': 'lz',
        'ɾ': 'r',
        'ɽ': 'r',
        'ɻ': 'r',
        'ʀ': 'R',
        'ʁ': 'g',
        'ʂ': 's',
        'ʐ': 'z',
        'ɳ': 'n',
        'ɖ': 'd',
        'ɭ': 'l',
        'ʈ': 't',
        'ɟ': 'j',
        'ɡ': 'g',
        'ɢ': 'G',
        'ʡ': "'",
        'ɂ': "'",
        'ɕ': 's',
        'ʑ': 'z',
        'ɻ': 'r'
    };
    
    let result = String(text);
    
    // Replace known problematic characters
    Object.entries(characterMap).forEach(([ipa, safe]) => {
        result = result.replace(new RegExp(ipa, 'g'), safe);
    });
    
    // Remove any remaining non-printable or problematic characters
    result = result.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
    
    return result;
},

// Helper function to wrap text
wrapText(text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    
    words.forEach(word => {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (testLine.length * 2.5 <= maxWidth) { // Rough character width estimation
            currentLine = testLine;
        } else {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
        }
    });
    
    if (currentLine) lines.push(currentLine);
    return lines;
},

// Helper function to chunk arrays
chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
},

    // Safe text wrapping that handles font measurement errors
    wrapTextSafe(text, font, size, maxWidth) {
        const words = text.split(' ');
        let lines = [];
        let currentLine = '';

        for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            
            try {
                const testWidth = font.widthOfTextAtSize(testLine, size);
                
                if (testWidth <= maxWidth) {
                    currentLine = testLine;
                } else {
                    if (currentLine) {
                        lines.push(currentLine);
                        currentLine = word;
                    } else {
                        lines.push(word);
                    }
                }
            } catch (e) {
                // If width calculation fails, use character count as approximation
                if (testLine.length <= maxWidth / 6) { // Rough character width estimate
                    currentLine = testLine;
                } else {
                    if (currentLine) {
                        lines.push(currentLine);
                        currentLine = word;
                    } else {
                        lines.push(word);
                    }
                }
            }
        }
        if (currentLine) lines.push(currentLine);
        return lines;
    },

    // Get language name with fallback to prompt
    getLanguageName() {
        // Try multiple sources for language name
        let languageName = window.generator?.language?.name || 
                          window.generator?.currentLanguageName || 
                          document.getElementById('language-name')?.value;
        
        // If no name found, prompt the user
        if (!languageName || languageName === 'Unnamed Conlang') {
            languageName = prompt('What would you like to name your language?', 'My Conlang');
            
            // Save the name for future use
            if (languageName && window.generator?.language) {
                window.generator.language.name = languageName;
            }
        }
        
        return languageName || 'Unnamed Conlang';
    },
    calculateCompletionScore(words, language) {
        let score = 0;
        score += Math.min(40, (words.length / 200) * 40); // Vocabulary
        
        const phonology = language.phonology || {};
        if (phonology.vowels && phonology.vowels.length > 0) score += 10;
        if (phonology.consonants && phonology.consonants.length > 0) score += 10;
        
        if (language.syntax?.wordOrder) score += 10;
        if (language.morphology?.cases) score += 10;
        if (language.culture?.type) score += 10;
        
        return Math.round(score);
    },

    // Export Anki Deck
    exportAnkiDeck() {
        const allWords = window.appState.getState('allWords') || [];
        
        if (allWords.length === 0) {
            showToast('No vocabulary to export! Generate a language first.', 'error');
            return;
        }

        let ankiCSV = 'Front,Back,Tags\n';
        
        allWords.forEach(word => {
            const front = word.conlang;
            const back = `${word.english}<br><i>(${word.pos})</i>`;
            const tags = `conlang ${word.pos} ${word.type || 'core'}`.replace(/\s+/g, ' ');
            
            const escapedBack = `"${back.replace(/"/g, '""')}"`;
            const escapedTags = `"${tags}"`;
            
            ankiCSV += `"${front}",${escapedBack},${escapedTags}\n`;
        });

        this.downloadFile(ankiCSV, 'conlang_anki_deck.csv', 'text/csv');
        showToast(`Exported ${allWords.length} flashcards for Anki!`, 'success');
    },

    // Export HTML Dictionary - RESTORED FULL VERSION
    exportHTMLDictionary() {
        const allWords = window.appState.getState('allWords') || [];
        
        if (allWords.length === 0) {
            showToast('No vocabulary to export! Generate a language first.', 'error');
            return;
        }

        const language = window.generator?.language || {};
        const culture = language.culture || {};
        const languageName = this.getLanguageName();

        // Group words by first letter for navigation
        const wordsByLetter = {};
        allWords.forEach(word => {
            const firstLetter = word.conlang.charAt(0).toUpperCase();
            if (!wordsByLetter[firstLetter]) wordsByLetter[firstLetter] = [];
            wordsByLetter[firstLetter].push(word);
        });

        // Sort letters and words
        const sortedLetters = Object.keys(wordsByLetter).sort();
        sortedLetters.forEach(letter => {
            wordsByLetter[letter].sort((a, b) => a.conlang.localeCompare(b.conlang));
        });

        const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${languageName} Dictionary</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f8f9fa;
            color: #333;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
        }
        .search-bar {
            padding: 20px;
            background: #f8f9fa;
            border-bottom: 1px solid #dee2e6;
        }
        .search-input {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #dee2e6;
            border-radius: 25px;
            font-size: 16px;
            outline: none;
            transition: border-color 0.3s;
            box-sizing: border-box;
        }
        .search-input:focus {
            border-color: #667eea;
        }
        .navigation {
            padding: 20px;
            background: #f8f9fa;
            border-bottom: 1px solid #dee2e6;
            text-align: center;
        }
        .nav-letter {
            display: inline-block;
            margin: 0 5px;
            padding: 8px 12px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 20px;
            font-weight: bold;
            transition: background-color 0.3s;
        }
        .nav-letter:hover {
            background: #5a6fd8;
        }
        .content {
            padding: 30px;
        }
        .letter-section {
            margin-bottom: 40px;
        }
        .letter-header {
            font-size: 2em;
            font-weight: bold;
            color: #667eea;
            border-bottom: 3px solid #667eea;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .word-entry {
            margin-bottom: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }
        .word-conlang {
            font-size: 1.3em;
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
        }
        .word-english {
            font-size: 1.1em;
            color: #667eea;
            margin-bottom: 5px;
        }
        .word-pos {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 0.8em;
            margin-right: 10px;
        }
        .word-type {
            display: inline-block;
            background: #6c757d;
            color: white;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 0.8em;
        }
        .word-notes {
            margin-top: 8px;
            color: #666;
            font-style: italic;
        }
        .stats {
            background: #e9ecef;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
        }
        .hidden {
            display: none;
        }
        @media (max-width: 768px) {
            .header h1 { font-size: 2em; }
            .content { padding: 20px; }
            .nav-letter { margin: 2px; padding: 6px 10px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${languageName} Dictionary</h1>
            <p>${allWords.length} words • ${culture.type || 'Unknown'} culture • Generated ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="search-bar">
            <input type="text" class="search-input" placeholder="Search words..." onkeyup="searchWords()">
        </div>
        
        <div class="navigation">
            ${sortedLetters.map(letter => `<a href="#letter-${letter}" class="nav-letter">${letter}</a>`).join('')}
        </div>
        
        <div class="content">
            <div class="stats">
                <strong>Dictionary Statistics:</strong> ${allWords.length} total words across ${sortedLetters.length} letters
            </div>
            
            ${sortedLetters.map(letter => `
                <div class="letter-section" id="letter-${letter}">
                    <div class="letter-header">${letter}</div>
                    ${wordsByLetter[letter].map(word => `
                        <div class="word-entry" data-search="${word.conlang.toLowerCase()} ${word.english.toLowerCase()}">
                            <div class="word-conlang">${word.conlang}</div>
                            <div class="word-english">${word.english}</div>
                            <div>
                                <span class="word-pos">${word.pos || 'unknown'}</span>
                                ${word.type ? `<span class="word-type">${word.type}</span>` : ''}
                            </div>
                            ${word.notes ? `<div class="word-notes">"${word.notes}"</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            `).join('')}
        </div>
    </div>
    
    <script>
        function searchWords() {
            const searchTerm = document.querySelector('.search-input').value.toLowerCase();
            const wordEntries = document.querySelectorAll('.word-entry');
            const letterSections = document.querySelectorAll('.letter-section');
            
            wordEntries.forEach(entry => {
                const searchData = entry.getAttribute('data-search');
                if (searchData.includes(searchTerm)) {
                    entry.classList.remove('hidden');
                } else {
                    entry.classList.add('hidden');
                }
            });
            
            // Hide empty letter sections
            letterSections.forEach(section => {
                const visibleEntries = section.querySelectorAll('.word-entry:not(.hidden)');
                if (visibleEntries.length === 0) {
                    section.classList.add('hidden');
                } else {
                    section.classList.remove('hidden');
                }
            });
        }
        
        // Smooth scrolling for navigation
        document.querySelectorAll('.nav-letter').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                target.scrollIntoView({ behavior: 'smooth' });
            });
        });
    </script>
</body>
</html>`;

        this.downloadFile(htmlContent, `${languageName.replace(/[^a-zA-Z0-9]/g, '_')}_dictionary.html`, 'text/html');

        if (window.ActivityModule) {
            window.ActivityModule.addActivity('Exported HTML dictionary', 'export');
        }
        
        showToast('HTML dictionary exported successfully!', 'success');
    },

    // Basic exports
    exportDictionary() {
        const allWords = window.appState.getState('allWords') || [];
        if (allWords.length === 0) {
            showToast('No vocabulary to export!', 'error');
            return;
        }

        const csvContent = 'Conlang,English,Part of Speech,Type,Notes\n' + 
            allWords.map(word => `"${word.conlang}","${word.english}","${word.pos}","${word.type || 'core'}","${word.notes || ''}"`).join('\n');
        
        this.downloadFile(csvContent, 'conlang_dictionary.csv', 'text/csv');
        showToast('Dictionary exported successfully!', 'success');
    },

    exportGrammar() {
        let grammarText = `CONLANG GRAMMAR REFERENCE\n`;
        grammarText += `Generated: ${new Date().toLocaleDateString()}\n\n`;
        
        if (window.generator?.language?.grammarRules) {
            window.generator.language.grammarRules.forEach(rule => {
                grammarText += `${rule.category}: ${rule.rule}\n`;
                if (rule.details) {
                    grammarText += `  Details: ${rule.details}\n`;
                }
                grammarText += `\n`;
            });
        }

        this.downloadFile(grammarText, 'conlang_grammar.txt', 'text/plain');
        showToast('Grammar reference exported!', 'success');
    },

    exportComplete() {
        const completeData = {
            language: window.generator.language,
            allWords: window.appState.getState('allWords') || [],
            exportDate: new Date().toISOString(),
            version: "2.0"
        };

        this.downloadFile(JSON.stringify(completeData, null, 2), 'conlang_complete.json', 'application/json');
        showToast('Complete language data exported!', 'success');
    },

    exportWordList() {
        const allWords = window.appState.getState('allWords') || [];
        if (allWords.length === 0) {
            showToast('No vocabulary to export!', 'error');
            return;
        }

        let wordList = `CONLANG WORD LIST\n`;
        wordList += `Generated: ${new Date().toLocaleDateString()}\n`;
        wordList += `Total words: ${allWords.length}\n\n`;
        
        allWords.forEach(word => {
            wordList += `${word.conlang} - ${word.english} (${word.pos})\n`;
        });

        this.downloadFile(wordList, 'conlang_wordlist.txt', 'text/plain');
        showToast('Word list exported!', 'success');
    },

    // Storage functions
    saveToLocalStorage() {
        try {
            const dataToSave = {
                language: window.generator.language,
                allWords: window.appState.getState('allWords') || [],
                saveDate: new Date().toISOString()
            };

            localStorage.setItem('conlang_save', JSON.stringify(dataToSave));
            showToast('Language saved to browser storage!', 'success');
        } catch (error) {
            showToast('Failed to save language data!', 'error');
        }
    },

    loadFromLocalStorage() {
        try {
            const savedData = localStorage.getItem('conlang_save');
            if (!savedData) {
                showToast('No saved language found!', 'error');
                return;
            }

            const data = JSON.parse(savedData);
            
            if (data.language) {
                window.generator.language = data.language;
            }
            if (data.allWords) {
                window.appState.setState('allWords', data.allWords);
            }
            
            if (window.VocabularyModule) {
                window.VocabularyModule.updateDisplay();
            }

            showToast('Language loaded successfully!', 'success');
        } catch (error) {
            showToast('Failed to load language data!', 'error');
        }
    },

    // Import functionality
    importLanguage() {
        const fileInput = document.getElementById('language-file-input');
        if (!fileInput || !fileInput.files.length) {
            showToast('Please select a JSON file to import!', 'error');
            return;
        }

        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importData = JSON.parse(e.target.result);
                
                // Import the data
                if (importData.language) {
                    window.generator.language = importData.language;
                }
                if (importData.allWords) {
                    window.appState.setState('allWords', importData.allWords);
                }
                
                // Refresh displays
                if (window.VocabularyModule) {
                    window.VocabularyModule.updateDisplay();
                }

                showToast(`Language imported successfully! ${importData.allWords?.length || 0} words loaded.`, 'success');
                
            } catch (error) {
                showToast('Invalid JSON file!', 'error');
            }
        };
        reader.readAsText(file);
    },

    // Utility function
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
};