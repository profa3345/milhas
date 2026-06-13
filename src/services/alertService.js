// src/services/alertService.js
// Firestore CRUD para alertas, fare_snapshots e alert_hits
// Espelha o schema.sql mas no Firestore (coleções em vez de tabelas)

import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  writeBatch,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";

// ─── Coleções ────────────────────────────────────────────────────────────────
const ALERTS_COL       = "alerts";
const SNAPSHOTS_COL    = "fare_snapshots";
const HITS_COL         = "alert_hits";

// ─── ALERTAS ─────────────────────────────────────────────────────────────────

/** Lista todos os alertas de um usuário (ou todos, se não passar userId) */
export async function fetchAlerts(userId = null) {
  let q;
  if (userId) {
    q = query(
      collection(db, ALERTS_COL),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
  } else {
    q = query(collection(db, ALERTS_COL), orderBy("createdAt", "desc"));
  }
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Cria um novo alerta */
export async function createAlert({
  origin,
  destination,
  maxMiles,
  cabin,
  partnerOnly,
  contact,
  userId = null,
}) {
  const ref = await addDoc(collection(db, ALERTS_COL), {
    origin,
    destination,
    maxMiles,
    cabin,
    partnerOnly,
    contact,
    userId,
    active: true,
    lastChecked: null,
    lastFound: null,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/** Atualiza campos de um alerta */
export async function updateAlert(id, fields) {
  await updateDoc(doc(db, ALERTS_COL, id), fields);
}

/** Ativa / pausa */
export async function toggleAlert(id, currentActive) {
  await updateDoc(doc(db, ALERTS_COL, id), { active: !currentActive });
}

/** Remove alerta e seus hits */
export async function deleteAlert(id) {
  const batch = writeBatch(db);
  // deleta hits do alerta
  const hitsSnap = await getDocs(
    query(collection(db, HITS_COL), where("alertId", "==", id))
  );
  hitsSnap.docs.forEach((d) => batch.delete(d.ref));
  // deleta o alerta
  batch.delete(doc(db, ALERTS_COL, id));
  await batch.commit();
}

// ─── FARE SNAPSHOTS ──────────────────────────────────────────────────────────

/** Grava uma snapshot de tarifa (chamada pelo robô/cron) */
export async function saveFareSnapshot({
  origin,
  destination,
  airline,
  airlineCode,
  miles,
  taxes,
  award,
  baggage,
  partner,
}) {
  const ref = await addDoc(collection(db, SNAPSHOTS_COL), {
    origin,
    destination,
    airline,
    airlineCode,
    miles,
    taxes,
    award,
    baggage,
    partner,
    foundAt: serverTimestamp(),
  });
  return ref.id;
}

/** Busca snapshots recentes para uma rota */
export async function fetchRecentSnapshots(origin, destination, limitMinutes = 60) {
  const since = Timestamp.fromDate(
    new Date(Date.now() - limitMinutes * 60 * 1000)
  );
  const q = query(
    collection(db, SNAPSHOTS_COL),
    where("origin", "==", origin),
    where("destination", "==", destination),
    where("foundAt", ">=", since),
    orderBy("foundAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ─── ALERT HITS ───────────────────────────────────────────────────────────────

/** Verifica se um par (alertId, snapshotId) já foi notificado */
export async function hitExists(alertId, snapshotId) {
  const q = query(
    collection(db, HITS_COL),
    where("alertId", "==", alertId),
    where("snapshotId", "==", snapshotId)
  );
  const snap = await getDocs(q);
  return !snap.empty;
}

/** Registra uma notificação disparada */
export async function recordHit(alertId, snapshotId) {
  await addDoc(collection(db, HITS_COL), {
    alertId,
    snapshotId,
    notifiedAt: serverTimestamp(),
  });
}

// ─── MOTOR DE CHECAGEM (roda no front ao clicar "Verificar agora") ──────────

/** 
 * Equivale ao SELECT do schema.sql mas no cliente.
 * Em produção isso roda num Cloud Function / cron.
 */
export async function checkAlertNow(alert, fares) {
  const route = `${alert.origin}-${alert.destination}`;
  const hits = fares.filter(
    (f) =>
      f.route === route &&
      f.miles <= alert.maxMiles &&
      (!alert.partnerOnly || f.partner)
  ).sort((a, b) => a.miles - b.miles);

  const best = hits[0] || null;

  // atualiza lastChecked e lastFound no Firestore
  await updateAlert(alert.id, {
    lastChecked: serverTimestamp(),
    lastFound: best ? best.miles : null,
  });

  return best;
}
