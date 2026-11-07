/**
 * OneFlex - Snippet Console DevTools
 * Historique d'occupation d'une place sur les 3 derniers mois
 * 
 * Utilisation :
 * 1. Rendez-vous sur la page OneFlex de votre espace (ex: https://oneflex.myworldline.com/spaces/.../details)
 * 2. Ouvrez les DevTools (F12) -> Onglet "Console"
 * 3. Collez ce script et appuyez sur Entrée
 */
(async function() {
  // 1. Nettoyage d'une éventuelle instance précédente
  const existing = document.getElementById('oneflex-history-modal');
  if (existing) existing.remove();

  // 2. Détection de l'espace courant depuis l'URL
  console.group("🔍 [OneFlex Debug] 1. Détection de l'espace courant");
  const currentUrl = window.location.href;
  const currentPath = window.location.pathname;
  console.log("• URL courante :", currentUrl);
  console.log("• Chemin (pathname) :", currentPath);

  const pathMatch = currentPath.match(/spaces\/([a-f0-9-]{36})/i);
  const leafSpaceId = pathMatch ? pathMatch[1] : null;

  if (!leafSpaceId) {
    console.error("❌ Impossible de trouver un UUID d'espace dans l'URL. Format attendu : /spaces/<uuid>/details");
    console.groupEnd();
    alert("Veuillez vous placer sur la page de détails d'un espace OneFlex (ex: /spaces/<id>/details) avant de lancer le script.");
    return;
  }
  console.log("✔ ID de l'espace (leafSpaceId) :", leafSpaceId);

  // Détection du parent (étage) via l'URL si présent
  const urlParams = new URLSearchParams(window.location.search);
  const treeParam = urlParams.get('treeExpandedNodes');
  const treeNodes = treeParam ? decodeURIComponent(treeParam).split(',') : [];
  let parentSpaceId = treeNodes.length > 0 ? treeNodes[treeNodes.length - 1] : null;

  console.log("• Arborescence (treeExpandedNodes) :", treeNodes.length > 0 ? treeNodes : "(aucun)");
  if (parentSpaceId) {
    console.log("✔ ID parent (étage / parentSpaceId) extrait de l'URL :", parentSpaceId);
  } else {
    console.log("ℹ Pas d'étage parent dans l'URL, résolution via l'API lors de l'initialisation...");
  }
  console.groupEnd();

  // 3. Injection du panneau UI flottant
  const modal = document.createElement('div');
  modal.id = 'oneflex-history-modal';
  modal.innerHTML = `
    <div style="position:fixed; top:20px; right:20px; width:560px; max-height:88vh; background:#ffffff; color:#1e293b; border-radius:12px; box-shadow:0 12px 40px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.08); z-index:999999; display:flex; flex-direction:column; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size:13px; overflow:hidden;">
      <!-- Header -->
      <div style="background:#0f172a; color:#fff; padding:12px 16px; display:flex; justify-content:space-between; align-items:center;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:16px;">🔍</span>
          <span style="font-weight:600; font-size:14px;">OneFlex — Historique d'occupation</span>
        </div>
        <button id="of-close-btn" style="background:transparent; border:none; color:#94a3b8; font-size:18px; cursor:pointer; padding:0 4px; line-height:1;">✕</button>
      </div>

      <!-- Corps du formulaire -->
      <div style="padding:16px; overflow-y:auto; flex:1; display:flex; flex-direction:column; gap:12px;">
        <!-- Info espace -->
        <div style="background:#f1f5f9; padding:8px 12px; border-radius:6px; display:flex; align-items:center; gap:6px;">
          <span style="color:#64748b; font-weight:500;">Espace :</span>
          <span id="of-space-name" style="font-weight:600; color:#0f172a;">Chargement...</span>
        </div>

        <!-- Sélection de la place -->
        <div style="display:flex; flex-direction:column; gap:4px;">
          <label style="font-weight:600; color:#334155;">Place à analyser :</label>
          <select id="of-desk-select" style="padding:8px; border:1px solid #cbd5e1; border-radius:6px; background:#fff; font-size:13px; font-weight:500;">
            <option value="">Chargement des places...</option>
          </select>
        </div>

        <!-- Période -->
        <div style="display:flex; flex-direction:column; gap:6px;">
          <label style="font-weight:600; color:#334155;">Période d'historique :</label>
          <div style="display:flex; gap:6px;">
            <label style="flex:1; border:1px solid #cbd5e1; border-radius:6px; padding:6px 6px; display:flex; align-items:center; justify-content:center; gap:4px; cursor:pointer; font-size:12px;">
              <input type="radio" name="of-period" value="30"> 1 mois
            </label>
            <label style="flex:1; border:1px solid #cbd5e1; border-radius:6px; padding:6px 6px; display:flex; align-items:center; justify-content:center; gap:4px; cursor:pointer; font-size:12px;">
              <input type="radio" name="of-period" value="60"> 2 mois
            </label>
            <label style="flex:1; border:1px solid #2563eb; background:#eff6ff; border-radius:6px; padding:6px 6px; display:flex; align-items:center; justify-content:center; gap:4px; cursor:pointer; font-size:12px;">
              <input type="radio" name="of-period" value="90" checked> 3 mois
            </label>
            <label style="flex:1; border:1px solid #cbd5e1; border-radius:6px; padding:6px 6px; display:flex; align-items:center; justify-content:center; gap:4px; cursor:pointer; font-size:12px;">
              <input type="radio" name="of-period" value="180"> 6 mois
            </label>
          </div>
        </div>

        <!-- Filtres -->
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px; display:flex; flex-direction:column; gap:6px;">
          <div style="font-weight:600; color:#475569; margin-bottom:2px;">Filtres d'affichage :</div>
          <label style="display:flex; align-items:center; gap:6px; cursor:pointer;">
            <input type="checkbox" id="of-filter-weekdays" checked>
            <span>Jours ouvrés uniquement (Lundi à Vendredi)</span>
          </label>
          <label style="display:flex; align-items:center; gap:6px; cursor:pointer;">
            <input type="checkbox" id="of-filter-empty" checked>
            <span>Ignorer les jours où la place était vide</span>
          </label>
          <label style="display:flex; align-items:center; gap:6px; cursor:pointer;">
            <input type="checkbox" id="of-filter-me" checked>
            <span>Ignorer mes réservations :</span>
            <input type="text" id="of-my-name" value="Ludovic TANT" style="padding:2px 6px; border:1px solid #cbd5e1; border-radius:4px; font-size:12px; width:130px;">
          </label>
        </div>

        <!-- Boutons d'action -->
        <div style="display:flex; gap:8px;">
          <button id="of-start-btn" style="flex:1; background:#2563eb; color:#fff; border:none; border-radius:6px; padding:10px; font-weight:600; cursor:pointer; transition:background 0.2s;">
            ▶ Lancer la recherche
          </button>
          <button id="of-cancel-btn" style="display:none; background:#ef4444; color:#fff; border:none; border-radius:6px; padding:10px 14px; font-weight:600; cursor:pointer;">
            ⏹ Arrêter
          </button>
        </div>

        <!-- Barre de progression -->
        <div id="of-progress-box" style="display:none; flex-direction:column; gap:4px;">
          <div style="display:flex; justify-content:space-between; font-size:11px; color:#64748b;">
            <span id="of-progress-text">Analyse en cours...</span>
            <span id="of-progress-pct">0%</span>
          </div>
          <div style="background:#e2e8f0; height:6px; border-radius:3px; overflow:hidden;">
            <div id="of-progress-bar" style="background:#2563eb; width:0%; height:100%; transition:width 0.1s;"></div>
          </div>
        </div>

        <!-- Zone des résultats -->
        <div id="of-results-container" style="display:none; flex-direction:column; gap:8px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px;">
            <span id="of-results-summary" style="font-weight:600; color:#0f172a;"></span>
            <div style="display:flex; gap:6px;">
              <button id="of-copy-names-btn" style="background:#f1f5f9; border:1px solid #cbd5e1; border-radius:4px; padding:4px 8px; font-size:11px; font-weight:500; cursor:pointer;">
                📋 Copier les noms
              </button>
              <button id="of-export-csv-btn" style="background:#f1f5f9; border:1px solid #cbd5e1; border-radius:4px; padding:4px 8px; font-size:11px; font-weight:500; cursor:pointer;">
                💾 Exporter CSV
              </button>
            </div>
          </div>

          <div style="max-height:220px; overflow-y:auto; border:1px solid #e2e8f0; border-radius:6px;">
            <table style="width:100%; border-collapse:collapse; text-align:left; font-size:12px;">
              <thead style="background:#f8fafc; position:sticky; top:0; border-bottom:1px solid #e2e8f0;">
                <tr>
                  <th style="padding:6px 8px; color:#475569;">Date</th>
                  <th style="padding:6px 8px; color:#475569;">Jour</th>
                  <th style="padding:6px 8px; color:#475569;">Créneau</th>
                  <th style="padding:6px 8px; color:#475569;">Occupant</th>
                </tr>
              </thead>
              <tbody id="of-table-body"></tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // Gestion fermeture
  const closeBtn = document.getElementById('of-close-btn');
  closeBtn.onclick = () => modal.remove();
  const onKey = (e) => { if (e.key === 'Escape') { modal.remove(); window.removeEventListener('keydown', onKey); } };
  window.addEventListener('keydown', onKey);

  // Mise à jour visuelle des boutons radio de période
  modal.querySelectorAll('input[name="of-period"]').forEach(radio => {
    radio.addEventListener('change', () => {
      modal.querySelectorAll('input[name="of-period"]').forEach(r => {
        const lbl = r.parentElement;
        if (r.checked) {
          lbl.style.borderColor = '#2563eb';
          lbl.style.background = '#eff6ff';
        } else {
          lbl.style.borderColor = '#cbd5e1';
          lbl.style.background = '#ffffff';
        }
      });
    });
  });

  // Requête GraphQL épurée : seules les variables nécessaires sont déclarées et utilisées
  const MAP_VIEW_QUERY = `
    query mapViewLight($spaceId: ID!, $includeLeavesIds: [String!], $affectationData: SpaceAffectationDataInput!) {
      space(id: $spaceId) {
        id
        spaceLeaves(exclusive: true, includeLeavesIds: $includeLeavesIds) {
          id
          name
          desks { id name }
          affectations(affectationData: $affectationData) {
            id
            deskId
            moment
            user { id firstName lastName }
          }
        }
      }
    }
  `;

  async function callGql(dateStr) {
    const payload = {
      operationName: "mapViewLight",
      variables: {
        spaceId: parentSpaceId,
        includeLeavesIds: [leafSpaceId],
        affectationData: { date: dateStr, allDay: true, moment: "MORNING" }
      },
      query: MAP_VIEW_QUERY
    };

    const res = await fetch('/api/gql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'accept': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  }

  // 4. Initialisation : récupération de l'espace et des bureaux du jour
  const todayStr = new Date().toISOString().split('T')[0];
  console.group("💺 [OneFlex Debug] 2. Recherche des places de l'espace");
  console.log("• Date de référence :", todayStr);

  try {
    // Si l'étage parent n'a pas pu être extrait de l'URL, on le résout via GraphQL
    if (!parentSpaceId) {
      console.log("• Résolution du parentSpaceId via requête GraphQL space()...");
      try {
        const pRes = await fetch('/api/gql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'accept': 'application/json' },
          body: JSON.stringify({
            query: `query resolveParent($id: ID!) { space(id: $id) { id name parent { id name } } }`,
            variables: { id: leafSpaceId }
          })
        });
        const pData = await pRes.json();
        console.log("  ↳ Réponse résolution parent :", pData);
        parentSpaceId = pData?.data?.space?.parent?.id || leafSpaceId;
        console.log("✔ parentSpaceId résolu :", parentSpaceId);
      } catch (errP) {
        console.warn("⚠️ Impossible de résoudre le parent, repli sur leafSpaceId :", errP);
        parentSpaceId = leafSpaceId;
      }
    }

    console.log("• Envoi requête mapView avec :", {
      spaceId: parentSpaceId,
      includeLeavesIds: [leafSpaceId],
      date: todayStr
    });

    const initData = await callGql(todayStr);
    console.log("• Réponse mapView reçue :", initData);

    if (initData?.errors) {
      console.error("❌ Erreurs retournées par GraphQL :", initData.errors);
    }

    const spaceData = initData?.data?.space;
    const leaf = spaceData?.spaceLeaves?.find(l => l.id === leafSpaceId) || spaceData?.spaceLeaves?.[0];

    if (!leaf) {
      console.error("❌ Aucun sous-espace (spaceLeaf) trouvé dans la réponse pour l'ID :", leafSpaceId);
      console.groupEnd();
      document.getElementById('of-space-name').innerText = "Espace non trouvé (vérifiez l'ID)";
      return;
    }

    console.log(`✔ Espace identifié : "${leaf.name}" (ID: ${leaf.id})`);
    document.getElementById('of-space-name').innerText = leaf.name;

    // Récupération des bureaux
    const rawDesks = leaf.desks || [];
    console.log(`• Nombre brut de places trouvées : ${rawDesks.length}`);

    // Trier les bureaux par nom naturel (Place 1, Place 2 ... Place 13)
    const desks = rawDesks.slice().sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
    );

    console.log("• Liste ordonnée des places trouvées :");
    console.table(desks.map(d => ({ ID: d.id, Nom: d.name })));

    const deskSelect = document.getElementById('of-desk-select');
    deskSelect.innerHTML = desks.map(d => `<option value="${d.id}">${d.name}</option>`).join('');

    // Présélection de la "Place 13" si présente
    const p13 = desks.find(d => d.name.toLowerCase().includes('13'));
    if (p13) {
      deskSelect.value = p13.id;
      console.log(`✔ Place 13 détectée et présélectionnée (ID: ${p13.id})`);
    } else if (desks.length > 0) {
      deskSelect.value = desks[0].id;
      console.log(`ℹ Place 13 non trouvée, première place sélectionnée : "${desks[0].name}"`);
    } else {
      console.warn("⚠️ Aucune place n'a été trouvée pour cet espace !");
    }
    console.groupEnd();

  } catch (err) {
    console.error("❌ Erreur pendant l'initialisation et la recherche des places :", err);
    console.groupEnd();
    document.getElementById('of-space-name').innerText = "Erreur de chargement";
  }

  // 5. Gestion de l'analyse
  let isCancelled = false;
  let lastResults = [];

  const startBtn = document.getElementById('of-start-btn');
  const cancelBtn = document.getElementById('of-cancel-btn');
  const progressBox = document.getElementById('of-progress-box');
  const progressBar = document.getElementById('of-progress-bar');
  const progressText = document.getElementById('of-progress-text');
  const progressPct = document.getElementById('of-progress-pct');
  const resultsContainer = document.getElementById('of-results-container');
  const tableBody = document.getElementById('of-table-body');

  cancelBtn.onclick = () => { isCancelled = true; };

  startBtn.onclick = async () => {
    isCancelled = false;
    startBtn.style.display = 'none';
    cancelBtn.style.display = 'inline-block';
    progressBox.style.display = 'flex';
    resultsContainer.style.display = 'none';
    tableBody.innerHTML = '';
    lastResults = [];

    const targetDeskId = document.getElementById('of-desk-select').value;
    const daysBack = parseInt(document.querySelector('input[name="of-period"]:checked').value, 10);
    const onlyWeekdays = document.getElementById('of-filter-weekdays').checked;
    const hideEmpty = document.getElementById('of-filter-empty').checked;
    const hideMe = document.getElementById('of-filter-me').checked;
    const myName = document.getElementById('of-my-name').value.trim().toLowerCase();

    // Génération des dates (du plus récent au plus ancien)
    const dates = [];
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - daysBack);

    let cur = new Date(end);
    while (cur >= start) {
      const dow = cur.getDay(); // 0 = dimanche, 6 = samedi
      if (!onlyWeekdays || (dow !== 0 && dow !== 6)) {
        dates.push(cur.toISOString().split('T')[0]);
      }
      cur.setDate(cur.getDate() - 1);
    }

    const totalDays = dates.length;
    let completed = 0;
    const CONCURRENCY = 4; // 4 requêtes simultanées pour un scan rapide et doux

    for (let i = 0; i < dates.length; i += CONCURRENCY) {
      if (isCancelled) break;
      const chunk = dates.slice(i, i + CONCURRENCY);

      await Promise.all(chunk.map(async (d) => {
        try {
          const res = await callGql(d);
          const leaf = res?.data?.space?.spaceLeaves?.[0];
          const affs = (leaf?.affectations || []).filter(a => a.deskId === targetDeskId);

          const dateObj = new Date(d);
          const jourSemaine = dateObj.toLocaleDateString('fr-FR', { weekday: 'long' });
          const dateFormatee = dateObj.toLocaleDateString('fr-FR');

          if (!affs || affs.length === 0) {
            lastResults.push({ date: d, dateFr: dateFormatee, jour: jourSemaine, moment: '-', occupant: 'Vide', isMe: false, empty: true });
          } else {
            const morning = affs.find(a => a.moment === 'MORNING');
            const afternoon = affs.find(a => a.moment === 'AFTERNOON');

            const mUser = morning?.user ? `${morning.user.firstName} ${morning.user.lastName}` : null;
            const aUser = afternoon?.user ? `${afternoon.user.firstName} ${afternoon.user.lastName}` : null;

            if (mUser && aUser && mUser === aUser) {
              const isMe = mUser.toLowerCase().includes(myName);
              lastResults.push({ date: d, dateFr: dateFormatee, jour: jourSemaine, moment: 'Journée', occupant: mUser, isMe, empty: false });
            } else {
              if (mUser) {
                const isMe = mUser.toLowerCase().includes(myName);
                lastResults.push({ date: d, dateFr: dateFormatee, jour: jourSemaine, moment: 'Matin', occupant: mUser, isMe, empty: false });
              }
              if (aUser) {
                const isMe = aUser.toLowerCase().includes(myName);
                lastResults.push({ date: d, dateFr: dateFormatee, jour: jourSemaine, moment: 'Après-midi', occupant: aUser, isMe, empty: false });
              }
            }
          }
        } catch (e) {
          console.error(`Erreur pour la date ${d}:`, e);
        } finally {
          completed++;
          const pct = Math.round((completed / totalDays) * 100);
          progressBar.style.width = `${pct}%`;
          progressPct.innerText = `${pct}%`;
          progressText.innerText = `Analyse : ${completed} / ${totalDays} jours`;
        }
      }));

      // Petite pause de 40ms entre les lots
      await new Promise(r => setTimeout(r, 40));
    }

    // Réinitialisation des boutons
    startBtn.style.display = 'inline-block';
    cancelBtn.style.display = 'none';

    // Tri par date décroissante
    lastResults.sort((a, b) => b.date.localeCompare(a.date));

    // Filtrage
    const filtered = lastResults.filter(r => {
      if (hideEmpty && r.empty) return false;
      if (hideMe && r.isMe) return false;
      return true;
    });

    // Affichage des résultats
    const uniquePersons = [...new Set(filtered.filter(r => !r.empty && !r.isMe).map(r => r.occupant))];
    document.getElementById('of-results-summary').innerText = `${filtered.length} réservation(s) — ${uniquePersons.length} personne(s) distincte(s)`;

    tableBody.innerHTML = filtered.length === 0 
      ? `<tr><td colspan="4" style="padding:12px; text-align:center; color:#94a3b8;">Aucun occupant trouvé avec ces filtres.</td></tr>`
      : filtered.map(r => `
          <tr style="border-bottom:1px solid #f1f5f9; background:${r.empty ? '#fff' : (r.isMe ? '#f8fafc' : '#eff6ff')};">
            <td style="padding:6px 8px; font-weight:500;">${r.dateFr}</td>
            <td style="padding:6px 8px; color:#64748b; text-transform:capitalize;">${r.jour}</td>
            <td style="padding:6px 8px; color:#475569;">${r.moment}</td>
            <td style="padding:6px 8px; font-weight:${r.empty ? 'normal' : '600'}; color:${r.isMe ? '#64748b' : (r.empty ? '#94a3b8' : '#1e3a8a')};">
              ${r.occupant} ${r.isMe ? '<span style="font-size:10px; color:#94a3b8;">(moi)</span>' : ''}
            </td>
          </tr>
        `).join('');

    resultsContainer.style.display = 'flex';

    // Sortie miroir dans la console
    console.log("=== Résultat OneFlex History ===");
    console.table(filtered.map(r => ({ Date: r.dateFr, Jour: r.jour, Créneau: r.moment, Occupant: r.occupant })));
    console.log("Personnes trouvées :", uniquePersons.join(', '));

    // Bouton copier les noms
    document.getElementById('of-copy-names-btn').onclick = () => {
      navigator.clipboard.writeText(uniquePersons.join(', '));
      alert(`Noms copiés dans le presse-papier :\n${uniquePersons.join(', ')}`);
    };

    // Bouton export CSV
    document.getElementById('of-export-csv-btn').onclick = () => {
      const csv = ['Date,Jour,Creneau,Occupant']
        .concat(filtered.map(r => `"${r.dateFr}","${r.jour}","${r.moment}","${r.occupant}"`))
        .join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `historique_place_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    };
  };
})();
