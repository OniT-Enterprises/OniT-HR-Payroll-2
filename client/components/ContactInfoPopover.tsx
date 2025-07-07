import React, { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Mail, Phone, Copy, Check } from "lucide-react";

interface ContactInfoPopoverProps {
  email: string;
  phone: string;
  employeeName: string;
}

export default function ContactInfoPopover({
  email,
  phone,
  employeeName,
}: ContactInfoPopoverProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const copyToClipboard = async (text: string, type: "email" | "phone") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "email") {
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
      } else {
        setCopiedPhone(true);
        setTimeout(() => setCopiedPhone(false), 2000);
      }
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <TooltipProvider>
      <Popover>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <div className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1 rounded">
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Mail className="h-3 w-3 text-muted-foreground" />
                </Button>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Phone className="h-3 w-3 text-muted-foreground" />
                </Button>
              </div>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm">
              <p className="font-medium">{employeeName}</p>
              <p>{email}</p>
              <p>{phone}</p>
            </div>
          </TooltipContent>
        </Tooltip>

        <PopoverContent className="w-80" align="start">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Contact Information</h4>
              <p className="text-sm text-muted-foreground mb-3">
                {employeeName}
              </p>
            </div>

            {/* Email */}
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
              <div className="flex items-center gap-2 flex-1">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {email}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(email, "email")}
                className="h-8 w-8 p-0"
              >
                {copiedEmail ? (
                  <Check className="h-3 w-3 text-green-600" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>

            {/* Phone */}
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
              <div className="flex items-center gap-2 flex-1">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-xs text-muted-foreground">{phone}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(phone, "phone")}
                className="h-8 w-8 p-0"
              >
                {copiedPhone ? (
                  <Check className="h-3 w-3 text-green-600" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => (window.location.href = `mailto:${email}`)}
              >
                <Mail className="h-3 w-3 mr-1" />
                Email
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => (window.location.href = `tel:${phone}`)}
              >
                <Phone className="h-3 w-3 mr-1" />
                Call
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
}
