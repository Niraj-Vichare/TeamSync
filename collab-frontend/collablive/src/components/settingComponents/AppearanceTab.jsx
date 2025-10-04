import React from 'react'
import { Button } from '../ui/button';

function AppearanceTab() {
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
              <button className="border-2 border-primary rounded-lg p-4 hover:bg-secondary/50 transition-colors">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-full h-20 bg-background border rounded"></div>
                  <span className="text-sm font-medium">Light</span>
                </div>
              </button>
              <button className="border-2 border-border rounded-lg p-4 hover:bg-secondary/50 transition-colors">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-full h-20 bg-gray-900 border rounded"></div>
                  <span className="text-sm font-medium">Dark</span>
                </div>
              </button>
              <button className="border-2 border-border rounded-lg p-4 hover:bg-secondary/50 transition-colors">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-full h-20 bg-gradient-to-br from-background to-gray-900 border rounded"></div>
                  <span className="text-sm font-medium">System</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button>Update preferences</Button>
      </div>
    </div>
  );
}

export default AppearanceTab