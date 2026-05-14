# HealthGuard AI: User Workflow & Standard Operating Procedure (SOP)

**Target Audience:** Frontline Health Workers AND General Public.

---

## 1. System Access (Dual Mode)

### Mode A: Health Worker (Professional)
*   **Login**: Uses secure credentials.
*   **Access**: Full diagnostic suite, patient queue management.

### Mode B: Public User (Self-Service)
*   **Login**: No login required (Guest Access) or simpler Email Sign-up.
*   **Access**: Simplified "Check Your Symptoms" interface.

---

## 2. General Public Workflow (Self-Service)

**Scenario:** A person has an X-ray film from a lab but cannot find a doctor immediately.

### Step 1: Upload & Check
*   **Action**: The user takes a clear photo of their X-ray using their smartphone or uploads a digital file.
*   **Safety Warning**: The system shows a disclaimer: *"This is a preliminary screening tool. Consult a doctor for final diagnosis."*
*   **Analysis**: The user clicks **"Scan My X-Ray"**.

### Step 2: Simplified Result
*   **Result**: Instead of complex medical terms, it shows plain language.
    *   *Green*: "Looks Healthy. No obvious issues detected."
    *   *Red*: "Potential Sign of Pneumonia. Please see a doctor."
    *   **Visual**: Shows the same Heatmap so the user can see *where* the issue might be.

### Step 3: "Start Chat" (AI Doctor)
*   **Action**: If the user is worried, they click **"Ask HealthGuard Bot"**.
*   **Interaction**:
    *   *User*: "What should I do now? Is this dangerous?"
    *   *Bot*: "Based on the scan, there are signs of congestion. It is important to see a pulmonologist. Would you like to find one nearby?"

### Step 4: Find Help (Smart Referral)
*   **Action**: User clicks **"Find Doctor"**.
*   **System**: Uses the phone's GPS to show the top 3 nearest clinics on Google Maps with a "Call Now" button.

---

## 3. Professional Diagnostic Workflow (Health Workers)

**Scenario:** A doctor or dispenser treating patients in a clinic.

### Step 1: Patient Registration
*   **Action**: Enter Patient Name, Age, and Chief Complaint digitally.

### Step 2: Advanced Analysis
*   **Pneumonia**: Uploads X-ray -> Viewing Heatmap & Confidence Score (e.g., "94%").
*   **Malaria**: Uploads Microscope Image -> Automatic Parasite Counting (e.g., "12 parasites detected").

### Step 3: Decision Support
*   **Result**: The system suggests a triage grade (Mild/Moderate/Severe).
*   **Referral**: Generates a professional Referral Note for hospital transfer if the case is Severe.

### Step 4: Patient Handover (QR Code)
*   **Action**: User clicks **"Generate Patient Report"**.
*   **Result**: A **QR Code** appears.
*   **Usage**: The patient takes a photo of this code to carry their digital medical record to the next hospital.
