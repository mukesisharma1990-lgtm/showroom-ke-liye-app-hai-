import { useState } from 'react'
import { exportBackup, importBackup, wipeAllData } from '../lib/repo'
import { download, readFileAsText } from '../lib/format'
import { seedDatabase } from '../lib/db'
import { ConfirmDialog, toast } from '../components/ui'
import type { Business } from '../lib/types'

export function BackupScreen({ business, onBusinessChange }: { business: Business; onBusinessChange: () => void }) {
  const [confirmReset, setConfirmReset] = useState(false)

  return (
    <div className="screen-content flex-1 px-3 pb-24 pt-3">
      <div className="card">
        <div className="text-[14px] font-bold text-slate-800">💾 Data Backup &amp; Restore</div>
        <p className="mt-1 text-xs text-slate-500">Apne showroom ka pura data JSON file me backup lein ya restore karein.</p>
        <div className="mt-4 flex flex-col gap-3">
          <button
            className="btn btn-primary btn-block"
            onClick={async () => {
              try {
                const json = await exportBackup()
                download(`showroom-backup-${new Date().toISOString().slice(0, 10)}.json`, json, 'application/json')
                toast('Backup download ho gaya', 'success')
              } catch (e) { toast(e instanceof Error ? e.message : 'Backup nahi bana', 'error') }
            }}
            title="Download Backup JSON"
          >
            ⬇ Backup download karein
          </button>
          <label className="btn btn-outline btn-block cursor-pointer text-center">
            ⬆ Backup file se restore karein
            <input
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0]
                e.target.value = ''
                if (!f) return
                try {
                  const text = await readFileAsText(f)
                  await importBackup(text, 'replace')
                  onBusinessChange()
                  toast('Backup restore ho gaya', 'success')
                } catch (err) {
                  toast(err instanceof Error ? err.message : 'File padhne me ya restore karne me dikkat aayi', 'error')
                }
              }}
            />
          </label>
          <button
            className="btn btn-danger-soft btn-block mt-4"
            onClick={() => setConfirmReset(true)}
            title="Wipe and Reset All Data"
          >
            ⚠️ Sara data reset / wipe karein
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmReset}
        title="Sara data delete karein?"
        message="Items, bills, parties — sab kuch mit jayega. Ye wapas nahi aayega. Pehle backup le lein!"
        confirmLabel="Sab delete karein"
        onCancel={() => setConfirmReset(false)}
        onConfirm={async () => {
          try {
            await wipeAllData()
            await seedDatabase()
            await onBusinessChange()
            setConfirmReset(false)
            toast('Data reset ho gaya', 'success')
          } catch (e) { toast(e instanceof Error ? e.message : 'Reset nahi hua', 'error') }
        }}
      />
      <span className="hidden">{business.stateCode}</span>
    </div>
  )
}
