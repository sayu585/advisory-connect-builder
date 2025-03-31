
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Users, BarChart3, ClipboardList } from "lucide-react";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="py-12 md:py-24 lg:py-32 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              KULSTOCK COMMUNICATION
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              A complete client relationship management system designed specifically for financial advisors. 
              Securely manage client relationships and deliver personalized investment recommendations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Button size="lg" asChild>
                  <Link to="/dashboard">Go to Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button size="lg" asChild>
                    <Link to="/login">Sign In</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/register">Create Account</Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
            <Card className="border-none shadow-lg transition-all hover:shadow-xl">
              <CardContent className="p-6">
                <Shield className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">Secure Access</h3>
                <p className="text-gray-600">
                  Role-based access control ensures data security and appropriate permissions.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-lg transition-all hover:shadow-xl">
              <CardContent className="p-6">
                <Users className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">Client Management</h3>
                <p className="text-gray-600">
                  Easily manage client information, interactions, and communication history.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-lg transition-all hover:shadow-xl">
              <CardContent className="p-6">
                <ClipboardList className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">Recommendations</h3>
                <p className="text-gray-600">
                  Create and track investment recommendations with multiple price targets.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-lg transition-all hover:shadow-xl">
              <CardContent className="p-6">
                <BarChart3 className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">Analytics</h3>
                <p className="text-gray-600">
                  Track client acknowledgments and monitor recommendation performance.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} KULSTOCK COMMUNICATION. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
