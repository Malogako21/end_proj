import { configureStore } from '@reduxjs/toolkit';
import authSlice from "./authSlice";


/* 

подключим редьюсер, созданный в срезе,  в общее хранилище.

вызываем функцию configureStore() 
и передаем в нее объект со свойством reducer. 
А вот уже в reducer мы указываем объект с нашими редьюсерами. 
*/
const store = configureStore({
  reducer: {
    // У общего состояния state ключи будут такими же, как у этого объекта.
    // редьюсер authReducer передается под ключем auth
    auth: authSlice,
  },
})

export default store
