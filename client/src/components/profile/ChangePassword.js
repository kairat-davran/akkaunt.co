import React, { useState } from 'react'

const ChangePassword = ({ setShowChangePass }) => {
  const [form, setForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = e => {
    e.preventDefault()
    if (form.newPassword !== form.confirmPassword) {
      return alert('New passwords do not match')
    }
    alert('Password change not implemented yet.')
    setShowChangePass(false)
  }

  return (
    <div className="settings">
      <div className="settings_box">
        <div className="settings_header">
          <h4>Change Password</h4>
          <span onClick={() => setShowChangePass(false)} className="settings_close">&times;</span>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            name="oldPassword"
            placeholder="Old Password"
            value={form.oldPassword}
            onChange={handleChange}
            required
            className="settings_input"
          />
          <input
            type="password"
            name="newPassword"
            placeholder="New Password"
            value={form.newPassword}
            onChange={handleChange}
            required
            className="settings_input"
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm New Password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            className="settings_input"
          />
          <button type="submit" className="btn btn-dark w-100 mt-3">Update Password</button>
        </form>
      </div>
    </div>
  )
}

export default ChangePassword