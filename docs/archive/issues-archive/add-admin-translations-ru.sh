#!/bin/bash

# Add admin and account translations to Russian locale

# Remove the last closing brace
head -n -1 i18n/locales/ru.json > i18n/locales/ru.temp.json

# Add the new sections
cat >> i18n/locales/ru.temp.json <<'EOF'
  },
  "admin": {
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
  },
  "account": {
    "navigation": {
      "logout": "Выйти",
      "profile": "Мой профиль",
      "orders": "Мои заказы",
      "settings": "Настройки"
    }
  }
}
EOF

# Replace the original file
mv i18n/locales/ru.temp.json i18n/locales/ru.json

echo "Russian translations updated!"
