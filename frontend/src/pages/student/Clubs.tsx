import React, { useEffect, useState } from 'react';
import { getClubs, followClub, unfollowClub } from '../../api/clubs';
import type { Club } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './Clubs.module.css';

export const Clubs: React.FC = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      const data = await getClubs();
      setClubs(data);
    } catch (error) {
      toast.error('Failed to load clubs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowToggle = async (clubId: number, isJoined: boolean) => {
    try {
      // Optimistic update
      setClubs(clubs.map(c => {
        if (c.id === clubId) {
          return { 
            ...c, 
            is_joined: !isJoined, 
            followers_count: isJoined ? c.followers_count - 1 : c.followers_count + 1 
          };
        }
        return c;
      }));

      if (isJoined) {
        await unfollowClub(clubId);
        toast.success('Unfollowed club');
      } else {
        await followClub(clubId);
        toast.success('Followed club');
      }
    } catch (error) {
      toast.error('Action failed');
      fetchClubs(); // Revert
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-center py-8">
        <svg className="spinner" viewBox="0 0 24 24" width="32" height="32" stroke="var(--primary)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
          <circle cx="12" cy="12" r="10" strokeOpacity="0.25"></circle>
          <path d="M12 2v4"></path>
        </svg>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Campus Clubs</h1>
      </div>

      <div className={styles.grid}>
        {clubs.map((club) => (
          <Card key={club.id} className={styles.clubCard}>
            {club.cover ? (
              <img src={club.cover} alt="Cover" className={styles.coverImage} />
            ) : (
              <div className={styles.coverImage} style={{ backgroundColor: 'var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ImageIcon size={32} className="text-muted" />
              </div>
            )}
            
            <div className={styles.cardContent}>
              <div className={styles.logoWrapper}>
                {club.logo ? (
                  <img src={club.logo} alt={club.name} className={styles.logoImage} />
                ) : (
                  <div className={styles.logoImage} style={{ backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    {club.name.charAt(0)}
                  </div>
                )}
              </div>
              
              <div className={styles.clubInfo}>
                <h3 className={styles.clubName}>{club.name}</h3>
                <p className={styles.clubDescription}>{club.description}</p>
              </div>

              <div className={styles.stats}>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>{club.followers_count}</span>
                  <span className={styles.statLabel}>Followers</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>{club.event_number}</span>
                  <span className={styles.statLabel}>Events</span>
                </div>
              </div>
            </div>

            <div className={styles.cardFooter}>
              <Button 
                variant={club.is_joined ? 'secondary' : 'primary'}
                onClick={() => handleFollowToggle(club.id, club.is_joined)}
              >
                {club.is_joined ? 'Following' : 'Follow'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
