
import React from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft } from "lucide-react";

const Unauthorized = () => {
  const navigate = useNavigate();
  
  // Go back to previous page
  const handleGoBack = () => {
    navigate(-1);
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <ShieldAlert className="mx-auto h-16 w-16 text-destructive mb-6" />
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-6">
          Sorry, you don't have permission to access this page. Please contact
          your administrator if you believe this is an error.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={handleGoBack} className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
          <Button variant="outline" asChild>
            <Link to="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
