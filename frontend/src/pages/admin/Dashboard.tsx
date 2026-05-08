import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { getAdminLogs, getAdminReports, getAdminStats, getAttendanceOverview, getFacilitiesUsage } from '../../api/admin';
import type { AttendancePoint, DashboardStats, LogEntry, Report, UsagePoint } from '../../types';
import { Activity, BarChart3, ClipboardList, ShieldCheck } from 'lucide-react';
import styles from '../portal/Portal.module.css';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const defaultStats: DashboardStats = {
  total_students: 0,
  active_clubs: 0,
  active_events: 0,
  active_sessions: 0,
  reserved_rooms: 0,
  reserved_facilities: 0,
};

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [reports, setReports] = useState<Report[]>([]);
  const [usage, setUsage] = useState<UsagePoint[]>([]);
  const [attendance, setAttendance] = useState<AttendancePoint[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [statsData, reportsData, usageData, attendanceData, logsData] = await Promise.all([
          getAdminStats(),
          getAdminReports(),
          getFacilitiesUsage(),
          getAttendanceOverview(),
          getAdminLogs(),
        ]);
        setStats(statsData);
        setReports(reportsData.slice(0, 4));
        setUsage(usageData);
        setAttendance(attendanceData.slice(-6));
        setLogs(logsData.slice(0, 5));
      } catch (error) {
        toast.error('Failed to load admin dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <h1>Run the campus platform from one operational command center.</h1>
          <p>
            Review live system activity, spot report trends, and monitor how students are using
            rooms and sports facilities.
          </p>
        </div>
        <div className={styles.heroPanel}>
          <div className={styles.heroStat}>
            <div>
              <span className={styles.subtle}>Students</span>
              <strong>{stats.total_students}</strong>
            </div>
            <div>
              <span className={styles.subtle}>Open activity</span>
              <strong>{reports.length}</strong>
            </div>
          </div>
          <div className={styles.actions}>
            <span className={styles.pill}>admin console</span>
            <span className={styles.pill}>live ops</span>
          </div>
        </div>
      </section>

      <div className={styles.statsGrid}>
        <Card className={styles.metricCard}>
          <span className={styles.subtle}>Active clubs</span>
          <span className={styles.metricValue}>{stats.active_clubs}</span>
        </Card>
        <Card className={styles.metricCard}>
          <span className={styles.subtle}>Active events</span>
          <span className={styles.metricValue}>{stats.active_events}</span>
        </Card>
        <Card className={styles.metricCard}>
          <span className={styles.subtle}>Sessions</span>
          <span className={styles.metricValue}>{stats.active_sessions}</span>
        </Card>
        <Card className={styles.metricCard}>
          <span className={styles.subtle}>Reserved rooms</span>
          <span className={styles.metricValue}>{stats.reserved_rooms}</span>
        </Card>
      </div>

      <div className={styles.gridTwo}>
        <Card>
          <CardHeader>
            <CardTitle>
              <BarChart3 size={18} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />
              Facilities Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className={styles.subtle}>Loading usage split...</p>
            ) : (
              <div className={styles.chartWrap}>
                {usage.map((item) => (
                  <div className={styles.barRow} key={item.type}>
                    <span className={styles.listItemTitle}>{item.type}</span>
                    <div className={styles.barTrack}>
                      <div className={styles.barFill} style={{ width: `${item.value}%` }} />
                    </div>
                    <span className={styles.subtle}>{item.value}%</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <Activity size={18} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />
              Attendance Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.list}>
              {attendance.length === 0 ? (
                <p className={styles.subtle}>No attendance data yet.</p>
              ) : (
                attendance.map((point) => (
                  <div key={`${point.month}-${point.events}-${point.sessions}`} className={styles.listItem}>
                    <div>
                      <div className={styles.listItemTitle}>{point.month}</div>
                      <p className={styles.subtle}>Recent participation snapshot</p>
                    </div>
                    <div className={styles.actions}>
                      <span className={styles.pill}>events {point.events}</span>
                      <span className={styles.pill}>sessions {point.sessions}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className={styles.gridTwo}>
        <Card>
          <CardHeader>
            <CardTitle>
              <ClipboardList size={18} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />
              Latest Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.list}>
              {reports.length === 0 ? (
                <p className={styles.subtle}>No reports submitted.</p>
              ) : (
                reports.map((report) => (
                  <div key={`${report.report_type}-${report.report_id}-${report.student_id}`} className={styles.listItem}>
                    <div>
                      <div className={styles.actions} style={{ marginBottom: '0.5rem' }}>
                        <span className={styles.pill}>{report.report_type}</span>
                        <span className={styles.pill}>{report.status}</span>
                      </div>
                      <div className={styles.listItemTitle}>{report.reason}</div>
                      <p className={styles.subtle}>{report.details}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <ShieldCheck size={18} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />
              Recent Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.list}>
              {logs.length === 0 ? (
                <p className={styles.subtle}>No log entries yet.</p>
              ) : (
                logs.map((log, index) => (
                  <div key={`${log.record_id}-${log.action}-${index}`} className={styles.listItem}>
                    <div>
                      <div className={styles.listItemTitle}>
                        {log.action} on {log.edited_table}
                      </div>
                      <p className={styles.subtle}>
                        by {log.changed_by} from {log.ip_address}
                      </p>
                    </div>
                    <span className={styles.subtle}>
                      {log.timestamp ? format(new Date(log.timestamp), 'PP p') : 'No timestamp'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
