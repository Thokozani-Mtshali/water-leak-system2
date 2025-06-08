Johannesburg Water Leak Reporting App
This is a mobile app built using React Native, Expo, and Expo Router. The app allows users in Johannesburg to report water leaks and view water supply issues on a map. It includes a simple login screen (no backend), an interactive map with markers, and options to filter and view report details.

Features
Simple login screen (no real authentication)

Interactive map showing reported water leaks

Users can report leaks by entering a title, description, severity, and optionally adding images

Filter leaks by severity (Low, Medium, High) and status (Open, In Progress, Resolved)

View detailed information about each report

View water supply status per area

Basic structure ready for Firebase or other backends in future

Basic UI tested using Jest

Project Structure
app/
(tabs)/ - Main home screen after login
auth/ - Login, register, forgot password screens
screens/ - Other screens like report details

components/
map/ - Map and marker UI
dashboard/ - Summary cards, status views
common/ - Shared UI elements

data/
statusConfig.js - Config file for area status and severity

utils/
mapProjection.js - Utility functions for map handling

Getting Started
Prerequisites
You need Node.js installed (preferably version 18 or newer) and Expo CLI.

To install Expo CLI globally:

npm install -g expo-cli

Step 1: Clone the repository
git clone https://github.com/yourusername/water-leak-system.git
cd water-leak-system

Step 2: Install dependencies
npm install

Step 3: Start the project
npx expo start --clear

This will open Expo Dev Tools. You can scan the QR code with your phone or launch an Android/iOS emulator.

Navigation (Using Expo Router)
/auth/login - Login screen

/auth/register - Register screen

/auth/forgot-password - Forgot password screen

/(tabs) - Main map/home screen

/screens/ReportDetails - Detailed view for a single leak

Make sure the files are inside the correct folders under app/ so Expo Router can detect and route them properly.

Technologies Used
React Native

Expo and Expo Router

React Native Maps

Lucide Icons (optional)

Jest and React Native Testing Library

Testing
Run tests using:

npm test

Make sure your Jest config is correctly set up.

Future Plans
Add real backend (Firebase or other)

Admin panel for viewing and updating reports

Push notifications when reports are updated

Offline support using local storage

Graphs or statistics showing total leaks by area and time

Author
Developed by Thokozani as part of the SRM11A1 Capstone Project for a smart water management solution in Johannesburg.
