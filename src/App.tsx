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

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [user, setUser] = useState<User | null>(null);
  const [patientDetails, setPatientDetails] = useState<PatientDetails | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisResult[]>([]);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User'
        });
        fetchAnalysisHistory(session.user.id);
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
        setCurrentPage('patient-details');
        fetchAnalysisHistory(session.user.id);
        fetchPatientDetails(session.user.id);
      } else {
        setUser(null);
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
      if (data.age) { // If age exists, they completed the form
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
      setCurrentPage('analysis');
      }
    }
  };

  const fetchAnalysisHistory = async (userId: string) => {
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
        patientDetails: patientDetails! // Simplification for now
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
      // User is logged in and has patient details, go to analysis
      setCurrentPage('analysis');
    } else {
      setCurrentPage(page);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setPatientDetails(null);
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
        />
      )}
      
      {currentPage === 'contact' && (
        <ContactPage />
      )}
    </div>
  );
}