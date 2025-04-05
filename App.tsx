import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { AuthGuard } from './components/AuthGuard';
import { RoleGuard } from './components/RoleGuard';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';
import { MentorSearch } from './pages/MentorSearch';
import { MentorProfile } from './pages/MentorProfile';
import { Masterclasses } from './pages/Masterclasses';
import { Commons } from './pages/Commons';
import { DiscussionThread } from './pages/DiscussionThread';
import { Vault } from './pages/Vault';
import { Directory } from './pages/Directory';
import { Messages } from './pages/Messages';
import { About } from './pages/About';
import { FAQ } from './pages/FAQ';
import { Contact } from './pages/Contact';
import { Press } from './pages/Press';
import { Partner } from './pages/Partner';
import { Careers } from './pages/Careers';
import { Sitemap } from './pages/Sitemap';
import { Policies } from './pages/Policies';
import { InvoiceManagement } from './pages/admin/InvoiceManagement';
import { MentorOnboarding } from './pages/onboarding/MentorOnboarding';
import { IndividualOnboarding } from './pages/onboarding/IndividualOnboarding';
import { OrganizationOnboarding } from './pages/onboarding/OrganizationOnboarding';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navigation />
        <main className="container mx-auto px-4 py-8 flex-grow mt-16">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/about" element={<About />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/press" element={<Press />} />
            <Route path="/partner" element={<Partner />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/sitemap" element={<Sitemap />} />
            <Route path="/policies" element={<Policies />} />
            <Route path="/search" element={<MentorSearch />} />
            <Route path="/mentors/:id" element={<MentorProfile />} />
            <Route path="/masterclasses" element={<Masterclasses />} />
            <Route path="/commons" element={<Commons />} />
            <Route path="/commons/:id" element={<DiscussionThread />} />
            <Route path="/vault" element={<Vault />} />
            <Route path="/directory" element={<Directory />} />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <AuthGuard>
                  <Dashboard />
                </AuthGuard>
              }
            />
            <Route
              path="/profile"
              element={
                <AuthGuard>
                  <Profile />
                </AuthGuard>
              }
            />
            <Route
              path="/messages"
              element={
                <AuthGuard>
                  <Messages />
                </AuthGuard>
              }
            />

            {/* Onboarding routes */}
            <Route
              path="/onboarding/mentor"
              element={
                <AuthGuard>
                  <RoleGuard allowedRoles={['mentor']}>
                    <MentorOnboarding />
                  </RoleGuard>
                </AuthGuard>
              }
            />
            <Route
              path="/onboarding/individual"
              element={
                <AuthGuard>
                  <RoleGuard allowedRoles={['subscriber']}>
                    <IndividualOnboarding />
                  </RoleGuard>
                </AuthGuard>
              }
            />
            <Route
              path="/onboarding/organization"
              element={
                <AuthGuard>
                  <RoleGuard allowedRoles={['team_admin']}>
                    <OrganizationOnboarding />
                  </RoleGuard>
                </AuthGuard>
              }
            />

            {/* Admin routes */}
            <Route
              path="/admin/invoices"
              element={
                <RoleGuard allowedRoles={['system_admin']}>
                  <InvoiceManagement />
                </RoleGuard>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;