import { Download, FileText } from 'lucide-react'
import { toast } from 'sonner'

const AGREEMENTS = [
  { id: 'ag_1', title: 'EmiSafe Distributor Partnership Agreement', version: 'v2.4', date: '01-Jan-2026', size: '1.2 MB' },
  { id: 'ag_2', title: 'EmiSafe Dealer Authorization Form', version: 'v1.8', date: '15-Mar-2026', size: '890 KB' },
  { id: 'ag_3', title: 'MDM Device Lock Terms & Conditions', version: 'v3.1', date: '10-Jul-2026', size: '540 KB' },
  { id: 'ag_4', title: 'EMI Finance Borrower Agreement', version: 'v1.0', date: '20-Sep-2026', size: '720 KB' },
]

export default function DownloadAgreementPage() {
  return (
    <div className="bg-card p-8 rounded-2xl shadow-xs border border-border max-w-3xl text-card-foreground">
      <div className="pb-4 border-b border-border mb-6">
        <h2 className="text-xl font-bold text-foreground tracking-tight">Download Agreements & Compliance</h2>
        <p className="text-xs text-muted-foreground mt-1">Official EMI SAFE partnership documentation, MDM mandates, and borrower agreements</p>
      </div>

      <div className="space-y-3">
        {AGREEMENTS.map((ag) => (
          <div
            key={ag.id}
            className="flex items-center justify-between p-4 border border-border/80 rounded-xl bg-card hover:bg-muted/40 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-rose-500/15 flex items-center justify-center text-rose-500">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{ag.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                  {ag.version} · Updated {ag.date} · {ag.size}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => toast.success(`Downloading "${ag.title}"...`)}
              className="flex items-center gap-2 btn-action-primary text-xs font-bold px-4 py-2 rounded-lg shadow-xs"
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
