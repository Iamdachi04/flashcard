// storageService.ts - Local storage management service
// Note: This is for reference only - in React artifacts, use useState instead

export class StorageService {
    private static readonly CURRENT_DAY_KEY = 'currentDay';
    private static readonly PRACTICE_SETTINGS_KEY = 'practiceSettings';
    private static readonly USER_PREFERENCES_KEY = 'userPreferences';
  
    static getCurrentDay(): number {
      try {
        const storedDay = localStorage.getItem(this.CURRENT_DAY_KEY);
        return storedDay ? parseInt(storedDay, 10) : 0;
      } catch (error) {
        console.error('Error reading currentDay from localStorage:', error);
        return 0;
      }
    }
  
    static setCurrentDay(day: number): void {
      try {
        localStorage.setItem(this.CURRENT_DAY_KEY, day.toString());
      } catch (error) {
        console.error('Error saving currentDay to localStorage:', error);
      }
    }
  
    static incrementDay(): number {
      const currentDay = this.getCurrentDay();
      const newDay = currentDay + 1;
      this.setCurrentDay(newDay);
      return newDay;
    }
  
    static getPracticeSettings(): any {
      try {
        const settings = localStorage.getItem(this.PRACTICE_SETTINGS_KEY);
        return settings ? JSON.parse(settings) : {};
      } catch (error) {
        console.error('Error reading practice settings from localStorage:', error);
        return {};
      }
    }
  
    static setPracticeSettings(settings: any): void {
      try {
        localStorage.setItem(this.PRACTICE_SETTINGS_KEY, JSON.stringify(settings));
      } catch (error) {
        console.error('Error saving practice settings to localStorage:', error);
      }
    }
  
    static getUserPreferences(): any {
      try {
        const preferences = localStorage.getItem(this.USER_PREFERENCES_KEY);
        return preferences ? JSON.parse(preferences) : {};
      } catch (error) {
        console.error('Error reading user preferences from localStorage:', error);
        return {};
      }
    }
  
    static setUserPreferences(preferences: any): void {
      try {
        localStorage.setItem(this.USER_PREFERENCES_KEY, JSON.stringify(preferences));
      } catch (error) {
        console.error('Error saving user preferences to localStorage:', error);
      }
    }
  
    static clearAllData(): void {
      try {
        localStorage.removeItem(this.CURRENT_DAY_KEY);
        localStorage.removeItem(this.PRACTICE_SETTINGS_KEY);
        localStorage.removeItem(this.USER_PREFERENCES_KEY);
      } catch (error) {
        console.error('Error clearing localStorage:', error);
      }
    }
  }