import React from 'react'
import { Button } from '../ui/button';
import { Save } from 'lucide-react';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';

function NotificationsTab({ notifications, onToggle }) {
  return (
    <div className="space-y-6">
      <div className="border border-border rounded-lg bg-card p-6">
        <h3 className="text-lg font-semibold mb-4">Email Notifications</h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="font-medium text-sm">Task Assignments</p>
              <p className="text-xs text-muted-foreground">Receive emails when you're assigned to a task</p>
            </div>
            <Switch
              checked={notifications.emailAssignments}
              onCheckedChange={() => onToggle('emailAssignments')}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="font-medium text-sm">Mentions</p>
              <p className="text-xs text-muted-foreground">Get notified when someone mentions you</p>
            </div>
            <Switch
              checked={notifications.emailMentions}
              onCheckedChange={() => onToggle('emailMentions')}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="font-medium text-sm">Due Date Reminders</p>
              <p className="text-xs text-muted-foreground">Receive reminders for upcoming deadlines</p>
            </div>
            <Switch
              checked={notifications.emailDueDates}
              onCheckedChange={() => onToggle('emailDueDates')}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="font-medium text-sm">Project Updates</p>
              <p className="text-xs text-muted-foreground">Stay informed about project changes</p>
            </div>
            <Switch
              checked={notifications.projectUpdates}
              onCheckedChange={() => onToggle('projectUpdates')}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="font-medium text-sm">Weekly Digest</p>
              <p className="text-xs text-muted-foreground">Receive a weekly summary of activity</p>
            </div>
            <Switch
              checked={notifications.weeklyDigest}
              onCheckedChange={() => onToggle('weeklyDigest')}
            />
          </div>
        </div>
      </div>

      <div className="border border-border rounded-lg bg-card p-6">
        <h3 className="text-lg font-semibold mb-4">Push Notifications</h3>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="font-medium text-sm">Enable Push Notifications</p>
            <p className="text-xs text-muted-foreground">Receive real-time notifications in browser</p>
          </div>
          <Switch
            checked={notifications.pushNotifications}
            onCheckedChange={() => onToggle('pushNotifications')}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button>
          <Save className="w-4 h-4 mr-2" />
          Save Preferences
        </Button>
      </div>
    </div>
  );
}

export default NotificationsTab