import { Mail, Send } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import FilterPanel from '../../components/FilterPanel'
import { communicationService, type EmailTemplateRecord, type RecipientSource } from '../../services/communicationService'
import { getApiErrorMessage } from '../../services/errorService'

function parseTemplateVariables(variables: string[]) {
  return variables.reduce<Record<string, string>>((carry, variable) => {
    const key = variable.replace(/[{}]/g, '').trim()
    carry[key] = key === 'date' ? new Date().toLocaleDateString() : key === 'name' ? 'Ameen' : key === 'department' ? 'Shareea' : key === 'batch' ? String(new Date().getFullYear()) : key
    return carry
  }, {})
}

function BulkEmailComposer() {
  const [templates, setTemplates] = useState<EmailTemplateRecord[]>([])
  const [sources, setSources] = useState<RecipientSource | null>(null)
  const [recipientFilter, setRecipientFilter] = useState<'all_users' | 'all_students' | 'all_teachers' | 'department' | 'batch' | 'custom_list'>('all_users')
  const [department, setDepartment] = useState<'shareea' | 'hifl' | ''>('')
  const [batch, setBatch] = useState('')
  const [customEmails, setCustomEmails] = useState('')
  const [templateId, setTemplateId] = useState<number | null>(null)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    Promise.all([
      communicationService.listEmailTemplates({ per_page: 100 }),
      communicationService.getRecipientSources(),
    ])
      .then(([templateResponse, sourceResponse]) => {
        setTemplates(templateResponse.data)
        setSources(sourceResponse)
      })
      .catch((error) => toast.error(getApiErrorMessage(error, 'Unable to load email composer data.')))
  }, [])

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === templateId) ?? null,
    [templateId, templates],
  )

  const recipientCount = useMemo(() => {
    if (!sources) return 0

    switch (recipientFilter) {
      case 'all_users':
        return sources.users.filter((user) => Boolean(user.email)).length
      case 'all_students':
        return sources.students.filter((student) => Boolean(student.email)).length
      case 'all_teachers':
        return sources.teachers.filter((teacher) => Boolean(teacher.email)).length
      case 'department':
        return [
          ...sources.students.filter((student) => student.department === department && Boolean(student.email)),
          ...sources.teachers.filter((teacher) => (teacher.department === department || teacher.department === 'both') && Boolean(teacher.email)),
        ].length
      case 'batch':
        return sources.students.filter((student) => student.batch === batch && Boolean(student.email)).length
      case 'custom_list':
        return customEmails.split(/[\s,;]+/).filter(Boolean).length
      default:
        return 0
    }
  }, [batch, customEmails, department, recipientFilter, sources])

  const previewVariables = useMemo(
    () => ({
      name: 'Ameen',
      email: 'ameen@example.com',
      department: department || 'Shareea',
      batch: batch || String(new Date().getFullYear()),
      date: new Date().toLocaleDateString(),
      ...parseTemplateVariables(selectedTemplate?.variables ?? []),
    }),
    [batch, department, selectedTemplate?.variables],
  )

  return (
    <section className="grid gap-5">
      <div>
        <p className="text-xs font-bold uppercase text-college-green">Communication</p>
        <h1 className="mt-2 text-3xl font-bold text-college-ink">Bulk Email Composer</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Queue branded email campaigns for users, students, teachers, departments, or custom recipient lists.</p>
      </div>

      <FilterPanel title="Recipient Filters">
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Recipient Group
          <select className="form-input" onChange={(event) => setRecipientFilter(event.target.value as typeof recipientFilter)} value={recipientFilter}>
            <option value="all_users">All Users</option>
            <option value="all_students">All Students</option>
            <option value="all_teachers">All Teachers</option>
            <option value="department">Specific Department</option>
            <option value="batch">Specific Batch</option>
            <option value="custom_list">Custom Email List</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Department
          <select className="form-input" disabled={recipientFilter !== 'department'} onChange={(event) => setDepartment(event.target.value as 'shareea' | 'hifl' | '')} value={department}>
            <option value="">Choose department</option>
            <option value="shareea">Shareea</option>
            <option value="hifl">Hifl</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Batch
          <input className="form-input" disabled={recipientFilter !== 'batch'} onChange={(event) => setBatch(event.target.value)} placeholder="2026" value={batch} />
        </label>
        <div className="rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-600">
          <strong className="block text-college-ink">Recipient Count</strong>
          <span>{recipientCount} recipients currently match this selection.</span>
        </div>
      </FilterPanel>

      {recipientFilter === 'custom_list' ? (
        <section className="panel p-5">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Custom Email List
            <textarea className="form-input min-h-28 py-3" onChange={(event) => setCustomEmails(event.target.value)} placeholder="Paste emails separated by commas, spaces, or new lines." value={customEmails} />
          </label>
        </section>
      ) : null}

      <section className="panel p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Template
            <select
              className="form-input"
              onChange={(event) => {
                const nextId = event.target.value ? Number(event.target.value) : null
                setTemplateId(nextId)

                const template = templates.find((item) => item.id === nextId)
                if (template) {
                  setSubject(template.subject)
                  setBody(template.body)
                }
              }}
              value={templateId ?? ''}
            >
              <option value="">Custom email</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name} ({template.category})
                </option>
              ))}
            </select>
          </label>
          <div className="rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-600">
            <strong className="block text-college-ink">Variable Placeholder Guide</strong>
            <div className="mt-2 flex flex-wrap gap-2">
              {['{{name}}', '{{email}}', '{{department}}', '{{batch}}', '{{date}}', ...(selectedTemplate?.variables ?? []).map((variable) => `{{${variable.replace(/[{}]/g, '').trim()}}}`)].map((variable) => (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600" key={variable}>{variable}</span>
              ))}
            </div>
          </div>
          <label className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2">
            Subject
            <input className="form-input" onChange={(event) => setSubject(event.target.value)} value={subject} />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2">
            Body
            <textarea className="form-input min-h-72 py-3" onChange={(event) => setBody(event.target.value)} value={body} />
          </label>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button className="btn-secondary" onClick={() => setShowPreview((current) => !current)} type="button">
            <Mail size={16} />
            {showPreview ? 'Hide Preview' : 'Preview'}
          </button>
          <button className="btn-primary" disabled={recipientCount === 0 || !subject || !body} onClick={() => setShowConfirm(true)} type="button">
            <Send size={16} />
            Send
          </button>
        </div>
      </section>

      {showPreview ? (
        <section className="panel p-5">
          <h2 className="text-lg font-semibold text-college-ink">Preview</h2>
          <p className="mt-2 text-sm text-slate-500">Rendered with sample data using the current subject, body, and placeholders.</p>
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="font-semibold text-college-ink">{communicationService.renderPreview(subject, previewVariables)}</h3>
            <div className="mt-3 text-sm leading-6 text-slate-600" dangerouslySetInnerHTML={{ __html: communicationService.renderPreview(body, previewVariables) }} />
          </div>
        </section>
      ) : null}

      {showConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-college-ink">Confirm Bulk Email</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              This will queue <strong>{recipientCount}</strong> emails using the current subject and body.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button className="btn-secondary" onClick={() => setShowConfirm(false)} type="button">Cancel</button>
              <button
                className="btn-primary"
                disabled={isSending}
                onClick={async () => {
                  setIsSending(true)
                  try {
                    await communicationService.sendBulkEmail({
                      recipient_filter: recipientFilter,
                      department: department || undefined,
                      batch: batch || undefined,
                      custom_emails: customEmails || undefined,
                      template_id: templateId,
                      subject,
                      body,
                      variables: previewVariables,
                    })
                    toast.success('Bulk emails queued successfully.')
                    setShowConfirm(false)
                  } catch (error) {
                    toast.error(getApiErrorMessage(error, 'Unable to queue bulk emails.'))
                  } finally {
                    setIsSending(false)
                  }
                }}
                type="button"
              >
                {isSending ? 'Queueing...' : 'Confirm Send'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default BulkEmailComposer
