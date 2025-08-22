import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import HotDogStyleNavigation from "@/components/layout/HotDogStyleNavigation";
import { FirebaseIsolationControl } from "@/components/FirebaseIsolationControl";
import { DevAuthControl } from "@/components/DevAuthControl";
import { FetchDiagnostic } from "@/components/FetchDiagnostic";
import { getCurrentUser } from "@/lib/localAuth";
import {
  Settings as SettingsIcon,
  User,
  Building,
  Shield,
  Bell,
  Palette,
  Database,
  Download,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Save,
  Camera,
  Key,
  Activity,
} from "lucide-react";

export default function Settings() {
  const settingsCategories = [
    {
      title: "Account Settings",
      description: "Manage your personal account preferences",
      icon: <User className="h-5 w-5" />,
      items: [
        "Profile Information",
        "Password & Security",
        "Two-Factor Authentication",
        "Session Management",
      ],
    },
    {
      title: "Company Settings",
      description: "Configure company-wide settings and policies",
      icon: <Building className="h-5 w-5" />,
      items: [
        "Company Information",
        "Business Structure",
        "Departments",
        "Holiday Calendar",
      ],
    },
    {
      title: "Access Control",
      description: "Manage user roles and permissions",
      icon: <Shield className="h-5 w-5" />,
      items: ["User Roles", "Permission Levels", "Module Access", "Audit Logs"],
    },
    {
      title: "Notifications",
      description: "Configure alerts and notification preferences",
      icon: <Bell className="h-5 w-5" />,
      items: [
        "Email Notifications",
        "SMS Alerts",
        "System Notifications",
        "Reminder Settings",
      ],
    },
    {
      title: "Appearance",
      description: "Customize the look and feel of the application",
      icon: <Palette className="h-5 w-5" />,
      items: [
        "Theme Settings",
        "Language Preferences",
        "Date & Time Format",
        "Currency Settings",
      ],
    },
    {
      title: "Data Management",
      description: "Backup, export, and manage your data",
      icon: <Database className="h-5 w-5" />,
      items: ["Data Backup", "Data Export", "Data Retention", "Data Privacy"],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <HotDogStyleNavigation />

      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <SettingsIcon className="h-8 w-8 text-muted-foreground" />
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">
              Configure your PayrollHR application settings and preferences
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {settingsCategories.map((category, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {category.icon}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{category.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {category.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {category.items.map((item, itemIndex) => (
                    <div key={itemIndex}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-auto p-3 text-left"
                      >
                        <span className="text-sm">{item}</span>
                      </Button>
                      {itemIndex < category.items.length - 1 && (
                        <Separator className="mt-2" />
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <Button className="w-full">Configure {category.title}</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Network Fetch Diagnostic */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Network Fetch Diagnostic</CardTitle>
            <CardDescription>
              Fix "Failed to fetch" errors by restoring network functions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FetchDiagnostic />
          </CardContent>
        </Card>

        {/* Development Authentication */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Development Authentication</CardTitle>
            <CardDescription>
              Sign in to Firebase to enable database operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DevAuthControl />
          </CardContent>
        </Card>

        {/* Firebase Database Control */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Firebase Database Control</CardTitle>
            <CardDescription>
              Manage database connectivity and isolation mode
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FirebaseIsolationControl />
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common settings and administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                <Download className="h-5 w-5" />
                <span>Export All Data</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                <Shield className="h-5 w-5" />
                <span>Security Audit</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                <Database className="h-5 w-5" />
                <span>Backup Now</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
