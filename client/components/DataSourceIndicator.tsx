import React from 'react';
import { Badge } from '@/components/ui/badge';
import { db, isFirebaseReady, isFirebaseBlocked } from '@/lib/firebase';

const DataSourceIndicator: React.FC = () => {
  const isFirebaseAvailable = !!(db && isFirebaseReady() && !isFirebaseBlocked());

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">Data Source:</span>
      {isFirebaseAvailable ? (
        <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
          🔥 Firebase Connected
        </Badge>
      ) : (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
          📋 Demo Data
        </Badge>
      )}
    </div>
  );
};

export default DataSourceIndicator;
