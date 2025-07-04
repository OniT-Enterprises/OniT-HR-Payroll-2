import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import MainNavigation from "@/components/layout/MainNavigation";
import {
  Users,
  Search,
  Filter,
  Download,
  Mail,
  Phone,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  Upload,
  File,
  ChevronDown,
} from "lucide-react";

export default function CandidateSelection() {
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importedData, setImportedData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({
    cv: null as File | null,
    coverLetter: null as File | null,
  });

  // AI extraction function - simulates real AI processing
  const extractInfoFromFiles = async (
    cvFile?: File,
    coverLetterFile?: File,
  ) => {
    setIsProcessing(true);

    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock AI extraction results - in real implementation, this would call an AI service
    const extractedData = {
      name: "John Smith",
      email: "john.smith@email.com",
      phone: "+1 (555) 0127",
    };

    setImportedData(extractedData);
    setIsProcessing(false);
  };

  const handleCVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const cvFile = files[0];
      setUploadedFiles((prev) => ({ ...prev, cv: cvFile }));
      // Trigger AI extraction when CV is uploaded
      extractInfoFromFiles(cvFile, uploadedFiles.coverLetter);
    }
  };

  const handleCoverLetterUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const coverLetterFile = files[0];
      setUploadedFiles((prev) => ({ ...prev, coverLetter: coverLetterFile }));
      // Trigger AI extraction when cover letter is uploaded
      extractInfoFromFiles(uploadedFiles.cv, coverLetterFile);
    }
  };

  const candidates = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      phone: "+1 (555) 0123",
      position: "Senior Software Engineer",
      experience: "5 years",
      score: 4.8,
      status: "Under Review",
      appliedDate: "2024-01-15",
      resume: "sarah_johnson_resume.pdf",
      avatar: "SJ",
      cvQuality: 9.2,
      coverLetter: 8.8,
      technicalSkills: 9.0,
      interviewScore: 8.5,
      totalScore: 8.9,
    },
    {
      id: 2,
      name: "Michael Chen",
      email: "michael.chen@email.com",
      phone: "+1 (555) 0124",
      position: "Senior Software Engineer",
      experience: "7 years",
      score: 4.6,
      status: "Shortlisted",
      appliedDate: "2024-01-14",
      resume: "michael_chen_resume.pdf",
      avatar: "MC",
      cvQuality: 8.9,
      coverLetter: 8.2,
      technicalSkills: 9.5,
      interviewScore: 9.0,
      totalScore: 8.9,
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      email: "emily.rodriguez@email.com",
      phone: "+1 (555) 0125",
      position: "Senior Software Engineer",
      experience: "4 years",
      score: 4.4,
      status: "New",
      appliedDate: "2024-01-16",
      resume: "emily_rodriguez_resume.pdf",
      avatar: "ER",
      cvQuality: 8.1,
      coverLetter: 8.7,
      technicalSkills: 8.0,
      interviewScore: null,
      totalScore: 8.3,
    },
    {
      id: 4,
      name: "David Wilson",
      email: "david.wilson@email.com",
      phone: "+1 (555) 0126",
      position: "Senior Software Engineer",
      experience: "6 years",
      score: 4.2,
      status: "Rejected",
      appliedDate: "2024-01-13",
      resume: "david_wilson_resume.pdf",
      avatar: "DW",
      cvQuality: 7.2,
      coverLetter: 6.8,
      technicalSkills: 7.5,
      interviewScore: 6.0,
      totalScore: 6.9,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Shortlisted":
        return "bg-green-100 text-green-800";
      case "Under Review":
        return "bg-yellow-100 text-yellow-800";
      case "New":
        return "bg-blue-100 text-blue-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Shortlisted":
        return <CheckCircle className="h-4 w-4" />;
      case "Under Review":
        return <Clock className="h-4 w-4" />;
      case "New":
        return <Star className="h-4 w-4" />;
      case "Rejected":
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return "text-gray-400";
    if (score >= 8.5) return "text-green-600";
    if (score >= 7.5) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />

      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Users className="h-8 w-8 text-green-400" />
          <div>
            <h1 className="text-3xl font-bold">Candidate Selection</h1>
            <p className="text-muted-foreground">
              Review and manage job applications
            </p>
          </div>
        </div>

        {/* Statistics moved under title */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Applications
                  </p>
                  <p className="text-2xl font-bold">47</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Shortlisted
                  </p>
                  <p className="text-2xl font-bold">12</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Under Review
                  </p>
                  <p className="text-2xl font-bold">8</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    New Applications
                  </p>
                  <p className="text-2xl font-bold">5</p>
                </div>
                <Star className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls row - job selector inline with other buttons */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search candidates..." className="pl-9 w-64" />
            </div>
            <Button size="sm">Search</Button>
          </div>

          <div className="flex items-center gap-3">
            <select className="px-4 py-2 border rounded-md bg-background min-w-[200px] h-9">
              <option value="">Select job position...</option>
              <option value="senior-software-engineer">
                Senior Software Engineer
              </option>
              <option value="marketing-manager">Marketing Manager</option>
              <option value="hr-specialist">HR Specialist</option>
              <option value="data-analyst">Data Analyst</option>
              <option value="product-manager">Product Manager</option>
            </select>

            <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Upload className="mr-2 h-4 w-4" />
                  Import Application
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Import Application</DialogTitle>
                  <DialogDescription>
                    Upload CV and cover letter files. Our AI will automatically
                    extract candidate information.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">CV/Resume</label>
                      <div
                        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                          uploadedFiles.cv
                            ? "border-green-300 bg-green-50"
                            : "border-gray-300"
                        }`}
                      >
                        <File
                          className={`h-8 w-8 mx-auto mb-2 ${
                            uploadedFiles.cv
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        />
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleCVUpload}
                          className="hidden"
                          id="cv-upload"
                        />
                        <label htmlFor="cv-upload" className="cursor-pointer">
                          <p className="text-sm text-gray-600">
                            {uploadedFiles.cv
                              ? uploadedFiles.cv.name
                              : "Click to upload CV"}
                          </p>
                          <p className="text-xs text-gray-400">
                            PDF, DOC, DOCX
                          </p>
                        </label>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Cover Letter
                      </label>
                      <div
                        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                          uploadedFiles.coverLetter
                            ? "border-green-300 bg-green-50"
                            : "border-gray-300"
                        }`}
                      >
                        <Mail
                          className={`h-8 w-8 mx-auto mb-2 ${
                            uploadedFiles.coverLetter
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        />
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleCoverLetterUpload}
                          className="hidden"
                          id="cl-upload"
                        />
                        <label htmlFor="cl-upload" className="cursor-pointer">
                          <p className="text-sm text-gray-600">
                            {uploadedFiles.coverLetter
                              ? uploadedFiles.coverLetter.name
                              : "Click to upload Cover Letter"}
                          </p>
                          <p className="text-xs text-gray-400">
                            PDF, DOC, DOCX
                          </p>
                        </label>
                      </div>
                    </div>
                  </div>

                  {isProcessing && (
                    <div className="border rounded-lg p-4 bg-blue-50">
                      <div className="flex items-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <div>
                          <h4 className="font-medium text-blue-800">
                            AI Processing Documents...
                          </h4>
                          <p className="text-sm text-blue-600">
                            Extracting candidate information from uploaded files
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {!isProcessing && importedData.name && (
                    <div className="border rounded-lg p-4 bg-green-50">
                      <h4 className="font-medium mb-3 text-green-800">
                        AI Extracted Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs text-gray-600">Name</label>
                          <p className="font-medium">{importedData.name}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">Email</label>
                          <p className="font-medium">{importedData.email}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">Phone</label>
                          <p className="font-medium">{importedData.phone}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowImportDialog(false);
                        setUploadedFiles({ cv: null, coverLetter: null });
                        setImportedData({ name: "", email: "", phone: "" });
                        setIsProcessing(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      disabled={!importedData.name || isProcessing}
                      onClick={() => {
                        // Handle adding candidate logic here
                        setShowImportDialog(false);
                        setUploadedFiles({ cv: null, coverLetter: null });
                        setImportedData({ name: "", email: "", phone: "" });
                        setIsProcessing(false);
                      }}
                    >
                      {isProcessing ? "Processing..." : "Add Candidate"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>

        {/* Candidates List */}
        <Card>
          <CardHeader className="ml-2.5">
            <CardTitle>Candidate Applications</CardTitle>
            <CardDescription>
              Review and manage candidate applications for open positions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Candidate</th>
                    <th className="text-center p-3 font-medium">
                      <button className="flex flex-col items-center gap-1 hover:bg-gray-50 p-1 rounded">
                        <span className="text-xs leading-tight">CV</span>
                        <span className="text-xs leading-tight">Quality</span>
                        <ChevronDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="text-center p-3 font-medium">
                      <button className="flex flex-col items-center gap-1 hover:bg-gray-50 p-1 rounded">
                        <span className="text-xs leading-tight">Cover</span>
                        <span className="text-xs leading-tight">Letter</span>
                        <ChevronDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="text-center p-3 font-medium">
                      <button className="flex flex-col items-center gap-1 hover:bg-gray-50 p-1 rounded">
                        <span className="text-xs leading-tight ml-2.5">
                          Technical
                        </span>
                        <span className="text-xs leading-tight ml-2.5">
                          Skills
                        </span>
                        <ChevronDown className="h-3 w-3 ml-2.5" />
                      </button>
                    </th>
                    <th className="text-center p-3 font-medium">
                      <button className="flex flex-col items-center gap-1 hover:bg-gray-50 p-1 rounded ml-3.5">
                        <span className="text-xs leading-tight">Interview</span>
                        <span className="text-xs leading-tight">Score</span>
                        <ChevronDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="text-center p-3 font-medium">
                      <button className="flex flex-col items-center gap-1 hover:bg-gray-50 p-1 rounded">
                        <span className="text-sm font-semibold leading-tight ml-2.5">
                          Total
                        </span>
                        <span className="text-sm font-semibold leading-tight ml-2.5">
                          Score
                        </span>
                        <ChevronDown className="h-3 w-3 ml-2.5" />
                      </button>
                    </th>
                    <th className="text-center p-3 font-medium">Status</th>
                    <th className="text-center p-3 font-medium">Documents</th>
                    <th className="text-center p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((candidate) => (
                    <tr
                      key={candidate.id}
                      className="border-b hover:bg-muted/50 transition-colors"
                    >
                      {/* Candidate Info */}
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage
                              src={`/placeholder.svg`}
                              alt={candidate.name}
                            />
                            <AvatarFallback>{candidate.avatar}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">{candidate.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {candidate.email}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">
                                {candidate.experience}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                Applied: {candidate.appliedDate}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* CV Quality */}
                      <td className="p-3 text-center">
                        <span
                          className={`font-semibold ${getScoreColor(candidate.cvQuality)}`}
                        >
                          {candidate.cvQuality}/10
                        </span>
                      </td>

                      {/* Cover Letter */}
                      <td className="p-3 text-center">
                        <span
                          className={`font-semibold ${getScoreColor(candidate.coverLetter)}`}
                        >
                          {candidate.coverLetter}/10
                        </span>
                      </td>

                      {/* Technical Skills */}
                      <td className="p-3 text-center">
                        <span
                          className={`font-semibold ${getScoreColor(candidate.technicalSkills)}`}
                        >
                          {candidate.technicalSkills}/10
                        </span>
                      </td>

                      {/* Interview Score */}
                      <td className="p-3 text-center">
                        {candidate.interviewScore ? (
                          <span
                            className={`font-semibold ${getScoreColor(candidate.interviewScore)}`}
                          >
                            {candidate.interviewScore}/10
                          </span>
                        ) : (
                          <span className="text-gray-400 font-semibold">
                            NA
                          </span>
                        )}
                      </td>

                      {/* Total Score */}
                      <td className="p-3 text-center">
                        <span
                          className={`font-bold text-lg ${getScoreColor(candidate.totalScore)}`}
                        >
                          {candidate.totalScore}/10
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {getStatusIcon(candidate.status)}
                          <Badge className={getStatusColor(candidate.status)}>
                            {candidate.status}
                          </Badge>
                        </div>
                      </td>

                      {/* Documents */}
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-3">
                          {/* CV and CL stacked */}
                          <div className="flex items-center gap-2">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs font-medium">CV</span>
                              <span className="text-xs font-medium">CL</span>
                            </div>
                            <div className="flex flex-col gap-1">
                              {/* CV Viewer */}
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 p-0 rounded-full border"
                                  >
                                    <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                                      <File className="h-2 w-2 text-primary-foreground" />
                                    </div>
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[80vh]">
                                  <DialogHeader>
                                    <DialogTitle>
                                      CV - {candidate.name}
                                    </DialogTitle>
                                    <DialogDescription>
                                      Resume/CV document for review
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="border rounded-lg p-4 h-[60vh] overflow-auto bg-gray-50">
                                    <div className="text-center text-muted-foreground">
                                      <File className="h-16 w-16 mx-auto mb-4" />
                                      <p>CV document would be displayed here</p>
                                      <p className="text-sm">
                                        {candidate.resume}
                                      </p>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>

                              {/* Cover Letter Viewer */}
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 p-0 rounded-sm border"
                                  >
                                    <div className="h-4 w-4 bg-secondary flex items-center justify-center rounded-sm">
                                      <div className="h-2 w-3 bg-foreground rounded-sm opacity-70"></div>
                                    </div>
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[80vh]">
                                  <DialogHeader>
                                    <DialogTitle>
                                      Cover Letter - {candidate.name}
                                    </DialogTitle>
                                    <DialogDescription>
                                      Cover letter document for review
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="border rounded-lg p-4 h-[60vh] overflow-auto bg-gray-50">
                                    <div className="text-center text-muted-foreground">
                                      <Mail className="h-16 w-16 mx-auto mb-4" />
                                      <p>
                                        Cover letter would be displayed here
                                      </p>
                                      <p className="text-sm">
                                        Cover letter content for{" "}
                                        {candidate.name}
                                      </p>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>

                          {/* Contact icons stacked */}
                          <div className="flex flex-col gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 p-0"
                            >
                              <Phone className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 p-0"
                            >
                              <Mail className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-3">
                        <div className="flex flex-col items-center gap-1">
                          <Button variant="outline" size="sm" className="w-20">
                            Reject
                          </Button>
                          <Button size="sm" className="w-20">
                            Shortlist
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
