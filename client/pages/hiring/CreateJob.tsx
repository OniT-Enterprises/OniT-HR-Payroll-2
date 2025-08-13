import React from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MainNavigation from "@/components/layout/MainNavigation";
import {
  Briefcase,
  DollarSign,
  Calendar,
  Building,
  Users,
  FileText,
  Upload,
  Mail,
  Globe,
} from "lucide-react";

export default function CreateJob() {
  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />

      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Briefcase className="h-8 w-8 text-green-400" />
            <div>
              <h1 className="text-3xl font-bold">Create Job Posting</h1>
              <p className="text-muted-foreground">
                Create a new job posting for your organization
              </p>
            </div>
          </div>

          {/* Action Buttons - Top Right */}
          <div className="flex items-center gap-3">
            <Button variant="outline">Save as Draft</Button>
            <Button variant="outline">Preview</Button>
            <Button>Submit for Approval</Button>
          </div>
        </div>

        <div className="flex flex-col justify-start gap-6">
          <div className="flex gap-5 max-lg:flex-col max-lg:items-stretch max-lg:gap-0">
            <div className="flex flex-col w-[58%] max-lg:w-full max-lg:ml-0">
              <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Job Information
                </CardTitle>
                <CardDescription>
                  Basic information about the position
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input
                      id="jobTitle"
                      placeholder="e.g. Senior Software Engineer"
                    />
                    <div className="mt-2 space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input id="department" placeholder="e.g. Engineering" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobDescription">Job Description</Label>
                  <Textarea
                    id="jobDescription"
                    placeholder="Describe the role, responsibilities, and requirements..."
                    rows={6}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Compensation & Benefits
                </CardTitle>
                <CardDescription>
                  Salary range and benefits information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salaryMin">Minimum Monthly Salary</Label>
                    <Input id="salaryMin" placeholder="$4,200" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salaryMax">Maximum Monthly Salary</Label>
                    <Input id="salaryMax" placeholder="$5,800" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="benefits">Benefits</Label>
                  <Textarea
                    id="benefits"
                    placeholder="Health insurance, dental, 401k, vacation time..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Requirements & Qualifications
                </CardTitle>
                <CardDescription>
                  Skills and experience required for this position
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="qualifications">
                    Required Qualifications
                  </Label>
                  <Textarea
                    id="qualifications"
                    placeholder="Bachelor's degree, 3+ years experience..."
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="skills">Required Skills</Label>
                  <Textarea
                    id="skills"
                    placeholder="JavaScript, React, Node.js..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
              </div>
            </div>

            <div className="flex flex-col w-[42%] ml-5 max-lg:w-full max-lg:ml-0">
              <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="applicationDeadline">
                    Application Deadline
                  </Label>
                  <Input id="applicationDeadline" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Expected Start Date</Label>
                  <Input id="startDate" type="date" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Job Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Work Location</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select work location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="office">Office</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="on-site">On-site</SelectItem>
                      <SelectItem value="field-work">Field Work</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employmentType">Employment Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="temporary">Temporary</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="positions">Number of Positions</Label>
                  <Input id="positions" type="number" placeholder="1" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Approval Process
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hiringManager">Hiring Manager</Label>
                  <Input
                    id="hiringManager"
                    placeholder="Select hiring manager"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="approver">Job Posting Approver</Label>
                  <Input id="approver" placeholder="Select approver" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Application Submission
                </CardTitle>
                <CardDescription>
                  How candidates should submit their CV and covering letter
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="submissionMethod">Submission Method</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select submission method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email Application</SelectItem>
                      <SelectItem value="portal">Online Portal</SelectItem>
                      <SelectItem value="both">Email & Portal</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="post">Postal Mail</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="applicationEmail">Application Email</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="applicationEmail"
                      type="email"
                      placeholder="hr@company.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="applicationUrl">Application Portal URL</Label>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="applicationUrl"
                      type="url"
                      placeholder="https://careers.company.com/apply"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requiredDocuments">Required Documents</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="rounded"
                        defaultChecked
                      />
                      <span className="text-sm">CV/Resume</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="rounded"
                        defaultChecked
                      />
                      <span className="text-sm">Cover Letter</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Portfolio</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">References</span>
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="applicationInstructions">
                    Application Instructions
                  </Label>
                  <Textarea
                    id="applicationInstructions"
                    placeholder="Please submit your CV and cover letter via email with the subject line 'Application for [Job Title]'..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
