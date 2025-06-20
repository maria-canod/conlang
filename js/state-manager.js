// State Management System
class StateManager {
    constructor() {
        this.state = {
            currentLanguage: null,
            allWords: [],
            filteredWords: [],
            recentActivity: [],
            currentGeneratedWord: '',
            editingWordIndex: -1
        };
        this.listeners = {};
    }

    setState(key, value) {
        this.state[key] = value;
        this.notifyListeners(key, value);
        console.log(`State updated: ${key}`, value);
    }

    getState(key) {
        return this.state[key];
    }

    subscribe(key, callback) {
        if (!this.listeners[key]) this.listeners[key] = [];
        this.listeners[key].push(callback);
    }

    notifyListeners(key, value) {
        if (this.listeners[key]) {
            this.listeners[key].forEach(callback => callback(value));
        }
    }

    // Helper methods for common operations
    addWord(word) {
        const allWords = [...this.state.allWords, word];
        this.setState('allWords', allWords);
        this.setState('filteredWords', [...allWords]);
    }

    removeWord(index) {
        const allWords = this.state.allWords.filter((_, i) => i !== index);
        this.setState('allWords', allWords);
        this.setState('filteredWords', [...allWords]);
    }

    updateWord(index, updatedWord) {
        const allWords = [...this.state.allWords];
        allWords[index] = updatedWord;
        this.setState('allWords', allWords);
        this.setState('filteredWords', [...allWords]);
    }

    addActivity(action, type) {
        const activity = {
            action: action,
            type: type,
            time: new Date().toLocaleString()
        };
        
        const recentActivity = [activity, ...this.state.recentActivity];
        if (recentActivity.length > 10) {
            recentActivity.pop();
        }
        
        this.setState('recentActivity', recentActivity);
    }

    // Language data helpers
    updateLanguageData() {
        if (!window.generator) return;
        
        const allWords = [
            ...(window.generator.language.vocabulary || []),
            ...(window.generator.language.derivedWords || []),
            ...(window.generator.language.customWords || [])
        ];
        
        this.setState('allWords', allWords);
        this.setState('filteredWords', [...allWords]);
        this.setState('currentLanguage', window.generator.language);
    }

    // Statistics helpers
    getWordStats() {
        const core = (window.generator.language.vocabulary || []).length;
        const derived = (window.generator.language.derivedWords || []).length;
        const custom = (window.generator.language.customWords || []).length;
        const total = core + derived + custom;

        return { total, core, derived, custom };
    }
}

// Create global state manager
window.appState = new StateManager();

// Activity Module (simple implementation)
window.ActivityModule = {
    addActivity(action, type) {
        window.appState.addActivity(action, type);
        this.updateRecentActivityDisplay();
    },

    updateRecentActivityDisplay() {
        const activityDiv = document.getElementById('recent-activity');
        if (!activityDiv) return;

        const recentActivity = window.appState.getState('recentActivity');
        
        if (recentActivity.length === 0) {
            activityDiv.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">No recent activity. Start creating your language!</p>';
            return;
        }
        
        activityDiv.innerHTML = recentActivity.map(activity => `
            <div style="padding: 10px; border-left: 4px solid #4CAF50; margin-bottom: 10px; background: white; border-radius: 5px;">
                <strong>${activity.action}</strong>
                <div style="color: #666; font-size: 0.9em;">${activity.time}</div>
            </div>
        `).join('');
    }
};