// Enhanced Tab Management System with auto-scroll fix
class TabManager {
    constructor() {
        this.tabs = [
            { id: 'home', name: '🏠 Home', shortName: 'Home', file: 'templates/home.html' },
            { id: 'phonology', name: '🔤 Phonology', shortName: 'Phono', file: 'templates/phonology.html' },
            { id: 'grammar', name: '📖 Grammar', shortName: 'Grammar', file: 'templates/grammar.html' },
            { id: 'morphology', name: '🔧 Morphology', shortName: 'Morph', file: 'templates/morphology.html' },
            { id: 'generator', name: '⚡ Generator', shortName: 'Gen', file: 'templates/generator.html' },
            { id: 'vocabulary', name: '📚 Vocabulary', shortName: 'Vocab', file: 'templates/vocabulary.html' },
            { id: 'corpus', name: '📝 Corpus', shortName: 'Corpus', file: 'templates/corpus.html' },
            { id: 'cultural', name: '🏛️ Cultural', shortName: 'Culture', file: 'templates/cultural.html' },
            { id: 'ai-assistant', name: '🤖 AI Assistant', shortName: 'AI', file: 'templates/ai-assistant.html' },
            { id: 'overview', name: '📊 Overview', shortName: 'Stats', file: 'templates/overview.html' },
            { id: 'export', name: '📤 Export', shortName: 'Export', file: 'templates/export.html' }
        ];
        this.currentTab = 'home';
        this.init();
    }

    init() {
        this.renderTabs();
        // Load home tab by default
        this.loadTab('home');
        
        // Add resize listener to handle responsive changes
        window.addEventListener('resize', () => this.handleResize());
    }

    renderTabs() {
        const navTabs = document.querySelector('.nav-tabs');
        if (!navTabs) {
            console.error('Nav tabs container not found');
            return;
        }

        navTabs.innerHTML = this.tabs.map(tab => 
            `<button class="nav-tab ${tab.id === this.currentTab ? 'active' : ''}" 
                     data-short-name="${tab.shortName}"
                     onclick="tabManager.switchTab('${tab.id}')">${tab.name}</button>`
        ).join('');
    }

    async switchTab(tabId) {
        if (this.currentTab === tabId) return;

        // Update active state in navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        const clickedTab = Array.from(document.querySelectorAll('.nav-tab')).find(tab => 
            tab.onclick && tab.onclick.toString().includes(`'${tabId}'`)
        );
        if (clickedTab) {
            clickedTab.classList.add('active');
            
            // Scroll the active tab into view if needed
            this.scrollTabIntoView(clickedTab);
        }

        this.currentTab = tabId;
        await this.loadTab(tabId);
    }

    scrollTabIntoView(tabElement) {
        const navTabs = document.querySelector('.nav-tabs');
        if (!navTabs || !tabElement) return;

        // Only scroll on smaller screens where overflow is enabled
        if (window.innerWidth <= 1024) {
            const tabRect = tabElement.getBoundingClientRect();
            const navRect = navTabs.getBoundingClientRect();
            
            // Check if tab is not fully visible
            if (tabRect.left < navRect.left || tabRect.right > navRect.right) {
                // Calculate scroll position to center the tab
                const scrollLeft = tabElement.offsetLeft - (navTabs.clientWidth / 2) + (tabElement.clientWidth / 2);
                navTabs.scrollTo({
                    left: scrollLeft,
                    behavior: 'smooth'
                });
            }
        }
    }

    handleResize() {
        // Re-scroll active tab into view after resize
        const activeTab = document.querySelector('.nav-tab.active');
        if (activeTab) {
            // Small delay to ensure layout has settled
            setTimeout(() => {
                this.scrollTabIntoView(activeTab);
            }, 100);
        }
    }

    async loadTab(tabId) {
        const tab = this.tabs.find(t => t.id === tabId);
        if (!tab) {
            console.error(`Tab ${tabId} not found`);
            return;
        }

        const contentContainer = document.getElementById('tab-content-container');
        if (!contentContainer) {
            console.error('Tab content container not found');
            return;
        }

        try {
            // Show loading state
            contentContainer.innerHTML = '<div style="text-align: center; padding: 50px;"><div class="loading"></div><p>Loading...</p></div>';
            
            const response = await fetch(tab.file);
            
            if (!response.ok) {
                throw new Error(`Failed to load ${tab.file}: ${response.status}`);
            }
            
            const html = await response.text();
            contentContainer.innerHTML = html;

            // Initialize tab-specific modules
            this.initializeTabModules(tabId);
            
        } catch (error) {
            console.error('Error loading tab:', error);
            contentContainer.innerHTML = `
                <div style="text-align: center; padding: 50px;">
                    <h3 style="color: #e53e3e;">Error Loading Tab</h3>
                    <p>Failed to load ${tab.name}. Please check the console for details.</p>
                    <button class="btn" onclick="tabManager.loadTab('${tabId}')">Try Again</button>
                </div>
            `;
        }
    }

    initializeTabModules(tabId) {
        // Initialize modules based on the loaded tab
        try {
            switch (tabId) {
                case 'phonology':
                    if (window.PhonologyModule) window.PhonologyModule.init();
                    break;
                case 'grammar':
                    if (window.GrammarModule) window.GrammarModule.init();
                    break;
                case 'morphology':
                    if (window.MorphologyModule) window.MorphologyModule.init();
                    break;
                case 'generator':
                    if (window.GeneratorModule) window.GeneratorModule.init();
                    break;
                case 'vocabulary':
                    if (window.VocabularyModule) window.VocabularyModule.init();
                    if (window.vocabularyGlobalFunctions) window.vocabularyGlobalFunctions.initVocabularyPage();
                    break;
                case 'corpus':
                    if (window.CorpusModule) window.CorpusModule.init();
                    break;
                case 'cultural':
                    if (window.CulturalModule) window.CulturalModule.init();
                    break;
                case 'ai-assistant':
                    if (window.AIAssistantModule) window.AIAssistantModule.init();
                    break;
                case 'overview':
                    if (window.OverviewModule) window.OverviewModule.init();
                    break;
                case 'export':
                    if (window.ExportModule) window.ExportModule.init();
                    break;
                case 'home':
                    if (window.ActivityModule) window.ActivityModule.displayRecentActivity();
                    break;
            }
        } catch (error) {
            console.warn(`Failed to initialize module for ${tabId}:`, error);
        }
    }
}

// Global function for switching tabs (used by onclick handlers)
function switchTab(tabId) {
    if (window.tabManager) {
        window.tabManager.switchTab(tabId);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.tabManager = new TabManager();
});