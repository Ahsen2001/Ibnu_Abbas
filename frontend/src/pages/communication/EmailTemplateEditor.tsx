import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { MailCheck, Save, Trash2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { communicationService, type EmailTemplateCategory, type EmailTemplatePayload, type EmailTemplateRecord } from '../../services/communicationService'
import { getApiErrorMessage } from '../../services/errorService'

type TemplateFormState = {
  id: number | null
  name: string
  subject: string
  body: string
  category: EmailTemplateCategory
  variablesText: string
}

const emptyTemplate: TemplateFormState = {
  id: null,
  name: '',
  subject: '',
  body: '',
  category: 'general',
  variablesText: 'name\ndate',
}

function EmailTemplateEditor() {
  const { user } = useAuth()
  const [templates, setTemplates] = useState<EmailTemplateRecord[]>([])
  const [form, setForm] = useState<TemplateFormState>(emptyTemplate)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)

  const loadTemplates = async () => {
    try {
      const response = await communicationService.listEmailTemplates({ per_page: 100 })
      setTemplates(response.data)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to load email templates.'))
    }
  }

  useEffect(() => {
    loadTemplates()
  }, [])

  const variables = useMemo(
    () => form.variablesText.split(/[\n,]+/).map((variable) => variable.trim()).filter(Boolean),
    [form.variablesText],
  )

  const previewVariables = useMemo(
    () => variables.reduce<Record<string, string>>((carry, variable) => {
      carry[variable] = variable === 'name' ? (user?.name ?? 'Ameen') : variable === 'date' ? new Date().toLocaleDateString() : variable
      return carry
    }, {}),
    [user?.name, variables],
  )

  const hydrateForm = (template: EmailTemplateRecord) => {
    setForm({
      id: template.id,
      name: template.name,
      subject: template.subject,
      body: template.body,
      category: template.category,
      variablesText: (template.variables ?? []).join('\n'),
    })
  }

  const payload: EmailTemplatePayload = {
    name: form.name,
    subject: form.subject,
    body: form.body,
    category: form.category,
    variables,
  }

  return (
    <section className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
      <section className="panel overflow-hidden">
        <div className="border-b border-slate-200 px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase text-college-green">Communication</p>
              <h1 className="mt-2 text-xl font-bold text-college-ink">Email Templates</h1>
            </div>
            <button className="btn-secondary min-h-9 px-3" onClick={() => setForm(emptyTemplate)} type="button">New</button>
          </div>
        </div>
        <div className="grid gap-3 p-4">
          {templates.map((template) => (
            <button
              className={`rounded-xl border px-4 py-3 text-left transition ${form.id === template.id ? 'border-college-green bg-teal-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
              key={template.id}
              onClick={() => hydrateForm(template)}
              type="button"
            >
              <p className="font-semibold text-college-ink">{template.name}</p>
              <p className="mt-1 text-sm text-slate-500">{template.category}</p>
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-5">
        <section className="panel p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Template Name
              <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} value={form.name} />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Category
              <select className="form-input" onChange={(event) => setForm((current) => ({ ...current, category: event.target.value as EmailTemplateCategory }))} value={form.category}>
                <option value="admission">Admission</option>
                <option value="academic">Academic</option>
                <option value="general">General</option>
                <option value="alert">Alert</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2">
              Subject
              <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))} value={form.subject} />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2">
              HTML Body
              <textarea className="form-input min-h-72 py-3" onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))} value={form.body} />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2">
              Variables
              <textarea className="form-input min-h-28 py-3" onChange={(event) => setForm((current) => ({ ...current, variablesText: event.target.value }))} placeholder="name&#10;date&#10;department" value={form.variablesText} />
            </label>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              className="btn-primary"
              disabled={isSaving || !form.name || !form.subject || !form.body}
              onClick={async () => {
                setIsSaving(true)
                try {
                  const saved = form.id
                    ? await communicationService.updateEmailTemplate(form.id, payload)
                    : await communicationService.createEmailTemplate(payload)
                  toast.success('Template saved successfully.')
                  hydrateForm(saved)
                  await loadTemplates()
                } catch (error) {
                  toast.error(getApiErrorMessage(error, 'Unable to save the email template.'))
                } finally {
                  setIsSaving(false)
                }
              }}
              type="button"
            >
              <Save size={16} />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button
              className="btn-secondary"
              disabled={isTesting || !user?.email}
              onClick={async () => {
                setIsTesting(true)
                try {
                  await communicationService.sendSingleEmail({
                    email: user?.email ?? '',
                    name: user?.name,
                    subject: communicationService.renderPreview(form.subject, previewVariables),
                    body: communicationService.renderPreview(form.body, previewVariables),
                  })
                  toast.success('Test email queued to your account.')
                } catch (error) {
                  toast.error(getApiErrorMessage(error, 'Unable to send test email.'))
                } finally {
                  setIsTesting(false)
                }
              }}
              type="button"
            >
              <MailCheck size={16} />
              Test Send
            </button>
            {form.id ? (
              <button
                className="btn-secondary text-red-600 hover:bg-red-50"
                onClick={async () => {
                  if (!window.confirm(`Delete template "${form.name}"?`)) {
                    return
                  }

                  try {
                    await communicationService.deleteEmailTemplate(form.id as number)
                    toast.success('Template deleted.')
                    setForm(emptyTemplate)
                    await loadTemplates()
                  } catch (error) {
                    toast.error(getApiErrorMessage(error, 'Unable to delete the template.'))
                  }
                }}
                type="button"
              >
                <Trash2 size={16} />
                Delete
              </button>
            ) : null}
          </div>
        </section>

        <section className="panel p-5">
          <h2 className="text-lg font-semibold text-college-ink">Live Preview</h2>
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="font-semibold text-college-ink">{communicationService.renderPreview(form.subject, previewVariables)}</h3>
            <div className="mt-3 text-sm leading-6 text-slate-600" dangerouslySetInnerHTML={{ __html: communicationService.renderPreview(form.body, previewVariables) }} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {variables.map((variable) => (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600" key={variable}>{`{{${variable}}}`}</span>
            ))}
          </div>
        </section>
      </div>
    </section>
  )
}

export default EmailTemplateEditor
