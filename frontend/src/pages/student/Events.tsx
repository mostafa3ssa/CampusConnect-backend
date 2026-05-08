import React, { useEffect, useState } from 'react';
import { getEvents, registerForEvent, cancelRegistration } from '../../api/events';
import type { EventType } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { MapPin, Clock, Users, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import styles from './Events.module.css';

export const Events: React.FC = () => {
  const [events, setEvents] = useState<EventType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingEventId, setLoadingEventId] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'event' | 'session'>('all');

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const params = filter !== 'all' ? { type: filter } : undefined;
      const data = await getEvents(params);
      setEvents(data);
    } catch {
      toast.error('Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (eventId: number, isRegistered: boolean) => {
    setLoadingEventId(eventId);
    try {
      if (isRegistered) {
        await cancelRegistration(eventId);
        toast.success('Registration cancelled');
      } else {
        await registerForEvent(eventId);
        toast.success('Successfully registered');
      }
      
      // Update the event locally without fetching all events
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.event_id === eventId
            ? {
                ...event,
                is_registered: !isRegistered,
                regestrations: isRegistered
                  ? (event.regestrations || 1) - 1
                  : (event.regestrations || 0) + 1,
              }
            : event
        )
      );
    } catch {
      toast.error('Failed to update registration');
    } finally {
      setLoadingEventId(null);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Upcoming Events</h1>
        <div className={styles.filters}>
          <button 
            className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`${styles.filterBtn} ${filter === 'event' ? styles.active : ''}`}
            onClick={() => setFilter('event')}
          >
            Events
          </button>
          <button 
            className={`${styles.filterBtn} ${filter === 'session' ? styles.active : ''}`}
            onClick={() => setFilter('session')}
          >
            Sessions
          </button>
        </div>
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
          {events.length === 0 ? (
            <div className={styles.emptyState}>
              <CalendarDays size={48} className="mb-4 text-muted" />
              <h3>No events found</h3>
              <p>Check back later for new events and sessions.</p>
            </div>
          ) : (
            events.map((event) => (
              <Card key={event.event_id} className={styles.eventCard}>
                <div className={styles.eventDate}>
                  <span>{format(new Date(event.start_time), 'MMM dd, yyyy')}</span>
                  <span className={styles.badge}>{event.type}</span>
                </div>
                
                <div className={styles.cardContent}>
                  <h3 className={styles.title}>{event.title}</h3>
                  <div className={styles.clubInfo}>
                    {event.club_name}
                  </div>
                  
                  <p className={styles.description}>{event.description}</p>
                  
                  <div className={styles.details}>
                    <div className={styles.detailRow}>
                      <Clock size={16} />
                      {format(new Date(event.start_time), 'h:mm a')} - {format(new Date(event.end_time), 'h:mm a')}
                    </div>
                    {event.location && (
                      <div className={styles.detailRow}>
                        <MapPin size={16} />
                        {event.location}
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <div className={styles.spots}>
                    <Users size={16} style={{ display: 'inline', marginRight: 4, verticalAlign: 'text-bottom' }} />
                    <span>{event.regestrations || 0}</span> / {event.max_regestrations}
                  </div>
                  <Button 
                    variant={event.is_registered ? 'danger' : ((event.regestrations || 0) >= event.max_regestrations ? 'secondary' : 'primary')}
                    onClick={() => handleRegister(event.event_id, event.is_registered || false)}
                    disabled={(!event.is_registered && (event.regestrations || 0) >= event.max_regestrations) || loadingEventId === event.event_id}
                    isLoading={loadingEventId === event.event_id}
                  >
                    {event.is_registered ? 'Cancel Registration' : 'Register'}
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};
