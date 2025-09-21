import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from "@/lib/api";

interface ProfileData {
  avatarUrl: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  role?: string;
  collegeId?: string;
  collegeName?: string;
}

interface ProfileContextType {
  profileData: ProfileData;
  updateProfile: (data: ProfileData) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profileData, setProfileData] = useState<ProfileData>({
    avatarUrl: "",
    fullName: "",
    email: "",
    phone: "",
    department: "",
    role: "",
    collegeId: "",
    collegeName: "",
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const user = await authAPI.getCurrentUser();
        // Map backend fields to ProfileData
        setProfileData({
          avatarUrl: user.avatarUrl || user.avatar || "",
          fullName: user.fullName || user.name || user.username || "",
          email: user.email || "",
          phone: user.phone || "",
          department: user.department || "",
          role: user.role || "",
          collegeId: user.collegeId || "",
          collegeName: user.collegeName || "",
        });
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    }
    fetchProfile();
  }, []);

  const updateProfile = async (data: ProfileData) => {
    try {
      await authAPI.updateProfile(data);
      setProfileData(data);
    } catch (error) {
      console.error("Failed to update profile:", error);
      throw error;
    }
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
