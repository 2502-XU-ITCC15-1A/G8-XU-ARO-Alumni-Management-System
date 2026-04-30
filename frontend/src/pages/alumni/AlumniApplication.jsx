import React, { useState, memo } from 'react';
import { Container, Card, Table } from 'react-bootstrap'; // Using your preferred library
import { Eye, ChevronDown } from 'lucide-react';

// --- Helper Components ---

const StatusBadge = memo(({ text, type }) => {
  const isPayment = type === 'payment';
  
  const getBadgeClass = () => {
    if (isPayment) {
      return text === 'Pending' 
        ? 'bg-warning bg-opacity-25 text-warning-emphasis' 
        : 'text-secondary opacity-50';
    }
    return text === 'Processing' ? 'bg-info text-white' : 'bg-success text-white';
  };

  return (
    <span className={`d-inline-block text-center fw-bold rounded-2 px-3 py-1 ${getBadgeClass()}`}
      style={{ fontSize: '0.75rem', minWidth: '95px' }}>
      {text}
    </span>
  );
});

const ApplicationRow = memo(({ app }) => (
  <tr className="border-bottom border-light">
    <td className="ps-4 fw-bold py-4 text-dark">{app.id}</td>
    <td className="fw-bold py-4 text-secondary">{app.type}</td>
    <td className="fw-bold py-4 text-secondary">{app.date}</td>
    <td className="py-4">
      <StatusBadge text={app.payment} type="payment" />
    </td>
    <td className="py-4">
      <StatusBadge text={app.status} type="status" />
    </td>
    <td className="text-center py-4">
      <div className="d-inline-flex align-items-center justify-content-center" 
           style={{ cursor: 'pointer' }}>
        <Eye size={20} className="text-success" />
      </div>
    </td>
  </tr>
));

// --- Main Page Component ---

function AlumniApplication() {
  const [applications] = useState([
    { id: '01', type: 'Alumni ID', date: 'March 20, 2026', payment: 'Pending', status: 'Processing' },
    { id: '02', type: 'Alumni ID', date: 'March 20, 2023', payment: 'PAID', status: 'Completed' }
  ]);

  return (
    /* MATCHING YOUR DASHBOARD PATTERN:
       Using Container fluid with your specific padding (30px 50px) 
       and background color ensures it fills the screen perfectly.
    */
    <Container fluid style={{ padding: "30px 50px", minHeight: "100vh", backgroundColor: "#f4f6f9" }}>
      
      <Card className="border-0 shadow-sm rounded-4 bg-white overflow-hidden">
        
        {/* Header Section */}
        <div className="p-4 border-bottom d-flex justify-content-between align-items-center bg-white">
          <h4 className="m-0 fw-bold text-dark" style={{ fontSize: '1.2rem' }}>
            Application History
          </h4>
          
          <button className="btn btn-link text-decoration-none fw-bold d-flex align-items-center gap-2 text-dark p-0">
            All <ChevronDown size={16} />
          </button>
        </div>
        
        {/* Table Body */}
        <div className="p-0">
          <div className="table-responsive">
            <Table hover className="m-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4 py-3 text-uppercase text-muted fw-bold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>#</th>
                  <th className="py-3 text-uppercase text-muted fw-bold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>Application Type</th>
                  <th className="py-3 text-uppercase text-muted fw-bold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>Submission Date</th>
                  <th className="py-3 text-uppercase text-muted fw-bold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>Payment Status</th>
                  <th className="py-3 text-uppercase text-muted fw-bold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>Application Status</th>
                  <th className="text-center py-3 text-uppercase text-muted fw-bold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>Action</th>
                </tr>
              </thead>
              <tbody className="border-0">
                {applications.map((app) => (
                  <ApplicationRow key={app.id} app={app} />
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      </Card>
    </Container>
  );
}

export default AlumniApplication;