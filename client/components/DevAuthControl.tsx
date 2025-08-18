import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { signInDev, signOutDev, getAuthStatus, signInWithEmail } from '../lib/devAuth';
import { auth } from '../lib/firebase';

export const DevAuthControl: React.FC = () => {
  const [authStatus, setAuthStatus] = useState(getAuthStatus());
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>('');

  // Listen for auth state changes
  useEffect(() => {
    if (!auth) return;

    const unsubscribe = auth.onAuthStateChanged((user) => {
      setAuthStatus(getAuthStatus());
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const user = await signInDev();
      if (user) {
        setMessage(`✅ Signed in successfully! User ID: ${user.uid.substring(0, 8)}...`);
      } else {
        setMessage('❌ Sign in failed - check console for details');
      }
    } catch (error: any) {
      setMessage(`❌ Sign in error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      await signOutDev();
      setMessage('✅ Signed out successfully');
    } catch (error: any) {
      setMessage(`❌ Sign out error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (authStatus.isSignedIn) {
      return <Badge variant="default">SIGNED IN</Badge>;
    } else {
      return <Badge variant="destructive">NOT SIGNED IN</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Development Authentication</CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            {authStatus.isSignedIn ? (
              <>
                <strong>Status:</strong> Authenticated as {authStatus.isAnonymous ? 'Anonymous User' : authStatus.email}
                <br />
                <strong>User ID:</strong> {authStatus.uid?.substring(0, 16)}...
              </>
            ) : (
              <>
                <strong>Status:</strong> Not authenticated. You need to sign in to access Firebase data.
                <br />
                This will enable database operations and fix permission errors.
              </>
            )}
          </AlertDescription>
        </Alert>

        <div className="flex gap-2">
          {!authStatus.isSignedIn ? (
            <Button 
              onClick={handleSignIn}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Signing In...' : 'Sign In (Anonymous)'}
            </Button>
          ) : (
            <Button 
              onClick={handleSignOut}
              variant="outline"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Signing Out...' : 'Sign Out'}
            </Button>
          )}
        </div>

        {message && (
          <Alert>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground">
          <strong>Note:</strong> This uses Firebase Anonymous Authentication for development.
          After signing in, Firebase operations should work if Firestore rules allow anonymous users.
        </div>
      </CardContent>
    </Card>
  );
};
