import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import { thunkUserLogin } from '../storage/authSlice'
import { Error } from '../components/Error'
import { Spinner } from '../components/Spinner'
import './LoginPage.css'

export const LoginPage = () => {


  // распаковка ключей объекта хранилища
  // состояние получения данных
  // объект пользователя
  // ошибка выполнения запроса к серверу
  const { loading, userInfo, error } = useSelector((state) => state.auth)
  const dispatch = useDispatch()

  const { register, handleSubmit } = useForm()

  const navigate = useNavigate()

  // перенаправление аутентифицированного пользователя на начальную страницу
  useEffect(() => {
    if (userInfo) {
      navigate('/')
    }
  }, [navigate, userInfo])

  const submitForm = (data) => {
    // console.log(data)
    // выполнение входа с сохранением результата в общем хранилище
    dispatch(thunkUserLogin(data))
  }


  /* https://blog.logrocket.com/handling-user-authentication-redux-toolkit
    Поля ввода на страницах регистрации подключены к React Hook Form, 
    которая корректно считывает значения ввода и возвращает их в функции handleSubmit
  */
  return (
    <div id="container">

        <form onSubmit={handleSubmit(submitForm)}>
          
          {error && <Error>{error}</Error>}
          
          <div className='form-group'>
            <label htmlFor='username'>Логин</label>
            <input
              type='text'
              className='form-input'
              {...register('username')}
              required
            />
          </div>
          
          <div className='form-group'>
            <label htmlFor='password'>Пароль</label>
            <input
              type='password'
              className='form-input'
              {...register('password')}
              required
            />
          </div>
          
          <button type='submit' id='submit' disabled={loading}>
            {loading ? <Spinner /> : 'Вход'}
          </button>
        </form>

    </div>
  )
}

