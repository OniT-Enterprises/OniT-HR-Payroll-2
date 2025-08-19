import React from "react";
import Header from "@/components/layout/Header";
import { Heart } from "lucide-react";

export default function BenefitsEnrollment() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <Heart className="h-8 w-8 text-emerald-400" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Benefits Enrollment
                </h1>
                <p className="text-gray-600">
                  Manage employee benefits enrollment
                </p>
              </div>
            </div>
          </div>
          <div className="text-center py-12">
            <p className="text-gray-500">
              Benefits enrollment page coming soon...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
