import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import Dashboard from './pages/Dashboard';
import Requests from './pages/Requests';
import RequestForm from './pages/RequestForm';
import Lots from './pages/Lots';
import CalendarPage from './pages/Calendar';
import Budget from './pages/Budget';
import References from './pages/References';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: 'requests', Component: Requests },
      { path: 'requests/:id', Component: RequestForm },
      { path: 'lots', Component: Lots },
      { path: 'calendar', Component: CalendarPage },
      { path: 'budget', Component: Budget },
      { path: 'references', Component: References },
    ],
  },
]);
