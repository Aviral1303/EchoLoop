"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Loader2, CheckCircle, XCircle } from "lucide-react";

export function GmailAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"unchecked" | "checking" | "authenticated" | "unauthenticated">("unchecked");
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    // Check authentication status when component mounts
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    setStatus("checking");
    try {
      const response = await fetch("http://localhost:8000/api/v1/auth/status");
      const data = await response.json();
      
      if (data.authenticated) {
        setStatus("authenticated");
        setProfile(data.profile);
      } else {
        setStatus("unauthenticated");
      }
    } catch (error) {
      console.error("Error checking authentication status:", error);
      setStatus("unauthenticated");
      setError("Could not connect to the server. Please try again later.");
    }
  };

  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch("http://localhost:8000/api/v1/auth/login");
      const data = await response.json();
      
      if (data.auth_url) {
        // Redirect to Google's OAuth consent screen
        window.location.href = data.auth_url;
      } else {
        setError("Failed to generate authentication URL. Please try again.");
      }
    } catch (error) {
      console.error("Error connecting to Gmail:", error);
      setError("Could not connect to the server. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Gmail Connection
        </CardTitle>
        <CardDescription>
          Connect your Gmail account to access and summarize your emails
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {status === "checking" && (
          <div className="flex flex-col items-center justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Checking connection status...</p>
          </div>
        )}
        
        {status === "authenticated" && (
          <div className="flex flex-col items-center justify-center py-6">
            <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
            <p className="font-medium">Connected to Gmail</p>
            {profile && (
              <p className="text-sm text-muted-foreground mt-1">{profile.emailAddress || profile.email}</p>
            )}
          </div>
        )}
        
        {status === "unauthenticated" && (
          <div className="flex flex-col items-center justify-center py-6">
            <XCircle className="h-8 w-8 text-red-500 mb-2" />
            <p className="font-medium">Not connected to Gmail</p>
            <p className="text-sm text-muted-foreground mt-1">
              Connect your Gmail account to start summarizing your emails
            </p>
          </div>
        )}
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        {status === "unauthenticated" && (
          <Button 
            onClick={handleConnect} 
            disabled={isLoading} 
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>Connect Gmail</>
            )}
          </Button>
        )}
        
        {status === "authenticated" && (
          <Button 
            variant="outline"
            onClick={checkAuthStatus}
            className="w-full"
          >
            Refresh Status
          </Button>
        )}
      </CardFooter>
    </Card>
  );
} 