import React, { useEffect, useState } from 'react';
import { approvePendingEvent, getPendingApprovals } from '../../api/admin';
import { getRooms } from '../../api/rooms';
import type { PendingEventApproval, Room } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import styles from '../portal/Portal.module.css';

export const AdminApprovals: React.FC = () => {
  const [events, setEvents] = useState<PendingEventApproval[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<PendingEventApproval | null>(null);
  const [roomId, setRoomId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadPage = async () => {
    try {
      const [eventsData, roomsData] = await Promise.all([getPendingApprovals(), getRooms()]);
      setEvents(eventsData);
      setRooms(roomsData);
    } catch (error) {
      toast.error('Failed to load approval queue');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPage();
  }, []);

  const handleReject = async (eventId: number) => {
    try {
      await approvePendingEvent(eventId, { status: 'rejected' });
      toast.success('Event rejected');
      loadPage();
    } catch (error) {
      toast.error('Failed to reject event');
    }
  };

  const openApproveModal = (pendingEvent: PendingEventApproval) => {
    setSelectedEvent(pendingEvent);
    setRoomId('');
    setIsModalOpen(true);
  };

  const handleApprove = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedEvent) {
      return;
    }

    try {
      await approvePendingEvent(selectedEvent.event_id, {
        status: 'approved',
        room_id: Number(roomId),
      });
      toast.success('Event approved');
      setIsModalOpen(false);
      loadPage();
    } catch (error) {
      toast.error('Failed to approve event');
    }
  };

  return (
    <div className={styles.page}>
      <section className={styles.sectionHeader}>
        <div>
          <h2>Pending Event Approvals</h2>
          <p className={styles.subtle}>Assign a room and move approved requests into the scheduled calendar.</p>
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Approval Queue</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className={styles.subtle}>Loading pending events...</p>
          ) : events.length === 0 ? (
            <p className={styles.subtle}>No pending events waiting for approval.</p>
          ) : (
            <div className={styles.list}>
              {events.map((pendingEvent) => (
                <div key={pendingEvent.event_id} className={styles.listItem}>
                  <div>
                    <div className={styles.actions} style={{ marginBottom: '0.5rem' }}>
                      <span className={styles.pill}>{pendingEvent.type}</span>
                      <span className={styles.pill}>{pendingEvent.club_name}</span>
                    </div>
                    <div className={styles.listItemTitle}>{pendingEvent.description}</div>
                    <p className={styles.subtle}>
                      {format(new Date(pendingEvent.start_time), 'PPP p')} to{' '}
                      {format(new Date(pendingEvent.end_time), 'PPP p')}
                    </p>
                    <p className={styles.subtle}>
                      Maximum registrations: {pendingEvent.max_registerations}
                    </p>
                  </div>
                  <div className={styles.actions}>
                    <Button onClick={() => openApproveModal(pendingEvent)}>Approve</Button>
                    <Button variant="danger" onClick={() => handleReject(pendingEvent.event_id)}>
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Approve ${selectedEvent?.club_name || 'event'}`}
      >
        <form className={styles.inlineForm} onSubmit={handleApprove}>
          <Input
            className={styles.inlineFormFull}
            label="Room id"
            type="number"
            placeholder={
              rooms.length > 0
                ? `Available rooms: ${rooms.slice(0, 5).map((room) => room.id).join(', ')}`
                : 'Enter room id'
            }
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            required
          />
          <div className={styles.inlineFormFull}>
            <Button type="submit">Confirm Approval</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
