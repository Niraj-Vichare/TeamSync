import { Badge, Calendar, CreditCard, Download, Trash2 } from 'lucide-react';
import React, { useState } from 'react'
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

// Billing Tab Component
function BillingTab({ showPlans, setShowPlans }) {
  const [billingCycle, setBillingCycle] = useState('monthly');

  if (showPlans) {
    return <PricingPlans billingCycle={billingCycle} setBillingCycle={setBillingCycle} onBack={() => setShowPlans(false)} />;
  }

  return (
    <div className="space-y-6">
      <div className="border border-border rounded-lg bg-card p-6">
        <h3 className="text-lg font-semibold mb-4">Current Plan</h3>
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-2xl font-bold">Pro Plan</h3>
              <Badge variant="secondary">Active</Badge>
            </div>
            <p className="text-muted-foreground mb-4">Perfect for growing teams</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold">$29</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </div>
          <Button variant="outline">Change Plan</Button>
        </div>

        <Separator className="my-6" />

        <div className="space-y-4">
          <h4 className="font-semibold text-sm">Plan Features</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm">Unlimited Projects</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm">Up to 50 Team Members</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm">100GB Storage</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm">Priority Support</span>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Usage</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Projects</span>
              <span className="font-medium">12 / Unlimited</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: '20%' }}></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Team Members</span>
              <span className="font-medium">23 / 50</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: '46%' }}></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Storage</span>
              <span className="font-medium">45GB / 100GB</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="border border-border rounded-lg bg-card p-6">
        <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center text-white text-xs font-bold">
                VISA
              </div>
              <div>
                <p className="font-medium">•••• •••• •••• 4242</p>
                <p className="text-sm text-muted-foreground">Expires 12/25</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Edit</Button>
              <Button variant="outline" size="sm">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <Button variant="outline" className="w-full">
            <CreditCard className="w-4 h-4 mr-2" />
            Add Payment Method
          </Button>
        </div>
      </div>

      <div className="border border-border rounded-lg bg-card p-6">
        <h3 className="text-lg font-semibold mb-4">Billing History</h3>
        <div className="space-y-3">
          {[
            { date: 'Sep 1, 2025', amount: '$29.00', status: 'Paid' },
            { date: 'Aug 1, 2025', amount: '$29.00', status: 'Paid' },
            { date: 'Jul 1, 2025', amount: '$29.00', status: 'Paid' }
          ].map((invoice, i) => (
            <div key={i} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-secondary/50 transition-colors">
              <div className="flex items-center gap-4">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">{invoice.date}</p>
                  <p className="text-xs text-muted-foreground">Invoice #{1000 + i}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-semibold">{invoice.amount}</span>
                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">{invoice.status}</Badge>
                <Button variant="ghost" size="sm">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BillingTab