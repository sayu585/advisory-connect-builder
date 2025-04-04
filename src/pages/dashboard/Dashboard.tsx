
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { 
  Users, ChevronUp, ChevronDown, Clock, AlertCircle,
  Calendar, ArrowUpRight, ArrowDownRight, 
  BarChartIcon, PieChartIcon, LineChartIcon
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { loadClients, loadRecommendations } from "@/utils/localStorage";

const performanceData = [
  { month: "Jan", performance: 5.67 },
  { month: "Feb", performance: 7.12 },
  { month: "Mar", performance: 6.89 },
  { month: "Apr", performance: 9.21 },
  { month: "May", performance: 8.76 },
  { month: "Jun", performance: 10.54 },
  { month: "Jul", performance: 12.32 },
  { month: "Aug", performance: 11.98 },
  { month: "Sep", performance: 14.43 },
  { month: "Oct", performance: 13.76 },
  { month: "Nov", performance: 15.21 },
  { month: "Dec", performance: 16.54 },
];

const sectorData = [
  { name: "Technology", value: 35 },
  { name: "Healthcare", value: 25 },
  { name: "Financials", value: 20 },
  { name: "Consumer", value: 15 },
  { name: "Energy", value: 5 },
];

const recommendationTypeData = [
  { name: "Buy", value: 45 },
  { name: "Hold", value: 35 },
  { name: "Sell", value: 20 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const Dashboard = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [clients, setClients] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [pendingAcknowledgements, setPendingAcknowledgements] = useState(0);
  
  // Refresh data on mount and focus
  useEffect(() => {
    const refreshData = () => {
      // Load clients and recommendations
      setClients(loadClients());
      const loadedRecommendations = loadRecommendations();
      setRecommendations(loadedRecommendations);
      
      // Calculate pending acknowledgements for clients
      if (!isAdmin && user) {
        const pending = loadedRecommendations.filter(rec => 
          rec.clientsAssigned?.includes(user.id) && 
          !rec.clientsAcknowledged?.includes(user.id)
        ).length;
        setPendingAcknowledgements(pending);
      }
    };
    
    refreshData();
    
    // Add event listeners for tab focus and storage changes
    const handleFocus = () => refreshData();
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'recommendations' || event.key === 'clients') {
        refreshData();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user, isAdmin]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        {isAdmin && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clients.length}</div>
              <p className="text-xs text-muted-foreground">
                {clients.filter(c => c.status === "Active").length} active
              </p>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isAdmin ? "Total Recommendations" : "Your Recommendations"}
            </CardTitle>
            <div className="h-4 w-4 text-muted-foreground">
              {isAdmin ? "📊" : "📋"}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isAdmin ? recommendations.length : recommendations.filter(r => r.clientsAssigned?.includes(user?.id)).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {isAdmin ? (
                `${recommendations.filter(r => r.status === "Active").length} active`
              ) : (
                `${pendingAcknowledgements} pending acknowledgement`
              )}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Performance</CardTitle>
            <div className="flex items-center space-x-1">
              <ArrowUpRight className="h-4 w-4 text-green-500" />
              <span className="text-xs text-green-500">+12.5%</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">16.54%</div>
            <p className="text-xs text-muted-foreground">
              +2.5% from last month
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid grid-cols-3 max-w-[400px]">
          <TabsTrigger value="performance" className="flex items-center">
            <LineChartIcon className="mr-2 h-4 w-4" />
            <span className="hidden sm:block">Performance</span>
          </TabsTrigger>
          <TabsTrigger value="sectors" className="flex items-center">
            <PieChartIcon className="mr-2 h-4 w-4" />
            <span className="hidden sm:block">Sectors</span>
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center">
            <BarChartIcon className="mr-2 h-4 w-4" />
            <span className="hidden sm:block">Types</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="performance" className="p-0">
          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    padding={{ left: 10, right: 10 }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="performance"
                    name="Performance (%)"
                    stroke="#2563eb"
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sectors" className="p-0">
          <Card>
            <CardHeader>
              <CardTitle>Sector Allocation</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="w-full max-w-md">
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={sectorData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {sectorData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recommendations" className="p-0">
          <Card>
            <CardHeader>
              <CardTitle>Recommendation Types</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={recommendationTypeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Bar dataKey="value" name="Percentage" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
