import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// загрузка единого хранилища React Redux
import { Provider } from 'react-redux'
import store from './storage/store.js'

import './main.css';
// использование на странице компонентов primereact
import 'primeflex/primeflex.css';
import 'primereact/resources/primereact.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import App from './App.jsx'

// русский язык в компонентах primereact
import { locale, addLocale } from 'primereact/api';

import localeFile from './ru.json'


// получение корня языкового файла
const rootkey = Object.keys(localeFile)[0];

// чтение данных используя корень языкового файла
let newLocale = localeFile[rootkey];

// добавить русский в список доступных языков
addLocale('ru', newLocale);

// установить русский язык
locale('ru');

// для использования единого хранилища любой частью приложения,
// оборачиваем все приложение в компонент Provider пакета React Redux
createRoot(document.getElementById('root')).render(
  
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
