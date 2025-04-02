
import React, { useState, useEffect } from "react";
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
import { loadRecommendations, saveRecommendations, deleteRecommendation as deleteRecommendationFromStorage } from "@/utils/localStorage";
import { v4 as uuidv4 } from 'uuid';

const Recommendations = () => {
  const { user, hasAccessToClient } = useAuth();
  const isAdmin = user?.role === "admin";
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Load recommendations from localStorage on component mount
  useEffect(() => {
    setRecommendations(loadRecommendations());
  }, []);

  const handleAddRecommendation = (newRecommendation: any) => {
    const recommendationWithId = {
      ...newRecommendation,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      status: "Active",
      clientsAcknowledged: [],
      clientsAssigned: newRecommendation.clientsAssigned || [],
    };
    
    const updatedRecommendations = [recommendationWithId, ...recommendations];
    setRecommendations(updatedRecommendations);
    saveRecommendations(updatedRecommendations);
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
    if (selectedRecommendation) {
      const updatedRecommendations = recommendations.filter(rec => rec.id !== selectedRecommendation.id);
      setRecommendations(updatedRecommendations);
      saveRecommendations(updatedRecommendations);
      deleteRecommendationFromStorage(selectedRecommendation.id);
      setIsDeleteDialogOpen(false);
      setSelectedRecommendation(null);
    }
  };

  const handleAcknowledge = (recommendationId: string) => {
    if (!user) return;

    const updatedRecommendations = recommendations.map(rec => {
      if (rec.id === recommendationId && !rec.clientsAcknowledged.includes(user.id)) {
        return {
          ...rec,
          clientsAcknowledged: [...rec.clientsAcknowledged, user.id],
        };
      }
      return rec;
    });
    
    setRecommendations(updatedRecommendations);
    saveRecommendations(updatedRecommendations);
  };

  // Filter recommendations based on client access for sub-admins
  const filteredRecommendations = recommendations.filter(rec => {
    if (!isAdmin) return true; // Clients can see all their recommendations
    
    // Check if main admin
    if (user?.isMainAdmin) return true;
    
    // For sub-admins, check if they have access to any of the clients assigned to this recommendation
    return rec.clientsAssigned && rec.clientsAssigned.some((clientId: string) => hasAccessToClient(clientId));
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
                      {recommendation.targets && recommendation.targets.map((target: any, idx: number) => (
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
                        {recommendation.clientsAcknowledged?.length || 0}/{recommendation.clientsAssigned?.length || 0} clients
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
                            disabled={recommendation.clientsAcknowledged?.includes(user?.id || "")}
                          >
                            {recommendation.clientsAcknowledged?.includes(user?.id || "") ? (
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
          hasAcknowledged={selectedRecommendation.clientsAcknowledged?.includes(user?.id || "")}
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
