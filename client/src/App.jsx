import { Routes, Route, useNavigate } from 'react-router-dom';
import { SignedIn, SignedOut, SignIn, SignUp, useUser } from '@clerk/clerk-react';
import Dashboard from './pages/Dashboard';
import GroupDetail from './pages/GroupDetail';
import AuthPage from './pages/AuthPage'; // Import AuthPage
import { useEffect } from 'react';

function App() {
  const navigate = useNavigate();
  const { isSignedIn } = useUser();

  return (
    <div>
      <Routes>
        <Route path="/sign-in/*" element={
          <div className="full-screen-center">
            <SignIn routing="path" path="/sign-in" />
          </div>
        } />
        <Route path="/sign-up/*" element={
          <div className="full-screen-center">
            <SignUp routing="path" path="/sign-up" />
          </div>
        } />
        <Route
          path="/"
          element={
            <>
              <SignedIn>
                <Dashboard />
              </SignedIn>
              <SignedOut>
                <AuthPage />
              </SignedOut>
            </>
          }
        />
        <Route
          path="/group/:id"
          element={
            <SignedIn>
              <GroupDetail />
            </SignedIn>
          }
        />
      </Routes>
    </div>
  );
}

export default App;