import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Eye, Pencil, PlusCircle, Trash2 } from 'lucide-react'
import FilterPanel from '../../components/FilterPanel'
import Pagination from '../../components/Pagination'
import SearchBar from '../../components/SearchBar'
import TableSkeleton from '../../components/TableSkeleton'
import { getApiErrorMessage } from '../../services/errorService'
import { userService, type UserFormValues, type UserRecord, type UserRoleRecord } from '../../services/userService'

const initialFilters = {
  search: '',
  role: '',
  status: '',
  page: 1,
}

type UserFormState = {
  role_id: number
  name: string
  email: string
  phone: string
  password: string
  password_confirmation: string
  preferred_locale: 'en' | 'ta' | 'ar'
  status: 'active' | 'inactive' | 'suspended'
}

const emptyForm: UserFormState = {
  role_id: 0,
  name: '',
  email: '',
  phone: '',
  password: '',
  password_confirmation: '',
  preferred_locale: 'en',
  status: 'active',
}

function formatRoleLabel(role: UserRoleRecord | null | undefined) {
  if (!role) {
    return 'Unassigned'
  }

  return role.name
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function UserManagementPage() {
  const [filters, setFilters] = useState(initialFilters)
  const [users, setUsers] = useState<UserRecord[]>([])
  const [roles, setRoles] = useState<UserRoleRecord[]>([])
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 })
  const [form, setForm] = useState(emptyForm)

  const isInitialLoading = isLoading && users.length === 0

  const roleChoices = useMemo(
    () => roles.filter((role) => ['super_admin', 'admin_staff', 'student', 'teacher', 'applicant'].includes(role.slug)),
    [roles],
  )

  const loadUsers = async () => {
    setIsLoading(true)

    try {
      const response = await userService.list({
        ...filters,
        per_page: 12,
      })

      setUsers(response.data)
      setPagination({
        currentPage: response.current_page,
        lastPage: response.last_page,
        total: response.total,
      })
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to load users.'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    userService
      .listRoles()
      .then((data) => {
        setRoles(data)

        if (!emptyForm.role_id && data.length > 0) {
          const defaultRole = data.find((role) => role.slug === 'applicant') ?? data[0]
          setForm((current) => ({ ...current, role_id: defaultRole.id }))
        }
      })
      .catch((error) => toast.error(getApiErrorMessage(error, 'Unable to load roles.')))
  }, [])

  useEffect(() => {
    loadUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const resetForm = () => {
    const defaultRole = roleChoices.find((role) => role.slug === 'applicant') ?? roleChoices[0]

    setSelectedUser(null)
    setForm({
      ...emptyForm,
      role_id: defaultRole?.id ?? 0,
    })
  }

  const openCreate = () => {
    resetForm()
    setIsModalOpen(true)
  }

  const openEdit = (user: UserRecord) => {
    setSelectedUser(user)
    setForm({
      role_id: user.role_id ?? roleChoices[0]?.id ?? 0,
      name: user.name,
      email: user.email,
      phone: user.phone ?? '',
      password: '',
      password_confirmation: '',
      preferred_locale: user.preferred_locale ?? 'en',
      status: user.status ?? 'active',
    })
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.role_id) {
      toast.error('Choose a role for this user.')
      return
    }

    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Name and email are required.')
      return
    }

    if (!selectedUser && !form.password) {
      toast.error('Password is required for new users.')
      return
    }

    if (form.password !== form.password_confirmation) {
      toast.error('Password confirmation does not match.')
      return
    }

    setIsSaving(true)

    const payload: Partial<UserFormValues> = {
      role_id: form.role_id,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || undefined,
      preferred_locale: form.preferred_locale,
      status: form.status,
    }

    if (form.password) {
      payload.password = form.password
      payload.password_confirmation = form.password_confirmation
    }

    try {
      const saved = selectedUser
        ? await userService.update(selectedUser.id, payload)
        : await userService.create(payload as UserFormValues)

      toast.success(selectedUser ? 'User updated successfully.' : 'User created successfully.')
      setIsModalOpen(false)
      setSelectedUser(saved)
      await loadUsers()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to save this user.'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="grid gap-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-college-green">Access Control</p>
          <h1 className="mt-2 text-3xl font-bold text-college-ink">User Management</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Create portal users manually, assign roles, and manage their login details. Email works as the username for the system.
          </p>
        </div>
        <button className="btn-primary" onClick={openCreate} type="button">
          <PlusCircle size={18} />
          New User
        </button>
      </div>

      <SearchBar
        initialValue={filters.search}
        onSearch={(search) => setFilters((current) => ({ ...current, search, page: 1 }))}
        placeholder="Search by name, email, or phone"
      />

      <FilterPanel
        onClear={() => setFilters(initialFilters)}
        title="User Filters"
      >
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Role
          <select className="form-input" onChange={(event) => setFilters((current) => ({ ...current, role: event.target.value, page: 1 }))} value={filters.role}>
            <option value="">All roles</option>
            {roleChoices.map((role) => (
              <option key={role.id} value={role.slug}>{formatRoleLabel(role)}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Status
          <select className="form-input" onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value, page: 1 }))} value={filters.status}>
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </label>
      </FilterPanel>

      <section className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Locale</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {isInitialLoading ? <TableSkeleton columns={5} rows={6} /> : null}
              {!isLoading && users.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-slate-500" colSpan={5}>No users matched the current filters.</td>
                </tr>
              ) : null}
              {users.map((user) => (
                <tr className="hover:bg-slate-50" key={user.id}>
                  <td className="px-4 py-4 align-top">
                    <p className="font-semibold text-college-ink">{user.name}</p>
                    <p className="text-slate-500">{user.email}</p>
                    {user.phone ? <p className="text-slate-400">{user.phone}</p> : null}
                  </td>
                  <td className="px-4 py-4 align-top">
                    <span className="status-chip bg-slate-100 text-slate-700">{formatRoleLabel(user.role)}</span>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <span className={`status-chip ${user.status === 'active' ? 'bg-teal-50 text-college-green' : user.status === 'inactive' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 align-top uppercase text-slate-600">{user.preferred_locale}</td>
                  <td className="px-4 py-4 align-top">
                    <div className="flex flex-wrap gap-2">
                      <button className="btn-secondary min-h-9 px-3" onClick={() => setSelectedUser(user)} type="button">
                        <Eye size={15} />
                        View
                      </button>
                      <button className="btn-secondary min-h-9 px-3" onClick={() => openEdit(user)} type="button">
                        <Pencil size={15} />
                        Edit
                      </button>
                      <button
                        className="btn-secondary min-h-9 px-3 text-red-600 hover:bg-red-50"
                        onClick={async () => {
                          if (!window.confirm(`Delete ${user.name}?`)) {
                            return
                          }

                          try {
                            await userService.remove(user.id)
                            toast.success('User deleted.')
                            if (selectedUser?.id === user.id) {
                              setSelectedUser(null)
                            }
                            await loadUsers()
                          } catch (error) {
                            toast.error(getApiErrorMessage(error, 'Unable to delete this user.'))
                          }
                        }}
                        type="button"
                      >
                        <Trash2 size={15} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isLoading && users.length > 0 ? (
          <div className="border-t border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-college-green">
            Refreshing users...
          </div>
        ) : null}

        <Pagination currentPage={pagination.currentPage} lastPage={pagination.lastPage} onChange={(page) => setFilters((current) => ({ ...current, page }))} total={pagination.total} />
      </section>

      {selectedUser ? (
        <section className="panel p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-college-green">Selected User</p>
              <h2 className="mt-2 text-2xl font-bold text-college-ink">{selectedUser.name}</h2>
              <p className="mt-1 text-sm text-slate-500">{selectedUser.email}</p>
            </div>
            <button className="btn-secondary" onClick={() => openEdit(selectedUser)} type="button">
              <Pencil size={16} />
              Edit User
            </button>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <p className="text-xs font-bold uppercase text-slate-400">Role</p>
              <p className="mt-2 text-sm font-medium text-college-ink">{formatRoleLabel(selectedUser.role)}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-slate-400">Status</p>
              <p className="mt-2 text-sm font-medium text-college-ink">{selectedUser.status}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-slate-400">Username</p>
              <p className="mt-2 text-sm font-medium text-college-ink">{selectedUser.email}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-slate-400">Preferred Locale</p>
              <p className="mt-2 text-sm font-medium text-college-ink">{selectedUser.preferred_locale.toUpperCase()}</p>
            </div>
          </div>
        </section>
      ) : null}

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/50 px-4 py-8">
          <div className="w-full max-w-3xl rounded-2xl bg-college-mist p-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase text-college-green">{selectedUser ? 'Edit User' : 'Create User'}</p>
                <h2 className="mt-2 text-2xl font-bold text-college-ink">{selectedUser?.name ?? 'New User Account'}</h2>
              </div>
              <button className="btn-secondary" onClick={() => setIsModalOpen(false)} type="button">
                Close
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Full Name
                <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} value={form.name} />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Email / Username
                <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} type="email" value={form.email} />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Phone
                <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} value={form.phone} />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Role
                <select className="form-input" onChange={(event) => setForm((current) => ({ ...current, role_id: Number(event.target.value) }))} value={form.role_id}>
                  <option value={0}>Choose role</option>
                  {roleChoices.map((role) => (
                    <option key={role.id} value={role.id}>{formatRoleLabel(role)}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Status
                <select className="form-input" onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as typeof emptyForm.status }))} value={form.status}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Preferred Locale
                <select className="form-input" onChange={(event) => setForm((current) => ({ ...current, preferred_locale: event.target.value as typeof emptyForm.preferred_locale }))} value={form.preferred_locale}>
                  <option value="en">English</option>
                  <option value="ta">Tamil</option>
                  <option value="ar">Arabic</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Password
                <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} type="password" value={form.password} />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Confirm Password
                <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, password_confirmation: event.target.value }))} type="password" value={form.password_confirmation} />
              </label>
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
              {selectedUser
                ? 'Leave the password fields empty if you only want to update the role, contact details, or account status.'
                : 'Create admin, student, teacher, or applicant accounts here. The email address becomes the login username.'}
            </div>

            <div className="mt-5 flex flex-wrap justify-end gap-3">
              <button className="btn-secondary" onClick={() => setIsModalOpen(false)} type="button">
                Cancel
              </button>
              <button className="btn-primary" disabled={isSaving} onClick={handleSave} type="button">
                {isSaving ? 'Saving...' : selectedUser ? 'Update User' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default UserManagementPage
