import { createBrowserRouter } from 'react-router'
import LandingPage from '../../pages/LandingPage'
import MainPage from '../../pages/MainPage/mainpage'
import SearchPage from '../../pages/SearchPage/SearchPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/main',
    element: <MainPage />,
  },
  {
    path: '/search',
    element: <SearchPage />,
  },
])
