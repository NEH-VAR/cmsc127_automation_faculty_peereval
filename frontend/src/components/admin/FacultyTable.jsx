import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '../ui/button';
import { useToast } from '../../lib/ToastContext';
import { api } from '../../lib/api';
import UsersTable from './users/UsersTable';
import UserModal from './users/UserModal';

const FacultyTable = ({ onComplete }) => {
  const roleOptions = useMemo(() => ([
    { value: 'Faculty', label: 'Faculty' },
    { value: 'Admin', label: 'Admin' },
    { value: 'Dean', label: 'Dean' },
    { value: 'DepChair', label: 'Department Chair' },
  ]), []);

  const [members, setMembers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [collegeOptions, setCollegeOptions] = useState([]);
  const [isCycleModalOpen, setIsCycleModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [editingUserId, setEditingUserId] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [cycleForm, setCycleForm] = useState({ semester: '1', end_date: '' });
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: 'Faculty',
    password: '',
    image: '',
    college_id: '',
  });
  const { showToast } = useToast();

  const normalizeRoleLabel = (role) => {
    const option = roleOptions.find((item) => item.value === role);
    return option ? option.label : role || 'Faculty';
  };

  const getInitialFormData = () => ({
    full_name: '',
    email: '',
    role: 'Faculty',
    password: '',
    image: '',
    college_id: '',
  });

  const resetForm = () => {
    setFormData(getInitialFormData());
    setImagePreview('');
    setEditingUserId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const openEditModal = async (member) => {
    try {
      const details = await api.users.getById(member.id);
      setEditingUserId(member.id);
      setFormData({
        full_name: details.full_name || member.name,
        email: details.email || member.email,
        role: details.role || member.role || 'Faculty',
        password: '',
        image: '',
        college_id: details.college_id ?? member.college_id ?? '',
      });
      setImagePreview(details.image_base64 ? `data:image/*;base64,${details.image_base64}` : '');
      setIsEditModalOpen(true);
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Unable to open editor',
        message: error.message || 'Could not load this user.',
        actionText: 'Dismiss',
      });
    }
  };

  const readImageAsBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Unable to read image file'));
    reader.readAsDataURL(file);
  });

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const maxSizeInBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      showToast({
        type: 'warning',
        title: 'Image too large',
        message: 'Please choose an image smaller than 5 MB.',
        actionText: 'Okay',
      });
      event.target.value = '';
      return;
    }

    try {
      const base64 = await readImageAsBase64(file);
      setFormData((prev) => ({ ...prev, image: base64 }));
      setImagePreview(URL.createObjectURL(file));
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Image upload failed',
        message: error.message || 'Please try another file.',
        actionText: 'Dismiss',
      });
    }
  };

  const loadUsers = async () => {
    setIsLoading(true);
    setLoadError('');

    try {
      const data = await api.users.listAll();
      const nextMembers = Array.isArray(data)
        ? data.map((user) => ({
            id: user.user_id,
            name: user.full_name,
            role: user.role,
            email: user.email,
            collegeId: user.college_id ?? '',
            collegeName: user.college_name || '',
            avatarSrc: user.image_base64 ? `data:image/*;base64,${user.image_base64}` : '',
          }))
        : [];

      setMembers(nextMembers);
      setSelectedIds((prev) => prev.filter((id) => nextMembers.some((member) => member.id === id && member.role === 'Faculty')));
    } catch (error) {
      setLoadError(error.message || 'Failed to load users');
      showToast({
        type: 'error',
        title: 'Unable to load users',
        message: error.message || 'Please refresh and try again.',
        actionText: 'Dismiss',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadColleges = async () => {
    try {
      const data = await api.colleges.listAll();
      setCollegeOptions(Array.isArray(data) ? data : []);
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Unable to load colleges',
        message: error.message || 'Please refresh and try again.',
        actionText: 'Dismiss',
      });
    }
  };

  useEffect(() => {
    loadUsers();
    loadColleges();
  }, []);

  const toggleSelect = (id) => {
    const member = members.find((item) => item.id === id);
    if (!member || member.role !== 'Faculty') {
      return;
    }

    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelectedIds(members.filter((member) => member.role === 'Faculty').map((member) => member.id));
  const deselectAll = () => setSelectedIds([]);

  const getSemesterLabel = (semester) => (Number(semester) === 2 ? '2nd Semester' : '1st Semester');

  const getDefaultSemester = () => {
    const month = new Date().getMonth() + 1;
    return month >= 7 ? '2' : '1';
  };

  const buildNewCyclePayload = () => {
    const now = new Date();
    const year = now.getFullYear();
    const startDate = now.toISOString().split('T')[0];

    return {
      year,
      semester: Number(cycleForm.semester) || 1,
      start_date: startDate,
      end_date: cycleForm.end_date,
      is_active: true,
    };
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();

    if (!formData.full_name.trim() || !formData.email.trim()) {
      showToast({
        type: 'warning',
        title: 'Missing information',
        message: 'Full name and email are required.',
        actionText: 'Okay',
      });
      return;
    }

    if (formData.role === 'Faculty' && !formData.college_id) {
      showToast({
        type: 'warning',
        title: 'College required',
        message: 'Faculty members must belong to a college.',
        actionText: 'Okay',
      });
      return;
    }

    const passwordRequiredOnCreate = formData.role !== 'Faculty' && !formData.password.trim();

    if (passwordRequiredOnCreate) {
      showToast({
        type: 'warning',
        title: 'Password required',
        message: 'A password is required when changing a faculty account into a privileged account.',
        actionText: 'Okay',
      });
      return;
    }

    setIsCreating(true);
    try {
      await api.users.create({
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        role: formData.role,
        ...(formData.college_id ? { college_id: Number(formData.college_id) } : {}),
        ...(formData.password.trim() ? { password: formData.password } : {}),
        ...(formData.image ? { image: formData.image } : {}),
      });

      showToast({
        type: 'success',
        title: 'User created',
        message: `${formData.full_name.trim()} was added successfully.`,
        actionText: 'Done',
      });

      setFormData({
        full_name: '',
        email: '',
        role: 'Faculty',
        password: '',
        image: '',
        college_id: '',
      });
      setIsAddModalOpen(false);
      await loadUsers();
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Create failed',
        message: error.message || 'Could not create user.',
        actionText: 'Dismiss',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateUser = async (event) => {
    event.preventDefault();

    if (!editingUserId) return;

    if (!formData.full_name.trim() || !formData.email.trim()) {
      showToast({
        type: 'warning',
        title: 'Missing information',
        message: 'Full name and email are required.',
        actionText: 'Okay',
      });
      return;
    }

    if (formData.role === 'Faculty' && !formData.college_id) {
      showToast({
        type: 'warning',
        title: 'College required',
        message: 'Faculty members must belong to a college.',
        actionText: 'Okay',
      });
      return;
    }

    setIsSaving(true);
    try {
      await api.users.update(editingUserId, {
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        role: formData.role,
        ...(formData.college_id ? { college_id: Number(formData.college_id) } : { college_id: null }),
        ...(formData.password.trim() ? { password: formData.password } : {}),
        ...(formData.image ? { image: formData.image } : {}),
      });

      showToast({
        type: 'success',
        title: 'User updated',
        message: `${formData.full_name.trim()} was updated successfully.`,
        actionText: 'Done',
      });

      resetForm();
      setIsEditModalOpen(false);
      await loadUsers();
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Update failed',
        message: error.message || 'Could not update user.',
        actionText: 'Dismiss',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartForms = () => {
    if (selectedIds.length === 0) {
      showToast({
        type: 'warning',
        title: 'No Faculty Selected',
        message: 'Please select at least one faculty member to proceed.',
        actionText: 'Got it'
      });
      return;
    }
    setCycleForm({ semester: getDefaultSemester(), end_date: '' });
    setIsCycleModalOpen(true);
  };

  const handleConfirm = async (event) => {
    event.preventDefault();

    if (!cycleForm.end_date) {
      showToast({
        type: 'warning',
        title: 'End date required',
        message: 'Please choose the evaluation cycle end date.',
        actionText: 'Okay',
      });
      return;
    }

    const startDate = new Date().toISOString().split('T')[0];
    if (cycleForm.end_date < startDate) {
      showToast({
        type: 'warning',
        title: 'Invalid end date',
        message: 'The end date must be today or later.',
        actionText: 'Okay',
      });
      return;
    }

    setIsCycleModalOpen(false);
    setIsStarting(true);

    try {
      const cyclePayload = buildNewCyclePayload();
      const cycle = await api.evaluationCycles.create(cyclePayload);
      await api.evaluationCycles.assignFaculty(cycle.cycle_id, selectedIds);

      showToast({
        type: 'success',
        title: 'Cycle created',
        message: `Cycle ${cycle.year} - ${getSemesterLabel(cycle.semester ?? cyclePayload.semester)} created. Review and finalize questions next.`,
        actionText: 'Go to Questions',
      });

      onComplete?.();
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Unable to start forms',
        message: error.message || 'Please try again.',
        actionText: 'Dismiss',
      });
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 lg:p-12 bg-brand-bg min-h-screen">
      <header className="mb-8 lg:mb-12">
        <h1 className="text-4xl lg:text-6xl font-normal text-brand-green mb-2 font-heading">Hello Dean!</h1>
        <p className="text-brand-black text-base lg:text-lg">Manage faculty, admin, dean, and department chair accounts from this page.</p>
      </header>

      <UsersTable
        members={members}
        selectedIds={selectedIds}
        isLoading={isLoading}
        loadError={loadError}
        onSelectAll={selectAll}
        onDeselectAll={deselectAll}
        onAddUser={openCreateModal}
        onToggleSelect={toggleSelect}
        onEditUser={openEditModal}
        normalizeRoleLabel={normalizeRoleLabel}
      />

      <div className="mt-8 lg:mt-12 flex justify-end">
        <Button 
          onClick={handleStartForms}
          disabled={isStarting}
          className="w-full lg:w-auto bg-brand-maroon hover:opacity-90 text-white px-12 py-3 h-auto rounded-[16px] text-lg font-medium transition-all shadow-[0_8px_20px_-4px_rgba(123,17,19,0.3)]"
        >
          {isStarting ? 'Starting...' : 'Start Forms'}
        </Button>
      </div>

      {isCycleModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCycleModalOpen(false)} />

          <form onSubmit={handleConfirm} className="relative w-full max-w-[560px] rounded-[32px] border border-gray-100 bg-white p-8 shadow-2xl lg:p-10">
            <button
              type="button"
              onClick={() => setIsCycleModalOpen(false)}
              className="absolute right-6 top-6 text-brand-grey transition-colors hover:text-brand-black"
            >
              ×
            </button>

            <h2 className="mb-3 text-3xl font-normal text-brand-green font-heading">Set up evaluation cycle</h2>
            <p className="mb-8 text-sm text-brand-grey">Select the semester and the date when this evaluation cycle should end.</p>

            <div className="grid gap-5">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-brand-black">Semester</label>
                <select
                  value={cycleForm.semester}
                  onChange={(event) => setCycleForm((prev) => ({ ...prev, semester: event.target.value }))}
                  className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-brand-green"
                >
                  <option value="1">1st Semester</option>
                  <option value="2">2nd Semester</option>
                </select>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-brand-black">Cycle end date</label>
                <input
                  type="date"
                  value={cycleForm.end_date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(event) => setCycleForm((prev) => ({ ...prev, end_date: event.target.value }))}
                  className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-brand-green"
                />
              </div>

              <div className="rounded-2xl bg-brand-bg px-4 py-3 text-sm text-brand-black">
                This will create the current year cycle for the selected semester and assign the faculty you selected.
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setIsCycleModalOpen(false)}
                className="flex-1 rounded-[16px] border border-gray-200 px-8 py-3 text-base font-medium text-brand-grey transition-all hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isStarting}
                className="flex-1 rounded-[16px] bg-brand-maroon px-8 py-3 text-base font-medium text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isStarting ? 'Creating...' : 'Create Cycle'}
              </button>
            </div>
          </form>
        </div>
      )}

      <UserModal
        isOpen={isAddModalOpen || isEditModalOpen}
        isEdit={isEditModalOpen}
        formData={formData}
        setFormData={setFormData}
        roleOptions={roleOptions}
        collegeOptions={collegeOptions}
        imagePreview={imagePreview}
        onImageChange={handleImageChange}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
          resetForm();
        }}
        onSubmit={isEditModalOpen ? handleUpdateUser : handleCreateUser}
        isCreating={isCreating}
        isSaving={isSaving}
      />
    </div>
  );
};

export default FacultyTable;
