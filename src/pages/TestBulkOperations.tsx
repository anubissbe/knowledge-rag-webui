import { FC } from 'react';
import { MemoriesPage } from './MemoriesPage';

export const TestBulkOperations: FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Bulk Operations Test</h1>
        <div className="bg-muted/20 p-4 rounded-lg mb-6">
          <h2 className="font-semibold mb-2">How to test:</h2>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Click "Select Items" to enable selection mode</li>
            <li>Click on memory cards to select them (checkbox will appear)</li>
            <li>Use the bulk operations toolbar to:
              <ul className="list-disc list-inside ml-6 mt-1">
                <li>Delete selected items</li>
                <li>Add tags to selected items</li>
                <li>Move selected items to a collection</li>
                <li>Export selected items (JSON, CSV, Markdown)</li>
              </ul>
            </li>
            <li>Click X or "Select Items" again to exit selection mode</li>
          </ol>
        </div>
        <MemoriesPage />
      </div>
    </div>
  );
};