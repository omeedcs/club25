'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings, Save, Mail, Globe, Key, Database, RefreshCw } from 'lucide-react'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    siteName: 'Club25',
    defaultSeatLimit: 25,
    autoApproveRSVPs: true,
    sendConfirmationEmails: true,
    sendReminderEmails: true,
    reminderHoursBefore: 24,
    allowWaitlist: true,
    maxWaitlistSize: 10,
    inviteCodeDefaultUses: 3,
    inviteCodeDefaultExpiry: 0,
    requireInviteCode: true,
  })

  const [saved, setSaved] = useState(false)

  function handleSave() {
    // In a real app, save to database or config file
    localStorage.setItem('club25_settings', JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  useEffect(() => {
    // Load settings from localStorage
    const stored = localStorage.getItem('club25_settings')
    if (stored) {
      setSettings(JSON.parse(stored))
    }
  }, [])

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-serif mb-2">Settings</h1>
          <p className="text-club-cream/60">Configure Club25 system preferences</p>
        </div>
        <button
          onClick={handleSave}
          className={`px-6 py-3 rounded font-semibold transition-all flex items-center gap-2 ${
            saved 
              ? 'bg-club-gold text-club-blue' 
              : 'border border-club-cream/30 hover:bg-club-cream/5'
          }`}
        >
          <Save className="w-5 h-5" />
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-6 max-w-3xl">
        {/* General */}
        <div className="bg-club-charcoal/30 border border-club-cream/10 rounded p-6">
          <div className="flex items-center gap-2 mb-6">
            <Globe className="w-5 h-5 text-club-gold" />
            <h2 className="text-xl font-serif">General</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2 text-club-cream/70">Site Name</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full bg-club-charcoal/50 border border-club-cream/20 px-4 py-2 rounded focus:border-club-gold outline-none"
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-club-cream/70">Default Seat Limit</label>
              <input
                type="number"
                value={settings.defaultSeatLimit}
                onChange={(e) => setSettings({ ...settings, defaultSeatLimit: parseInt(e.target.value) })}
                className="w-full bg-club-charcoal/50 border border-club-cream/20 px-4 py-2 rounded focus:border-club-gold outline-none"
                min="1"
              />
              <p className="text-xs text-club-cream/50 mt-1">Default number of seats for new drops</p>
            </div>
          </div>
        </div>

        {/* RSVPs */}
        <div className="bg-club-charcoal/30 border border-club-cream/10 rounded p-6">
          <div className="flex items-center gap-2 mb-6">
            <RefreshCw className="w-5 h-5 text-club-gold" />
            <h2 className="text-xl font-serif">RSVPs</h2>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <div>
                <div className="font-medium">Auto-Approve RSVPs</div>
                <div className="text-xs text-club-cream/50">Automatically confirm RSVPs if seats available</div>
              </div>
              <input
                type="checkbox"
                checked={settings.autoApproveRSVPs}
                onChange={(e) => setSettings({ ...settings, autoApproveRSVPs: e.target.checked })}
                className="w-5 h-5"
              />
            </label>

            <label className="flex items-center justify-between">
              <div>
                <div className="font-medium">Allow Waitlist</div>
                <div className="text-xs text-club-cream/50">Enable waitlist when drops are full</div>
              </div>
              <input
                type="checkbox"
                checked={settings.allowWaitlist}
                onChange={(e) => setSettings({ ...settings, allowWaitlist: e.target.checked })}
                className="w-5 h-5"
              />
            </label>

            {settings.allowWaitlist && (
              <div>
                <label className="block text-sm mb-2 text-club-cream/70">Max Waitlist Size</label>
                <input
                  type="number"
                  value={settings.maxWaitlistSize}
                  onChange={(e) => setSettings({ ...settings, maxWaitlistSize: parseInt(e.target.value) })}
                  className="w-full bg-club-charcoal/50 border border-club-cream/20 px-4 py-2 rounded focus:border-club-gold outline-none"
                  min="0"
                />
              </div>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="bg-club-charcoal/30 border border-club-cream/10 rounded p-6">
          <div className="flex items-center gap-2 mb-6">
            <Mail className="w-5 h-5 text-club-gold" />
            <h2 className="text-xl font-serif">Email Notifications</h2>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <div>
                <div className="font-medium">Send Confirmation Emails</div>
                <div className="text-xs text-club-cream/50">Email guests after RSVP confirmation</div>
              </div>
              <input
                type="checkbox"
                checked={settings.sendConfirmationEmails}
                onChange={(e) => setSettings({ ...settings, sendConfirmationEmails: e.target.checked })}
                className="w-5 h-5"
              />
            </label>

            <label className="flex items-center justify-between">
              <div>
                <div className="font-medium">Send Reminder Emails</div>
                <div className="text-xs text-club-cream/50">Remind guests before the event</div>
              </div>
              <input
                type="checkbox"
                checked={settings.sendReminderEmails}
                onChange={(e) => setSettings({ ...settings, sendReminderEmails: e.target.checked })}
                className="w-5 h-5"
              />
            </label>

            {settings.sendReminderEmails && (
              <div>
                <label className="block text-sm mb-2 text-club-cream/70">Reminder Hours Before Event</label>
                <input
                  type="number"
                  value={settings.reminderHoursBefore}
                  onChange={(e) => setSettings({ ...settings, reminderHoursBefore: parseInt(e.target.value) })}
                  className="w-full bg-club-charcoal/50 border border-club-cream/20 px-4 py-2 rounded focus:border-club-gold outline-none"
                  min="1"
                />
              </div>
            )}
          </div>
        </div>

        {/* Invite Codes */}
        <div className="bg-club-charcoal/30 border border-club-cream/10 rounded p-6">
          <div className="flex items-center gap-2 mb-6">
            <Key className="w-5 h-5 text-club-gold" />
            <h2 className="text-xl font-serif">Invite Codes</h2>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <div>
                <div className="font-medium">Require Invite Code</div>
                <div className="text-xs text-club-cream/50">Users must enter code to access site</div>
              </div>
              <input
                type="checkbox"
                checked={settings.requireInviteCode}
                onChange={(e) => setSettings({ ...settings, requireInviteCode: e.target.checked })}
                className="w-5 h-5"
              />
            </label>

            <div>
              <label className="block text-sm mb-2 text-club-cream/70">Default Max Uses</label>
              <input
                type="number"
                value={settings.inviteCodeDefaultUses}
                onChange={(e) => setSettings({ ...settings, inviteCodeDefaultUses: parseInt(e.target.value) })}
                className="w-full bg-club-charcoal/50 border border-club-cream/20 px-4 py-2 rounded focus:border-club-gold outline-none"
                min="1"
              />
              <p className="text-xs text-club-cream/50 mt-1">Default uses for new invite codes</p>
            </div>

            <div>
              <label className="block text-sm mb-2 text-club-cream/70">Default Expiry (days, 0 = never)</label>
              <input
                type="number"
                value={settings.inviteCodeDefaultExpiry}
                onChange={(e) => setSettings({ ...settings, inviteCodeDefaultExpiry: parseInt(e.target.value) })}
                className="w-full bg-club-charcoal/50 border border-club-cream/20 px-4 py-2 rounded focus:border-club-gold outline-none"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Database */}
        <div className="bg-club-charcoal/30 border border-club-cream/10 rounded p-6">
          <div className="flex items-center gap-2 mb-6">
            <Database className="w-5 h-5 text-club-gold" />
            <h2 className="text-xl font-serif">Database</h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-club-blue/10 rounded border border-club-cream/10">
              <div className="text-sm text-club-cream/70 mb-2">Database URL</div>
              <code className="text-xs text-club-cream/50 break-all">{process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not configured'}</code>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 px-4 py-2 border border-club-cream/30 hover:bg-club-cream/5 transition-colors rounded text-sm">
                Export All Data
              </button>
              <button className="flex-1 px-4 py-2 border border-red-400/30 text-red-400 hover:bg-red-400/10 transition-colors rounded text-sm">
                Clear Test Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
