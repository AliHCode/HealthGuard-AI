# Implementation Plan - Phase 2: Intelligent Cloud System

## Goal
Upgrade the current static React prototype into a functional full-stack application with **Google Maps Referral**, **WHO Chatbot**, and **QR Code Reports**.

## User Review Required
> [!IMPORTANT]
> **API Keys Required**: To implement the "Real-Time Referral" and "Chatbot", we will eventually need API keys for:
> - Google Maps / Mapbox
> - OpenAI (or open-source equivalent for Chatbot)
> *For development, we will mock these responses to avoid costs.*

## Proposed Changes

### 1. Backend Infrastructure (New)
We need a Python backend to handle the Dual-Stream Model and the new smart features.
- [NEW] `backend/app.py`: Main Flask/FastAPI application.
- [NEW] `backend/referral_service.py`: Logic for Google Maps/Distance calculation.
- [NEW] `backend/chatbot_service.py`: RAG logic for WHO guidelines.
- [NEW] `backend/report_service.py`: QR Code and PDF generation.

### 2. Frontend Enhancements (React)
Updating `d:\fyp\src` to connect with the backend and add new feature UIs.

#### [NEW] Smart Referral Component
- File: `src/components/ReferralMap.tsx`
- Description: Displays interactive map with pins for nearest pulmonologists/doctors.

#### [NEW] AI Chatbot Widget
- File: `src/components/HealthBot.tsx`
- Description: Floating button that opens a chat window for "Ask a Doctor".

#### [NEW] Digital Report View
- File: `src/components/DigitalReport.tsx`
- Description: Renders the analysis result with a dynamic QR code.

### 3. Integration Logic
- Modify `src/components/AnalysisPage.tsx` to:
    1. Send image to `POST /analyze`.
    2. Receive JSON response.
    3. Display the appropriate "Disease Detected" screens with the new features initiated.

## Verification Plan

### Automated Tests
- **Backend API**: Test `/analyze`, `/refer`, and `/chat` endpoints using `pytest`.
- **Frontend**: Unit tests for the new Map and Chat components.

### Manual Verification
1.  **Referral**: Click "Find Doctor" -> Verify map loads with mock data pins.
2.  **Chatbot**: Type "Is this contagious?" -> Verify instant sensible response.
3.  **QR Code**: Scan the generated code with a real phone -> Verify it opens a text/URL summary.
