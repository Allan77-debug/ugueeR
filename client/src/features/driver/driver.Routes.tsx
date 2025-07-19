// Ruta: UGUEER/client/src/components/features/driver/driver.routes.tsx
import { RouteObject } from 'react-router-dom';
// Importa tus componentes de layout y página del driver
import DriverPageLayout from './components/layout/DriverPageLayout';
import MyDriverRoutesPage from './pages/MyDriverRoutesPage';
import MyDriverVehiclesPage from './pages/MyDriverVehiclesPage';
import MyDriverTripsPage from './pages/MyDriverTripsPage';

export const driverDashboardRoutes: RouteObject[] = [
  {
    // Esta es la ruta base para todo el dashboard del conductor.
    // Será relativa a donde la montes en App.tsx.
    // Si en App.tsx montas esto en '/app/driver', entonces:
    // '/app/driver' -> MyDriverRoutesPage (por el index: true)
    // '/app/driver/my-routes' -> MyDriverRoutesPage
    // '/app/driver/my-vehicles' -> MyDriverVehiclesPage
    // '/app/driver/my-trips' -> MyDriverTripsPage
    path: '', // Dejar vacío o '/' si quieres que sea la ruta base del path padre
    element: <DriverPageLayout />,
    children: [
      {
        index: true, // Esta será la ruta por defecto cuando se acceda a la ruta padre
        element: <MyDriverRoutesPage />,
      },
      {
        path: 'my-routes',
        element: <MyDriverRoutesPage />,
      },
      {
        path: 'my-vehicles',
        element: <MyDriverVehiclesPage />,
      },
      {
        path: 'my-trips',
        element: <MyDriverTripsPage />,
      },
      // Puedes añadir más rutas aquí si el dashboard del conductor crece
      // { path: 'settings', element: <DriverSettingsPage /> },
    ],
  },
];