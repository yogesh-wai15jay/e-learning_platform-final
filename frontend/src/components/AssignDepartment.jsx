import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import toast from 'react-hot-toast';
import Logo from './Logo';

const AssignDepartment = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedDepts, setSelectedDepts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [addingDept, setAddingDept] = useState(false);

  // Fetch all users and all departments
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, deptsRes] = await Promise.all([
          api.get('/admin/users'),
          api.get('/admin/departments')
        ]);
        setUsers(usersRes.data);
        setFilteredUsers(usersRes.data);
        setDepartments(deptsRes.data);
      } catch (error) {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter users by search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredUsers(users.filter(u =>
        u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
      ));
    }
  }, [searchTerm, users]);

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const toggleDepartmentSelection = (deptName) => {
    setSelectedDepts(prev =>
      prev.includes(deptName) ? prev.filter(d => d !== deptName) : [...prev, deptName]
    );
  };

  const handleAssign = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one user');
      return;
    }
    if (selectedDepts.length === 0) {
      toast.error('Please select at least one department');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/admin/assign-department', {
        userIds: selectedUsers,
        departments: selectedDepts
      });
      toast.success(`Departments added to ${selectedUsers.length} user(s)`);
      // Refresh users to show updated departments
      const usersRes = await api.get('/admin/users');
      setUsers(usersRes.data);
      setFilteredUsers(usersRes.data);
      setSelectedUsers([]);
      setSelectedDepts([]);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Assignment failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveDepartment = async (userId, deptName, userName) => {
    if (!window.confirm(`Remove "${deptName}" from ${userName}?`)) return;
    try {
      await api.delete(`/admin/users/${userId}/departments`, { data: { department: deptName } });
      toast.success(`Removed ${deptName} from ${userName}`);
      // Update local state
      setUsers(prev => prev.map(u =>
        u._id === userId ? { ...u, departments: u.departments.filter(d => d !== deptName) } : u
      ));
      setFilteredUsers(prev => prev.map(u =>
        u._id === userId ? { ...u, departments: u.departments.filter(d => d !== deptName) } : u
      ));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove department');
    }
  };

  const handleAddDepartment = async () => {
    if (!newDeptName.trim()) {
      toast.error('Please enter a department name');
      return;
    }
    setAddingDept(true);
    try {
      const res = await api.post('/admin/departments', { name: newDeptName.trim() });
      setDepartments([...departments, res.data]);
      setShowAddModal(false);
      setNewDeptName('');
      toast.success(`Department "${res.data.name}" added`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add department');
    } finally {
      setAddingDept(false);
    }
  };

  const handleDeleteDepartment = async (deptId, deptName) => {
  if (!window.confirm(`Are you sure you want to delete the department "${deptName}"? This will remove it from all users.`)) {
    return;
  }
  try {
    await api.delete(`/admin/departments/${deptId}`);
    toast.success(`Department "${deptName}" deleted`);
    // Refresh departments list
    const deptsRes = await api.get('/admin/departments');
    setDepartments(deptsRes.data);
    // Also refresh users list (departments removed from them)
    const usersRes = await api.get('/admin/users');
    setUsers(usersRes.data);
    setFilteredUsers(usersRes.data);
    // Clear selections that might have included the deleted department
    setSelectedDepts(prev => prev.filter(d => d !== deptName));
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to delete department');
  }
};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
  <div className="relative min-h-screen">

    {/* Background */}
    <div
      className="absolute inset-0 bg-cover bg-center"
      style={{
        backgroundImage: "url('/background.png')",
        backgroundSize: '100% 100%',
      }}
    />

    {/* Soft overlay */}

    <div className="relative z-10 min-h-screen">

      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Logo className="h-10" />

          <div className="flex items-center gap-4">
            <div
              style={{
                padding: '8px 14px',
                borderRadius: 999,
                background: 'rgba(99,102,241,0.08)',
                border: '1px solid rgba(99,102,241,0.16)',
                color: '#6366f1',
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              Admin: {user?.name}
            </div>

            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              style={{
                padding: '10px 16px',
                borderRadius: 12,
                background: 'rgba(236,72,153,0.08)',
                color: '#ec4899',
                border: '1px solid rgba(236,72,153,0.12)',
                fontWeight: 700,
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 py-10">

        {/* Top Heading */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 20,
            marginBottom: 30,
          }}
        >
          <div>
            <p
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: '#6366f1',
                textTransform: 'uppercase',
                marginBottom: 8,
              }}
            >
              Department Management
            </p>

            <h1
              style={{
                fontSize: 'clamp(28px, 4vw, 42px)',
                fontWeight: 900,
                color: '#0f172a',
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                marginBottom: 10,
              }}
            >
              Assign Departments
            </h1>

            <p
              style={{
                color: '#64748b',
                fontSize: 15,
                maxWidth: 650,
                lineHeight: 1.7,
              }}
            >
              Organize users into departments, manage department access,
              and maintain team structures across the platform.
            </p>
          </div>

          <button
            onClick={() => navigate('/admin')}
            style={{
              padding: '12px 18px',
              borderRadius: 14,
              background: 'rgba(99,102,241,0.08)',
              border: '1px solid rgba(99,102,241,0.16)',
              color: '#6366f1',
              fontWeight: 700,
            }}
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

          {/* Departments Card */}
          <div
            style={{
              background: 'rgba(255,255,255,0.55)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 28,
              padding: 28,
              boxShadow: '0 18px 40px rgba(0,0,0,0.06)',
            }}
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#6366f1',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    marginBottom: 4,
                  }}
                >
                  Department List
                </p>

                <h3
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: '#0f172a',
                  }}
                >
                  Select Departments
                </h3>
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 14px',
                  borderRadius: 12,
                  background: 'rgba(99,102,241,0.08)',
                  border: '1px solid rgba(99,102,241,0.18)',
                  color: '#6366f1',
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Department
              </button>
            </div>

            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {departments.map((dept) => (
                <div
                  key={dept._id}
                  style={{
                    background: selectedDepts.includes(dept.name)
                      ? 'rgba(99,102,241,0.08)'
                      : 'rgba(255,255,255,0.45)',
                    border: selectedDepts.includes(dept.name)
                      ? '1px solid rgba(99,102,241,0.22)'
                      : '1px solid rgba(255,255,255,0.3)',
                    borderRadius: 16,
                    padding: '14px 16px',
                    transition: 'all 0.2s',
                  }}
                  className="flex items-center justify-between gap-3"
                >
                  <label className="flex items-center gap-3 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      value={dept.name}
                      checked={selectedDepts.includes(dept.name)}
                      onChange={() => toggleDepartmentSelection(dept.name)}
                      className="w-4 h-4"
                    />

                    <span
                      style={{
                        fontWeight: 600,
                        color: '#334155',
                      }}
                    >
                      {dept.name}
                    </span>
                  </label>

                  <button
                    onClick={() =>
                      handleDeleteDepartment(dept._id, dept.name)
                    }
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      background: 'rgba(239,68,68,0.08)',
                      border: '1px solid rgba(239,68,68,0.14)',
                      color: '#ef4444',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Users Card */}
          <div
            style={{
              background: 'rgba(255,255,255,0.55)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 28,
              padding: 28,
              boxShadow: '0 18px 40px rgba(0,0,0,0.06)',
            }}
          >
            <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
              <div>
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#6366f1',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    marginBottom: 4,
                  }}
                >
                  User Selection
                </p>

                <h3
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: '#0f172a',
                  }}
                >
                  Select Users
                </h3>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: 250,
                    padding: '11px 16px 11px 40px',
                    borderRadius: 14,
                    border: '1px solid rgba(0,0,0,0.08)',
                    background: 'rgba(255,255,255,0.7)',
                    backdropFilter: 'blur(10px)',
                    outline: 'none',
                    fontSize: 14,
                  }}
                />

                <svg
                  className="absolute left-3 top-3.5 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <div className="max-h-[520px] overflow-y-auto space-y-4 pr-1">
              {filteredUsers.map((user) => (
                <div
                  key={user._id}
                  style={{
                    background: selectedUsers.includes(user._id)
                      ? 'rgba(99,102,241,0.08)'
                      : 'rgba(255,255,255,0.4)',
                    border: selectedUsers.includes(user._id)
                      ? '1px solid rgba(99,102,241,0.2)'
                      : '1px solid rgba(255,255,255,0.3)',
                    borderRadius: 18,
                    padding: 18,
                    transition: 'all 0.2s',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user._id)}
                      onChange={() => toggleUserSelection(user._id)}
                      className="w-4 h-4 mt-1"
                    />

                    <div className="flex-1">
                      <div
                        style={{
                          fontWeight: 700,
                          color: '#0f172a',
                          marginBottom: 4,
                        }}
                      >
                        {user.name}
                      </div>

                      <div
                        style={{
                          fontSize: 14,
                          color: '#64748b',
                          marginBottom: 4,
                        }}
                      >
                        {user.email}
                      </div>

                      <div
                        style={{
                          fontSize: 12,
                          color: '#94a3b8',
                          marginBottom: 12,
                        }}
                      >
                        Role: {user.role}
                      </div>

                      <div>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: '#64748b',
                            marginBottom: 8,
                          }}
                        >
                          Current Departments
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {user.departments &&
                          user.departments.length > 0 ? (
                            user.departments.map((dept) => (
                              <span
                                key={dept}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  background: 'rgba(99,102,241,0.08)',
                                  border: '1px solid rgba(99,102,241,0.16)',
                                  padding: '6px 10px',
                                  borderRadius: 999,
                                  fontSize: 12,
                                  color: '#6366f1',
                                  fontWeight: 600,
                                }}
                              >
                                {dept}

                                <button
                                  onClick={() =>
                                    handleRemoveDepartment(
                                      user._id,
                                      dept,
                                      user.name
                                    )
                                  }
                                  className="hover:text-red-500"
                                >
                                  ✕
                                </button>
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400">
                              None
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {filteredUsers.length === 0 && (
                <div className="text-center text-gray-500 py-10">
                  No users found
                </div>
              )}
            </div>

            <div
              style={{
                marginTop: 18,
                fontSize: 13,
                fontWeight: 600,
                color: '#64748b',
              }}
            >
              {selectedUsers.length} user(s) selected
            </div>
          </div>
        </div>

        {/* Bottom Action */}
        <div className="mt-10 flex justify-end">
          <button
            onClick={handleAssign}
            disabled={submitting}
            style={{
              padding: '14px 24px',
              borderRadius: 16,
              background: '#6366f1',
              color: '#fff',
              fontWeight: 700,
              border: 'none',
              boxShadow: '0 10px 24px rgba(99,102,241,0.28)',
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting
              ? 'Assigning...'
              : 'Add Departments to Selected Users'}
          </button>
        </div>
      </main>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            style={{
              background: 'rgba(255,255,255,0.88)',
              backdropFilter: 'blur(20px)',
              borderRadius: 24,
              width: '100%',
              maxWidth: 460,
              padding: 28,
              border: '1px solid rgba(255,255,255,0.4)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
            }}
          >
            <h3
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: '#0f172a',
                marginBottom: 18,
              }}
            >
              Add New Department
            </h3>

            <input
              type="text"
              value={newDeptName}
              onChange={(e) => setNewDeptName(e.target.value)}
              placeholder="Department name"
              autoFocus
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: 14,
                border: '1px solid rgba(0,0,0,0.08)',
                background: 'rgba(255,255,255,0.8)',
                outline: 'none',
                marginBottom: 22,
              }}
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  padding: '12px 18px',
                  borderRadius: 12,
                  background: '#e2e8f0',
                  color: '#334155',
                  fontWeight: 700,
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleAddDepartment}
                disabled={addingDept}
                style={{
                  padding: '12px 18px',
                  borderRadius: 12,
                  background: '#6366f1',
                  color: '#fff',
                  fontWeight: 700,
                  opacity: addingDept ? 0.7 : 1,
                }}
              >
                {addingDept ? 'Adding...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);
};

export default AssignDepartment;