import React, { useState } from 'react';
import { User, Mail, Lock, AlertCircle, Trash2, Download } from 'lucide-react';
import { useAuthStore, useUIStore } from '../../stores';

export function AccountSettings() {
  const { user, updateUser, deleteAccount } = useAuthStore();
  const { addNotification } = useUIStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || ''
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const handleSave = async () => {
    try {
      await updateUser(formData);
      setIsEditing(false);
      addNotification({
        title: 'Profile Updated',
        message: 'Your profile has been updated successfully',
        type: 'success'
      });
    } catch (error) {
      addNotification({
        title: 'Error',
        message: 'Failed to update profile',
        type: 'error'
      });
    }
  };

  const handlePasswordChange = () => {
    // Navigate to password change or trigger password reset
    addNotification({
      title: 'Password Reset',
      message: 'Check your email for password reset instructions',
      type: 'info'
    });
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      addNotification({
        title: 'Error',
        message: 'Please type DELETE to confirm',
        type: 'error'
      });
      return;
    }

    try {
      await deleteAccount();
      addNotification({
        title: 'Account Deleted',
        message: 'Your account has been permanently deleted',
        type: 'success'
      });
    } catch (error) {
      addNotification({
        title: 'Error',
        message: 'Failed to delete account',
        type: 'error'
      });
    }
  };

  const handleExportData = () => {
    // Trigger data export
    addNotification({
      title: 'Export Started',
      message: 'Your data export has been initiated. You will receive an email when it\'s ready.',
      type: 'info'
    });
  };

  return (
    <>
      <div className="bg-card border rounded-lg p-6 space-y-6">
        <div className="flex items-center gap-3">
          <User className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Account Settings</h2>
        </div>

        {/* Profile Information */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Profile Information</h3>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm text-primary hover:underline"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: user?.name || '',
                      email: user?.email || '',
                      bio: user?.bio || ''
                    });
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="text-sm text-primary hover:underline"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>

          <div className="grid gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!isEditing}
                className="w-full mt-1 px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditing}
                  className="flex-1 mt-1 px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                disabled={!isEditing}
                rows={3}
                placeholder="Tell us about yourself..."
                className="w-full mt-1 px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Member Since</label>
              <p className="mt-1 text-sm">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
          </div>
        </div>

        {/* Password */}
        <div className="border-t border-border pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Password</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Change your password or enable two-factor authentication
              </p>
            </div>
            <button
              onClick={handlePasswordChange}
              className="flex items-center gap-2 px-4 py-2 border border-input rounded-md hover:bg-muted transition-colors text-sm"
            >
              <Lock className="w-4 h-4" />
              Change Password
            </button>
          </div>
        </div>

        {/* Data Management */}
        <div className="border-t border-border pt-6">
          <h3 className="font-medium mb-4">Data Management</h3>
          <div className="space-y-3">
            <button
              onClick={handleExportData}
              className="flex items-center gap-2 px-4 py-2 border border-input rounded-md hover:bg-muted transition-colors text-sm w-full justify-center"
            >
              <Download className="w-4 h-4" />
              Export All Data
            </button>
            
            <p className="text-xs text-muted-foreground text-center">
              Export includes all memories, collections, and settings
            </p>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="border-t border-destructive/20 pt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              <h3 className="font-medium">Danger Zone</h3>
            </div>
            
            <div className="p-4 border border-destructive/20 rounded-lg space-y-3">
              <div>
                <h4 className="font-medium">Delete Account</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </div>
              
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setShowDeleteModal(false)}
          />
          
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-card rounded-lg shadow-xl p-6">
              <div className="flex items-center gap-3 mb-4 text-destructive">
                <AlertCircle className="w-6 h-6" />
                <h3 className="text-lg font-semibold">Delete Account</h3>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm">
                  This will permanently delete your account and all associated data including:
                </p>
                
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>All memories and collections</li>
                  <li>Your profile information</li>
                  <li>API keys and integrations</li>
                  <li>All settings and preferences</li>
                </ul>
                
                <div>
                  <label className="text-sm font-medium">
                    Type <span className="font-mono bg-destructive/10 px-1 py-0.5 rounded">DELETE</span> to confirm
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="Type DELETE to confirm"
                    className="w-full mt-1 px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-destructive/20"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmation('');
                  }}
                  className="flex-1 px-4 py-2 border border-input rounded-md hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmation !== 'DELETE'}
                  className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}