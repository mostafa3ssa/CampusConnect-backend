import React, { useEffect, useState } from 'react';
import { getFacilities, reserveFacility, reportFacility } from '../../api/facilities';
import type { Facility } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { MapPin, Users, Dumbbell, FlagTriangleRight, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './Facilities.module.css';

export const Facilities: React.FC = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Reservation Modal State
  const [isReserveOpen, setIsReserveOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [reserveForm, setReserveForm] = useState({ start_time: '', end_time: '', team_ids: '' });
  
  // Report Modal State
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportForm, setReportForm] = useState({ reason: '', details: '' });

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    try {
      const data = await getFacilities();
      setFacilities(data);
    } catch (error) {
      toast.error('Failed to load facilities');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFacility) return;

    try {
      await reserveFacility(selectedFacility.facility_id, {
        start_time: reserveForm.start_time,
        end_time: reserveForm.end_time,
        team_ids: reserveForm.team_ids.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id))
      });
      toast.success('Facility reserved successfully');
      setIsReserveOpen(false);
      fetchFacilities();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reserve facility');
    }
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFacility) return;

    try {
      await reportFacility(selectedFacility.facility_id, reportForm.reason, reportForm.details);
      toast.success('Issue reported successfully');
      setIsReportOpen(false);
    } catch (error) {
      toast.error('Failed to report issue');
    }
  };

  const openReserve = (facility: Facility) => {
    setSelectedFacility(facility);
    setReserveForm({ start_time: '', end_time: '', team_ids: '' });
    setIsReserveOpen(true);
  };

  const openReport = (facility: Facility) => {
    setSelectedFacility(facility);
    setReportForm({ reason: '', details: '' });
    setIsReportOpen(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Campus Facilities</h1>
      </div>

      {isLoading ? (
        <div className="d-flex justify-center py-8">
          <svg className="spinner" viewBox="0 0 24 24" width="32" height="32" stroke="var(--primary)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
            <circle cx="12" cy="12" r="10" strokeOpacity="0.25"></circle>
            <path d="M12 2v4"></path>
          </svg>
        </div>
      ) : (
        <div className={styles.grid}>
          {facilities.map((facility) => (
            <Card key={facility.facility_id} className={styles.facilityCard}>
              <div className={styles.facilityHeader}>
                <h3 className={styles.facilityTitle}>
                  {facility.type === 'gym' ? <Dumbbell size={20} /> : <FlagTriangleRight size={20} />}
                  {facility.name}
                </h3>
                <span className={`${styles.statusBadge} ${
                  facility.status === 'available' ? styles.statusAvailable : 
                  facility.status === 'closed' ? styles.statusClosed : styles.statusMaintenance
                }`}>
                  {facility.status.replace('_', ' ')}
                </span>
              </div>
              
              <div className={styles.content}>
                <div className={styles.detailRow}>
                  <MapPin size={16} />
                  {facility.location_description}
                </div>
                <div className={styles.detailRow}>
                  <Users size={16} />
                  Capacity: {facility.min_capacity} - {facility.max_capacity} people
                </div>
              </div>

              <div className={styles.footer}>
                <Button 
                  variant="primary" 
                  disabled={facility.status !== 'available'}
                  onClick={() => openReserve(facility)}
                >
                  Reserve
                </Button>
                <Button 
                  variant="secondary"
                  onClick={() => openReport(facility)}
                >
                  <AlertTriangle size={16} />
                  Report Issue
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Reserve Modal */}
      <Modal isOpen={isReserveOpen} onClose={() => setIsReserveOpen(false)} title={`Reserve ${selectedFacility?.name}`}>
        <form className={styles.modalForm} onSubmit={handleReserve}>
          <div style={{ backgroundColor: 'var(--bg-surface-hover)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-sm)' }}>
            <strong>Note:</strong> Team size must be between {selectedFacility?.min_capacity} and {selectedFacility?.max_capacity} members. All members must be active.
          </div>
          <Input 
            label="Start Time" 
            type="datetime-local"
            value={reserveForm.start_time}
            onChange={e => setReserveForm({...reserveForm, start_time: e.target.value})}
            required 
          />
          <Input 
            label="End Time" 
            type="datetime-local"
            value={reserveForm.end_time}
            onChange={e => setReserveForm({...reserveForm, end_time: e.target.value})}
            required 
          />
          <Input 
            label="Team Member IDs (comma-separated, must include yours)" 
            placeholder="e.g. 12, 13, 14"
            value={reserveForm.team_ids}
            onChange={e => setReserveForm({...reserveForm, team_ids: e.target.value})}
            required 
          />
          <Button type="submit" className="mt-4">Confirm Reservation</Button>
        </form>
      </Modal>

      {/* Report Modal */}
      <Modal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} title={`Report Issue at ${selectedFacility?.name}`}>
        <form className={styles.modalForm} onSubmit={handleReport}>
          <Input 
            label="Reason" 
            value={reportForm.reason}
            onChange={e => setReportForm({...reportForm, reason: e.target.value})}
            placeholder="e.g. Unsafe floor"
            required 
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 'var(--font-sm)', fontWeight: 500 }}>Details</label>
            <textarea 
              style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', minHeight: 100, fontFamily: 'inherit' }}
              value={reportForm.details}
              onChange={e => setReportForm({...reportForm, details: e.target.value})}
              required
            />
          </div>
          <Button type="submit" variant="danger" className="mt-4">Submit Report</Button>
        </form>
      </Modal>
    </div>
  );
};
