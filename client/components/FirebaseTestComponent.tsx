import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { db, auth, isFirebaseReady, isFirebaseBlocked } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, setDoc } from 'firebase/firestore';

const FirebaseTestComponent: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const testFirebaseConnection = async () => {
    setIsLoading(true);
    clearResults();

    try {
      // Test 1: Check Firebase initialization
      addResult(`✅ Firebase ready: ${isFirebaseReady()}`);
      addResult(`❌ Firebase blocked: ${isFirebaseBlocked()}`);
      addResult(`📊 Database instance: ${db ? 'Available' : 'Not available'}`);
      addResult(`🔐 Auth instance: ${auth ? 'Available' : 'Not available'}`);

      if (!db) {
        addResult('❌ Cannot proceed - database not initialized');
        return;
      }

      // Test 2: Simple read operation
      try {
        addResult('🔍 Testing read access to candidates collection...');
        const candidatesRef = collection(db, 'candidates');
        const snapshot = await getDocs(candidatesRef);
        addResult(`✅ Read test successful - found ${snapshot.docs.length} documents`);
      } catch (readError: any) {
        addResult(`❌ Read test failed: ${readError.message}`);
      }

      // Test 3: Simple write operation
      try {
        addResult('✍️ Testing write access...');
        const testRef = collection(db, 'test');
        await addDoc(testRef, {
          message: 'Firebase connectivity test',
          timestamp: new Date(),
          type: 'connectivity-test'
        });
        addResult('✅ Write test successful');
      } catch (writeError: any) {
        addResult(`❌ Write test failed: ${writeError.message}`);
      }

      // Test 4: Auth state
      if (auth) {
        addResult(`👤 Current user: ${auth.currentUser ? auth.currentUser.email || 'Anonymous' : 'Not authenticated'}`);
      }

    } catch (error: any) {
      addResult(`❌ General error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔥 Firebase Connectivity Test
          <Badge variant={isFirebaseReady() ? 'default' : 'destructive'}>
            {isFirebaseReady() ? 'Ready' : 'Not Ready'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={testFirebaseConnection} 
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Testing...' : 'Run Tests'}
          </Button>
          <Button 
            onClick={clearResults} 
            variant="outline"
            disabled={isLoading}
          >
            Clear
          </Button>
        </div>

        {testResults.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
            <h4 className="font-semibold mb-2">Test Results:</h4>
            <div className="space-y-1 font-mono text-sm">
              {testResults.map((result, index) => (
                <div key={index} className={`
                  ${result.includes('✅') ? 'text-green-600' : ''}
                  ${result.includes('❌') ? 'text-red-600' : ''}
                  ${result.includes('🔍') || result.includes('✍️') ? 'text-blue-600 font-semibold' : ''}
                `}>
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FirebaseTestComponent;
