import { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AuthModal } from "./components/AuthModal";

// Standalone Landing Page without AuthContext dependency
function StandaloneLandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #ffffff 50%, #faf5ff 100%)',
      padding: '20px'
    }}>
      {/* Header */}
      <header style={{
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: 'rgba(255,255,255,0.8)',
        padding: '16px 0',
        marginBottom: '40px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '18px',
              fontWeight: 'bold'
            }}>
              🧠
            </div>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>SubTracker AI</span>
            <span style={{ 
              backgroundColor: '#e0e7ff', 
              color: '#3730a3', 
              padding: '4px 8px', 
              borderRadius: '12px', 
              fontSize: '12px',
              fontWeight: '500'
            }}>Beta</span>
          </div>
          <button 
            onClick={onGetStarted}
            style={{
              background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
        <span style={{ 
          backgroundColor: '#dbeafe', 
          color: '#1e40af', 
          padding: '6px 12px', 
          borderRadius: '16px', 
          fontSize: '14px',
          display: 'inline-block',
          marginBottom: '24px'
        }}>
          ⚡ AI-Powered Subscription Management
        </span>
        
        <h1 style={{ 
          fontSize: '48px', 
          fontWeight: 'bold', 
          marginBottom: '24px',
          background: 'linear-gradient(45deg, #2563eb, #7c3aed, #2563eb)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Take Control of Your Subscriptions
        </h1>
        
        <p style={{ 
          fontSize: '20px', 
          color: '#6b7280', 
          marginBottom: '32px', 
          lineHeight: '1.6' 
        }}>
          Stop overpaying for unused subscriptions. SubTracker AI uses advanced analytics and
          automation to help you optimize costs, prevent overspend, and never miss important renewals.
        </p>
        
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={onGetStarted}
            style={{
              background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            Start Free Trial →
          </button>
          <button style={{
            border: '2px solid #e5e7eb',
            backgroundColor: 'white',
            color: '#374151',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500'
          }}>
            ▶ Watch Demo
          </button>
        </div>
        
        <div style={{ 
          marginTop: '40px', 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '32px',
          fontSize: '14px',
          color: '#6b7280'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', marginRight: '4px' }}>
              <div style={{ width: '20px', height: '20px', backgroundColor: '#2563eb', borderRadius: '50%', marginRight: '-6px', border: '2px solid white' }}></div>
              <div style={{ width: '20px', height: '20px', backgroundColor: '#7c3aed', borderRadius: '50%', marginRight: '-6px', border: '2px solid white' }}></div>
              <div style={{ width: '20px', height: '20px', backgroundColor: '#059669', borderRadius: '50%', border: '2px solid white' }}></div>
            </div>
            <span>10,000+ users</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>⭐⭐⭐⭐⭐</span>
            <span>4.9/5 rating</span>
          </div>
        </div>
      </section>
    </div>
  );
}

function SimpleAppContent() {
  const { user, loading, isAuthenticated, error } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  
  // Debug auth state
  console.log('🔐 Auth Debug:', {
    user: user?.email,
    loading,
    isAuthenticated,
    error,
    showAuth
  });

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: 'white',
        color: 'black'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <StandaloneLandingPage onGetStarted={() => setShowAuth(true)} />
        <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
      </>
    );
  }

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: 'white', 
      color: 'black',
      minHeight: '100vh'
    }}>
      <h1>Welcome to SubTracker AI!</h1>
      <p>You are logged in as: {user?.email}</p>
      <button 
        onClick={() => window.location.reload()}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Refresh
      </button>
    </div>
  );
}

const SimpleRouter = () => {
  return (
    <div style={{ backgroundColor: 'white', minHeight: '100vh' }}>
      <AuthProvider>
        <SimpleAppContent />
      </AuthProvider>
    </div>
  );
};

export default SimpleRouter;