import { API_URL } from "../../config";
import React, { useState, useEffect } from "react";
import "../../styles/AdminUsers.css";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    full_name: "",
    email: "",
    password: "",
    address: "",
    role: "customer",
  });

  const [roleFilter, setRoleFilter] = useState("all"); // FOR ROLE FILTER 
  const [activityFilter, setActivityFilter] = useState("all"); // FOR ACTIVITY FILTER 

  // FETCH USERS FROM THE BACKEND 
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/admin/users`);
      const data = await res.json();
      setUsers(data);
      setFilteredUsers(data);
    } catch(err) {
      console.error("Failed to load users:", err);
    }
  };

  // APPLY FILTERS 
  useEffect(() => {
    let result = users;

    // APPLY ROLE FILTER
    if (roleFilter !== "all") {
      result = result.filter(user => user.role === roleFilter);
    }

    // APPLY ACTIVITY FILTER
    if (activityFilter !== "all") {
      const isActiveFilter = activityFilter === "active";
      result = result.filter(user => user.is_active === isActiveFilter);
    }

    setFilteredUsers(result);
  }, [roleFilter, activityFilter, users]);
 
  // DELETE/DEACTIVATE USER 
  const handleDeleteUser = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user? If the user has orders, cart, or deliveries, they will be deactivated instead.");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${API_URL}/auth/admin/users/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Delete failed");
        return;
      }

      if (data.action === "deleted") {
        // REMOVE USER FROM LIST 
        setUsers((prev) => prev.filter((u) => u.id !== id));
      } 
      else if (data.action === "deactivated") {
        // UPDATE USER STATUS IN STATE
        setUsers(prev => prev.map(user => 
          user.id === id ? { ...user, is_active: false } : user
        ));
        alert("User deactivated successfully (has related records).");
      }

    } catch (err) {
      console.error("Failed to delete user:", err);
    }
  };

  // REACTIVATE USER
  const handleReactivateUser = async (id) => {
    const confirmReactivate = window.confirm("Are you sure you want to reactivate this user?");
    if (!confirmReactivate) return;

    try {
      const res = await fetch(`${API_URL}/auth/admin/users/${id}/reactivate`, {
        method: "PATCH",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Reactivate failed");
        return;
      }

      if (data.action === "reactivated") {
        // UPDATE USER STATUS IN STATE
        setUsers(prev => prev.map(user => 
          user.id === id ? { ...user, is_active: true } : user
        ));
        alert("User reactivated successfully!");
      }

    } catch (err) {
      console.error("Failed to reactivate user:", err);
    }
  };

  // ADD NEW USER
  const handleAddUser = async (e) => {
    e.preventDefault();

    try {
      const userData = {
        full_name: newUser.full_name,
        email: newUser.email,
        password: newUser.password,
        address: newUser.address || "", 
        role: newUser.role || "customer", 
      };

      const res = await fetch(`${API_URL}/auth/admin/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to create user");
        return;
      }

      // ADD NEW USER TO UI 
      setUsers((prev) => [...prev, data.user]);

      // CLEAR ADD FORM 
      setNewUser({
        full_name: "",
        email: "",
        password: "",
        address: "",
        role: "customer",
      });

      alert("User created successfully!");

    } catch (err) {
      console.error("Failed to add user:", err);
    }
  };

  // RESET FILTERS 
  const resetFilters = () => {
    setRoleFilter("all");
    setActivityFilter("all");
  };

  return (
    <div className="admin-users">
      <h2 className="admin-section-title">Users</h2>

      {/* FILTERS SECTION */}
      <div className="filters-section">
        <div className="filter-group">
          <h3>Filters</h3>
          
          <div className="filter-row">
            <div className="filter-item">
              <label>Role:</label>
              <select 
                value={roleFilter} 
                onChange={(e) => setRoleFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Roles</option>
                <option value="customer">Customer</option>
                <option value="driver">Driver</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="filter-item">
              <label>Activity:</label>
              <select 
                value={activityFilter} 
                onChange={(e) => setActivityFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>

            <button 
              onClick={resetFilters}
              className="reset-filters-btn"
            >
              Reset Filters
            </button>
          </div>

          {/* FILTER SUMMARY */}
          <div className="filter-summary">
            <span className="user-count">
              Showing {filteredUsers.length} of {users.length} users
              {roleFilter !== "all" && ` • Role: ${roleFilter}`}
              {activityFilter !== "all" && ` • Status: ${activityFilter}`}
            </span>
          </div>
        </div>
      </div>

      {/* USERS TABLE */}
      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Activity</th>
              <th style={{ width: "140px" }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className={user.is_active ? "user-active" : "user-inactive"}>
                <td>{user.full_name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge role-${user.role}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className={`activity-badge ${user.is_active ? "active" : "inactive"}`}>
                    {user.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  {user.is_active ? (
                    <button 
                      className="delete-btn-users" 
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      Delete
                    </button>
                  ) : (
                    <button 
                      className="reactivate-btn-users" 
                      onClick={() => handleReactivateUser(user.id)}
                    >
                      Reactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* EMPTY STATE */}
        {filteredUsers.length === 0 && (
          <div className="no-users-message">
            <p>No users found with the current filters.</p>
            <button onClick={resetFilters} className="clear-filters-btn">
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* ADD USER */}
      <div className="add-user-box">
        <h3>Add New User</h3>

        <form onSubmit={handleAddUser}>
          <input
            type="text"
            placeholder="Full Name"
            value={newUser.full_name}
            onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            required
          />

          <input
            type="text"
            placeholder="Address"
            value={newUser.address}
            onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
          />

          <select
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            required
          >
            <option value="customer">Customer</option>
            <option value="driver">Driver</option>
            <option value="admin">Admin</option>
          </select>

          <button className="add-user-btn" type="submit">
            Add User
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminUsers;