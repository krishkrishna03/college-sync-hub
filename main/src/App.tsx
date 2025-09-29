import React, { useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LoadingSpinner from './components/UI/LoadingSpinner';
import apiService from './services/api';

function App() {
  const { state, dispatch } = useAuth();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        try {
          // Set loading to false initially to prevent hydration issues
          dispatch({ type: 'LOGIN_START' });
          // Verify token is still valid by fetching current user
          const currentUser = await apiService.getCurrentUser();
          dispatch({ 
            type: 'LOGIN_SUCCESS', 
            payload: { user: currentUser, token } 
          });
        } catch (error) {
          console.error('Token validation failed:', error);
          // Clear invalid token
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        // No token found, user needs to login
        dispatch({ type: 'LOGOUT' });
      }
    };

    initializeAuth();
  }, [dispatch]);

  // Show loading spinner while checking authentication
  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error if there's an authentication error
  if (state.error && !state.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Authentication Error</h2>
            <p className="text-red-600 mb-4">{state.error}</p>
            <button
              onClick={() => {
                dispatch({ type: 'CLEAR_ERROR' });
                dispatch({ type: 'LOGOUT' });
              }}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="App min-h-screen bg-gray-50">
      {state.user ? <Dashboard /> : <Login />}
    </div>
  );
}

export default App;