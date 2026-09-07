import React, { useState, useEffect } from 'react';
import { X, Save, User, Mail, Phone, Calendar, Heart, BookOpen, Clock, AlertCircle } from 'lucide-react';
import { Student, Department, AcademicSession } from '../types/index.ts';
import { studentApi } from '../api/index.ts';
import { useToast } from '../contexts/ToastContext.tsx';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  studentToEdit?: Student | null;
  departments: Department[];
  sessions: AcademicSession[];
}

export const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  studentToEdit,
  departments,
  sessions,
}) => {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    blood_group: 'A+',
    department_id: '',
    session_id: '',
    current_semester: '1st Semester',
    status: 'ACTIVE',
    photo_url: '',
    emergency_contact: '',
    address: '',
    student_id_number: '',
  });

  useEffect(() => {
    if (studentToEdit) {
      setFormData({
        first_name: studentToEdit.first_name || '',
        last_name: studentToEdit.last_name || '',
        email: studentToEdit.email || '',
        phone: studentToEdit.phone || '',
        date_of_birth: studentToEdit.date_of_birth ? studentToEdit.date_of_birth.split('T')[0] : '',
        blood_group: studentToEdit.blood_group || 'A+',
        department_id: studentToEdit.department_id || '',
        session_id: studentToEdit.session_id || '',
        current_semester: studentToEdit.current_semester || '1st Semester',
        status: studentToEdit.status || 'ACTIVE',
        photo_url: studentToEdit.photo_url || '',
        emergency_contact: studentToEdit.emergency_contact || '',
        address: studentToEdit.address || '',
        student_id_number: studentToEdit.student_id_number || '',
      });
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        date_of_birth: '2004-05-15',
        blood_group: 'O+',
        department_id: departments[0]?.id || '',
        session_id: sessions[0]?.id || '',
        current_semester: '1st Semester',
        status: 'ACTIVE',
        photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
        emergency_contact: '+1-555-0199',
        address: 'Campus Dormitory Block B',
        student_id_number: '',
      });
    }
    setErrorMsg(null);
  }, [studentToEdit, departments, sessions, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      if (studentToEdit) {
        // Section 14 & 15: update safe fields only, persists to PostgreSQL
        const updatePayload: any = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
          date_of_birth: formData.date_of_birth || null,
          blood_group: formData.blood_group,
          department_id: formData.department_id || null,
          session_id: formData.session_id || null,
          current_semester: formData.current_semester,
          status: formData.status,
          photo_url: formData.photo_url,
          emergency_contact: formData.emergency_contact,
          address: formData.address,
        };

        const res = await studentApi.update(studentToEdit.id, updatePayload);
        if (res.success) {
          showToast('Student details updated successfully in PostgreSQL.', 'success');
          onSuccess();
          onClose();
        }
      } else {
        const createPayload: any = {
          ...formData,
        };
        const res = await studentApi.create(createPayload);
        if (res.success) {
          showToast('Student registered and digital ID card issued.', 'success');
          onSuccess();
          onClose();
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save student record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-blue-400" />
              {studentToEdit ? 'Edit Student Record' : 'Register New Student'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {studentToEdit
                ? `Updating ID: ${studentToEdit.student_id_number} (Protected identifier)`
                : 'Enter student details to register and generate official digital ID'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-200 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {studentToEdit && (
            <div className="p-3 bg-blue-950/40 border border-blue-800/60 rounded-xl text-xs text-blue-300 flex items-center justify-between">
              <div>
                <span className="font-semibold text-white">Student ID Number:</span> {studentToEdit.student_id_number}
              </div>
              <span className="text-[10px] bg-blue-900/60 px-2 py-0.5 rounded text-blue-200 uppercase tracking-wider">
                Protected Field
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Jane"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Doe"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="jane.doe@univ.edu"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+1 (555) 019-2834"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
              <select
                value={formData.department_id}
                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Department</option>
                {(departments || []).map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Academic Session</label>
              <select
                value={formData.session_id}
                onChange={(e) => setFormData({ ...formData, session_id: e.target.value })}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Session</option>
                {(sessions || []).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Current Semester</label>
              <input
                type="text"
                value={formData.current_semester}
                onChange={(e) => setFormData({ ...formData, current_semester: e.target.value })}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 4th Semester"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Blood Group</label>
              <select
                value={formData.blood_group}
                onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Date of Birth</label>
              <input
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Enrollment Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="GRADUATED">GRADUATED</option>
                <option value="SUSPENDED">SUSPENDED</option>
                <option value="DROPPED">DROPPED</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Photo URL</label>
            <input
              type="url"
              value={formData.photo_url}
              onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/photos/student.jpg"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Emergency Contact</label>
              <input
                type="text"
                value={formData.emergency_contact}
                onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Parent / Guardian (+1 555-0123)"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Address / Residence</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Hostel Block A, Room 302"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-lg shadow-blue-600/30 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Saving...' : studentToEdit ? 'Update in Database' : 'Register & Issue ID'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
