import json

# Update Romanian
with open('i18n/locales/ro.json', 'r', encoding='utf-8') as f:
    ro = json.load(f)

ro['admin'] = {
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
}

ro['account'] = {
    "navigation": {
        "logout": "Deconectare",
        "profile": "Profilul Meu",
        "orders": "Comenzile Mele",
        "settings": "Setări"
    }
}

with open('i18n/locales/ro.json', 'w', encoding='utf-8') as f:
    json.dump(ro, f, ensure_ascii=False, indent=2)

# Update Russian
with open('i18n/locales/ru.json', 'r', encoding='utf-8') as f:
    ru = json.load(f)

ru['admin'] = {
    "navigation": {
        "toggleSidebar": "Переключить боковую панель",
        "notifications": "Уведомления",
        "dashboard": "Панель управления",
        "products": "Товары",
        "inventory": "Инвентарь",
        "orders": "Заказы",
        "users": "Пользователи",
        "analytics": "Аналитика",
        "tools": "Инструменты",
        "testing": "Тестирование"
    },
    "products": {
        "select": "Выбрать товар"
    },
    "users": {
        "loading": "Загрузка пользователей...",
        "retry": "Повторить загрузку",
        "columns": {
            "user": "Пользователь",
            "email": "Электронная почта",
            "status": "Статус",
            "orders": "Заказы",
            "totalSpent": "Всего потрачено",
            "registered": "Зарегистрирован",
            "lastLogin": "Последний вход",
            "actions": "Действия"
        }
    }
}

ru['account'] = {
    "navigation": {
        "logout": "Выйти",
        "profile": "Мой профиль",
        "orders": "Мои заказы",
        "settings": "Настройки"
    }
}

with open('i18n/locales/ru.json', 'w', encoding='utf-8') as f:
    json.dump(ru, f, ensure_ascii=False, indent=2)

print("✓ Romanian translations updated")
print("✓ Russian translations updated")
