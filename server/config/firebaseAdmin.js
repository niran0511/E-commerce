const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

// Initialize Firebase Admin with project ID only (sufficient for ID token verification)
if (!getApps().length) {
  initializeApp({
    projectId: 'shopsmartai-66d49',
  });
}

const auth = getAuth();

module.exports = { auth };
