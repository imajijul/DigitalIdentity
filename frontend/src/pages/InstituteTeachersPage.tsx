import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Trash2, Mail, Phone, X, Shield } from 'lucide-react';
import { teacherApi, departmentApi } from '../api/index.ts';
import { Teacher, Department } from '../types/index.ts';
import { useToast } from '../contexts/ToastContext.tsx';

export const InstituteTeachersPage: React.FC = () => {
  const { showToast } = useToast();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('teacher123');
  const [empId, setEmpId] = useState('');
  const [designation, setDesignation] = useState('Associate Professor');
  const [deptId, setDeptId] = useState('');
  const [phone, setPhone] = useState('+1 (555) 019-2834');

  const fetchTeachers = async () => {
    try {
      const res = await teacherApi.list();
      if (res.success && res.data) {
        setTeachers(Array.isArray(res.data.teachers) ? res.data.teachers : []);
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to load teachers', 'error');
    }
  };

  useEffect(() => {
    fetchTeachers();
    departmentApi.list().then((res) => {
      if (res.success && res.data) {
        const deptList = Array.isArray(res.data.departments) ? res.data.departments : [];
        setDepartments(deptList);
        if (deptList.length > 0) setDeptId(deptList[0].id);
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await teacherApi.create({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        employee_id_number: empId,
        designation,
        department_id: deptId,
        phone,
      });
      showToast('Faculty member onboarded successfully', 'success');
      setIsModalOpen(false);
      fetchTeachers();
    } catch (err: any) {
      showToast(err.message || 'Failed to onboard teacher', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-blue-400" />
            Faculty & Verification Staff
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Department instructors and staff with permissions to verify student credentials
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Faculty
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(teachers || []).map((t) => (
          <div
            key={t.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-white">
                  {t.first_name} {t.last_name}
                </h3>
                <div className="text-xs font-semibold text-blue-400 mt-0.5">{t.designation}</div>
                <div className="text-[11px] text-slate-400">{t.department_name}</div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {t.employee_id_number}
              </span>
            </div>

            <div className="pt-3 border-t border-slate-800/80 space-y-1 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span className="truncate">{t.email}</span>
              </div>
              {t.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t.phone}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Onboard Faculty Member</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Faculty ID *</label>
                  <input
                    type="text"
                    required
                    value={empId}
                    onChange={(e) => setEmpId(e.target.value)}
                    placeholder="FAC-2024-01"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Designation</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                <select
                  value={deptId}
                  onChange={(e) => setDeptId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  {(departments || []).map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30"
                >
                  Register Faculty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
