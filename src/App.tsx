
import React, { useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { toast } from 'sonner';

// Component to listen for new user registrations and show notifications
const UserRegistrationListener = () => {
  const { user } = useAuth();
  
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      // Only show notifications for admins
      if (!user || user.role !== 'admin') return;
      
      if (event.key === 'userRegistration' && event.newValue) {
        try {
          const data = JSON.parse(event.newValue);
          if (data.action === 'register') {
            toast.success(`New User Registration`, {
              description: `${data.userName} (${data.email}) has registered as a ${data.role}`,
              duration: 8000,
              action: {
                label: "View Users",
                onClick: () => window.location.href = '/clients'
              }
            });
          }
        } catch (error) {
          console.error('Error parsing user registration data', error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user]);
  
  return null;
};

// Main App component
const App = () => {
  return (
    <div>
      <UserRegistrationListener />
      {/* Rest of your application */}
    </div>
  );
};

export default App;
