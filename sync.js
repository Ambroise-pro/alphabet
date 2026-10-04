import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getFirestore, doc, setDoc, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyDRaLuBrbr2ibyhJqz7zY1K07j9gmNBPu0',
  authDomain: 'alphabet-984a7.firebaseapp.com',
  projectId: 'alphabet-984a7',
  storageBucket: 'alphabet-984a7.firebasestorage.app',
  messagingSenderId: '959536848728',
  appId: '1:959536848728:web:c9d6a1cfd8feec43fdcf2d'
};

const db = getFirestore(initializeApp(firebaseConfig));
const ref = doc(db, 'progress', 'main');

async function save(s) {
  try {
    await setDoc(ref, { validated: s.validated, updatedAt: s.updatedAt });
  } catch (e) {
    console.warn('Firebase: no se pudo guardar', e);
  }
}

window.cloudSync = { save };

onSnapshot(ref, snap => {
  const local = window.getLocalState();
  if (!snap.exists()) {
    if (local.validated.length) save(local);
    return;
  }
  const remote = snap.data();
  const remoteTime = remote.updatedAt || 0;
  const localTime = local.updatedAt || 0;
  if (remoteTime > localTime) window.applyRemoteState(remote);
  else if (remoteTime < localTime) save(local);
}, e => console.warn('Firebase: no se pudo leer', e));
