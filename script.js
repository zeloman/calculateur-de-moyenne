 // ====== Données ======
const MAX_MATIERES = 20;
const MAX_NOTES = 10;

// Matières de la filière IDA : [nom, coefficient]
const MATIERES_IDA = [
  ['Mathématiques', 3], ['Dvp Web', 3], ['Merise', 4], ['Français', 2],
  ['Math Fin', 2], ['Logiciel', 2], ['RIT', 2], ['ASI', 2],
  ['Anglais', 2], ['Droit', 2], ['Économie', 2], ['Algorithme', 2],
  ['SE (Système)', 2]
];

// ====== Éléments de la page ======
const inputNb = document.getElementById('nbMatieres');
const divErreur = document.getElementById('erreur');
const zoneTableau = document.getElementById('zoneTableau');
const corps = document.getElementById('corps');
const divResultat = document.getElementById('resultat');

document.getElementById('btnGenerer').addEventListener('click', validerNombre);
document.getElementById('btnIDA').addEventListener('click', chargerIDA);
document.getElementById('btnCalculer').addEventListener('click', calculerMoyenne);
inputNb.addEventListener('keydown', e => { if (e.key === 'Enter') validerNombre(); });

// ====== Étape 1 : validation du nombre de matières ======
// (équivalent du Tantque Nbrmatiere < 1 OU Nbrmatiere > 20)
function validerNombre() {
  const nb = parseInt(inputNb.value, 10);
  if (isNaN(nb)  ||nb < 1 || nb > MAX_MATIERES) {
    divErreur.textContent = 'Entre un nombre entier entre 1 et ' + MAX_MATIERES + '.';
    zoneTableau.hidden = true;
    return;
  }
  divErreur.textContent = '';
  genererTableau(nb);
}

function chargerIDA() {
  inputNb.value = MATIERES_IDA.length;
  divErreur.textContent = '';
  genererTableau(MATIERES_IDA.length, MATIERES_IDA);
}

// ====== Étape 2 : construction du tableau ======
function genererTableau(nb, preset) {
  corps.innerHTML = '';
  divResultat.className = 'result-box';
  divResultat.textContent = '';

  for (let i = 0; i < nb; i++) {
    corps.appendChild(creerLigne(i, preset ? preset[i] : null));
  }
  zoneTableau.hidden = false;
}

function creerChamp(type, classe, valeur) {
  const input = document.createElement('input');
  input.type = type;
  input.className = classe;
  if (valeur !== undefined) input.value = valeur;
  return input;
}

function creerLigne(i, donnee) {
  const tr = document.createElement('tr');

  const tdNum = document.createElement('td');
  tdNum.textContent = i + 1;

  const tdNom = document.createElement('td');
  const nom = creerChamp('text', 'nom', donnee ? donnee[0] : '');
  nom.placeholder = 'Nom';
  nom.style.width = '120px';
  tdNom.appendChild(nom);

  const tdCoeff = document.createElement('td');
  const coeff = creerChamp('number', 'coeff', donnee ? donnee[1] : '');
  coeff.min = '0.5';
  coeff.step = '0.5';
  tdCoeff.appendChild(coeff);

  const tdNb = document.createElement('td');
  const nbNotes = creerChamp('number', 'nbnotes', 1);
  nbNotes.min = '1';
  nbNotes.max = String(MAX_NOTES);
  tdNb.appendChild(nbNotes);

  const tdNotes = document.createElement('td');
  tdNotes.className = 'cellule-notes';
  afficherChampsNotes(tdNotes, 1);

  const tdMoy = document.createElement('td');
  tdMoy.className = 'moy';
  tdMoy.textContent = '-';

  // Quand on change le nombre de notes, on recrée les champs de notes
  nbNotes.addEventListener('input', () => {
    const n = parseInt(nbNotes.value, 10);
    afficherChampsNotes(tdNotes, isNaN(n) ? 1 : Math.min(Math.max(n, 1), MAX_NOTES));
  });

  tr.append(tdNum, tdNom, tdCoeff, tdNb, tdNotes, tdMoy);
  return tr;
}

function afficherChampsNotes(cellule, n) {
  cellule.innerHTML = '';
  for (let j = 0; j < n; j++) {
    const note = creerChamp('number', 'note');
    note.min = '0';
    note.max = '20';
    note.step = '0.25';
    note.title = 'Note ' + (j + 1);
    cellule.appendChild(note);
  }
}

// ====== Étape 3 : calcul (ton algorithme) ======
function calculerMoyenne() {
  let totalmoy = 0;
  let totalcoeff = 0;
  const erreurs = [];
 corps.querySelectorAll('tr').forEach((tr, i) => {
    const nom = tr.querySelector('.nom').value.trim() || 'Matière ' + (i + 1);
    const coeff = parseFloat(tr.querySelector('.coeff').value);
    const champsNotes = tr.querySelectorAll('.note');
    const cellMoy = tr.querySelector('.moy');
    cellMoy.textContent = '-';

    // Coefficient obligatoire et > 0
    if (isNaN(coeff) || coeff <= 0) {
      erreurs.push(nom + ' : coefficient invalide');
      tr.querySelector('.coeff').classList.add('invalide');
      return;
    }
    tr.querySelector('.coeff').classList.remove('invalide');

    // somme des notes de la matière (boucle "pour j")
    let somme = 0;
    let matiereOk = true;
    champsNotes.forEach(champ => {
      const note = parseFloat(champ.value);
      if (isNaN(note) || note < 0 || note > 20) {
        champ.classList.add('invalide');
        matiereOk = false;
      } else {
        champ.classList.remove('invalide');
        somme += note;
      }
    });
    if (!matiereOk) {
      erreurs.push(nom + ' : les notes doivent être comprises entre 0 et 20');
      return;
    }

    // moy[i] <- somme / Nbrnote
    const moy = somme / champsNotes.length;
    cellMoy.textContent = moy.toFixed(2);

    // totalmoy <- totalmoy + moy[k] * coeff[k]
    totalmoy += moy * coeff;
    totalcoeff += coeff;
  });

  divResultat.textContent = '';

  if (erreurs.length > 0) {
    divResultat.className = 'result-box resultat-echec';
    const titre = document.createElement('p');
    titre.textContent = 'Corrige ces points :';
    divResultat.appendChild(titre);
    erreurs.forEach(msg => {
      const p = document.createElement('p');
      p.textContent = '• ' + msg;
      divResultat.appendChild(p);
    });
    return;
  }

  // moyennegen <- totalmoy / totalcoeff
  const moyennegen = totalmoy / totalcoeff;

  const pMoyenne = document.createElement('p');
  pMoyenne.textContent = 'Votre moyenne générale est de :'+ moyennegen.toFixed(2);
  pMoyenne.style.fontSize = '1.3rem';
  divResultat.className = 'result-box resultat-echec';
divResultat.appendChild(pMoyenne);
}