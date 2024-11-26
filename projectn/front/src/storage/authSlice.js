import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import Cookies from "universal-cookie";

const cookies = new Cookies();

// Создаем thunk
// Функция, которая принимает строку с типом действия Redux и функцию обратного вызова, которая должна возвращать промис.
// Он не генерирует никаких функций-редукторов, так как не знает, какие данные вы запрашиваете,
// как вы хотите отслеживать состояние загрузки или как нужно обрабатывать возвращаемые вами данные.
// Вам следует написать собственную логику-редуктор, которая обрабатывает эти действия с учётом состояния загрузки и логики обработки,
// подходящей для вашего приложения.
// строковое значение действия type, обратный вызов payloadCreator и объект options
/* 
 https://ru.hexlet.io/courses/js-redux-toolkit/lessons/async-thunks/theory_unit
 
 thunk, созданный через createAsyncThunk(), содержит внутри себя три события:
  pending
  fulfilled
  rejected
 Они соответствуют состояниям промиса и вызываются в Redux Toolkit в тот момент, 
 когда промис переходит в одно из этих состояний. 
 Не обязательно реагировать на все. Выбираем, что важно в приложении.
*/
export const thunkUserLogin = createAsyncThunk(
  // ошибка возникает, когда вы пытаетесь получить доступ к свойству неопределённого или нулевого объекта. Проверьте свой createAsyncThunk()

  // Id отображается в dev tools и должен быть уникальный у каждого thunk
  // 1 строковое значение действия type
  "login",

  // 2 обратный вызов payloadCreator
  // Функция обратного вызова, которая должна возвращать промис, содержащий результат выполнения некоторой асинхронной логики.
  // Это может быть стандартный запрос на получение данных AJAX, несколько вызовов AJAX с результатами, объединёнными в итоговое значение,
  // взаимодействие с React Native AsyncStorage и так далее.
  // Функция payloadCreator будет вызвана с двумя аргументами:
  // 1 - arg: одно значение, содержащее первый параметр, переданный создателю действия-обёртки при его отправке.
  // Это полезно для передачи таких значений, как идентификаторы элементов, которые могут потребоваться в запросе.
  // Если вам нужно передать несколько значений, передайте их вместе в виде объекта при отправке действия-обёртки,
  // например dispatch(fetchUsers({status: 'active', sortBy: 'name'})).
  // 2 - thunkAPIобъект, содержащий все параметры, которые обычно передаются в функцию-обёртку Redux
  // https://ru.hexlet.io/courses/js-redux-toolkit/lessons/async-thunks/theory_unit
  //async ({username, password}, thunkAPI) => {
  async ({ username, password }) => {
    // Здесь только логика запроса и возврата данных
    // Никакой обработки ошибок
    /*
        https://qna.habr.com/q/59246 
        Почему не работает post ajax запрос в Django? - добавил slash в конец( /registration/ajax/) и POST тоже заработал.
         При отправке POST запроса на URL без слэша в конце, django вам сначала отдает 301 статус, 
         а потом перенаправляет ваш запрос куда-следует уже без данных. В итоге вы получали 500 статус.
      */
    // Для POST - ОБЯЗАТЕЛЕН / в конце строки!
    const url_value = "/api/login/";
    const data_value = { username: username, password: password };

    const csrftoken = cookies.get("csrftoken");

    // выполнение запроса к серверу
    /* только такое оформление запроса принимает django - иначе отвергает из-за csrf */
    axios.defaults.withCredentials = true;
    const response = await axios({
      method: "post",
      url: url_value,
      data: data_value,
      responseType: "json",
      headers: {
        "X-CSRFToken": csrftoken,
      },
    });

    // возвращение результата запроса, полученного от сервера
    return response.data;
  }
);

// объект начального состояния
const initialState = {
  loading: false,
  userInfo: null, // для объекта пользователя
  // userToken,
  error: null,
  success: false,
};

// срез reduxjs-toolkit
// В документации Redux Toolkit предлагается объединять действия и редьюсеры в один файл
// Чтобы создать слайс, нужно минимум три компонента — имя, начальное состояние и набор редьюсеров.
const authSlice = createSlice({
  // имя слайса
  name: "auth",
  // начальное состояние — это базовая структура данных и какие-то изначальные данные, если они есть (например, значение 0 для счетчика).
  // Данные, которые нужно выкачать по API, к начальным не относятся. Они заполняются уже потом через действия.
  initialState,
  // Редьюсеры в слайсах мутируют состояние и ничего не возвращают наружу
  // Каждый редьюсер соответствует конкретному действию, поэтому внутри нет конструкции switch.
  reducers: {
    // ДЕЙСТВИЕ ВЫХОДА ПОЛЬЗОВАТЕЛЯ
    logout: (state) => {
      localStorage.removeItem("userToken"); // delete token from storage
      state.loading = false;
      state.userInfo = null;
      //state.userToken = null
      state.error = null;
    },
  },
  /*
  https://ru.hexlet.io/courses/js-redux-toolkit/lessons/extra-reducers/theory_unit
  Разделение данных по слайсам и по редьюсерам в Redux приводит к ситуациям, 
  когда на одно действие нужно реагировать в разных частях хранилища. 
  Например, если мы удаляем пост, то нужно удалить и комментарии к нему — а они находятся в другом слайсе.

  В Redux Toolkit между редьюсерами и действиями есть неразрывная связь. Это цена, которую мы платим за сокращение кода.

  Для реакции на действия, происходящие в других слайсах, Redux Toolkit добавляет extraReducers 
  — механизм дополнительных редьюсеров. 
  Работает он достаточно просто. В слайс добавляется свойство extraReducers, 
  через которое можно устанавливать реакцию (редьюсеры) на внешние действия:
  */
  extraReducers: (builder) => {
    builder
      .addCase(thunkUserLogin.pending, (state, action) => {
        // в состоянии установить значение ЗАГРУЗКА true
        state.loading = true;
        state.error = null;
      })
      .addCase(thunkUserLogin.fulfilled, (state, payload) => {
        //в состоянии установить значение ЗАГРУЗКА false
        state.loading = false;
        //в состоянии сохранить полученные данные пользователя
        state.userInfo = payload;
      })
      .addCase(thunkUserLogin.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },

  /*
  {
    // Дополнительные редьюсеры
    // Добавьте сюда редукторы для дополнительных типов действий и обрабатывайте состояние загрузки по мере необходимости
    
    // ВХОД ПОЛЬЗОВАТЕЛЯ
    // Вызывается прямо перед выполнением запроса
    [thunkUserLogin.pending]: (state) => {
      // в состоянии установить значение ЗАГРУЗКА true
      state.loading = true
      state.error = null
    },
    // Вызывается, если запрос успешно выполнился
    // При УСПЕШНОМ входе пользователя 
    [thunkUserLogin.fulfilled]: (state, { payload }) => {
      //в состоянии установить значение ЗАГРУЗКА false
      state.loading = false
      //в состоянии сохранить полученные данные пользователя
      state.userInfo = payload
      // state.userToken = payload.userToken
    },
    // Вызывается в случае ошибки
    // При ОШИБКЕ входа пользователя в состоянии установить значение ЗАГРУЗКА false и удалить в хранилище данные пользователя, если они там есть
    [thunkUserLogin.rejected]: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
  },
  */
});

/* 
  https://ru.hexlet.io/courses/js-redux-toolkit/lessons/slices/theory_unit
  Функция createSlice() генерирует редьюсер и действия к нему. 
  Все это официальная документация рекомендует экспортировать так:

  Редьюсер — по умолчанию
  Действия — по именам 
*/
export const { logout } = authSlice.actions;

export default authSlice.reducer;
