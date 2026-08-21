import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Check, Save } from 'lucide-react';
import Button from '../common/Button.jsx';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const AvailabilityForm = ({ existingAvailability = [], onSave, loading = false }) => {
  const [schedules, setSchedules] = useState(
    DAYS.map((day) => ({
      dayOfWeek: day,
      startTime: '09:00',
      endTime: '17:00',
      slotDuration: 30,
      isAvailable: day !== 'Sunday',
    }))
  );

  useEffect(() => {
    if (existingAvailability && existingAvailability.length > 0) {
      setSchedules((prev) =>
        prev.map((item) => {
          const matched = existingAvailability.find((a) => a.dayOfWeek === item.dayOfWeek);
          if (matched) {
            return {
              ...item,
              startTime: matched.startTime || item.startTime,
              endTime: matched.endTime || item.endTime,
              slotDuration: matched.slotDuration || item.slotDuration,
              isAvailable: matched.isAvailable !== undefined ? matched.isAvailable : true,
            };
          }
          return item;
        })
      );
    }
  }, [existingAvailability]);

  const handleToggle = (index) => {
    setSchedules((prev) =>
      prev.map((s, idx) => (idx === index ? { ...s, isAvailable: !s.isAvailable } : s))
    );
  };

  const handleChange = (index, field, value) => {
    setSchedules((prev) =>
      prev.map((s, idx) => (idx === index ? { ...s, [field]: value } : s))
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) {
      onSave(schedules);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card" style={{ padding: '1.75rem', background: '#ffffff' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Weekly Consultation Schedule</h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>
          Configure your standard daily consultation hours and appointment slot duration.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {schedules.map((schedule, idx) => (
          <div
            key={schedule.dayOfWeek}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              background: schedule.isAvailable ? 'var(--bg-subtle)' : '#f8fafc',
              border: '1px solid var(--border-color)',
              opacity: schedule.isAvailable ? 1 : 0.65,
              transition: 'var(--transition)',
            }}
          >
            {/* Day and Available Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: '140px' }}>
              <input
                type="checkbox"
                id={`day-${idx}`}
                checked={schedule.isAvailable}
                onChange={() => handleToggle(idx)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label
                htmlFor={`day-${idx}`}
                style={{ fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}
              >
                {schedule.dayOfWeek}
              </label>
            </div>

            {/* Time Pickers */}
            {schedule.isAvailable ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>From:</span>
                  <input
                    type="time"
                    className="form-input"
                    value={schedule.startTime}
                    onChange={(e) => handleChange(idx, 'startTime', e.target.value)}
                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', width: '115px' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>To:</span>
                  <input
                    type="time"
                    className="form-input"
                    value={schedule.endTime}
                    onChange={(e) => handleChange(idx, 'endTime', e.target.value)}
                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', width: '115px' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Slot (min):</span>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    className="form-input"
                    value={schedule.slotDuration}
                    onChange={(e) => handleChange(idx, 'slotDuration', Number(e.target.value))}
                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', width: '75px' }}
                  />
                </div>
              </div>
            ) : (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                Off day (No consultation slots)
              </span>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '1.75rem', display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="submit" loading={loading} icon={Save}>
          Save Weekly Schedule
        </Button>
      </div>
    </form>
  );
};

export default AvailabilityForm;
