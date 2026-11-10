import { createBrowserRouter } from 'react-router'
import MainPage from '../../pages/MainPage/mainpage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainPage />,
  },
])
