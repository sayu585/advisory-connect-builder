
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ClipboardList, MessageSquare, TrendingUp, Bell } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { loadClients, loadRecommendations } from "@/utils/localStorage";

const Dashboard = () => {
  const { user, getPendingRequests, approveAccessRequest, rejectAccessRequest } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";
  const pendingRequests = getPendingRequests();
  const [clients, setClients] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const [showRequests, setShowRequests] = useState(false);

  // Load data from localStorage and ensure it refreshes properly
  useEffect(() => {
    if (user) {
      setClients(loadClients());
      setRecommendations(loadRecommendations());
    }
  }, [user]);

  const handleCardClick = (destination: string, title: string) => {
    if (destination) {
      navigate(destination);
    } else {
      toast.info(`${title} feature coming soon!`);
    }
  };

  // Calculate stats
  const clientCount = clients.length;
  const activeRecommendationsCount = recommendations.length;
  const acknowledgedRecommendationsCount = isAdmin 
    ? recommendations.reduce((sum, rec) => sum + (rec.clientsAcknowledged?.length || 0), 0) 
    : recommendations.filter(rec => rec.clientsAcknowledged?.includes(user?.id)).length;
  const pendingAcknowledgementsCount = isAdmin
    ? recommendations.reduce((sum, rec) => sum + ((rec.clientsAssigned?.length || 0) - (rec.clientsAcknowledged?.length || 0)), 0)
    : recommendations.filter(rec => !rec.clientsAcknowledged?.includes(user?.id)).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {user?.name}
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of your advisory platform
          </p>
        </div>
        
        {isAdmin && pendingRequests.length > 0 && (
          <div className="relative">
            <button 
              className="relative p-2 rounded-full bg-gray-100 hover:bg-gray-200"
              onClick={() => setShowRequests(!showRequests)}
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                {pendingRequests.length}
              </span>
            </button>
            
            {showRequests && (
              <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-md border z-50">
                <div className="p-3 border-b">
                  <h4 className="font-medium">Access Requests</h4>
                </div>
                <div className="max-h-64 overflow-auto">
                  {pendingRequests.map(request => (
                    <div key={request.id} className="p-3 border-b hover:bg-gray-50">
                      <p className="text-sm font-medium">{request.requesterName}</p>
                      <p className="text-xs text-gray-500">Requested access to {request.clientName}</p>
                      <div className="flex gap-2 mt-2">
                        <button 
                          className="text-xs bg-primary text-white px-2 py-1 rounded"
                          onClick={() => {
                            approveAccessRequest(request.id);
                            if (pendingRequests.length === 1) setShowRequests(false);
                          }}
                        >
                          Approve
                        </button>
                        <button 
                          className="text-xs bg-gray-200 px-2 py-1 rounded"
                          onClick={() => {
                            rejectAccessRequest(request.id);
                            if (pendingRequests.length === 1) setShowRequests(false);
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isAdmin && (
          <Card 
            className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
            onClick={() => handleCardClick(isAdmin ? "/clients" : "", "Total Clients")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Clients
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clientCount}</div>
              <p className="text-xs text-muted-foreground">
                Manage all your clients
              </p>
            </CardContent>
          </Card>
        )}
        <Card 
          className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
          onClick={() => handleCardClick("/recommendations", "Active Recommendations")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Recommendations
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRecommendationsCount}</div>
            <p className="text-xs text-muted-foreground">
              {isAdmin
                ? `${acknowledgedRecommendationsCount} acknowledgments received`
                : `${pendingAcknowledgementsCount} require acknowledgment`}
            </p>
          </CardContent>
        </Card>
        <Card 
          className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
          onClick={() => handleCardClick("/messages", "Unread Messages")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Messages
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              Coming soon
            </p>
          </CardContent>
        </Card>
        <Card 
          className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
          onClick={() => handleCardClick("/analytics", "Performance Analytics")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Performance
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              Coming soon
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card 
          className="col-span-2 cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
          onClick={() => toast.info("View all activity details coming soon!")}
        >
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest interactions and updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div 
              className="border-l-4 border-primary pl-4 py-2 cursor-pointer hover:bg-gray-50 rounded-r"
              onClick={(e) => {
                e.stopPropagation();
                navigate("/recommendations");
              }}
            >
              <p className="text-sm font-medium">View recommendations</p>
              <p className="text-xs text-muted-foreground">Click to manage recommendations</p>
            </div>
            {isAdmin && (
              <div 
                className="border-l-4 border-muted pl-4 py-2 cursor-pointer hover:bg-gray-50 rounded-r"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/clients");
                }}
              >
                <p className="text-sm font-medium">Manage clients</p>
                <p className="text-xs text-muted-foreground">Click to view clients</p>
              </div>
            )}
            <div 
              className="border-l-4 border-muted pl-4 py-2 cursor-pointer hover:bg-gray-50 rounded-r"
              onClick={(e) => {
                e.stopPropagation();
                navigate("/profile");
              }}
            >
              <p className="text-sm font-medium">Update profile</p>
              <p className="text-xs text-muted-foreground">Click to edit your information</p>
            </div>
          </CardContent>
        </Card>
        <Card 
          className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
          onClick={() => toast.info("Tasks management feature coming soon!")}
        >
          <CardHeader>
            <CardTitle>Upcoming Tasks</CardTitle>
            <CardDescription>
              Your scheduled tasks and deadlines
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
              <div>
                <p className="text-sm font-medium">Feature Coming Soon</p>
                <p className="text-xs text-muted-foreground">Task management will be available soon</p>
              </div>
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                Upcoming
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
