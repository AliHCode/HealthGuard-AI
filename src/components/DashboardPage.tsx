import { User, PatientDetails, AnalysisResult } from '../App';
import { AnalysisPage } from './AnalysisPage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Users, Activity, FileText, Settings, ShieldAlert } from 'lucide-react';
import { Button } from './ui/button';

interface DashboardPageProps {
  user: User;
  patientDetails: PatientDetails;
  onAnalysisComplete: (result: AnalysisResult) => void;
  history: AnalysisResult[];
}

export function DashboardPage({ user, patientDetails, onAnalysisComplete, history }: DashboardPageProps) {
  
  // Patient View
  if (user.role === 'patient' || !user.role) {
    return (
      <AnalysisPage 
        user={user}
        patientDetails={patientDetails}
        onAnalysisComplete={onAnalysisComplete}
        history={history}
      />
    );
  }

  // Doctor View
  if (user.role === 'doctor') {
    return (
      <div className="min-h-[calc(100vh-5rem)] py-6 px-8 bg-white">
        <div className="container mx-auto max-w-7xl space-y-8">
          <div className="flex items-center justify-between animate-fade-in">
            <div>
              <div className="inline-flex items-center px-3 py-1.5 bg-black/5 text-black rounded-full mb-4 text-sm font-medium">
                <ShieldAlert className="size-4 mr-2" />
                Doctor Portal
              </div>
              <h1 className="text-4xl tracking-tight mb-2">Dr. {user.name}</h1>
              <p className="text-black/60">Manage your patients and review clinical AI analyses.</p>
            </div>
            <Button className="bg-black text-white hover:bg-black/90 rounded-full px-6 h-11">
              + New Patient Record
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="shadow-elegant border-black/[0.06]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-black/60">Total Patients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight">1,248</div>
                <p className="text-sm text-green-600 font-medium mt-1">+12 this week</p>
              </CardContent>
            </Card>
            <Card className="shadow-elegant border-black/[0.06]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-black/60">Pending Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight text-amber-600">8</div>
                <p className="text-sm text-amber-600/80 font-medium mt-1">Requires immediate attention</p>
              </CardContent>
            </Card>
            <Card className="shadow-elegant border-black/[0.06]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-black/60">Recent Diagnoses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight text-blue-600">156</div>
                <p className="text-sm text-blue-600/80 font-medium mt-1">This month</p>
              </CardContent>
            </Card>
          </div>

          <AnalysisPage 
            user={user}
            patientDetails={patientDetails}
            onAnalysisComplete={onAnalysisComplete}
            history={history}
          />
        </div>
      </div>
    );
  }

  // ASHA Worker View
  return (
    <div className="min-h-[calc(100vh-5rem)] py-6 px-8 bg-black/5">
      <div className="container mx-auto max-w-3xl space-y-8 bg-white p-8 rounded-2xl shadow-elegant-lg border border-black/[0.06]">
        <div className="text-center animate-fade-in mb-8">
          <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-full mb-6 text-sm font-medium">
            <Users className="size-4 mr-2" />
            Field Worker / Nurse Portal
          </div>
          <h1 className="text-4xl tracking-tight mb-3">Hello, {user.name}</h1>
          <p className="text-lg text-black/60 max-w-md mx-auto">
            Quickly screen patients in the field for Malaria and Pneumonia.
          </p>
        </div>

        <AnalysisPage 
          user={user}
          patientDetails={patientDetails}
          onAnalysisComplete={onAnalysisComplete}
          history={history}
        />
      </div>
    </div>
  );
}
