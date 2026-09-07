import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  Plus,
  Filter,
  Edit2,
  Trash2,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  RefreshCw,
  X,
} from 'lucide-react';
import { studentApi, departmentApi, sessionApi, idCardApi } from '../api/index.ts';
import { Student, Department, AcademicSession, StudentIdCard } from '../types/index.ts';
import { StudentModal } from '../components/StudentModal.tsx';
import { DigitalIdCard } from '../components/DigitalIdCard.tsx';
import { useToast } from '../contexts/ToastContext.tsx';

export const InstituteStudentsPage: React.FC = () => {
  const { showToast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [sessions, setSessions] = useState<AcademicSession[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [cardToPreview, setCardToPreview] = useState<StudentIdCard | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await studentApi.list({
        search,
        department_id: selectedDept || undefined,
        status: selectedStatus || undefined,
        semester: selectedSemester || undefined,
      });
      if (res.success && res.data) {
        setStudents(Array.isArray(res.data.students) ? res.data.students : []);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load students directory', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, selectedDept, selectedStatus, selectedSemester, showToast]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    Promise.all([departmentApi.list(), sessionApi.list()])
      .then(([deptRes, sesRes]) => {
        if (deptRes.success && deptRes.data) {
          setDepartments(Array.isArray(deptRes.data.departments) ? deptRes.data.departments : []);
        }
        if (sesRes.success && sesRes.data) {
          setSessions(Array.isArray(sesRes.data.sessions) ? sesRes.data.sessions : []);
        }
      })
      .catch(() => {});
  }, []);

  const handleEdit = (student: Student) => {
    setStudentToEdit(student);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setStudentToEdit(null);
    setIsModalOpen(true);
  };

  const handleViewCard = async (student: Student) => {
    try {
      const res = await idCardApi.list({ student_id: student.id, limit: 1 });
      if (res.success && res.data && res.data.cards.length > 0) {
        setCardToPreview(res.data.cards[0]);
      } else {
        showToast('No active digital ID card found for this student. You can issue one from the ID Cards page.', 'info');
      }
    } catch (err: any) {
      showToast(err.message || 'Could not fetch student ID card', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    try {
      const res = await studentApi.delete(studentToDelete.id);
      if (res.success) {
        showToast(`Student ${studentToDelete.first_name} has been deactivated.`, 'success');
        setStudentToDelete(null);
        fetchStudents();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to deactivate student', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-400" />
            Students Directory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage institutional student enrollment, database updates, and digital ID issuance
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Register Student
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ID number, or email..."
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Departments</option>
            {(departments || []).map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="GRADUATED">GRADUATED</option>
            <option value="SUSPENDED">SUSPENDED</option>
          </select>

          <button
            onClick={fetchStudents}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
            title="Refresh List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/60 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Student</th>
                <th className="px-4 py-3.5">Student ID</th>
                <th className="px-4 py-3.5">Department</th>
                <th className="px-4 py-3.5">Semester</th>
                <th className="px-4 py-3.5">Blood Group</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">ID Card</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                    Querying student records...
                  </td>
                </tr>
              ) : (students || []).length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    No student records found matching your filters.
                  </td>
                </tr>
              ) : (
                (students || []).map((student) => (
                  <tr key={student.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3.5 flex items-center gap-3">
                      <div className="w-9 h-10 rounded-lg overflow-hidden border border-slate-700 bg-slate-800 flex-shrink-0">
                        <img
                          src={
                            student.photo_url ||
                            `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80`
                          }
                          alt={student.first_name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">
                          {student.first_name} {student.last_name}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[160px]">
                          {student.email}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 font-mono font-bold text-blue-400">
                      {student.student_id_number}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-medium text-slate-200">
                        {student.department_name || 'N/A'}
                      </div>
                      <div className="text-[10px] text-slate-400">{student.session_name}</div>
                    </td>

                    <td className="px-4 py-3.5">{student.current_semester}</td>

                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-900/60 text-[10px]">
                        {student.blood_group || 'N/A'}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          student.status === 'ACTIVE'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                        }`}
                      >
                        {student.status}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      {student.active_card_number ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-semibold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                          <CheckCircle2 className="w-3 h-3" />
                          Issued
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/60">
                          No Card
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleViewCard(student)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="View Digital ID Card"
                        >
                          <CreditCard className="w-4 h-4 text-blue-400" />
                        </button>

                        <button
                          onClick={() => handleEdit(student)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="Edit Student Record"
                        >
                          <Edit2 className="w-4 h-4 text-amber-400" />
                        </button>

                        <button
                          onClick={() => setStudentToDelete(student)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/50 text-slate-300 hover:text-rose-400 transition-colors"
                          title="Deactivate Student"
                        >
                          <Trash2 className="w-4 h-4 text-rose-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Form Modal (Create or PostgreSQL Update) */}
      <StudentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchStudents}
        studentToEdit={studentToEdit}
        departments={departments}
        sessions={sessions}
      />

      {/* Digital ID Card Preview Modal */}
      {cardToPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setCardToPreview(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <h3 className="text-base font-bold text-white">Student Digital ID Card</h3>
              <p className="text-xs text-slate-400">Cryptographically verifiable student credential</p>
            </div>

            <DigitalIdCard card={cardToPreview} showControls={true} />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Deactivate Student Record?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to deactivate <span className="font-bold text-white">{studentToDelete.first_name} {studentToDelete.last_name}</span> ({studentToDelete.student_id_number})? This will suspend their digital ID card credentials.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setStudentToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30"
              >
                Confirm Deactivation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
