import React from 'react';
import { Pill, Calendar, AlertCircle, Clock, CheckCircle, Printer } from 'lucide-react';
import { formatDate } from '../../utils/formatDate.js';

export const PrescriptionCard = ({ prescription }) => {
  if (!prescription) return null;

  const doctorName = prescription.doctor?.user?.name
    ? `Dr. ${prescription.doctor.user.name}`
    : 'Doctor';

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=850,height=700');
    if (!printWindow) {
      alert("Please allow popups to print/download the prescription.");
      return;
    }

    const medicinesHtml = prescription.medicines?.map((med, idx) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px 10px; font-weight: bold; color: #1e293b;">${idx + 1}. ${med.name}</td>
        <td style="padding: 12px 10px; color: #475569;">${med.dosage}</td>
        <td style="padding: 12px 10px; color: #475569;">${med.frequency}</td>
        <td style="padding: 12px 10px; color: #475569;">${med.duration}</td>
        <td style="padding: 12px 10px; font-size: 0.85em; color: #64748b; line-height: 1.4;">${med.instructions || '-'}</td>
      </tr>
    `).join('') || '<tr><td colspan="5" style="padding: 10px; text-align: center;">No medicines prescribed.</td></tr>';

    const pDate = new Date(prescription.prescriptionDate || prescription.createdAt).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    const fUpDate = prescription.followUpDate 
      ? new Date(prescription.followUpDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
      : '-';

    const docName = prescription.doctor?.user?.name ? `Dr. ${prescription.doctor.user.name}` : 'Doctor';
    const patName = prescription.patient?.user?.name || 'Patient';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Prescription_${prescription._id}</title>
        <meta charset="utf-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
          body {
            font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
            color: #0f172a;
            margin: 0;
            padding: 40px;
            background: #ffffff;
          }
          .prescription-sheet {
            max-width: 800px;
            margin: 0 auto;
            border: 1px solid #e2e8f0;
            padding: 40px;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 25px;
          }
          .logo {
            font-size: 1.8em;
            font-weight: 800;
            color: #2563eb;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .doctor-info {
            text-align: right;
          }
          .doctor-name {
            font-size: 1.25em;
            font-weight: 700;
            color: #0f172a;
          }
          .metadata {
            display: flex;
            justify-content: space-between;
            background: #f8fafc;
            padding: 16px 20px;
            border-radius: 10px;
            margin-bottom: 25px;
            font-size: 0.92em;
            border: 1px solid #f1f5f9;
            line-height: 1.5;
          }
          .rx-symbol {
            font-size: 2.5em;
            font-weight: 800;
            color: #2563eb;
            margin: 10px 0 20px;
            font-family: 'Outfit', serif;
          }
          .meds-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          .meds-table th {
            background: #eff6ff;
            color: #1e3a8a;
            text-align: left;
            padding: 12px 10px;
            font-size: 0.9em;
            font-weight: 700;
            border-bottom: 2px solid #bfdbfe;
          }
          .instructions-section {
            margin-top: 30px;
            font-size: 0.95em;
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
          }
          .signature-section {
            margin-top: 70px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          .signature-line {
            width: 220px;
            border-top: 1.5px solid #94a3b8;
            margin-top: 50px;
            text-align: center;
            font-size: 0.85em;
            color: #64748b;
            padding-top: 6px;
            font-weight: 600;
          }
          @media print {
            body { padding: 0; }
            .prescription-sheet { border: none; padding: 0; box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="prescription-sheet">
          <div class="header">
            <div>
              <div class="logo">MedBook</div>
              <div style="font-size: 0.85em; color: #64748b; margin-top: 4px; font-weight: 500;">Smart Healthcare Portal</div>
            </div>
            <div class="doctor-info">
              <div class="doctor-name">${docName}</div>
              <div style="color: #0d9488; font-size: 0.9em; font-weight: 700; margin-top: 2px;">${prescription.doctor?.specialization || 'General Physician'}</div>
              <div style="color: #64748b; font-size: 0.85em; margin-top: 2px;">${prescription.doctor?.user?.email || ''}</div>
            </div>
          </div>

          <div class="metadata">
            <div>
              <strong style="color: #475569;">Patient Name:</strong> ${patName}<br/>
              <strong style="color: #475569; display: inline-block; margin-top: 4px;">Diagnosis:</strong> ${prescription.diagnosis || 'General Checkup'}
            </div>
            <div style="text-align: right;">
              <strong style="color: #475569;">Date:</strong> ${pDate}<br/>
              <strong style="color: #475569; display: inline-block; margin-top: 4px;">Rx ID:</strong> <span style="font-family: monospace;">${prescription._id}</span>
            </div>
          </div>

          <div class="rx-symbol">R<sub>x</sub></div>

          <table class="meds-table">
            <thead>
              <tr>
                <th style="width: 35%;">Medicine Name</th>
                <th style="width: 15%;">Dosage</th>
                <th style="width: 15%;">Frequency</th>
                <th style="width: 15%;">Duration</th>
                <th style="width: 20%;">Instructions</th>
              </tr>
            </thead>
            <tbody>
              ${medicinesHtml}
            </tbody>
          </table>

          <div class="instructions-section">
            ${prescription.additionalInstructions ? `
              <div style="margin-bottom: 20px;">
                <strong style="color: #1e293b; display: block; margin-bottom: 6px; font-weight: 700;">Advice / Instructions:</strong>
                <p style="margin: 0; color: #475569; line-height: 1.6; font-size: 0.95em;">${prescription.additionalInstructions}</p>
              </div>
            ` : ''}
            
            ${prescription.followUpDate ? `
              <div style="color: #0d9488; font-weight: 700; font-size: 0.9em; display: inline-flex; align-items: center; gap: 4px;">
                <span>•</span> Follow-up Date: ${fUpDate}
              </div>
            ` : ''}
          </div>

          <div class="signature-section">
            <div style="font-size: 0.85em; color: #64748b; font-weight: 500;">
              Generated electronically via MedBook Portal
            </div>
            <div>
              <div class="signature-line">${docName}</div>
            </div>
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div
      className="card"
      style={{
        padding: '1.75rem',
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '1rem',
        }}
      >
        <div>
          <span className="badge badge-secondary" style={{ marginBottom: '0.35rem' }}>
            Rx Prescription
          </span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
            {prescription.diagnosis || 'General Prescription'}
          </h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Issued by {doctorName} ({prescription.doctor?.specialization || 'Physician'})
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
              background: 'var(--bg-subtle)',
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <Calendar size={14} />
            <span>{formatDate(prescription.prescriptionDate || prescription.createdAt)}</span>
          </div>

          <button
            onClick={handlePrint}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '0.4rem 0.75rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              cursor: 'pointer',
              transition: 'var(--transition)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--primary-light)';
              e.currentTarget.style.borderColor = 'var(--primary-border)';
              e.currentTarget.style.color = 'var(--primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--bg-subtle)';
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
          >
            <Printer size={14} />
            <span>Print PDF</span>
          </button>
        </div>
      </div>

      {/* Medicines Table */}
      <div>
        <h4
          style={{
            fontSize: '0.95rem',
            fontWeight: 700,
            marginBottom: '0.75rem',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <Pill size={16} style={{ color: 'var(--primary)' }} />
          Prescribed Medicines ({prescription.medicines?.length || 0})
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {prescription.medicines?.map((med, idx) => (
            <div
              key={idx}
              style={{
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              <div>
                <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  {idx + 1}. {med.name}
                </strong>
                <span
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--primary)',
                    fontWeight: 600,
                    marginLeft: '0.5rem',
                  }}
                >
                  ({med.dosage})
                </span>
                {med.instructions && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    Note: {med.instructions}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span className="badge badge-info">{med.frequency}</span>
                <span className="badge badge-primary">{med.duration}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Instructions & Follow-up */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--border-color)',
          fontSize: '0.85rem',
        }}
      >
        {prescription.additionalInstructions && (
          <div style={{ flex: '1 1 200px' }}>
            <strong style={{ color: 'var(--text-secondary)' }}>Advice: </strong>
            <span>{prescription.additionalInstructions}</span>
          </div>
        )}

        {prescription.followUpDate && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--secondary)',
              fontWeight: 600,
            }}
          >
            <Clock size={15} />
            <span>Follow-up: {formatDate(prescription.followUpDate)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrescriptionCard;
