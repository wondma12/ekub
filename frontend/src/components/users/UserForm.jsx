import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import Alert from '../common/Alert';

const UserForm = ({ 
  initialData = null, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  isEdit = false,
}) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    role: 'USER',
    status: 'ACTIVE',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        full_name: initialData.full_name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        password: '',
        role: initialData.role || 'USER',
        status: initialData.status || 'ACTIVE',
      });
    }
  }, [initialData]);

  const validate = (fieldName, value) => {
    const newErrors = { ...errors };

    switch (fieldName) {
      case 'full_name':
        if (!value || value.trim().length < 2) {
          newErrors.full_name = 'Full name must be at least 2 characters';
        } else if (value.trim().length > 150) {
          newErrors.full_name = 'Full name must not exceed 150 characters';
        } else {
          delete newErrors.full_name;
        }
        break;

      case 'email':
        if (!value) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;

      case 'phone':
        if (value && !/^[0-9+\-\s()]+$/.test(value)) {
          newErrors.phone = 'Phone number contains invalid characters';
        } else {
          delete newErrors.phone;
        }
        break;

      case 'password':
        if (!isEdit && (!value || value.length < 6)) {
          newErrors.password = 'Password must be at least 6 characters';
        } else if (value && value.length < 6) {
          newErrors.password = 'Password must be at least 6 characters';
        } else if (value && !/(?=.*[A-Za-z])(?=.*\d)/.test(value)) {
          newErrors.password = 'Password must contain at least one letter and one number';
        } else {
          delete newErrors.password;
        }
        break;

      case 'role':
        if (!value) {
          newErrors.role = 'Role is required';
        } else {
          delete newErrors.role;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return !newErrors[fieldName];
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      validate(name, value);
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validate(name, formData[name]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all fields
    const allTouched = {};
    const allErrors = {};
    let isValid = true;

    Object.keys(formData).forEach(key => {
      allTouched[key] = true;
      const fieldValid = validate(key, formData[key]);
      if (!fieldValid) {
        isValid = false;
        allErrors[key] = errors[key];
      }
    });

    setTouched(allTouched);

    if (isValid) {
      const submitData = { ...formData };
      // Remove password if empty and isEdit
      if (isEdit && !submitData.password) {
        delete submitData.password;
      }
      onSubmit(submitData);
    }
  };

  const roles = [
    { value: 'ADMIN', label: 'Admin' },
    { value: 'JUDGE', label: 'Judge' },
    { value: 'USER', label: 'User' },
  ];

  const statuses = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
    { value: 'SUSPENDED', label: 'Suspended' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="col-span-2">
          <label className="form-label">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`form-input ${touched.full_name && errors.full_name ? 'border-red-500 focus:ring-red-500' : ''}`}
            placeholder="Enter full name"
            disabled={isLoading}
          />
          {touched.full_name && errors.full_name && (
            <p className="form-error">{errors.full_name}</p>
          )}
        </div>

        {/* Email */}
        <div className="col-span-2 md:col-span-1">
          <label className="form-label">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`form-input ${touched.email && errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
            placeholder="Enter email address"
            disabled={isLoading}
          />
          {touched.email && errors.email && (
            <p className="form-error">{errors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div className="col-span-2 md:col-span-1">
          <label className="form-label">Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`form-input ${touched.phone && errors.phone ? 'border-red-500 focus:ring-red-500' : ''}`}
            placeholder="Enter phone number"
            disabled={isLoading}
          />
          {touched.phone && errors.phone && (
            <p className="form-error">{errors.phone}</p>
          )}
        </div>

        {/* Password */}
        <div className="col-span-2">
          <label className="form-label">
            Password {!isEdit && <span className="text-red-500">*</span>}
            {isEdit && <span className="text-gray-400 text-xs font-normal ml-2">(Leave blank to keep current)</span>}
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`form-input ${touched.password && errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
            placeholder={isEdit ? 'Enter new password (optional)' : 'Enter password'}
            disabled={isLoading}
          />
          {touched.password && errors.password && (
            <p className="form-error">{errors.password}</p>
          )}
        </div>

        {/* Role */}
        <div className="col-span-2 md:col-span-1">
          <label className="form-label">
            Role <span className="text-red-500">*</span>
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="form-input"
            disabled={isLoading}
          >
            {roles.map(role => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div className="col-span-2 md:col-span-1">
          <label className="form-label">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="form-input"
            disabled={isLoading}
          >
            {statuses.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button
          variant="light"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          type="submit"
          loading={isLoading}
          disabled={isLoading}
        >
          {isEdit ? 'Update User' : 'Create User'}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;