import React, { useState, useEffect } from 'react';
import { GraduationCap, Plus, Trash2, Edit2, CheckCircle, X, AlertCircle } from 'lucide-react';
import { departmentApi } from '../api/index.ts';
import { Department } from '../types/index.ts';
import { useToast } from '../contexts/ToastContext.tsx';

export const InstituteDepartmentsPage: React.FC = () => {
  const { showToast } = useToast();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [hod, setHod] = useState('');

  const fetchDepts = async () => {
    setLoading(true);
    try {
      const res = await departmentApi.list();
      if (res.success && res.data) {
        setDepartments(Array.isArray(res.data.departments) ? res.data.departments : []);
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to load departments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepts();
  }, []);

  const handleOpenCreate = () => {
    setEditingDept(null);
    setCode('');
    setName('');
    setDescription('');
    setHod('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (d: Department) => {
    setEditingDept(d);
    setCode(d.code);
    setName(d.name);
    setDescription(d.description || '');
    setHod(d.head_of_department || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDept) {
        await departmentApi.update(editingDept.id, { name, description, head_of_department: hod });
        showToast('Department updated successfully', 'success');
      } else {
        await departmentApi.create({ code, name, description, head_of_department: hod });
        showToast('Department created successfully', 'success');
      }
      setIsModalOpen(false);
      fetchDepts();
    } catch (err: any) {
      showToast(err.message || 'Action failed', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this department?')) return;
    try {
      await departmentApi.delete(id);
      showToast('Department deleted', 'success');
      fetchDepts();
    } catch (err: any) {
      showToast(err.message || 'Delete failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-blue-400" />
            Departments
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manage institutional academic faculties and programs</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Department
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(departments || []).map((dept) => (
          <div
            key={dept.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/60">
                  {dept.code}
                </span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                  <CheckCircle className="w-3 h-3" /> Active
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-2">{dept.name}</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {dept.description || 'Institutional academic division.'}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <div className="text-[11px] text-slate-400">
                <span className="text-slate-500">HOD:</span> {dept.head_of_department || 'Unassigned'}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(dept)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(dept.id)}
                  className="p-1.5 rounded-lg hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingDept ? 'Edit Department' : 'Create Department'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Department Code *</label>
                <input
                  type="text"
                  required
                  disabled={!!editingDept}
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. CS, ECE, ME"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Department Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Department of Computer Science"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Head of Department</label>
                <input
                  type="text"
                  value={hod}
                  onChange={(e) => setHod(e.target.value)}
                  placeholder="e.g. Dr. Alan Turing"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:ring-2 focus:ring-blue-500"
                />
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
                  {editingDept ? 'Update Department' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
