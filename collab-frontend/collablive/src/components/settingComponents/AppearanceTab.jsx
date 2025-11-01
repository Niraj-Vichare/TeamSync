import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { useTheme } from '@/context/ThemeContext';
import profileService from '@/services/profile';

function AppearanceTab() {
  const { theme, setTheme } = useTheme(); // from your ThemeContext
  const [selectedTheme, setSelectedTheme] = useState(theme || 'system');

  // Keep local state in sync with context changes
  useEffect(() => {
    setSelectedTheme(theme);
  }, [theme]);

  const handleSelect = (value) => {
    setSelectedTheme(value);
    setTheme(value); // updates context (and your app’s theme)
    localStorage.setItem('user-theme', value); // optional persistence
  };

  const handleUserPerference=async()=>{
    const response = await profileService.savePerference(selectedTheme);
    return response.data;
  }

  const isSelected = (value) =>
    selectedTheme === value
      ? 'border-primary'
      : 'border-border hover:border-primary/60';

  return (
    <div className="space-y-6">
      <div className="border border-border rounded-lg bg-card p-6">
        <h3 className="text-lg font-semibold mb-4">Theme</h3>
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground mb-3">
              Select the theme for the dashboard.
            </p>

            <div className="grid grid-cols-3 gap-4">
              {/* Light */}
              <button
                onClick={() => handleSelect('light')}
                className={`border-2 rounded-lg p-4 transition-colors ${isSelected(
                  'light'
                )}`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="w-full h-20 bg-white border rounded" />
                  <span className="text-sm font-medium">Light</span>
                </div>
              </button>

              {/* Dark */}
              <button
                onClick={() => handleSelect('dark')}
                className={`border-2 rounded-lg p-4 transition-colors ${isSelected(
                  'dark'
                )}`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="w-full h-20 bg-black border rounded" />
                  <span className="text-sm font-medium">Dark</span>
                </div>
              </button>

              {/* System */}
              <button
                onClick={() => handleSelect('system')}
                className={`border-2 rounded-lg p-4 transition-colors ${isSelected(
                  'system'
                )}`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="w-full h-20 bg-gradient-to-br from-background to-gray-900 border rounded" />
                  <span className="text-sm font-medium">System</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => handleUserPerference()}>
          Update preferences
        </Button>
      </div>
    </div>
  );
}

export default AppearanceTab;
