
import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ClipboardList, MessageSquare, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";

  const handleCardClick = (destination: string, title: string) => {
    if (destination) {
      navigate(destination);
    } else {
      toast.info(`${title} feature coming soon!`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {user?.name}
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your advisory platform
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
            <div className="text-2xl font-bold">{isAdmin ? "24" : "-"}</div>
            <p className="text-xs text-muted-foreground">
              {isAdmin ? "+2 from last month" : "Contact your admin for details"}
            </p>
          </CardContent>
        </Card>
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
            <div className="text-2xl font-bold">{isAdmin ? "12" : "5"}</div>
            <p className="text-xs text-muted-foreground">
              {isAdmin
                ? "+4 added this month"
                : "2 require acknowledgment"}
            </p>
          </CardContent>
        </Card>
        <Card 
          className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
          onClick={() => handleCardClick("/messages", "Unread Messages")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Unread Messages
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">
              3 new since yesterday
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
            <div className="text-2xl font-bold">+12.5%</div>
            <p className="text-xs text-muted-foreground">
              From previous period
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
              <p className="text-sm font-medium">New recommendation added</p>
              <p className="text-xs text-muted-foreground">Today, 10:30 AM</p>
            </div>
            <div 
              className="border-l-4 border-muted pl-4 py-2 cursor-pointer hover:bg-gray-50 rounded-r"
              onClick={(e) => {
                e.stopPropagation();
                toast.info("Client meeting details coming soon!");
              }}
            >
              <p className="text-sm font-medium">Client meeting scheduled</p>
              <p className="text-xs text-muted-foreground">Yesterday, 2:15 PM</p>
            </div>
            <div 
              className="border-l-4 border-muted pl-4 py-2 cursor-pointer hover:bg-gray-50 rounded-r"
              onClick={(e) => {
                e.stopPropagation();
                navigate("/recommendations");
              }}
            >
              <p className="text-sm font-medium">Recommendation acknowledged</p>
              <p className="text-xs text-muted-foreground">Yesterday, 11:45 AM</p>
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
            <div 
              className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-2 rounded"
              onClick={(e) => {
                e.stopPropagation();
                toast.info("Client review details coming soon!");
              }}
            >
              <div>
                <p className="text-sm font-medium">Client Review</p>
                <p className="text-xs text-muted-foreground">Tomorrow, 9:00 AM</p>
              </div>
              <div className="bg-yellow-100 text-yellow-800 text-xs py-1 px-2 rounded-full">
                Pending
              </div>
            </div>
            <div 
              className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-2 rounded"
              onClick={(e) => {
                e.stopPropagation();
                toast.info("Strategy meeting details coming soon!");
              }}
            >
              <div>
                <p className="text-sm font-medium">Strategy Meeting</p>
                <p className="text-xs text-muted-foreground">May 10, 2:00 PM</p>
              </div>
              <div className="bg-green-100 text-green-800 text-xs py-1 px-2 rounded-full">
                Confirmed
              </div>
            </div>
            <div 
              className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-2 rounded"
              onClick={(e) => {
                e.stopPropagation();
                toast.info("Quarterly report details coming soon!");
              }}
            >
              <div>
                <p className="text-sm font-medium">Quarterly Report</p>
                <p className="text-xs text-muted-foreground">May 15, 11:00 AM</p>
              </div>
              <div className="bg-blue-100 text-blue-800 text-xs py-1 px-2 rounded-full">
                Preparation
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
