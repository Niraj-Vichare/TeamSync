import AccountTab from '@/components/settingComponents/AccountTab';
import AppearanceTab from '@/components/settingComponents/AppearanceTab';
import BillingTab from '@/components/settingComponents/BillingTab';
import NotificationsTab from '@/components/settingComponents/NotificationsTab';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/context/AuthContext';
import profileService from '@/services/profile';
import { AnimatePresence,motion } from 'framer-motion';
import { Bell, CreditCard, Palette, Shield, User } from 'lucide-react';
import React, { use, useEffect, useState } from 'react'

function Settings() {
  const [activeTab, setActiveTab] = useState('account');
  const [showPlans, setShowPlans] = useState(false);

  const [profileData,setProfileData] = useState(null);
  
  const [notifications, setNotifications] = useState({
    emailAssignments: true,
    emailMentions: true,
    emailDueDates: true,
    pushNotifications: false,
    weeklyDigest: true,
    projectUpdates: true
  });

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ];

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getProfile=async()=>{
    const response = await profileService.getUserProfile();
    if(response.data){
      const {data,message,statusCode,success} = response.data;
      console.log(response.data)
      setProfileData(data);
    }
  }

  useEffect(()=>{
    getProfile();
  },[])

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account settings and set e-mail preferences.</p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Tabs */}
          <div className="w-80 flex-shrink-0">
            <div className="border border-border rounded-lg bg-card p-1">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  if (!false && ['billing', 'notifications'].includes(tab.id)) return null;
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-left transition-colors ${activeTab === tab.id
                          ? 'bg-secondary text-foreground'
                          : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                        }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'account' && <AccountTab profile={profileData}/>}
                {activeTab === 'billing' && <BillingTab showPlans={showPlans} setShowPlans={setShowPlans} />}
                {activeTab === 'appearance' && <AppearanceTab />}
                {activeTab === 'notifications' && (
                  <NotificationsTab
                    notifications={notifications}
                    onToggle={handleNotificationChange}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );

}

export default Settings