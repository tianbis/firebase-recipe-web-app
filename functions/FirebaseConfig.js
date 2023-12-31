const functions = require('firebase-functions');
const admin = require('firebase-admin');

const FIREBASE_STORAGE_BUCKET = 'fir-recipes-b9125.appspot.com';
const FIREBASE_PROJECT_ID = 'fir-recipes-b9125';

const apiFirebaseOptions = {
  ...functions.config().firebase,
  credential: admin.credential.applicationDefault(),
  projectId: FIREBASE_PROJECT_ID,
};

admin.initializeApp(apiFirebaseOptions);

const firestore = admin.firestore();
const settings = { timestampsInSnapshots: true };

firestore.settings(settings);

const storageBucket = admin.storage().bucket(FIREBASE_STORAGE_BUCKET);
const auth = admin.auth();

module.exports = { functions, auth, firestore, storageBucket, admin };
