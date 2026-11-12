import { createBrowserRouter } from 'react-router'
import LandingPage from '../../pages/LandingPage'
import MainPage from '../../pages/MainPage/mainpage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/main',
    element: <MainPage />,
  },
])
