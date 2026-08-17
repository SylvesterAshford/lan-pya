"use client";

const DATABASE = "lan-pya-private-drafts";
const STORE = "mission-drafts";
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export type MissionDraft = {
  repositoryUrl: string;
  deploymentUrl: string;
  reflection: string;
  screenshotUrl: string;
  /** Deliverable ids the learner has ticked in the Build step. Kept in the same
   *  record so it inherits the private, on-device storage and 30-day expiry that
   *  the rest of the draft already has. Optional: records written before the
   *  mission runner existed will not have it. */
  checklist?: string[];
  savedAt: number;
};

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function key(userId: string, missionKey: string) {
  return `${userId}:${missionKey}`;
}

export async function loadDraft(userId: string, missionKey: string): Promise<MissionDraft | null> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE, "readwrite");
    const request = transaction.objectStore(STORE).get(key(userId, missionKey));
    request.onsuccess = () => {
      const draft = request.result as MissionDraft | undefined;
      if (!draft || Date.now() - draft.savedAt > MAX_AGE_MS) {
        transaction.objectStore(STORE).delete(key(userId, missionKey));
        resolve(null);
      } else resolve(draft);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function saveDraft(userId: string, missionKey: string, draft: Omit<MissionDraft, "savedAt">) {
  const database = await openDatabase();
  return new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE, "readwrite");
    transaction.objectStore(STORE).put({ ...draft, savedAt: Date.now() }, key(userId, missionKey));
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function clearDraft(userId: string, missionKey: string) {
  const database = await openDatabase();
  return new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE, "readwrite");
    transaction.objectStore(STORE).delete(key(userId, missionKey));
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}
