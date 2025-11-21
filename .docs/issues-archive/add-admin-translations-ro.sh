#!/bin/bash

# Add admin and account translations to Romanian locale

# Remove the last closing brace
head -n -1 i18n/locales/ro.json > i18n/locales/ro.temp.json

# Add the new sections
cat >> i18n/locales/ro.temp.json <<'EOF'
  },
  "admin": {
    "navigation": {
      "toggleSidebar": "Comutare bară laterală",
      "notifications": "Notificări",
      "dashboard": "Tablou de bord",
      "products": "Produse",
      "inventory": "Inventar",
      "orders": "Comenzi",
      "users": "Utilizatori",
      "analytics": "Analize",
      "tools": "Instrumente",
      "testing": "Testare"
    },
    "products": {
      "select": "Selectează produs"
    },
    "users": {
      "loading": "Se încarcă utilizatorii...",
      "retry": "Reîncearcă încărcarea",
      "columns": {
        "user": "Utilizator",
        "email": "Email",
        "status": "Status",
        "orders": "Comenzi",
        "totalSpent": "Total Cheltuit",
        "registered": "Înregistrat",
        "lastLogin": "Ultima Autentificare",
        "actions": "Acțiuni"
      }
    }
  },
  "account": {
    "navigation": {
      "logout": "Deconectare",
      "profile": "Profilul Meu",
      "orders": "Comenzile Mele",
      "settings": "Setări"
    }
  }
}
EOF

# Replace the original file
mv i18n/locales/ro.temp.json i18n/locales/ro.json

echo "Romanian translations updated!"
