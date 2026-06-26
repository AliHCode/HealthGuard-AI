import { useState, useEffect } from 'react';
import { HomePage } from './components/HomePage';
import { AuthPage } from './components/AuthPage';
import { PatientDetailsForm } from './components/PatientDetailsForm';
import { AnalysisPage } from './components/AnalysisPage';
import { DashboardPage } from './components/DashboardPage';
import { ContactPage } from './components/ContactPage';
import { Navbar } from './components/Navbar';
import { supabase } from './lib/supabase';

type Page = 'home' | 'auth' | 'patient-details' | 'analysis' | 'contact';

export interface User {
  id: string;
  email: string;
  name: string;
  role?: 'patient' | 'asha_worker' | 'doctor';
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
  heatmapImage?: string;
  timestamp: Date;
  patientDetails: PatientDetails;
}

const getPageFromPath = (): Page => {
  const path = window.location.pathname.replace(/^\/+/g, '');
  if (path === 'analysis') return 'analysis';
  if (path === 'contact') return 'contact';
  if (path === 'auth') return 'auth';
  if (path === 'patient-details') return 'patient-details';
  return 'home';
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>(getPageFromPath());
  const [user, setUser] = useState<User | null>(null);
  const [patientDetails, setPatientDetails] = useState<PatientDetails | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisResult[]>([]);
  const [dashboardTab, setDashboardTab] = useState<'overview' | 'triage' | 'patients' | 'analytics' | 'settings'>('overview');

  // Handle URL change when page switches
  useEffect(() => {
    const path = currentPage === 'home' ? '/' : `/${currentPage}`;
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
  }, [currentPage]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPage(getPageFromPath());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User'
        });
        fetchPatientDetails(session.user.id);
      }
    });

    // Listen for changes on auth state (login, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User'
        });
        fetchPatientDetails(session.user.id);
      } else {
        setUser(null);
        setPatientDetails(null);
        setAnalysisHistory([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchPatientDetails = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
      
    if (data) {
      setUser(prev => prev ? { ...prev, role: data.role } : null);
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

      // Only redirect to analysis if the user is currently on an auth or secure onboarding page.
      // E.g. if they loaded home '/' or '/contact' directly, do not kick them to the dashboard.
      const currentPath = window.location.pathname.replace(/^\/+/g, '');
      if (
        currentPath === 'auth' || 
        currentPath === 'patient-details' || 
        currentPath === 'analysis' || 
        currentPage === 'auth' || 
        currentPage === 'patient-details'
      ) {
        setCurrentPage('analysis');
      }

      fetchAnalysisHistory(userId, details);
    } else {
      setPatientDetails(null);
      
      // If no profile, they must onboarding only if trying to access secure pages
      const currentPath = window.location.pathname.replace(/^\/+/g, '');
      if (
        currentPath === 'analysis' || 
        currentPath === 'patient-details' || 
        currentPage === 'analysis' || 
        currentPage === 'patient-details'
      ) {
        setCurrentPage('patient-details');
      }
      fetchAnalysisHistory(userId, null);
    }
  };

  const fetchAnalysisHistory = async (userId: string, currentDetails: PatientDetails | null) => {
    const { data, error } = await supabase
      .from('analysis_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
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
        patientDetails: currentDetails || {
          fullName: user?.name || 'Unknown Patient',
          age: '',
          gender: '',
          phone: '',
          address: '',
          emergencyContact: '',
          medicalHistory: ''
        }
      }));
      setAnalysisHistory(history);
    }
  };

  const handlePatientDetailsSubmit = async (details: PatientDetails) => {
    if (user) {
      const { error } = await supabase.from('profiles').upsert({
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
      if (error) {
        console.error("Error upserting profile:", error);
      }
    }
    setPatientDetails(details);
    setCurrentPage('analysis');
  };

  const handleNavigate = (page: Page) => {
    if (page === 'analysis') {
      // If user is not logged in, go to auth
      if (!user) {
        setCurrentPage('auth');
        return;
      }
      // If user is logged in but no patient details, go to patient details
      if (!patientDetails) {
        setCurrentPage('patient-details');
        return;
      }
      // User is logged in and has patient details, go to analysis overview
      setDashboardTab('overview');
      setCurrentPage('analysis');
    } else if (page === 'patient-details') {
      // Intercept profile edit clicks and direct to Dashboard Settings
      if (user && patientDetails) {
        setDashboardTab('settings');
        setCurrentPage('analysis');
      } else {
        setCurrentPage('patient-details');
      }
    } else {
      setCurrentPage(page);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setPatientDetails(null);
    setDashboardTab('overview');
    setCurrentPage('home');
  };

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysisHistory(prev => [result, ...prev]);
  };

  return (
    <div className="min-h-screen bg-white">
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
      
      {currentPage === 'analysis' && user && patientDetails && (
        <DashboardPage 
          user={user}
          patientDetails={patientDetails}
          onAnalysisComplete={handleAnalysisComplete}
          history={analysisHistory}
          initialTab={dashboardTab}
          onUpdatePatientDetails={handlePatientDetailsSubmit}
        />
      )}
      
      {currentPage === 'contact' && (
        <ContactPage />
      )}
    </div>
  );
}