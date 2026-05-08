import React, { useEffect, useMemo, useState } from 'react';
import { banStudent, createAdminUser, getAllStudents } from '../../api/admin';
import { searchStudents } from '../../api/users';
import type { StudentRecord } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import toast from 'react-hot-toast';
import styles from '../portal/Portal.module.css';

const initialForm = {
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  user_name: '',
  phone: '',
  role: 'student' as 'student' | 'admin',
  faculty: '',
  major: '',
  level: '',
  picture: '',
  in_dorms: false,
};

export const AdminUsers: React.FC = () => {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState(initialForm);

  const loadStudents = async () => {
    try {
      const data = await getAllStudents();
      setStudents(data);
    } catch (error) {
      toast.error('Failed to load students');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) {
      return students;
    }

    const lowered = query.toLowerCase();
    return students.filter((student) =>
      [student.student_name, student.student_email, student.faculty, student.major]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(lowered))
    );
  }, [query, students]);

  const handleBackendSearch = async () => {
    if (!query.trim()) {
      loadStudents();
      return;
    }

    try {
      const results = await searchStudents(query.trim());
      setStudents(results as unknown as StudentRecord[]);
    } catch (error) {
      toast.error('Search failed');
    }
  };

  const handleBan = async (studentId: string) => {
    try {
      await banStudent(studentId);
      toast.success('User banned');
      loadStudents();
    } catch (error) {
      toast.error('Failed to ban user');
    }
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await createAdminUser({
        ...form,
        faculty: form.role === 'student' ? form.faculty : undefined,
        major: form.role === 'student' ? form.major : undefined,
        level: form.role === 'student' ? form.level : undefined,
        picture: form.role === 'student' ? form.picture : undefined,
        in_dorms: form.role === 'student' ? form.in_dorms : undefined,
      });
      toast.success('User created');
      setIsCreateOpen(false);
      setForm(initialForm);
      loadStudents();
    } catch (error) {
      toast.error('Failed to create user');
    }
  };

  return (
    <div className={styles.page}>
      <section className={styles.sectionHeader}>
        <div>
          <h2>Student Management</h2>
          <p className={styles.subtle}>Search, review activity signals, and create new users.</p>
        </div>
        <div className={styles.actions}>
          <Button variant="secondary" onClick={handleBackendSearch}>
            Search Backend
          </Button>
          <Button onClick={() => setIsCreateOpen(true)}>Create User</Button>
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Student Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={styles.inlineForm} style={{ marginBottom: '1rem' }}>
            <Input
              className={styles.inlineFormFull}
              label="Filter students"
              placeholder="Search by name, faculty, major, or email"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {isLoading ? (
            <p className={styles.subtle}>Loading students...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Faculty</TableHead>
                  <TableHead>Major</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reservations</TableHead>
                  <TableHead>Complaints</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((student) => (
                  <TableRow key={student.student_id}>
                    <TableCell>
                      <strong>{student.student_name}</strong>
                      <div className={styles.subtle}>{student.student_email}</div>
                    </TableCell>
                    <TableCell>{student.faculty}</TableCell>
                    <TableCell>{student.major}</TableCell>
                    <TableCell>{student.status}</TableCell>
                    <TableCell>{student.reservations}</TableCell>
                    <TableCell>{student.complaints}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="danger"
                        disabled={student.status === 'banned'}
                        onClick={() => handleBan(student.student_id)}
                      >
                        Ban
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create User">
        <form className={styles.inlineForm} onSubmit={handleCreate}>
          <Input label="First name" value={form.first_name} onChange={(e) => setForm((current) => ({ ...current, first_name: e.target.value }))} required />
          <Input label="Last name" value={form.last_name} onChange={(e) => setForm((current) => ({ ...current, last_name: e.target.value }))} required />
          <Input className={styles.inlineFormFull} label="Email" type="email" value={form.email} onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))} required />
          <Input label="Username" value={form.user_name} onChange={(e) => setForm((current) => ({ ...current, user_name: e.target.value }))} required />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm((current) => ({ ...current, phone: e.target.value }))} required />
          <Input label="Password" type="password" value={form.password} onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))} required />
          <Input label="Role" value={form.role} onChange={(e) => setForm((current) => ({ ...current, role: e.target.value as 'student' | 'admin' }))} required />

          {form.role === 'student' ? (
            <>
              <Input label="Faculty" value={form.faculty} onChange={(e) => setForm((current) => ({ ...current, faculty: e.target.value }))} required />
              <Input label="Major" value={form.major} onChange={(e) => setForm((current) => ({ ...current, major: e.target.value }))} required />
              <Input label="Level" value={form.level} onChange={(e) => setForm((current) => ({ ...current, level: e.target.value }))} required />
              <Input className={styles.inlineFormFull} label="Picture URL" value={form.picture} onChange={(e) => setForm((current) => ({ ...current, picture: e.target.value }))} required />
            </>
          ) : null}

          <div className={styles.inlineFormFull}>
            <Button type="submit">Create User</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
