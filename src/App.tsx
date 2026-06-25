import { useState, useEffect } from 'react';
import { HomePage } from './components/HomePage';
import { AuthPage } from './components/AuthPage';
import { PatientDetailsForm } from './components/PatientDetailsForm';
import { AnalysisPage } from './components/AnalysisPage';
import { ContactPage } from './components/ContactPage';
import { Navbar } from './components/Navbar';
import { DashboardPage } from './components/DashboardPage';
import { supabase } from './lib/supabase';

type Page = 'home' | 'auth' | 'patient-details' | 'analysis' | 'contact' | 'dashboard';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'patient' | 'asha_worker' | 'doctor';
}

export interface PatientDetails {
  fullName: string;
  age: string;
  gender: string;
  phone: string;
  address: string;
  emergencyContact: string;
  medicalHistory: string;
}

export interface AnalysisResult {
  disease: 'pneumonia' | 'malaria';
  detected: boolean;
  confidence: number;
  severity?: 'Mild' | 'Moderate' | 'Severe';
  originalImage: string;
  processedImage: string;
  timestamp: Date;
  patientDetails: PatientDetails;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [user, setUser] = useState<User | null>(null);
  const [patientDetails, setPatientDetails] = useState<PatientDetails | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisResult[]>([]);
  const [selectedClinicalResult, setSelectedClinicalResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        handleAuthUser(session.user);
      }
    });

    // Listen for changes on auth state (login, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        handleAuthUser(session.user);
      } else {
        setUser(null);
        setAnalysisHistory([]);
        setPatientDetails(null);
        setCurrentPage('home');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthUser = async (authUser: any) => {
    // 1. Fetch user profile role and info
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();

    let userRole: 'patient' | 'asha_worker' | 'doctor' = 
      profile?.role || authUser.user_metadata?.role || 'patient';
    let fullName = 
      profile?.full_name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User';

    // 2. Create profile if it does not exist
    if (!profile) {
      await supabase.from('profiles').insert([{
        id: authUser.id,
        full_name: fullName,
        role: userRole
      }]);
    }

    const currentUser: User = {
      id: authUser.id,
      email: authUser.email || '',
      name: fullName,
      role: userRole
    };

    setUser(currentUser);
    fetchAnalysisHistory(authUser.id, userRole);

    // 3. Route user based on role
    if (userRole === 'doctor' || userRole === 'asha_worker') {
      setCurrentPage('dashboard');
    } else {
      // Check if patient details completed
      if (profile && profile.age) {
        const details: PatientDetails = {
          fullName: profile.full_name || '',
          age: profile.age || '',
          gender: profile.gender || '',
          phone: profile.phone || '',
          address: profile.address || '',
          emergencyContact: profile.emergency_contact || '',
          medicalHistory: profile.medical_history || ''
        };
        setPatientDetails(details);
        setCurrentPage('analysis');
      } else {
        setCurrentPage('patient-details');
      }
    }
  };

  const fetchPatientDetails = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
      
    if (data && data.age) { // If age exists, they completed the form
      const details: PatientDetails = {
        fullName: data.full_name || '',
        age: data.age || '',
        gender: data.gender || '',
        phone: data.phone || '',
        address: data.address || '',
        emergencyContact: data.emergency_contact || '',
        medicalHistory: data.medical_history || ''
      };
      setPatientDetails(details);
      if (user?.role === 'patient') {
        setCurrentPage('analysis');
      }
    }
  };

  const fetchAnalysisHistory = async (userId: string, role: string) => {
    // If doctor or asha, they fetch all history for screening
    let query = supabase.from('analysis_history').select('*');
    
    if (role === 'patient') {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
      
    if (data && !error) {
      // Map database snake_case to frontend camelCase
      const history: AnalysisResult[] = data.map((item: any) => ({
        disease: item.disease_type,
        detected: item.detected,
        confidence: item.confidence,
        severity: item.severity,
        originalImage: item.image_url,
        processedImage: item.image_url,
        timestamp: new Date(item.created_at),
        patientDetails: {
          fullName: item.profiles?.full_name || 'Anonymous Patient',
          age: item.profiles?.age || 'Unknown',
          gender: item.profiles?.gender || 'Unknown',
          phone: item.profiles?.phone || '',
          address: item.profiles?.address || '',
          emergencyContact: item.profiles?.emergency_contact || '',
          medicalHistory: item.profiles?.medical_history || ''
        }
      }));
      setAnalysisHistory(history);
    }
  };

  const handlePatientDetailsSubmit = async (details: PatientDetails) => {
    if (user) {
      await supabase.from('profiles').upsert({
        id: user.id,
        full_name: details.fullName,
        age: details.age,
        gender: details.gender,
        phone: details.phone,
        address: details.address,
        emergency_contact: details.emergencyContact,
        medical_history: details.medicalHistory,
        updated_at: new Date().toISOString()
      });
    }
    setPatientDetails(details);
    
    if (user?.role === 'doctor' || user?.role === 'asha_worker') {
      setCurrentPage('dashboard');
    } else {
      setCurrentPage('analysis');
    }
  };

  const handleNavigate = (page: Page) => {
    if (page === 'analysis') {
      if (!user) {
        setCurrentPage('auth');
        return;
      }
      if (user.role === 'doctor' || user.role === 'asha_worker') {
        setCurrentPage('dashboard');
        return;
      }
      if (!patientDetails) {
        setCurrentPage('patient-details');
        return;
      }
      setCurrentPage('analysis');
    } else {
      setCurrentPage(page);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setPatientDetails(null);
    setSelectedClinicalResult(null);
    setCurrentPage('home');
  };

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysisHistory(prev => [result, ...prev]);
  };

  const handleSelectPatientAnalysis = (patient: PatientDetails, result: AnalysisResult) => {
    setPatientDetails(patient);
    setSelectedClinicalResult(result);
    setCurrentPage('analysis');
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-white/30">
      <Navbar 
        currentPage={currentPage}
        onNavigate={handleNavigate}
        user={user}
        onLogout={handleLogout}
      />
      
      {currentPage === 'home' && (
        <HomePage onNavigate={handleNavigate} />
      )}
      
      {currentPage === 'auth' && (
        <AuthPage 
          onBack={() => setCurrentPage('home')}
        />
      )}
      
      {currentPage === 'patient-details' && user && (
        <PatientDetailsForm 
          onSubmit={handlePatientDetailsSubmit}
          user={user}
        />
      )}

      {currentPage === 'dashboard' && user && (
        <DashboardPage 
          user={user}
          onNavigate={handleNavigate}
          onSelectPatientAnalysis={handleSelectPatientAnalysis}
        />
      )}
      
      {currentPage === 'analysis' && user && patientDetails && (
        <AnalysisPage 
          user={user}
          patientDetails={patientDetails}
          onAnalysisComplete={handleAnalysisComplete}
          history={analysisHistory}
          initialResult={selectedClinicalResult}
          onClearInitialResult={() => setSelectedClinicalResult(null)}
        />
      )}
      
      {currentPage === 'contact' && (
        <ContactPage />
      )}
    </div>
  );
}