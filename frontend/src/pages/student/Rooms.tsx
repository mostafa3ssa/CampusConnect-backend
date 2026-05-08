import React, { useEffect, useState } from 'react';
import { getRooms, reserveRoom, reportRoom } from '../../api/rooms';
import type { Room } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { MapPin, Users, Clock, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './Rooms.module.css';

export const Rooms: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Reservation Modal State
  const [isReserveOpen, setIsReserveOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [reserveForm, setReserveForm] = useState({ start_time: '', end_time: '', purpose: '', std_ids: '' });
  
  // Report Modal State
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportForm, setReportForm] = useState({ reason: '', details: '' });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const data = await getRooms();
      setRooms(data);
    } catch (error) {
      toast.error('Failed to load rooms');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) return;

    try {
      await reserveRoom({
        ...reserveForm,
        std_ids: reserveForm.std_ids.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id))
      });
      toast.success('Room reserved successfully');
      setIsReserveOpen(false);
      fetchRooms();
    } catch (error) {
      toast.error('Failed to reserve room');
    }
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) return;

    try {
      await reportRoom(selectedRoom.id, reportForm.reason, reportForm.details);
      toast.success('Issue reported successfully');
      setIsReportOpen(false);
    } catch (error) {
      toast.error('Failed to report issue');
    }
  };

  const openReserve = (room: Room) => {
    setSelectedRoom(room);
    setReserveForm({ start_time: '', end_time: '', purpose: '', std_ids: '' });
    setIsReserveOpen(true);
  };

  const openReport = (room: Room) => {
    setSelectedRoom(room);
    setReportForm({ reason: '', details: '' });
    setIsReportOpen(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Campus Rooms</h1>
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
          {rooms.map((room) => (
            <Card key={room.id} className={styles.roomCard}>
              <div className={styles.roomHeader}>
                <h3 className={styles.roomTitle}>Room {room.room_number || room.name}</h3>
                <span className={`${styles.statusBadge} ${room.status === 'available' ? styles.statusAvailable : styles.statusMaintenance}`}>
                  {room.status}
                </span>
              </div>
              
              <div className={styles.content}>
                <div className={styles.detailRow}>
                  <MapPin size={16} />
                  {room.building_name} ({room.type})
                </div>
                <div className={styles.detailRow}>
                  <Users size={16} />
                  Capacity: {room.capacity}
                </div>
                <div className={styles.detailRow}>
                  <Clock size={16} />
                  Available: {room.start_time}:00 - {room.end_time}:00
                </div>

                {room.resources && room.resources.length > 0 && (
                  <div className={styles.resources}>
                    <div className={styles.resourcesTitle}>Resources</div>
                    <div className={styles.resourceTags}>
                      {room.resources.map((res, i) => (
                        <span key={i} className={styles.resourceTag}>{res}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.footer}>
                <Button 
                  variant="primary" 
                  disabled={room.status !== 'available'}
                  onClick={() => openReserve(room)}
                >
                  Reserve
                </Button>
                <Button 
                  variant="secondary"
                  onClick={() => openReport(room)}
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
      <Modal isOpen={isReserveOpen} onClose={() => setIsReserveOpen(false)} title={`Reserve Room ${selectedRoom?.room_number}`}>
        <form className={styles.modalForm} onSubmit={handleReserve}>
          <Input 
            label="Start Time (e.g. 2026-05-10T12:00:00)" 
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
            label="Purpose" 
            value={reserveForm.purpose}
            onChange={e => setReserveForm({...reserveForm, purpose: e.target.value})}
            required 
          />
          <Input 
            label="Team Member IDs (comma-separated)" 
            placeholder="e.g. 12, 13, 14"
            value={reserveForm.std_ids}
            onChange={e => setReserveForm({...reserveForm, std_ids: e.target.value})}
            required 
          />
          <Button type="submit" className="mt-4">Confirm Reservation</Button>
        </form>
      </Modal>

      {/* Report Modal */}
      <Modal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} title={`Report Issue in Room ${selectedRoom?.room_number}`}>
        <form className={styles.modalForm} onSubmit={handleReport}>
          <Input 
            label="Reason" 
            value={reportForm.reason}
            onChange={e => setReportForm({...reportForm, reason: e.target.value})}
            placeholder="e.g. Broken Projector"
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
