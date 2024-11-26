import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'


import './App.css'
import { LoginPage, TasksPage } from './pages';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Header } from './components/Header';

function App() {

  // https://stackoverflow.com/questions/52856010/style-background-color-of-root-react-javascript
  /* установка фона для корневого компонента
  const style={ background: "linear-gradient(#e66465, #9198e5)" };
  <main className='container content' style={style}>
  */
  return (
    <Router>
      <Header />
      <main className='content'>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path='/' element={<TasksPage />} />
          </Route>

          <Route path='/login' element={<LoginPage />} />

          <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
      </main>
    </Router>
  )
}

export default App
