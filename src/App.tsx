import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Private, Public } from './layout'
import { RouterUrl } from './routes'
import { AdminHomepage, LoginPage } from './pages'

function App() {
  const router = createBrowserRouter([
    {
      path: '/',
      element:<Public />,
      children:[
        { path: RouterUrl.Login, element: <LoginPage />},
      ]
    },
    {
      path: RouterUrl.Login,
      element:<Private />,
      children:[
        { path: RouterUrl.AdminDashboard, element:<AdminHomepage />}
      ]
    }
  ])

  return (
    <RouterProvider router={router} fallbackElement={<h6>Loading...</h6>}  />
  )
}

export default App
