
import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { PlusCircle, Eye, Edit, Trash2, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AddRecommendationDialog from "./AddRecommendationDialog";
import RecommendationDetails from "./RecommendationDetails";

// Sample data - in a real app this would come from an API
const mockRecommendations = [
  {
    id: "1",
    title: "AAPL Stock Buy Recommendation",
    type: "Equity",
    description: "Consider investing in Apple Inc. due to strong growth potential and upcoming product launches.",
    targets: [
      { id: "t1", price: 15475.50, timeframe: "3 months" },
      { id: "t2", price: 17550.25, timeframe: "1 year" },
    ],
    status: "Active",
    createdAt: "2023-04-15T10:30:00Z",
    clientsAcknowledged: ["client1", "client2"],
    clientsAssigned: ["client1", "client2", "client3"],
  },
  {
    id: "2",
    title: "MSFT Conservative Portfolio Allocation",
    type: "Equity",
    description: "Recommended 5% allocation to Microsoft in conservative portfolios based on stable dividend growth.",
    targets: [
      { id: "t3", price: 33765.75, timeframe: "6 months" },
      { id: "t4", price: 37500.00, timeframe: "18 months" },
    ],
    status: "Active",
    createdAt: "2023-04-10T14:45:00Z",
    clientsAcknowledged: ["client1"],
    clientsAssigned: ["client1", "client3"],
  },
  {
    id: "3",
    title: "Treasury Bond Rotation Strategy",
    type: "Fixed Income",
    description: "Recommend shifting allocation from short-term to medium-term treasury bonds to capture higher yields.",
    targets: [
      { id: "t5", price: 8562.50, timeframe: "3 months" },
    ],
    status: "Active",
    createdAt: "2023-04-05T09:15:00Z",
    clientsAcknowledged: ["client2", "client3"],
    clientsAssigned: ["client1", "client2", "client3"],
  },
];

const Recommendations = () => {
  const { user, hasAccessToClient } = useAuth();
  const isAdmin = user?.role === "admin";
  const [recommendations, setRecommendations] = useState(mockRecommendations);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleAddRecommendation = (newRecommendation: any) => {
    setRecommendations([
      {
        ...newRecommendation,
        id: `rec-${Date.now()}`,
        createdAt: new Date().toISOString(),
        status: "Active",
        clientsAcknowledged: [],
        clientsAssigned: newRecommendation.clientsAssigned || [],
      },
      ...recommendations,
    ]);
    setIsAddDialogOpen(false);
  };

  const handleViewRecommendation = (recommendation: any) => {
    setSelectedRecommendation(recommendation);
    setIsViewDialogOpen(true);
  };

  const handleEditRecommendation = (recommendation: any) => {
    // In a real app, this would open an edit form pre-populated with the recommendation data
    console.log("Edit recommendation", recommendation);
  };

  const handleDeleteClick = (recommendation: any) => {
    setSelectedRecommendation(recommendation);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    setRecommendations(recommendations.filter(rec => rec.id !== selectedRecommendation.id));
    setIsDeleteDialogOpen(false);
    setSelectedRecommendation(null);
  };

  const handleAcknowledge = (recommendationId: string) => {
    // In a real app, this would send a request to the server to acknowledge the recommendation
    setRecommendations(
      recommendations.map(rec => {
        if (rec.id === recommendationId && user && !rec.clientsAcknowledged.includes(user.id)) {
          return {
            ...rec,
            clientsAcknowledged: [...rec.clientsAcknowledged, user.id],
          };
        }
        return rec;
      })
    );
  };

  // Filter recommendations based on client access for sub-admins
  const filteredRecommendations = recommendations.filter(rec => {
    if (!isAdmin) return true; // Clients can see all their recommendations
    
    // Check if main admin
    if (user?.isMainAdmin) return true;
    
    // For sub-admins, check if they have access to any of the clients assigned to this recommendation
    return rec.clientsAssigned.some(clientId => hasAccessToClient(clientId));
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Recommendations</h1>
          <p className="text-muted-foreground">
            {isAdmin
              ? "Manage and track investment recommendations for your clients"
              : "View and acknowledge investment recommendations from your advisor"}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Recommendation
          </Button>
        )}
      </div>

      {filteredRecommendations.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Target(s)</TableHead>
                  <TableHead>Status</TableHead>
                  {isAdmin && <TableHead>Acknowledged</TableHead>}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecommendations.map((recommendation) => (
                  <TableRow key={recommendation.id}>
                    <TableCell className="font-medium">{recommendation.title}</TableCell>
                    <TableCell>{recommendation.type}</TableCell>
                    <TableCell>
                      {recommendation.targets.map((target, idx) => (
                        <div key={target.id} className="text-sm">
                          Target {idx + 1}: ₹{target.price} ({target.timeframe})
                        </div>
                      ))}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                        {recommendation.status}
                      </Badge>
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        {recommendation.clientsAcknowledged.length}/{recommendation.clientsAssigned.length} clients
                      </TableCell>
                    )}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => handleViewRecommendation(recommendation)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {isAdmin ? (
                          <>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => handleEditRecommendation(recommendation)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => handleDeleteClick(recommendation)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => handleAcknowledge(recommendation.id)}
                            disabled={recommendation.clientsAcknowledged.includes(user?.id || "")}
                          >
                            {recommendation.clientsAcknowledged.includes(user?.id || "") ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <AlertCircle className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No recommendations</CardTitle>
            <CardDescription>
              {isAdmin
                ? "Create your first investment recommendation for your clients."
                : "Your advisor hasn't added any recommendations yet."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            {isAdmin && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Recommendation
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <AddRecommendationDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddRecommendation}
      />

      {selectedRecommendation && (
        <RecommendationDetails
          open={isViewDialogOpen}
          onOpenChange={setIsViewDialogOpen}
          recommendation={selectedRecommendation}
          isAdmin={isAdmin}
          onAcknowledge={() => handleAcknowledge(selectedRecommendation.id)}
          hasAcknowledged={selectedRecommendation.clientsAcknowledged.includes(user?.id || "")}
        />
      )}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the recommendation
              "{selectedRecommendation?.title}" and remove it from all clients.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Recommendations;
