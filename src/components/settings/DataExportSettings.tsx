import { useState } from 'react';
import { Download, FileJson, FileText, FileSpreadsheet, Calendar, Package } from 'lucide-react';
import type { ExportOptions } from '../../types';
import { exportApi } from '../../services/api';
import { useToast } from '../../hooks/useToast';

export default function DataExportSettings() {
  const toast = useToast();
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'json',
    includeMetadata: true,
    includeAttachments: false,
  });
  
  const [isExporting, setIsExporting] = useState(false);
  const [dateRange, setDateRange] = useState({
    enabled: false,
    from: '',
    to: '',
  });

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await exportApi.exportAll({
        format: exportOptions.format as 'json' | 'markdown' | 'csv',
        includeMetadata: exportOptions.includeMetadata,
        includeTags: true,
        includeRelated: false,
        dateFrom: dateRange.enabled && dateRange.from ? dateRange.from : undefined,
        dateTo: dateRange.enabled && dateRange.to ? dateRange.to : undefined,
      });
      
      const filename = exportApi.getFilename(
        exportOptions.format as 'json' | 'markdown' | 'csv',
        'data-export'
      );
      exportApi.downloadBlob(blob, filename);
      
      toast.success('Export complete', 'Your data has been exported successfully');
    } catch (error) {
      toast.error('Export failed', 'Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const formatIcons = {
    json: FileJson,
    csv: FileSpreadsheet,
    pdf: FileText,
    markdown: FileText,
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        Data Export
      </h2>
      
      <div className="space-y-6">
        {/* Export Format */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Export Format
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4" role="radiogroup" aria-label="Export format selection">
            {(['json', 'csv', 'pdf', 'markdown'] as const).map((format) => {
              const Icon = formatIcons[format];
              return (
                <button
                  key={format}
                  onClick={() => setExportOptions({ ...exportOptions, format })}
                  className={`
                    p-4 rounded-lg border-2 transition-all duration-200
                    ${exportOptions.format === format
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }
                  `}
                  role="radio"
                  aria-checked={exportOptions.format === format}
                  aria-label={`Export as ${format.toUpperCase()}`}
                >
                  <Icon className="w-6 h-6 mx-auto mb-2 text-gray-600 dark:text-gray-400" aria-hidden="true" />
                  <span className="block text-sm font-medium text-gray-900 dark:text-white uppercase">
                    {format}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Export Options */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Export Options
          </h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={exportOptions.includeMetadata}
                onChange={(e) => setExportOptions({ ...exportOptions, includeMetadata: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                Include metadata (timestamps, tags, etc.)
              </span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={exportOptions.includeAttachments}
                onChange={(e) => setExportOptions({ ...exportOptions, includeAttachments: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                Include file attachments
              </span>
            </label>
          </div>
        </div>

        {/* Date Range */}
        <div>
          <label className="flex items-center mb-4">
            <input
              type="checkbox"
              checked={dateRange.enabled}
              onChange={(e) => setDateRange({ ...dateRange, enabled: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Calendar className="inline w-4 h-4 mr-1" aria-hidden="true" />
              Filter by date range
            </span>
          </label>
          
          {dateRange.enabled && (
            <div className="ml-7 grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="date-from" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  From
                </label>
                <input
                  id="date-from"
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="date-to" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  To
                </label>
                <input
                  id="date-to"
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>

        {/* Export Summary */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Export Summary
          </h3>
          <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <li>• Format: {exportOptions.format.toUpperCase()}</li>
            <li>• Include metadata: {exportOptions.includeMetadata ? 'Yes' : 'No'}</li>
            <li>• Include attachments: {exportOptions.includeAttachments ? 'Yes' : 'No'}</li>
            {dateRange.enabled && dateRange.from && dateRange.to && (
              <li>• Date range: {dateRange.from} to {dateRange.to}</li>
            )}
          </ul>
        </div>

        {/* Export Button */}
        <div>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg
                     hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            aria-busy={isExporting}
          >
            {isExporting ? (
              <>
                <Package className="w-4 h-4 mr-2 animate-pulse" aria-hidden="true" />
                Preparing Export...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" aria-hidden="true" />
                Export Data
              </>
            )}
          </button>
          
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Your export will be downloaded as a {exportOptions.format.toUpperCase()} file
          </p>
        </div>
      </div>
    </div>
  );
}