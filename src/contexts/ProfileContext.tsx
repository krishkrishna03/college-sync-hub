import { createContext, useContext, useState, ReactNode } from 'react';

interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  department: string;
}

interface ProfileContextType {
  profileData: ProfileData;
  updateProfile: (data: ProfileData) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: "John Doe",
    email: "john.doe@abcengineering.edu",
    phone: "+1 234 567 8900",
    department: "Computer Science"
  });

  const updateProfile = (data: ProfileData) => {
    setProfileData(data);
  };

  return (
    <ProfileContext.Provider value={{ profileData, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}