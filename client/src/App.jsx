import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SettlementsProvider } from './context/SettlementsContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

import Login from './features/auth/Login';
import Register from './features/auth/Register';
import GroupList from './features/groups/GroupList';
import CreateGroup from './features/groups/CreateGroup';
import GroupDetail from './features/groups/GroupDetail';
import AddMember from './features/groups/AddMember';
import AddVirtualMember from './features/groups/AddVirtualMember';
import AddBill from './features/bills/AddBill';
import BillDetail from './features/bills/BillDetail';
import Profile from './features/profile/Profile';
import Dashboard from './pages/Dashboard';
import Settlements from './pages/Settlements';
import History from './pages/History';
import Analytics from './pages/Analytics';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <SettlementsProvider>
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
          <Navbar />
          <main className="flex-grow container mx-auto px-4 sm-px-6 lg:px-8 py-8">
            <Routes>
              <Route element={<PublicRoute />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>

              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/settlements" element={<Settlements />} />
                <Route path="/history" element={<History />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/groups" element={<GroupList />} />
                <Route path="/groups/create" element={<CreateGroup />} />
                <Route path="/groups/:groupId/add-member" element={<AddMember />} />
                <Route path="/groups/:groupId/add-virtual-member" element={<AddVirtualMember />} />
                <Route path="/groups/:groupId" element={<GroupDetail />} />
                <Route path="/groups/:groupId/add-bill" element={<AddBill />} />
                <Route path="/bills/:billId" element={<BillDetail />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </SettlementsProvider>
    </AuthProvider>
  );
}

export default App;
