import React, { useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// Simple email regex for validation
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export default function InviteTeamPerson() {
  const [emails, setEmails] = useState([]);
  const [input, setInput] = useState('');

  const handleInputChange = (e) => {
    const value = e.target.value;

    // If a space is added, try to extract and validate emails
    if (value.endsWith(' ')) {
      const potentialEmail = value.trim();
      if (potentialEmail && isValidEmail(potentialEmail) && !emails.includes(potentialEmail)) {
        setEmails([...emails, potentialEmail]);
      }
      setInput('');
    } else {
      setInput(value);
    }
  };

  const removeEmail = (emailToRemove) => {
    setEmails(emails.filter(email => email !== emailToRemove));
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side: Message */}
      <div className="md:w-5/12 bg-muted flex items-center justify-center p-8">
        <div className="max-w-md text-center md:text-left">
          <h2 className="text-3xl font-bold mb-4">Invite your team</h2>
          <p className="text-muted-foreground text-lg">
            (Optional) Add teammate emails you'd like to invite now.  
            Just type or paste them, separated by spaces.
          </p>
        </div>
      </div>

      {/* Right side: Email textarea */}
      <div className="md:w-7/12 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          <div>
            <Label htmlFor="email-textarea" className="mb-2 block">
              Team Emails <span className="text-sm text-muted-foreground">(optional)</span>
            </Label>

            {/* Email tags */}
            <div className="flex flex-wrap gap-2 mb-2">
              {emails.map((email) => (
                <span
                  key={email}
                  className="flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded-full text-sm"
                >
                  {email}
                  <button
                    type="button"
                    onClick={() => removeEmail(email)}
                    className="ml-1 text-xs hover:text-muted"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <Textarea
              id="email-textarea"
              placeholder="Type or paste emails separated by spaces"
              value={input}
              onChange={handleInputChange}
              className="h-28 resize-none"
            />
          </div>

          <Button className="w-full">
            Complete Onboarding
          </Button>
        </div>
      </div>
    </div>
  );
}
