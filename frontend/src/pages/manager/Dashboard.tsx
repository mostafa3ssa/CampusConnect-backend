import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { createEvent, deleteEvent, getRequestedEvents } from '../../api/events';
import { createPost } from '../../api/posts';
import type { EventType } from '../../types';
import toast from 'react-hot-toast';
import { CalendarDays, Megaphone, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import styles from '../portal/Portal.module.css';

export const ManagerDashboard: React.FC = () => {
  const [events, setEvents] = useState<EventType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [eventForm, setEventForm] = useState({
    type: 'event',
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    room_id: '',
    max_registrations: '',
  });
  const [postForm, setPostForm] = useState({
    event_id: '',
    content: '',
    image_url: '',
  });

  const loadEvents = async () => {
    try {
      const data = await getRequestedEvents();
      setEvents(data);
    } catch (error) {
      toast.error('Failed to load your club events');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const eventSummary = useMemo(() => {
    return {
      total: events.length,
      scheduled: events.filter((event) => event.status === 'scheduled').length,
      pending: events.filter((event) => event.status === 'pending').length,
    };
  }, [events]);

  const handleCreateEvent = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await createEvent({
        type: eventForm.type,
        title: eventForm.title,
        description: eventForm.description,
        start_time: eventForm.start_time,
        end_time: eventForm.end_time,
        room_id: eventForm.room_id ? Number(eventForm.room_id) : undefined,
        max_registrations: Number(eventForm.max_registrations),
      });
      toast.success('Event request submitted');
      setIsEventModalOpen(false);
      setEventForm({
        type: 'event',
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        room_id: '',
        max_registrations: '',
      });
      loadEvents();
    } catch (error) {
      toast.error('Failed to schedule event');
    }
  };

  const handleCreatePost = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await createPost({
        event_id: Number(postForm.event_id),
        content: postForm.content,
        image_url: postForm.image_url || undefined,
      });
      toast.success('Post published');
      setIsPostModalOpen(false);
      setPostForm({ event_id: '', content: '', image_url: '' });
    } catch (error) {
      toast.error('Failed to create post');
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    try {
      await deleteEvent(eventId);
      toast.success('Event deleted');
      loadEvents();
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  const handleOpenPostModal = (eventId?: number) => {
    setPostForm((current) => ({
      ...current,
      event_id: eventId ? String(eventId) : current.event_id,
    }));
    setIsPostModalOpen(true);
  };

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <h1>Run your club like a real campus media and events team.</h1>
          <p>
            Track event requests, publish updates, and keep your audience engaged from one manager
            workspace.
          </p>
        </div>
        <div className={styles.heroPanel}>
          <div className={styles.heroStat}>
            <div>
              <span className={styles.subtle}>Event pipeline</span>
              <strong>{eventSummary.total}</strong>
            </div>
            <div>
              <span className={styles.subtle}>Pending approvals</span>
              <strong>{eventSummary.pending}</strong>
            </div>
          </div>
          <div className={styles.actions}>
            <Button onClick={() => setIsEventModalOpen(true)}>
              <CalendarDays size={16} />
              Schedule Event
            </Button>
            <Button variant="secondary" onClick={() => handleOpenPostModal()}>
              <Megaphone size={16} />
              Publish Post
            </Button>
          </div>
        </div>
      </section>

      <div className={styles.statsGrid}>
        <Card className={styles.metricCard}>
          <span className={styles.subtle}>Total events</span>
          <span className={styles.metricValue}>{eventSummary.total}</span>
        </Card>
        <Card className={styles.metricCard}>
          <span className={styles.subtle}>Scheduled</span>
          <span className={styles.metricValue}>{eventSummary.scheduled}</span>
        </Card>
        <Card className={styles.metricCard}>
          <span className={styles.subtle}>Pending</span>
          <span className={styles.metricValue}>{eventSummary.pending}</span>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Club Event Queue</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className={styles.subtle}>Loading manager workspace...</p>
          ) : events.length === 0 ? (
            <p className={styles.subtle}>No club events yet. Start by scheduling your first one.</p>
          ) : (
            <div className={styles.list}>
              {events.map((clubEvent) => (
                <div key={clubEvent.event_id} className={styles.listItem}>
                  <div>
                    <div className={styles.actions} style={{ marginBottom: '0.5rem' }}>
                      <span className={styles.pill}>{clubEvent.type}</span>
                      <span className={styles.pill}>{clubEvent.status || 'pending'}</span>
                    </div>
                    <div className={styles.listItemTitle}>{clubEvent.title}</div>
                    <p className={styles.subtle}>{clubEvent.description}</p>
                    <p className={styles.subtle}>
                      {format(new Date(clubEvent.start_time), 'PPP p')} to{' '}
                      {format(new Date(clubEvent.end_time), 'PPP p')}
                    </p>
                  </div>
                  <div className={styles.actions}>
                    <Button variant="secondary" onClick={() => handleOpenPostModal(clubEvent.event_id)}>
                      Post Update
                    </Button>
                    <Button variant="danger" onClick={() => handleDeleteEvent(clubEvent.event_id)}>
                      <Trash2 size={16} />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        title="Schedule Event"
      >
        <form className={styles.inlineForm} onSubmit={handleCreateEvent}>
          <Input
            label="Type"
            value={eventForm.type}
            onChange={(e) => setEventForm((current) => ({ ...current, type: e.target.value }))}
            placeholder="event or session"
            required
          />
          <Input
            label="Max registrations"
            type="number"
            value={eventForm.max_registrations}
            onChange={(e) =>
              setEventForm((current) => ({ ...current, max_registrations: e.target.value }))
            }
            required
          />
          <Input
            className={styles.inlineFormFull}
            label="Title"
            value={eventForm.title}
            onChange={(e) => setEventForm((current) => ({ ...current, title: e.target.value }))}
            required
          />
          <div className={styles.inlineFormFull}>
            <label className={styles.subtle}>Description</label>
            <textarea
              className={styles.textarea}
              value={eventForm.description}
              onChange={(e) =>
                setEventForm((current) => ({ ...current, description: e.target.value }))
              }
              required
            />
          </div>
          <Input
            label="Start time"
            type="datetime-local"
            value={eventForm.start_time}
            onChange={(e) =>
              setEventForm((current) => ({ ...current, start_time: e.target.value }))
            }
            required
          />
          <Input
            label="End time"
            type="datetime-local"
            value={eventForm.end_time}
            onChange={(e) =>
              setEventForm((current) => ({ ...current, end_time: e.target.value }))
            }
            required
          />
          <Input
            className={styles.inlineFormFull}
            label="Preferred room id"
            type="number"
            value={eventForm.room_id}
            onChange={(e) => setEventForm((current) => ({ ...current, room_id: e.target.value }))}
          />
          <div className={styles.inlineFormFull}>
            <Button type="submit">Submit Event</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isPostModalOpen} onClose={() => setIsPostModalOpen(false)} title="Publish Club Post">
        <form className={styles.inlineForm} onSubmit={handleCreatePost}>
          <Input
            className={styles.inlineFormFull}
            label="Event id"
            type="number"
            value={postForm.event_id}
            onChange={(e) => setPostForm((current) => ({ ...current, event_id: e.target.value }))}
            required
          />
          <div className={styles.inlineFormFull}>
            <label className={styles.subtle}>Content</label>
            <textarea
              className={styles.textarea}
              value={postForm.content}
              onChange={(e) => setPostForm((current) => ({ ...current, content: e.target.value }))}
              required
            />
          </div>
          <Input
            className={styles.inlineFormFull}
            label="Image URL"
            value={postForm.image_url}
            onChange={(e) => setPostForm((current) => ({ ...current, image_url: e.target.value }))}
          />
          <div className={styles.inlineFormFull}>
            <Button type="submit">Publish</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
