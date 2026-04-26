import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Save, User } from 'lucide-react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import profileService from '@/services/profile';
import { email } from 'zod';
import workspaceService from '@/services/workspace';

function AccountTab({ profile }) {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    username: '',
    phone: '',
    bio: '',
    id: '',
    guid: '',
  });

  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState('');
  const { getCurrentWorkspaceId, currentUser } = useAuth();
  const workspaceGuid = getCurrentWorkspaceId();

  const [loading, setLoading] = useState(false);
  const firstName = formData.displayName.split(' ')[0] || '';
  const lastName = formData.displayName.split(' ').slice(1).join(' ') || '';

  // When profile prop changes, populate the form
  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        email: profile.email || '',
        username: profile.username || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        id: profile.id || '',
        guid: profile.guid || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const response = await workspaceService.getWorkspaces();
        const data = response.data.data || [];

        setWorkspaces(data);

        const saved = localStorage.getItem('workspaceGuid');

        const active =
          saved ||
          data[0]?.workspaceGuid ||
          '';

        setCurrentWorkspace(active);

      } catch (error) {
        console.error('Error fetching workspaces:', error);
      }
    };

    fetchWorkspaces();
  }, []);

  // Generic change handler for all inputs
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleNameChange = (field, value) => {
    const updatedFirst =
      field === 'firstName' ? value : firstName;

    const updatedLast =
      field === 'lastName' ? value : lastName;

    const newDisplayName = `${updatedFirst} ${updatedLast}`.trim();

    setFormData(prev => ({
      ...prev,
      displayName: newDisplayName,
    }));
  };
  const handleWorkspaceChange = (workspaceGuid) => {
  setCurrentWorkspace(workspaceGuid);
  localStorage.setItem('workspaceGuid', workspaceGuid);
};

  // For Select components (since they don’t emit regular events)
  const handleSelectChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Save handler
  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await profileService.updateUserProfile(workspaceGuid, formData);
      console.log('Updated successfully:', response.data);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border border-border rounded-lg bg-card p-6">
        <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
        <div className="space-y-6">
          {/* Profile Picture */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center">
                <User className="w-10 h-10 text-muted-foreground" />
              </div>
            </div>
            <Button variant="outline">Upload image</Button>
          </div>

          <Separator />

          {/* Name */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => handleNameChange('firstName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" value={lastName} onChange={(e) => handleNameChange('lastName', e.target.value)} />
            </div>
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" value={formData.displayName} onChange={handleChange} />
            <p className="text-sm text-muted-foreground">
              This is your public display name. It can be your real name or a pseudonym.
            </p>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={formData.email} onChange={handleChange} />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" type="tel" value={formData.phone} onChange={handleChange} />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={handleChange}
              className="min-h-[100px] resize-none"
            />
            <p className="text-sm text-muted-foreground">
              You can @mention other users and organizations to link to them.
            </p>
          </div>

          <Separator />
          <div className="space-y-2">
            <Label>Workspace</Label>

            <Select
              value={currentWorkspace}
              onValueChange={handleWorkspaceChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select workspace" />
              </SelectTrigger>

              <SelectContent>
                {workspaces.map((ws) => (
                  <SelectItem
                    key={ws.workspaceGuid}
                    value={ws.workspaceGuid}
                  >
                    {ws.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select
                value={formData.language}
                onValueChange={(value) => handleSelectChange('language', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={formData.timezone}
                onValueChange={(value) => handleSelectChange('timezone', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pst">Pacific Time (PT)</SelectItem>
                  <SelectItem value="mst">Mountain Time (MT)</SelectItem>
                  <SelectItem value="cst">Central Time (CT)</SelectItem>
                  <SelectItem value="est">Eastern Time (ET)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div> */}

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>

      
    </div>
  );
}

export default AccountTab;
