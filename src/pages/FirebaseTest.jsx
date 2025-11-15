import { useEffect, useState } from 'react';
import { auth } from '../firebase';

export default function FirebaseTest() {
  const [status, setStatus] = useState('Checking Firebase...');
  const [config, setConfig] = useState(null);

  useEffect(() => {
    try {
      // Check if Firebase is initialized
      if (auth) {
        setStatus('✅ Firebase initialized successfully!');
        setConfig({
          apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing',
          authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? '✅ Set' : '❌ Missing',
          projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing',
        });
      } else {
        setStatus('❌ Firebase not initialized');
      }
    } catch (error) {
      setStatus('❌ Error: ' + error.message);
    }
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Firebase Configuration Test</h1>
      
      <div className="bg-white/5 p-6 rounded-lg space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Status:</h2>
          <p className="text-lg">{status}</p>
        </div>

        {config && (
          <div>
            <h2 className="text-xl font-semibold mb-2 mt-6">Environment Variables:</h2>
            <ul className="space-y-2">
              <li>API Key: {config.apiKey}</li>
              <li>Auth Domain: {config.authDomain}</li>
              <li>Project ID: {config.projectId}</li>
            </ul>
          </div>
        )}

        <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded">
          <h3 className="font-semibold mb-2">Next Steps:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Go to Firebase Console: console.firebase.google.com</li>
            <li>Select project: upianalyis</li>
            <li>Go to Authentication → Sign-in method</li>
            <li>Enable Email/Password and Google providers</li>
            <li>For Google: Add authorized domains</li>
          </ol>
        </div>

        <a 
          href="/login"
          className="inline-block mt-4 px-6 py-2 bg-white text-black rounded-lg hover:bg-white/90 transition-colors"
        >
          Back to Login
        </a>
      </div>
    </div>
  );
}
