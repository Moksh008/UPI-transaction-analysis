import { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

const Settings = () => {
  const [user] = useAuthState(auth);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    // Validation
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (currentPassword === newPassword) {
      setMessage({ type: 'error', text: 'New password must be different from current password' });
      return;
    }

    setLoading(true);

    try {
      // Re-authenticate user before changing password
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);

      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Password change error:', error);
      
      if (error.code === 'auth/wrong-password') {
        setMessage({ type: 'error', text: 'Current password is incorrect' });
      } else if (error.code === 'auth/weak-password') {
        setMessage({ type: 'error', text: 'New password is too weak' });
      } else if (error.code === 'auth/requires-recent-login') {
        setMessage({ type: 'error', text: 'Please log out and log in again before changing password' });
      } else {
        setMessage({ type: 'error', text: 'Failed to update password. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  // Check if user signed in with Google (no password to change)
  const isGoogleUser = user?.providerData?.some(provider => provider.providerId === 'google.com');

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      {/* Account Information */}
      <div className="rounded-lg p-6 border border-gray-200" style={{ backgroundColor: '#f7f6f2' }}>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-600">Name</label>
            <p className="text-gray-900">{user?.displayName || 'Not set'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <p className="text-gray-900">{user?.email}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Account Type</label>
            <p className="text-gray-900">{isGoogleUser ? 'Google Account' : 'Email/Password'}</p>
          </div>
        </div>
      </div>

      {/* Change Password Section - Only show for email/password users */}
      {!isGoogleUser && (
        <div className="rounded-lg p-6 border border-gray-200" style={{ backgroundColor: '#f7f6f2' }}>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Change Password</h2>
          
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ backgroundColor: '#f7f6f2' }}
                placeholder="Enter current password"
                required
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ backgroundColor: '#f7f6f2' }}
                placeholder="Enter new password (min 6 characters)"
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ backgroundColor: '#f7f6f2' }}
                placeholder="Confirm new password"
                required
              />
            </div>

            {message.text && (
              <div
                className={`p-4 rounded-lg ${
                  message.type === 'success'
                    ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                    : 'bg-red-500/10 border border-red-500/20 text-red-400'
                }`}
              >
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              {loading ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>
      )}

      {/* Info for Google users */}
      {isGoogleUser && (
        <div className="rounded-lg p-6 border border-gray-200" style={{ backgroundColor: '#f7f6f2' }}>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Password Management</h2>
          <p className="text-gray-600">
            You signed in with Google. To change your password, please visit your Google Account settings.
          </p>
        </div>
      )}
    </div>
  );
};

export default Settings;
