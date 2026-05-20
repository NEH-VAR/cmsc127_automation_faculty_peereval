import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, X, Eye, EyeOff } from 'lucide-react';

const UserModal = ({
  isOpen,
  isEdit,
  formData,
  setFormData,
  roleOptions,
  collegeOptions,
  imagePreview,
  onImageChange,
  onClose,
  onSubmit,
  isCreating,
  isSaving,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setShowPassword(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isSubmitting = isCreating || isSaving;

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/30 flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border-2 border-gray-200 my-auto">
        <div className="flex items-center justify-between border-b-2 border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-brand-black">{isEdit ? 'Edit User' : 'Add User'}</h2>
            <p className="text-sm text-brand-grey">Create a faculty, admin, dean, or department chair account.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-brand-grey hover:bg-gray-100 hover:text-brand-black"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-6 px-6 py-6">
          <div className="flex items-center gap-4 rounded-2xl border-2 border-dashed border-gray-300 p-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-gray-50 border-2 border-gray-200">
              {imagePreview ? (
                <img src={imagePreview} alt="Profile preview" className="h-full w-full object-cover" />
              ) : (
                <ImageIcon className="h-6 w-6 text-brand-grey" />
              )}
            </div>
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium text-brand-black" htmlFor="image">
                Profile Image
              </label>
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={onImageChange}
                className="w-full text-sm text-brand-grey file:mr-4 file:rounded-lg file:border-0 file:bg-brand-maroon file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:opacity-90"
              />
              <p className="mt-2 text-xs text-brand-grey">Upload a profile picture for this account.</p>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-brand-black" htmlFor="full_name">
              Full Name
            </label>
            <input
              id="full_name"
              type="text"
              value={formData.full_name}
              onChange={(event) => setFormData((prev) => ({ ...prev, full_name: event.target.value }))}
              className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-brand-green"
              placeholder="Juan Dela Cruz"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-brand-black" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
              className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-brand-green"
              placeholder="juan@school.edu"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-brand-black" htmlFor="college_id">
              College {formData.role === 'Faculty' ? '(required)' : '(optional)'}
            </label>
            <select
              id="college_id"
              value={formData.college_id}
              onChange={(event) => setFormData((prev) => ({ ...prev, college_id: event.target.value }))}
              className="w-full rounded-xl border-2 border-gray-300 pl-4 pr-10 py-3 text-sm outline-none transition focus:border-brand-green"
            >
              <option value="">Select college</option>
              {collegeOptions.map((college) => (
                <option key={college.college_id} value={college.college_id}>
                  {college.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-brand-black" htmlFor="role">
              Role
            </label>
            <select
              id="role"
              value={formData.role}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  role: event.target.value,
                  password: event.target.value === 'Faculty' ? '' : prev.password,
                }))
              }
              className="w-full rounded-xl border-2 border-gray-300 pl-4 pr-10 py-3 text-sm outline-none transition focus:border-brand-green"
            >
              {roleOptions.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          {formData.role !== 'Faculty' && (
            <div>
              <label className="mb-2 block text-sm font-medium text-brand-black" htmlFor="password">
                Password (Required)
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(event) => setFormData((prev) => ({ ...prev, password: event.target.value }))}
                  className="w-full rounded-xl border-2 border-gray-300 pl-4 pr-12 py-3 text-sm outline-none transition focus:border-brand-green"
                  placeholder={
                    isEdit
                      ? 'Leave blank to keep current password'
                      : 'Set a password'
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-grey hover:text-brand-black transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border-2 border-gray-300 px-5 py-3 text-sm font-medium text-brand-black hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl border-2 border-transparent bg-brand-maroon px-5 py-3 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isEdit ? (isSaving ? 'Updating...' : 'Update User') : isCreating ? 'Saving...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
