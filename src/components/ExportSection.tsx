import { useState } from 'react';
import { Download, FileText, Mail, Database, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Receipt, MonthlyStats } from '@/types/diesel';
import { toast } from 'sonner';

interface ExportSectionProps {
  receipts: Receipt[];
  monthlyStats: MonthlyStats[];
}

export function ExportSection({ receipts, monthlyStats }: ExportSectionProps) {
  const [exportingCSV, setExportingCSV] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingBackup, setExportingBackup] = useState(false);

  const downloadCSV = async () => {
    setExportingCSV(true);
    await new Promise(r => setTimeout(r, 800));

    const headers = ['Date', 'Location', 'Gallons', 'Price/Gal', 'Total', 'Odometer', 'Notes'];
    const rows = receipts.map(r => [
      r.date,
      r.location,
      r.gallons.toString(),
      r.pricePerGallon.toFixed(2),
      r.total.toFixed(2),
      r.odometer?.toString() || '',
      r.notes || ''
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diesel-receipts-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    setExportingCSV(false);
    toast.success('CSV downloaded!', { icon: <CheckCircle className="h-5 w-5 text-success" /> });
  };

  const generatePDFReport = async () => {
    setExportingPDF(true);
    await new Promise(r => setTimeout(r, 1200));

    // In a real app, you'd use a PDF library here
    // For now, we'll generate a text report
    const totalGallons = receipts.reduce((sum, r) => sum + r.gallons, 0);
    const totalCost = receipts.reduce((sum, r) => sum + r.total, 0);
    const avgPrice = receipts.length > 0 
      ? receipts.reduce((sum, r) => sum + r.pricePerGallon, 0) / receipts.length 
      : 0;

    const report = `
DIESEL TRACKER - FUEL EXPENSE REPORT
=====================================
Generated: ${new Date().toLocaleDateString()}

SUMMARY
-------
Total Gallons: ${totalGallons.toFixed(1)} gal
Total Cost: $${totalCost.toFixed(2)}
Average Price: $${avgPrice.toFixed(2)}/gal
Total Fill-ups: ${receipts.length}

MONTHLY BREAKDOWN
-----------------
${monthlyStats.map(m => `${m.month}: ${m.totalGallons.toFixed(1)} gal | $${m.totalCost.toFixed(2)} | $${m.avgPrice.toFixed(2)}/gal avg`).join('\n')}

DETAILED RECEIPTS
-----------------
${receipts.map(r => `${r.date} | ${r.location} | ${r.gallons}gal @ $${r.pricePerGallon.toFixed(2)} = $${r.total.toFixed(2)}`).join('\n')}
    `.trim();

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diesel-report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    setExportingPDF(false);
    toast.success('Report generated!', { icon: <CheckCircle className="h-5 w-5 text-success" /> });
  };

  const emailReport = () => {
    const totalGallons = receipts.reduce((sum, r) => sum + r.gallons, 0);
    const totalCost = receipts.reduce((sum, r) => sum + r.total, 0);
    const avgPrice = receipts.length > 0 
      ? receipts.reduce((sum, r) => sum + r.pricePerGallon, 0) / receipts.length 
      : 0;

    const subject = encodeURIComponent(`Fuel Expense Report - ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`);
    const body = encodeURIComponent(`
Fuel Expense Summary
--------------------
Total Gallons: ${totalGallons.toFixed(1)} gal
Total Cost: $${totalCost.toFixed(2)}
Average Price: $${avgPrice.toFixed(2)}/gal
Fill-ups: ${receipts.length}

(Full report attached)
    `.trim());

    window.open(`mailto:?subject=${subject}&body=${body}`);
    toast.success('Email draft opened!');
  };

  const backupData = async () => {
    setExportingBackup(true);
    await new Promise(r => setTimeout(r, 600));

    const backup = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      receipts
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diesel-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setExportingBackup(false);
    toast.success('Backup created!', { 
      description: `${receipts.length} receipts backed up`,
      icon: <CheckCircle className="h-5 w-5 text-success" />
    });
  };

  const exports = [
    {
      label: 'Download CSV',
      description: 'Excel-compatible spreadsheet',
      icon: Download,
      onClick: downloadCSV,
      loading: exportingCSV
    },
    {
      label: 'Generate Report',
      description: 'Monthly summary report',
      icon: FileText,
      onClick: generatePDFReport,
      loading: exportingPDF
    },
    {
      label: 'Email Report',
      description: 'Send summary via email',
      icon: Mail,
      onClick: emailReport,
      loading: false
    },
    {
      label: 'Backup Data',
      description: 'Download all data as JSON',
      icon: Database,
      onClick: backupData,
      loading: exportingBackup
    }
  ];

  return (
    <div className="card-elevated p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Export & Reporting</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {exports.map((exp) => (
          <Button
            key={exp.label}
            variant="outline"
            onClick={exp.onClick}
            disabled={exp.loading}
            className="h-auto py-4 px-4 justify-start gap-4 hover:bg-secondary/50 transition-colors"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
              {exp.loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <exp.icon className="h-5 w-5" />
              )}
            </div>
            <div className="text-left">
              <p className="font-medium text-foreground">{exp.label}</p>
              <p className="text-xs text-muted-foreground">{exp.description}</p>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}
