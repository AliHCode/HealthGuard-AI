import { useState } from 'react';
import { HomePage } from './components/HomePage';
import { AuthPage } from './components/AuthPage';
import { PatientDetailsForm } from './components/PatientDetailsForm';
import { AnalysisPage } from './components/AnalysisPage';
import { ContactPage } from './components/ContactPage';
import { Navbar } from './components/Navbar';

type Page = 'home' | 'auth' | 'patient-details' | 'analysis' | 'contact';

export interface User {
  id: string;
  email: string;
  name: string;
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

  const handleLogin = (email: string, password: string) => {
    // Mock authentication
    const mockUser: User = {
      id: Date.now().toString(),
      email: email,
      name: email.split('@')[0]
    };
    setUser(mockUser);
    setCurrentPage('patient-details');
  };

  const handleSignup = (email: string, password: string, name: string) => {
    // Mock signup
    const mockUser: User = {
      id: Date.now().toString(),
      email: email,
      name: name
    };
    setUser(mockUser);
    setCurrentPage('patient-details');
  };

  const handlePatientDetailsSubmit = (details: PatientDetails) => {
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

  const handleLogout = () => {
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
          onLogin={handleLogin}
          onSignup={handleSignup}
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
        <AnalysisPage 
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