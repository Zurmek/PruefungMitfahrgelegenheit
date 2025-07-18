// --- storage.js ---
const USER_DATA_KEY = 'userData';
const LOGGED_IN_USER_KEY = 'loggedInUser';
const LOCAL_STORAGE_KEY = 'fahrerDaten';

function setupStorage() {
  return {
    getUsers() {
      return JSON.parse(localStorage.getItem(USER_DATA_KEY)) || [];
    },
    saveUsers(users) {
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(users));
    },
    getLoggedInUser() {
      return localStorage.getItem(LOGGED_IN_USER_KEY);
    },
    setLoggedInUser(email) {
      localStorage.setItem(LOGGED_IN_USER_KEY, email);
    },
    removeLoggedInUser() {
      localStorage.removeItem(LOGGED_IN_USER_KEY);
    },
    getFahrerDaten() {
      return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
    },
    saveFahrerDaten(data) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    }
  };
}

// --- Datum-Formatierung ---
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

// --- Pluralisierungsfunktion ---
function plural(n, singular, plural, zero) {
  if (n === 0 && zero) return zero;
  return n === 1 ? singular : plural;
}

// --- Hilfsfunktionen ---
function validateEmail(email) {
  const universityDomain = '@haw-landshut.de';
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email) && email.endsWith(universityDomain);
}
function validatePassword(password) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers;
}
function displayUserInfo(storage, email) {
  const users = storage.getUsers();
  const user = users.find((u) => u.email === email);
  const firstName = user?.firstName || "Benutzer";
  console.log(`Willkommen, ${firstName}`); // Nur noch für Debugging
}

// --- Bereich-Umschaltung ---
window.zeigeBereich = function(id) {
  const abschnitte = [
    'startScreen',
    'registrationForm',
    'loginForm',
    'userInfo',
    'fahrerForm',
    'mitfahrerForm',
    'matchFormSuche',
    'matchFormPassengers',
    'results',
    'fahrerListe',
    'map',
    'nachrichtBox',
    'userSettings',
    'welcomeBox' // Willkommensbox
  ];
  abschnitte.forEach(sec => {
    const el = document.getElementById(sec);
    if (el) el.style.display = 'none';
  });
  const ziel = document.getElementById(id);
  if (ziel) ziel.style.display = 'block';
  // Willkommensbox nur anzeigen, wenn explizit 'welcomeBox' angezeigt werden soll und KEIN User eingeloggt ist
  const welcomeBox = document.getElementById('welcomeBox');
  const storage = setupStorage();
  if (welcomeBox) {
    if (id === 'welcomeBox' && !storage.getLoggedInUser()) {
      welcomeBox.style.display = 'block';
    } else {
      welcomeBox.style.display = 'none';
    }
  }
  // Suchformular auf Startseite immer anzeigen
  if (id === 'startScreen') {
    const matchFormSuche = document.getElementById('matchFormSuche');
    if (matchFormSuche) matchFormSuche.style.display = 'block';
  }
};

// --- Authentifizierung & User-Settings ---
function setupAuthAndSettings(storage) {
  // Registrierung
  document.getElementById('registrationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value.trim();
    const firstName = document.getElementById('regFirstName').value.trim();
    const lastName = document.getElementById('regLastName').value.trim();
    const homeAddress = document.getElementById('regHomeAddress').value.trim();
    const gender = document.getElementById('regGender').value;
    const phone = document.getElementById('regPhone').value.trim();

    if (!validateEmail(email)) {
      alert('Bitte registriere dich mit einer gültigen Universitäts-E-Mail-Adresse.');
      return;
    }
    if (!phone) {
      alert('Bitte gib deine Telefonnummer an.');
      return;
    }
    if (!validatePassword(password)) {
      alert('Passwort muss mindestens 8 Zeichen lang sein und Zahlen, Groß- und Kleinbuchstaben enthalten.');
      return;
    }

    const users = storage.getUsers();
    if (users.find(user => user.email === email)) {
      alert('Benutzer existiert bereits.');
      return;
    }

    users.push({ email, password, firstName, lastName, homeAddress, gender, phone });
    storage.saveUsers(users);
    alert('Registrierung erfolgreich! Bitte einloggen.');
    e.target.reset();
    zeigeBereich('loginForm');
  });

  // Login
  document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    const users = storage.getUsers();
    const user = users.find(user => user.email === email && user.password === password);

    if (user) {
      storage.setLoggedInUser(email);
      displayUserInfo(storage, email);
      // Nach erfolgreichem Login:
      const benachrichtigung = localStorage.getItem(`benachrichtigung_${email}`);
      if (benachrichtigung) {
        alert(benachrichtigung);
        localStorage.removeItem(`benachrichtigung_${email}`);
      }
      const menu = document.getElementById('mainMenu');
      if (menu) menu.style.display = '';
      zeigeBereich('startScreen');
    } else {
      alert('Ungültige E-Mail oder Passwort.');
    }
  });

  // User-Settings laden & speichern
  const userSettingsForm = document.getElementById("userSettingsForm");
  if (userSettingsForm) {
    userSettingsForm.addEventListener("submit", function(event) {
      event.preventDefault();
      const firstName = document.getElementById("firstName").value.trim();
      const lastName = document.getElementById("lastName").value.trim();
      const homeAddress = document.getElementById("homeAddress").value.trim();
      const gender = document.getElementById("gender").value;
      const phone = document.getElementById("phone").value.trim();
      const loggedInUser = storage.getLoggedInUser();
      if (!loggedInUser) return;
      const users = storage.getUsers();
      const userIndex = users.findIndex((u) => u.email === loggedInUser);
      if (userIndex !== -1) {
        users[userIndex] = {
          ...users[userIndex],
          firstName,
          lastName,
          homeAddress,
          gender,
          phone,
        };
        storage.saveUsers(users);
        alert("Einstellungen gespeichert!");
      }
    });
  }


}

// --- Initialisierung nach dem Laden der Seite ---
window.addEventListener('DOMContentLoaded', () => {
  const storage = setupStorage();
  setupAuthAndSettings(storage);

  // Startscreen anzeigen, wenn niemand eingeloggt ist
  if (!storage.getLoggedInUser()) {
    zeigeBereich('welcomeBox');
  } else {
    zeigeBereich('startScreen');
  }

  // Dark Mode anwenden, wenn gespeichert
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
  }

  // Dark Mode Umschalter-Button oben links aktivieren
  const darkModeBtn = document.getElementById('darkModeBtn');
  if (darkModeBtn) {
    darkModeBtn.onclick = window.toggleDarkMode;
    // Initiales Icon setzen
    darkModeBtn.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
  }
  setupFahrtAnbietenForm(storage);
  setupFahrtSucheForm(storage);
});

// --- Neue BlaBlaCar-ähnliche Fahrten-Logik ---
// Fahrer kann Fahrt mit Start, Ziel, Datum, Uhrzeit, freien Plätzen, Preis anbieten
function setupFahrtAnbietenForm(storage) {
  const form = document.getElementById('fahrerForm');
  if (!form) return;
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const loggedInUser = storage.getLoggedInUser();
    const users = storage.getUsers();
    const user = users.find(u => u.email === loggedInUser);
    // Felder aus Benutzereinstellungen
    const firstName = user?.firstName || '';
    const lastName = user?.lastName || '';
    const kontakt = user?.email || '';
    const phone = user?.phone || '';
    // Neue Felder für Fahrt
    const start = document.getElementById('fahrtStart').value.trim();
    const ziel = document.getElementById('fahrtZiel').value.trim();
    const datum = document.getElementById('fahrtDatum').value;
    const zeit = document.getElementById('fahrtZeit').value;
    const freiePlaetze = parseInt(document.getElementById('freiePlaetze').value, 10);
    const preis = parseFloat(document.getElementById('fahrtPreis').value);
    // Fahrt speichern
    let fahrten = storage.getFahrerDaten();
    fahrten.push({
      fahrer: loggedInUser,
      firstName,
      lastName,
      kontakt,
      start,
      ziel,
      datum,
      zeit,
      freiePlaetze,
      preis,
      phone,
      mitfahrer: [],
      anfragen: [],
      nachrichten: []
    });
    storage.saveFahrerDaten(fahrten);
    alert('Fahrt angeboten!');
    form.reset();
    zeigeBereich('startScreen');
  });
}

function setupFahrtSucheForm(storage) {
  // Unterstütze beide Suchformulare
  const forms = [
    document.getElementById('matchFormSuche'),
    document.getElementById('matchFormPassengers')
  ].filter(Boolean);

  forms.forEach(form => {
    form.addEventListener('submit', function(e) {
      e.preventDefault();

      // Felder je nach Formular
      let start, ziel, datum, maxPreis, mitfahrer;
      if (form.id === 'matchFormSuche') {
        start = document.getElementById('sucheStartSuche').value.trim();
        ziel = document.getElementById('sucheZielSuche').value.trim();
        datum = document.getElementById('sucheDatumSuche').value;
        mitfahrer = parseInt(document.getElementById('sucheMitfahrer').value, 10) || 1;
        maxPreis = undefined;
      } else {
        start = document.getElementById('sucheStartPassengers').value.trim();
        ziel = document.getElementById('sucheZielPassengers').value.trim();
        datum = document.getElementById('sucheDatumPassengers').value;
        maxPreis = parseFloat(document.getElementById('sucheMaxPreis').value);
        mitfahrer = 1;
      }

      const resultsDiv = document.getElementById('results');
      const loggedInUser = storage.getLoggedInUser();
      const fahrten = storage.getFahrerDaten()
        .filter(f => f.freiePlaetze > 0 && f.fahrer !== loggedInUser);

      // Filter: Start/Ziel als Teilstring, Datum exakt, genug Plätze, ggf. Preis
      const matches = fahrten.filter(f =>
        f.start && f.ziel && f.datum &&
        f.start.toLowerCase().includes(start.toLowerCase()) &&
        f.ziel.toLowerCase().includes(ziel.toLowerCase()) &&
        f.datum === datum &&
        (typeof maxPreis !== 'number' || isNaN(maxPreis) || f.preis <= maxPreis) &&
        (typeof mitfahrer !== 'number' || f.freiePlaetze >= mitfahrer)
      );

      if (matches.length > 0) {
    resultsDiv.innerHTML = `
    <button type="button" class="secondary-button" onclick="zeigeBereich('startScreen')">Zurück</button>
    <h3>Gefundene Fahrten:</h3>
    ${matches.map((f, i) => `
      <div class="fahrer-item">
        <div class="fahrer-info">
          <div class="fahrt-zeile">
            <span class="fahrt-icon">🗓️</span>
            <span class="fahrt-datum">${formatDate(f.datum)} um ${f.zeit || ''} Uhr</span>
          </div>
          <div class="fahrt-zeile">
            <span class="fahrt-icon">🚗</span>
            <span class="fahrt-route">${f.start || ''} → ${f.ziel || ''}</span>
          </div>
          <div class="fahrt-zeile">
            <span class="fahrt-icon">💺</span>
            <span class="fahrt-plaetze">
              <span>
                ${
                  f.mitfahrer && f.mitfahrer.length > 0
                    ? f.mitfahrer.length + ' ' + plural(f.mitfahrer.length, 'Platz gebucht', 'Plätze gebucht')
                    : 'Keine Plätze gebucht'
                }
              </span>
              <span style="margin: 0 0.5em;">•</span>
              <span>
                ${
                  f.freiePlaetze > 0
                    ? f.freiePlaetze + ' ' + plural(f.freiePlaetze, 'Platz frei', 'Plätze frei')
                    : 'Keine Plätze frei'
                }
              </span>
              <span style="margin: 0 0.5em;">•</span>
              <span>
                ${f.preis ? f.preis.toFixed(2) : '0.00'} € pro Person
              </span>
            </span>
          </div>
          <div class="fahrt-anbieter">
            Fahrt angeboten von <b>${f.firstName || ''} ${f.lastName || ''}</b>
            ${f.phone ? `<a href="https://wa.me/${f.phone.replace(/^0/, '49')}" target="_blank" title="WhatsApp"><img src="WhatsAppIcon.svg" alt="WhatsApp" style="width:1.2em; height:1.2em; vertical-align:middle; margin-right:0.3em;"></a>${f.phone}` : ''}
          </div>
        </div>
        <div class="fahrer-action">
          <button class="anfrage-button" onclick="anfrageSenden('${f.datum}','${f.zeit}','${f.start}','${f.ziel}')">Anfrage senden</button>
        </div>
      </div>
    `).join('')}
  `;
} else {
  resultsDiv.innerHTML = `
    <button type="button" class="secondary-button" onclick="zeigeBereich('startScreen')">Zurück</button>
    <p>Keine passende Fahrt gefunden.</p>
  `;
}
      zeigeBereich('results');
    });
  });
}

// Anfrage senden (Mitfahrer bucht Fahrt)
// Ersetze window.anfrageSenden durch:
window.anfrageSenden = function(datum, zeit, start, ziel) {
  const storage = setupStorage();
  const fahrten = storage.getFahrerDaten();
  const loggedInUser = storage.getLoggedInUser();
  if (!loggedInUser) return alert('Bitte einloggen!');

  // Suche die Fahrt eindeutig anhand der Parameter
  const fahrt = fahrten.find(f =>
    f.datum === datum &&
    f.zeit === zeit &&
    f.start === start &&
    f.ziel === ziel
  );
  if (!fahrt) return alert('Fahrt nicht gefunden!');
  if (!fahrt.anfragen) fahrt.anfragen = [];
  if (fahrt.anfragen.includes(loggedInUser) || (fahrt.mitfahrer && fahrt.mitfahrer.includes(loggedInUser))) {
    alert('Du hast diese Fahrt bereits angefragt oder bist schon Mitfahrer.');
    return;
  }
  fahrt.anfragen.push(loggedInUser);
  storage.saveFahrerDaten(fahrten);
  alert('Anfrage gesendet! Der Fahrer muss sie akzeptieren.');
};


window.zeigeMeineFahrten = function() {
  const storage = setupStorage();
  const loggedInUser = storage.getLoggedInUser();
  if (!loggedInUser) {
    alert('Bitte einloggen!');
    zeigeBereich('loginForm');
    return;
  }
  const fahrten = storage.getFahrerDaten();
  // Unterstützt beide Varianten: fahrer oder fahrerEmail

const meineFahrten = fahrten.filter(f =>
  (f.fahrer && f.fahrer.trim().toLowerCase() === loggedInUser.trim().toLowerCase()) ||
  (f.kontakt && f.kontakt.trim().toLowerCase() === loggedInUser.trim().toLowerCase())
);

  const meineBuchungen = fahrten.filter(f => Array.isArray(f.mitfahrer) && f.mitfahrer.includes(loggedInUser));
  let html = '<h3 class="fahrten-section-title">🚘 Meine angebotenen Fahrten</h3>';
  if (meineFahrten.length === 0) {
    html += '<p>Keine eigenen Fahrten angeboten.</p>';
  } else {
    html += meineFahrten.map(f => {
  if (f.start && f.ziel && f.datum) {
    let anfragenHtml = '';
    if (f.anfragen && f.anfragen.length > 0) {
      anfragenHtml = `
        <div class="anfragen-box">
          <b>Anfragen:</b>
          <ul class="anfragen-liste">
            ${f.anfragen.map(email => {
              const users = setupStorage().getUsers();
              const user = users.find(u => u.email === email);
              const name = user ? `${user.firstName || ''} ${user.lastName || ''}` : email;
              return `
                <li>
                  <span class="anfrage-name">${name}</span>
                  <span class="anfrage-buttons">
                    <button class="small-button akzeptieren-btn" onclick="anfrageAkzeptieren('${f.datum}','${f.zeit}','${email}')">✅ Akzeptieren</button>
                    <button class="small-button ablehnen-btn" onclick="anfrageAblehnen('${f.datum}','${f.zeit}','${email}')">❌ Ablehnen</button>
                  </span>
                </li>
              `;
            }).join('')}
          </ul>
        </div>
      `;
    }
    // ...innerhalb von meineFahrten.map(f => { ... })
return `<div class="fahrer-item">
  <div class="fahrer-info">
    <div class="fahrt-zeile">
      <span class="fahrt-icon">🗓️</span>
      <span class="fahrt-datum">${formatDate(f.datum)} um ${f.zeit || ''} Uhr</span>
    </div>
    <div class="fahrt-zeile">
      <span class="fahrt-icon">🚗</span>
      <span class="fahrt-route">${f.start || ''} → ${f.ziel || ''}</span>
    </div>
    <div class="fahrer-action stornieren-action">
      <button class="small-button" title="Fahrt stornieren" onclick="fahrtStornieren('${f.datum}','${f.zeit}')">❌</button>
    </div>
    <div class="fahrt-zeile">
      <span class="fahrt-icon">💺</span>
      <span class="fahrt-plaetze">
        <span>
          ${
            f.mitfahrer && f.mitfahrer.length > 0
              ? f.mitfahrer.length + ' ' + plural(f.mitfahrer.length, 'Platz gebucht', 'Plätze gebucht')
              : 'Keine Plätze gebucht'
          }
        </span>
        <span style="margin: 0 0.5em;">•</span>
        <span>
          ${
            f.freiePlaetze > 0
              ? f.freiePlaetze + ' ' + plural(f.freiePlaetze, 'Platz frei', 'Plätze frei')
              : 'Keine Plätze frei'
          }
        </span>
        <span style="margin: 0 0.5em;">•</span>
        <span>
          ${f.preis ? f.preis.toFixed(2) : '0.00'} € pro Person
        </span>
      </span>
    </div>
    ${anfragenHtml} <!-- HIER einfügen -->
    ${
      f.mitfahrer && f.mitfahrer.length > 0
        ? `<ul class="mitfahrer-liste" style="margin:0.5em 0 0 0;padding:0;list-style:none;">
            ${f.mitfahrer.map(email => {
              const users = setupStorage().getUsers();
              const m = users.find(u => u.email === email);
              return `<li style="margin-bottom:0.2em;">
                Fahrt gebucht von <b>${m ? `${m.firstName || ''} ${m.lastName || ''}` : email}</b>
                ${
                  m && m.phone
                    ? `<a href="https://wa.me/${m.phone.replace(/^0/, '49')}" target="_blank" title="WhatsApp"><img src="WhatsAppIcon.svg" alt="WhatsApp" style="width:2.0em; height:2.0em; vertical-align:middle; margin-right:0.3em;"></a>${m.phone}`
                    : ''
                }
              </li>`;
            }).join('')}
          </ul>`
        : ''
    }
  </div>
</div>`;
  } else {
    return `<div><b>${f.fahrerWohnort || ''}</b> (${(f.fahrtage || []).join(', ')}) Ankunft: ${f.ankunft || ''}</div>`;
  }
}).join('');

  }
  html += '<h3 class="fahrten-section-title">📅 Meine gebuchten Fahrten</h3>';
  if (meineBuchungen.length === 0) {
    html += '<p>Keine Fahrten gebucht.</p>';
  } else {
    html += meineBuchungen.map(f => `
  <div class="fahrer-item">
    <div class="fahrer-info">
      <div class="fahrer-action stornieren-action" style="position:absolute; top:50%; right:1.2em; transform:translateY(-50%);">
        <button class="small-button" title="Buchung stornieren" onclick="buchungStornieren('${f.datum}','${f.zeit}')">❌</button>
      </div>
      <div class="fahrt-zeile">
        <span class="fahrt-icon">🗓️</span>
        <span class="fahrt-datum">${formatDate(f.datum)} um ${f.zeit || ''} Uhr</span>
      </div>
      <div class="fahrt-zeile">
        <span class="fahrt-icon">🚗</span>
        <span class="fahrt-route">${f.start || f.fahrerWohnort || ''} → ${f.ziel || ''}</span>
      </div>
      <div class="fahrt-zeile">
        <span class="fahrt-icon">💺</span>
        <span class="fahrt-plaetze">
          <span>
            ${
              f.mitfahrer && f.mitfahrer.length > 0
                ? f.mitfahrer.length + ' ' + plural(f.mitfahrer.length, 'Platz gebucht', 'Plätze gebucht')
                : 'Keine Plätze gebucht'
            }
          </span>
          <span style="margin: 0 0.5em;">•</span>
          <span>
            ${
              f.freiePlaetze > 0
                ? f.freiePlaetze + ' ' + plural(f.freiePlaetze, 'Platz frei', 'Plätze frei')
                : 'Keine Plätze frei'
            }
          </span>
          <span style="margin: 0 0.5em;">•</span>
          <span>
            ${f.preis ? f.preis.toFixed(2) : '0.00'} € pro Person
          </span>
          </span>
          </div>
          <div class="fahrt-anbieter">
            Du fährst mit bei <b>${f.firstName || ''} ${f.lastName || ''}</b>
            ${f.phone ? `<a href="https://wa.me/${f.phone.replace(/^0/, '49')}" target="_blank" title="WhatsApp"><img src="WhatsAppIcon.svg" alt="WhatsApp" style="width:2.0em; height:2.0em; vertical-align:middle; margin-right:0.3em;"></a>${f.phone}` : ''}
          </div>
        </span>
      </div>
    </div>
    
  </div>
`).join('');
  }
  document.getElementById('results').innerHTML = `
  <button type="button" class="secondary-button" onclick="zeigeBereich('startScreen')">Zurück</button>
    ${html}
`;
  zeigeBereich('results');
};

// Anfragen akzeptieren oder ablehnen
window.anfrageAkzeptieren = function(datum, zeit, email) {
  const storage = setupStorage();
  const fahrten = storage.getFahrerDaten();
  const fahrt = fahrten.find(f => f.datum === datum && f.zeit === zeit);
  if (!fahrt) return;
  if (!fahrt.mitfahrer) fahrt.mitfahrer = [];
  if (!fahrt.mitfahrer.includes(email)) {
    fahrt.mitfahrer.push(email);
    fahrt.freiePlaetze--;
    // Entferne alle Storno-Benachrichtigungen für diesen Mitfahrer
    if (fahrt.nachrichten) {
      fahrt.nachrichten = fahrt.nachrichten.filter(msg =>
        !(msg.typ === 'storno' && msg.text.includes(email))
      );
    }
  }
  fahrt.anfragen = fahrt.anfragen.filter(e => e !== email);
  storage.saveFahrerDaten(fahrten);
  window.zeigeMeineFahrten();
};

window.anfrageAblehnen = function(datum, zeit, email) {
  const storage = setupStorage();
  const fahrten = storage.getFahrerDaten();
  const fahrt = fahrten.find(f => f.datum === datum && f.zeit === zeit);
  if (!fahrt) return;
  fahrt.anfragen = fahrt.anfragen.filter(e => e !== email);
  storage.saveFahrerDaten(fahrten);
  window.zeigeMeineFahrten();
};


// Dark Mode Umschalter global verfügbar machen
window.toggleDarkMode = function() {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
  // Button-Icon ggf. anpassen
  const btn = document.getElementById('darkModeBtn');
  if (btn) {
    btn.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
  }
};

function logout() {
  const storage = setupStorage();
  localStorage.removeItem('loggedInUser');
  const menu = document.getElementById('mainMenu');
  if (menu) menu.style.display = 'none'; // Menü ausblenden nach Logout
  zeigeBereich('welcomeBox');
}

// Fahrerformular um neue Felder ergänzen
  window.zeigeBenutzereinstellungen = function () {
  const storage = setupStorage();
  const loggedInUser = storage.getLoggedInUser();
  if (!loggedInUser) return;
  const users = storage.getUsers();
  const user = users.find((u) => u.email === loggedInUser);
  if (user) {
    document.getElementById("firstName").value = user.firstName || "";
    document.getElementById("lastName").value = user.lastName || "";
    document.getElementById("homeAddress").value = user.homeAddress || "";
    document.getElementById("gender").value = user.gender || "";
    document.getElementById("phone").value = user.phone || "";
  }
  const phone = user?.phone || ''; // Telefonnummer holen
  zeigeBereich('userSettings');
};


/*window.zeigeFahrerListe = function () {
  const storage = setupStorage();
  const fahrerDaten = storage.getFahrerDaten().filter(f => f.freiePlaetze > 0);
  const fahrerListeContent = document.getElementById('fahrerListeContent');
  fahrerListeContent.innerHTML = '';

  if (!fahrerDaten || fahrerDaten.length === 0) {
    fahrerListeContent.innerHTML = '<p>Keine Fahrer gefunden.</p>';
  } else {
    fahrerDaten.forEach((fahrer, idx) => {
  const loggedInUser = storage.getLoggedInUser();
  const istEigeneFahrt = fahrer.fahrer === loggedInUser;
  const buttonHtml = !istEigeneFahrt
    ? `<button onclick="anfrageSenden(${idx})">Anfrage senden</button>`
    : '';
  const div = document.createElement('div');
  div.className = 'fahrer-item';
  div.innerHTML = `
  <div class="fahrer-info">
    <b>${fahrer.firstName || ''} ${fahrer.lastName || ''}</b><br>
    <span>Start: ${fahrer.start || ''}</span><br>
    <span>Ziel: ${fahrer.ziel || ''}</span><br>
    <span>Datum: ${fahrer.datum || ''} ${fahrer.zeit || ''}</span><br>
    <span>Freie Plätze: ${fahrer.freiePlaetze || 0}</span><br>
    <span>Preis: ${fahrer.preis ? fahrer.preis.toFixed(2) : '0.00'} €</span>
  </div>
  <div class="fahrer-action">
    ${buttonHtml}
  </div>
`;
  fahrerListeContent.appendChild(div);
});
  }

  zeigeBereich('fahrerListe');
};
*/

window.zeigeFahrerListe = function () {
  const storage = setupStorage();
  const fahrerDaten = storage.getFahrerDaten().filter(f => f.freiePlaetze > 0);
  zeigeGefilterteFahrer(fahrerDaten); // Zeige zunächst ALLE Fahrer
  zeigeBereich('fahrerListe');
};

window.zeigeImpressum = function() {
  const modal = document.getElementById('impressumModal');
  if (modal) modal.classList.add('show');
};

window.schliesseImpressum = function() {
  const modal = document.getElementById('impressumModal');
  if (modal) modal.classList.remove('show');
};

// --- Buchung stornieren ---
window.buchungStornieren = function(datum, zeit) {
  const storage = setupStorage();
  const fahrten = storage.getFahrerDaten();
  const loggedInUser = storage.getLoggedInUser();
  const fahrt = fahrten.find(f => f.datum === datum && f.zeit === zeit);
  if (!fahrt) return;
  // Mitfahrer austragen
  if (fahrt.mitfahrer) {
    fahrt.mitfahrer = fahrt.mitfahrer.filter(m => m !== loggedInUser);
    fahrt.freiePlaetze++;
  }
  // Entferne auch eventuelle alte Anfragen dieses Nutzers
if (fahrt.anfragen) {
  fahrt.anfragen = fahrt.anfragen.filter(a => a !== loggedInUser);
}
  // Fahrer benachrichtigen (z.B. per Nachricht im Objekt)
  if (!fahrt.nachrichten) fahrt.nachrichten = [];
  fahrt.nachrichten.push({
    typ: 'storno',
    text: `Mitfahrer ${loggedInUser} hat die Buchung storniert.`,
    zeit: new Date().toISOString()
  });
  storage.saveFahrerDaten(fahrten);
  alert('Buchung storniert. Der Fahrer wurde informiert.');
  window.zeigeMeineFahrten();
};

window.fahrtStornieren = function(datum, zeit) {
  const storage = setupStorage();
  const fahrten = storage.getFahrerDaten();
  const users = storage.getUsers();
  const fahrtIndex = fahrten.findIndex(f => f.datum === datum && f.zeit === zeit);
  if (fahrtIndex === -1) return alert('Fahrt nicht gefunden.');
  const fahrt = fahrten[fahrtIndex];

  // Mitfahrer-Emails sammeln
  let mitfahrerEmails = [];
  if (fahrt.mitfahrer && fahrt.mitfahrer.length > 0) {
    mitfahrerEmails = fahrt.mitfahrer
      .map(email => users.find(u => u.email === email)?.email)
      .filter(Boolean);
  }

  // E-Mail-Programm öffnen
  if (mitfahrerEmails.length > 0) {
    const subject = encodeURIComponent('Fahrt storniert');
    const body = encodeURIComponent(`Die Fahrt am ${formatDate(fahrt.datum)} um ${fahrt.zeit} von ${fahrt.start} nach ${fahrt.ziel} wurde vom Fahrer storniert.`);
    window.location.href = `mailto:${mitfahrerEmails.join(',')}` +
      `?subject=${subject}&body=${body}`;
  }

  // Benachrichtigung für Mitfahrer im LocalStorage speichern
  mitfahrerEmails.forEach(email => {
    const key = `benachrichtigung_${email}`;
    localStorage.setItem(key, `Die Fahrt am ${formatDate(fahrt.datum)} um ${fahrt.zeit} von ${fahrt.start} nach ${fahrt.ziel} wurde vom Fahrer storniert.`);
  });

  // Fahrt löschen
  fahrten.splice(fahrtIndex, 1);
  storage.saveFahrerDaten(fahrten);

  setTimeout(() => window.zeigeMeineFahrten(), 500);
};

function filterFahrerListe() {
  const stadt = document.getElementById('filterStadt').value.trim().toLowerCase();
  const ziel = document.getElementById('filterZiel').value.trim().toLowerCase();
  const datumVon = document.getElementById('filterDatumVon').value;
  const datumBis = document.getElementById('filterDatumBis').value;
  const storage = setupStorage();
  let fahrerDaten = storage.getFahrerDaten().filter(f => f.freiePlaetze > 0);

  if (stadt) {
    fahrerDaten = fahrerDaten.filter(f => (f.start || '').toLowerCase().includes(stadt));
  }
  if (ziel) {
    fahrerDaten = fahrerDaten.filter(f => (f.ziel || '').toLowerCase().includes(ziel));
  }
  if (datumVon) {
    fahrerDaten = fahrerDaten.filter(f => f.datum && f.datum >= datumVon);
  }
  if (datumBis) {
    fahrerDaten = fahrerDaten.filter(f => f.datum && f.datum <= datumBis);
  }

  // Prüfe, ob Filter auf Vergangenheit geht
  let zeigeVergangene = false;
  if (datumVon || datumBis) {
    zeigeVergangene = true;
  }

  zeigeGefilterteFahrer(fahrerDaten, {zeigeVergangene});
}

function resetFahrerFilter() {
  document.getElementById('filterStadt').value = '';
  document.getElementById('filterZiel').value = '';
  document.getElementById('filterDatumVon').value = '';
  document.getElementById('filterDatumBis').value = '';
  filterFahrerListe();
}

// Hilfsfunktion: zeigt die gefilterte Liste an
function zeigeGefilterteFahrer(fahrerDaten, {zeigeVergangene = false} = {}){
  // Nur zukünftige Fahrten, wenn nicht explizit vergangene gewünscht
  if (!zeigeVergangene) {
    const heute = new Date();
    heute.setHours(0,0,0,0);
    fahrerDaten = fahrerDaten.filter(f => {
      const d = new Date(f.datum);
      d.setHours(0,0,0,0);
      return d >= heute;
    });
  }

  // HIER: Nach Datum sortieren (aufsteigend)
  fahrerDaten.sort((a, b) => new Date(a.datum) - new Date(b.datum));

  const fahrerListeContent = document.getElementById('fahrerListeContent');
  if (!fahrerDaten.length) {
    fahrerListeContent.innerHTML = '<p>Keine passende Fahrten gefunden.</p>';
    return;
  }
  fahrerListeContent.innerHTML = fahrerDaten.map((f, idx) => {
  const storage = setupStorage();
  const loggedInUser = storage.getLoggedInUser();
  const istEigeneFahrt = f.fahrer === loggedInUser;
  const buttonHtml = !istEigeneFahrt
    ? `<button class="anfrage-button" onclick="anfrageSenden('${f.datum}','${f.zeit}','${f.start}','${f.ziel}')">Anfrage senden</button>`
    : '';
  return `
  <div class="fahrer-item">
    <div class="fahrer-info">
      <div class="fahrt-zeile">
        <span class="fahrt-icon">🗓️</span>
        <span class="fahrt-datum">${formatDate(f.datum)} um ${f.zeit || ''} Uhr</span>
      </div>
      <div class="fahrt-zeile">
        <span class="fahrt-icon">🚗</span>
        <span class="fahrt-route">${f.start || ''} → ${f.ziel || ''}</span>
      </div>
      <div class="fahrt-zeile">
        <span class="fahrt-icon">💺</span>
        <span class="fahrt-plaetze">
          <span>
            ${
              f.mitfahrer && f.mitfahrer.length > 0
                ? f.mitfahrer.length + ' ' + plural(f.mitfahrer.length, 'Platz gebucht', 'Plätze gebucht')
                : 'Keine Plätze gebucht'
            }
          </span>
          <span style="margin: 0 0.5em;">•</span>
          <span>
            ${
              f.freiePlaetze > 0
                ? f.freiePlaetze + ' ' + plural(f.freiePlaetze, 'Platz frei', 'Plätze frei')
                : 'Keine Plätze frei'
            }
          </span>
          <span style="margin: 0 0.5em;">•</span>
          <span>
            ${f.preis ? f.preis.toFixed(2) : '0.00'} € pro Person
          </span>
        </span>
      </div>
      <div class="fahrt-anbieter">
        Fahrt angeboten von <b>${f.firstName || ''} ${f.lastName || ''}</b>
        ${f.phone ? `<a href="https://wa.me/${f.phone.replace(/^0/, '49')}" target="_blank" title="WhatsApp"><img src="WhatsAppIcon.svg" alt="WhatsApp" style="width:2.0em; height:2.0em; vertical-align:middle; margin-right:0.3em;"></a>${f.phone}` : ''}
      </div>
    </div>
    <div class="fahrer-action">
      ${buttonHtml}
    </div>
  </div>
`;
}).join('');
}

// Optional: Beim Laden der Fahrerliste Filter anwenden
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('fahrerListeContent')) {
    filterFahrerListe();
  }
});


window.addEventListener('DOMContentLoaded', () => {
  const storage = setupStorage();
  const menu = document.getElementById('mainMenu');
  if (menu) {
    if (!storage.getLoggedInUser()) {
      menu.style.display = 'none';
    } else {
      menu.style.display = '';
    }
  }
  // ...dein bestehender Code...
});

// --- Fahrer-Filter-Funktionen ---
window.toggleFahrerFilter = function() {
  const box = document.getElementById('fahrerFilterBox');
  if (box) box.style.display = box.style.display === 'none' ? 'block' : 'none';
};

window.hideFahrerFilter = function() {
  const box = document.getElementById('fahrerFilterBox');
  if (box) box.style.display = 'none';
};