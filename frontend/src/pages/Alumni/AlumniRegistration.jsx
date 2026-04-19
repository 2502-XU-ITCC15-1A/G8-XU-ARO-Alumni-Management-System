import React, { useState } from 'react';
import { 
  Gauge, Edit3, User, Bell, ArrowLeft, ArrowRight 
} from 'lucide-react';

const AlumniRegistration = () => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState('Apply');
  const [currentStep, setCurrentStep] = useState(1);

  // Form State for your Backend integration
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    extensions: '',
    nickname: '',
    birthdate: '',
    gender: '',
    nationality: '',
    religion: '',
    universityNumber: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="d-flex vh-100 vw-100 overflow-hidden" style={{ backgroundColor: '#D1D5DB' }}>
      <style>{`
        body, html, #root { margin: 0; padding: 0; height: 100%; width: 100%; overflow: hidden; }
        .nav-link { cursor: pointer; transition: all 0.2s ease; border-radius: 0 !important; }
        .nav-link:hover { background-color: rgba(255, 255, 255, 0.1) !important; }
        .step-circle { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; }
        .form-label { font-weight: bold; font-size: 1.2rem; margin-bottom: 0.5rem; }
        .form-control { border: 1px solid #ced4da; padding: 0.75rem; border-radius: 4px; }
      `}</style>

      {/* SIDEBAR */}
      <aside className="d-flex flex-column text-white shadow-lg h-100" 
             style={{ width: isMinimized ? '80px' : '280px', backgroundColor: '#233871', flexShrink: 0, transition: 'width 0.3s' }}>
        <div className="p-4 pt-5 pb-5 text-center overflow-hidden">
          {!isMinimized && (
            <>
              <small className="d-block text-uppercase fw-light" style={{ fontSize: '10px' }}>Xavier University</small>
              <h2 className="fw-bold m-0" style={{ fontSize: '28px' }}>ALUMNIMS</h2>
            </>
          )}
        </div>
        <div className={`px-3 mb-3 ${isMinimized ? 'text-center' : 'text-end'}`}>
          <div onClick={() => setIsMinimized(!isMinimized)} style={{ cursor: 'pointer', display: 'inline-block' }}>
            {isMinimized ? <ArrowRight size={24} /> : <ArrowLeft size={24} />}
          </div>
        </div>
<nav className="flex-column nav w-100">
  {/* 1. Dashboard Link */}
  <div 
    onClick={() => navigate('/dashboard')} 
    className={`nav-link text-white d-flex align-items-center gap-3 p-3 ${activeTab === 'Dashboard' ? '' : 'opacity-75'}`}
    style={{ backgroundColor: activeTab === 'Dashboard' ? '#3B82F6' : 'transparent', cursor: 'pointer' }}
  >
    <Gauge size={28} /> {!isMinimized && "Dashboard"}
  </div>

  {/* 2. Apply/Registration Link */}
  <div 
    onClick={() => navigate('/register')} 
    className={`nav-link text-white d-flex align-items-center gap-3 p-3 ${activeTab === 'Apply' ? '' : 'opacity-75'}`}
    style={{ backgroundColor: activeTab === 'Apply' ? '#3B82F6' : 'transparent', cursor: 'pointer' }}
  >
    <Edit3 size={28} /> {!isMinimized && "Apply for Alumni ID"}
  </div>

  {/* 3. Applications Link */}
  <div 
    onClick={() => navigate('/applications')} 
    className={`nav-link text-white d-flex align-items-center gap-3 p-3 ${activeTab === 'Applications' ? '' : 'opacity-75'}`}
    style={{ backgroundColor: activeTab === 'Applications' ? '#3B82F6' : 'transparent', cursor: 'pointer' }}
  >
    <User size={28} /> {!isMinimized && "Applications"}
  </div>
</nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="d-flex flex-column h-100 flex-grow-1 overflow-hidden">
        <header className="navbar bg-white px-4 shadow-sm py-3 w-100">
          <h2 className="m-0 fw-bold fs-3 text-dark">Alumni Registration</h2>
          <div className="d-flex align-items-center gap-4">
            <Bell size={24} className="text-dark" />
            <div className="rounded-pill px-3 py-1 text-white d-flex align-items-center gap-2 shadow-sm" style={{ backgroundColor: '#233871' }}>
              <span className="fw-bold">MR</span><small>▼</small>
            </div>
          </div>
        </header>

        <div className="p-4 flex-grow-1 overflow-auto d-flex justify-content-center">
          <div className="w-100 shadow-lg rounded-4 overflow-hidden bg-white" style={{ maxWidth: '1100px', height: 'fit-content' }}>
            
            {/* FORM HEADER */}
            <div className="p-5 text-center text-white" style={{ backgroundColor: '#233871' }}>
              <h1 className="fw-bold mb-2">Alumni Registration</h1>
              <p className="opacity-75">Update your profile and stay connected with your alma mater</p>
            </div>

            {/* STEP PROGRESS BAR */}
            <div className="d-flex justify-content-center align-items-center py-4 bg-light border-bottom gap-4">
              <div className="d-flex align-items-center gap-2">
                <div className="step-circle" style={{ backgroundColor: currentStep === 1 ? '#233871' : '#DEE2E6', color: currentStep === 1 ? 'white' : '#6C757D' }}>1</div>
                <span className={currentStep === 1 ? 'fw-bold' : 'text-muted'}>Personal</span>
              </div>
              <div style={{ width: '50px', height: '2px', backgroundColor: '#DEE2E6' }}></div>
              <div className="d-flex align-items-center gap-2">
                <div className="step-circle" style={{ backgroundColor: currentStep === 2 ? '#233871' : '#DEE2E6', color: currentStep === 2 ? 'white' : '#6C757D' }}>2</div>
                <span className={currentStep === 2 ? 'fw-bold' : 'text-muted'}>Education</span>
              </div>
              <div style={{ width: '50px', height: '2px', backgroundColor: '#DEE2E6' }}></div>
              <div className="d-flex align-items-center gap-2">
                <div className="step-circle" style={{ backgroundColor: currentStep === 3 ? '#233871' : '#DEE2E6', color: currentStep === 3 ? 'white' : '#6C757D' }}>3</div>
                <span className={currentStep === 3 ? 'fw-bold' : 'text-muted'}>Work</span>
              </div>
            </div>

            {/* FORM BODY */}
            <div className="p-5">
              <p className="text-muted small mb-4">Note: If alumna and married after graduation, please enter your surname as <u>Maiden Name-Married Name</u></p>
              
              <div className="row g-4">
                <div className="col-md-4">
                  <label className="form-label">First Name</label>
                  <input type="text" name="firstName" className="form-control w-100" onChange={handleInputChange} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Middle Name</label>
                  <input type="text" name="middleName" className="form-control w-100" onChange={handleInputChange} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Last Name</label>
                  <input type="text" name="lastName" className="form-control w-100" onChange={handleInputChange} />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Extensions</label>
                  <input type="text" name="extensions" className="form-control w-100" placeholder="e.g. Jr., III" onChange={handleInputChange} />
                </div>
                <div className="col-md-8">
                  <label className="form-label">Nickname</label>
                  <input type="text" name="nickname" className="form-control w-100" onChange={handleInputChange} />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Birthdate</label>
                  <input type="date" name="birthdate" className="form-control w-100" onChange={handleInputChange} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Gender</label>
                  <input type="text" name="gender" className="form-control w-100" onChange={handleInputChange} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Nationality</label>
                  <input type="text" name="nationality" className="form-control w-100" onChange={handleInputChange} />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Religion</label>
                  <input type="text" name="religion" className="form-control w-100" onChange={handleInputChange} />
                </div>
                <div className="col-md-8">
                  <label className="form-label">University Number</label>
                  <input type="text" name="universityNumber" className="form-control w-100" onChange={handleInputChange} />
                </div>
              </div>
            </div>

            {/* FORM FOOTER SPACE */}
            <div style={{ height: '40px', backgroundColor: '#233871' }}></div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AlumniRegistration;