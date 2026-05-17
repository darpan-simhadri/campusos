import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, Users, BarChart2, AlertTriangle, Trash2, Ban, CheckCircle, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getAllUsersAdmin, suspendUser, unsuspendUser, deleteDocument } from '../services/firebaseService'
import { SkeletonCard } from '../components/ui/Skeleton'
import { useNavigate } from 'react-router-dom'
import { getDocs, collection, query, orderBy } from 'firebase/firestore'
import { db } from '../firebase/config'

function StatBox({ label, value, color }) {
  return (
    <div className="card text-center">
      <p className={`text-3xl font-bold ${color || 'text-white'}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  )
}

export default function Admin() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('users')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (profile?.role !== 'admin') { navigate('/dashboard'); return }
    Promise.all([
      getAllUsersAdmin(),
      getDocs(query(collection(db, 'reports'), orderBy('createdAt', 'desc'))).then(s => s.docs.map(d => ({ id: d.id, ...d.data() }))),
    ]).then(([u, r]) => { setUsers(u); setReports(r); setLoading(false) })
  }, [profile])

  const handleSuspend = async (uid, suspended) => {
    if (suspended) await unsuspendUser(uid)
    else await suspendUser(uid)
    setUsers(prev => prev.map(u => u.id === uid ? { ...u, suspended: !suspended } : u))
  }

  const handleDeleteReport = (id) => {
    deleteDocument('reports', id)
    setReports(prev => prev.filter(r => r.id !== id))
  }

  const filteredUsers = users.filter(u =>
    u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.registrationNumber?.toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    total: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    suspended: users.filter(u => u.suspended).length,
    reports: reports.length,
  }

  if (loading) return (
    <div className="p-6 max-w-6xl mx-auto space-y-4">
      {Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  )

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-600/20 flex items-center justify-center">
          <Shield className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-gray-400 text-sm">Manage CampusOS community</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBox label="Total Users" value={stats.total} color="text-indigo-400" />
        <StatBox label="Admins" value={stats.admin} color="text-purple-400" />
        <StatBox label="Suspended" value={stats.suspended} color="text-red-400" />
        <StatBox label="Reports" value={stats.reports} color="text-amber-400" />
      </div>

      <div className="flex gap-2">
        {['users', 'reports'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${tab === t ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
            {t === 'users' ? <><Users className="w-4 h-4 inline mr-2" />Users</> : <><AlertTriangle className="w-4 h-4 inline mr-2" />Reports</>}
          </button>
        ))}
      </div>

      {tab === 'users' && (
        <div>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, or reg. number..." className="input-field mb-4 max-w-md" />
          <div className="card overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead className="bg-gray-800">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Student</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium hidden md:table-cell">Branch</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium hidden lg:table-cell">Reg. No.</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Role</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-600/30 flex items-center justify-center text-xs font-medium text-indigo-400">
                          {u.fullName?.[0]}
                        </div>
                        <div>
                          <p className="text-gray-200 font-medium">{u.fullName}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 hidden md:table-cell text-xs">{u.branch}</td>
                    <td className="px-4 py-3 text-gray-400 hidden lg:table-cell text-xs">{u.registrationNumber}</td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs ${u.role === 'admin' ? 'bg-purple-900/40 text-purple-400' : u.role === 'moderator' ? 'bg-blue-900/40 text-blue-400' : 'bg-gray-800 text-gray-400'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs ${u.suspended ? 'bg-red-900/40 text-red-400' : 'bg-emerald-900/40 text-emerald-400'}`}>
                        {u.suspended ? 'Suspended' : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.role !== 'admin' && (
                        <button onClick={() => handleSuspend(u.id, u.suspended)}
                          className={`flex items-center gap-1.5 text-xs transition-colors ${u.suspended ? 'text-emerald-400 hover:text-emerald-300' : 'text-red-400 hover:text-red-300'}`}>
                          {u.suspended ? <><CheckCircle className="w-3.5 h-3.5" /> Restore</> : <><Ban className="w-3.5 h-3.5" /> Suspend</>}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'reports' && (
        <div className="space-y-3">
          {reports.length === 0 ? (
            <div className="card text-center py-8 text-gray-500">No reports to review.</div>
          ) : (
            reports.map(r => (
              <div key={r.id} className="card flex items-start justify-between gap-4">
                <div>
                  <span className="badge bg-amber-900/40 text-amber-400 text-xs mb-2">{r.type}</span>
                  <p className="text-gray-200 text-sm">{r.reason}</p>
                  <p className="text-xs text-gray-500 mt-1">Reported by: {r.reporterName}</p>
                </div>
                <button onClick={() => handleDeleteReport(r.id)}
                  className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors flex-shrink-0">
                  <Trash2 className="w-3.5 h-3.5" /> Dismiss
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
