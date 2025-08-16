import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTenant } from '@/contexts/TenantContext';
import { Building2, Users, Settings, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TenantSwitcherProps {
  className?: string;
  showDetails?: boolean;
}

export function TenantSwitcher({ className, showDetails = false }: TenantSwitcherProps) {
  const { 
    currentTenant, 
    availableTenants, 
    loading, 
    error, 
    switchTenant, 
    refreshTenant 
  } = useTenant();
  const { toast } = useToast();
  const [switching, setSwitching] = useState(false);

  const handleTenantSwitch = async (tenantId: string) => {
    if (tenantId === currentTenant?.tenantId) return;
    
    setSwitching(true);
    try {
      await switchTenant(tenantId);
      toast({
        title: 'Tenant switched',
        description: `Now viewing tenant: ${tenantId}`,
      });
    } catch (err) {
      toast({
        title: 'Switch failed',
        description: err instanceof Error ? err.message : 'Failed to switch tenant',
        variant: 'destructive',
      });
    } finally {
      setSwitching(false);
    }
  };

  const handleRefresh = async () => {
    try {
      await refreshTenant();
      toast({
        title: 'Tenant refreshed',
        description: 'Tenant data has been updated',
      });
    } catch (err) {
      toast({
        title: 'Refresh failed',
        description: err instanceof Error ? err.message : 'Failed to refresh tenant',
        variant: 'destructive',
      });
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner':
        return 'default';
      case 'hr-admin':
        return 'secondary';
      case 'manager':
        return 'outline';
      case 'viewer':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading tenant...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive">Tenant Error</span>
            </div>
            <Button size="sm" variant="outline" onClick={handleRefresh}>
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
          {showDetails && (
            <p className="text-xs text-muted-foreground mt-2">{error}</p>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!currentTenant) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">No tenant selected</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      {showDetails && (
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Tenant Workspace
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Tenant Selector */}
          <div className="flex items-center gap-2">
            <Select
              value={currentTenant.tenantId}
              onValueChange={handleTenantSwitch}
              disabled={switching || availableTenants.length <= 1}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Select tenant" />
              </SelectTrigger>
              <SelectContent>
                {availableTenants.map((tenantId) => (
                  <SelectItem key={tenantId} value={tenantId}>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3 w-3" />
                      {tenantId}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefresh}
              disabled={switching}
            >
              <RefreshCw className={`h-3 w-3 ${switching ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Current Tenant Info */}
          {showDetails && (
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tenant:</span>
                <span className="font-medium">{currentTenant.config.name || currentTenant.tenantId}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Role:</span>
                <Badge variant={getRoleBadgeVariant(currentTenant.member.role)} className="text-xs">
                  {currentTenant.member.role}
                </Badge>
              </div>
              
              {currentTenant.member.modules && (
                <div className="flex items-start justify-between">
                  <span className="text-muted-foreground">Modules:</span>
                  <div className="flex flex-wrap gap-1 max-w-32">
                    {currentTenant.member.modules.map((module) => (
                      <Badge key={module} variant="outline" className="text-xs">
                        {module}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Access Info */}
          {!showDetails && (
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span className="text-muted-foreground">
                  {currentTenant.config.name || currentTenant.tenantId}
                </span>
              </div>
              <Badge variant={getRoleBadgeVariant(currentTenant.member.role)} className="text-xs">
                {currentTenant.member.role}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default TenantSwitcher;
