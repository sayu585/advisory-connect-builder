
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
import EditRecommendationDialog from "./EditRecommendationDialog";
import { loadRecommendations, saveRecommendations, deleteRecommendation as deleteRecommendationFromStorage } from "@/utils/localStorage";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";

const Recommendations = () => {
  const { user, refreshData } = useAuth();
  const location = useLocation();
  const isAdmin = user?.role === "admin";
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Load recommendations from localStorage on component mount and focus
  const loadRecommendationsData = () => {
    const loadedRecommendations = loadRecommendations();
    setRecommendations(loadedRecommendations);
  };

  useEffect(() => {
    loadRecommendationsData();
    
    // Add event listeners for tab focus and storage changes
    const handleFocus = () => loadRecommendationsData();
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'recommendations') {
        loadRecommendationsData();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [location.pathname]);

  // Filter recommendations for client view
  // For clients, show all recommendations but only detailed info for assigned ones
  const filteredRecommendations = isAdmin 
    ? recommendations 
    : recommendations.filter(rec => 
        rec.clientsAssigned?.includes(user?.id) || true // Show all but with limited info for non-assigned
      );

  const handleAddRecommendation = (newRecommendation: any) => {
    const updatedRecommendations = [newRecommendation, ...recommendations];
    setRecommendations(updatedRecommendations);
    saveRecommendations(updatedRecommendations);
    setIsAddDialogOpen(false);
    toast.success("Recommendation added successfully");
    
    // Trigger storage event for other tabs
    localStorage.setItem('lastRecommendationUpdate', Date.now().toString());
  };

  const handleViewRecommendation = (recommendation: any) => {
    setSelectedRecommendation(recommendation);
    setIsViewDialogOpen(true);
  };

  const handleEditRecommendation = (recommendation: any) => {
    setSelectedRecommendation(recommendation);
    setIsEditDialogOpen(true);
  };

  const handleUpdateRecommendation = (updatedData: any) => {
    if (!selectedRecommendation) return;

    const updatedRecommendation = {
      ...selectedRecommendation,
      ...updatedData,
      lastUpdated: new Date().toISOString(),
    };

    const updatedRecommendations = recommendations.map(rec => 
      rec.id === selectedRecommendation.id ? updatedRecommendation : rec
    );

    setRecommendations(updatedRecommendations);
    saveRecommendations(updatedRecommendations);
    setIsEditDialogOpen(false);
    toast.success("Recommendation updated successfully");
    
    // Trigger storage event for other tabs
    localStorage.setItem('lastRecommendationUpdate', Date.now().toString());
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
      toast.success("Recommendation deleted successfully");
      
      // Trigger storage event for other tabs
      localStorage.setItem('lastRecommendationUpdate', Date.now().toString());
    }
  };

  const handleAcknowledge = (recommendationId: string) => {
    if (!user) return;

    const updatedRecommendations = recommendations.map(rec => {
      if (rec.id === recommendationId && !rec.clientsAcknowledged?.includes(user.id)) {
        return {
          ...rec,
          clientsAcknowledged: [...(rec.clientsAcknowledged || []), user.id],
        };
      }
      return rec;
    });
    
    setRecommendations(updatedRecommendations);
    saveRecommendations(updatedRecommendations);
    toast.success("Recommendation acknowledged");
    
    // Trigger storage event for other tabs
    localStorage.setItem('lastRecommendationUpdate', Date.now().toString());
  };

  // Determine if a client is assigned to view full details
  const isAssigned = (recommendation: any) => {
    return user ? recommendation.clientsAssigned?.includes(user.id) : false;
  };

  // Check if a client has acknowledged the recommendation
  const hasAcknowledged = (recommendation: any) => {
    return user ? recommendation.clientsAcknowledged?.includes(user.id) : false;
  };

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

      {recommendations.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  {isAdmin && <TableHead>Targets</TableHead>}
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
                    {isAdmin && (
                      <TableCell>
                        {recommendation.targets && recommendation.targets.map((target: any, idx: number) => (
                          <div key={target.id} className="text-sm">
                            Target {idx + 1}: ₹{target.price} ({target.timeframe})
                          </div>
                        ))}
                      </TableCell>
                    )}
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
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {isAdmin ? (
                          <>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => handleEditRecommendation(recommendation)}
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => handleDeleteClick(recommendation)}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          isAssigned(recommendation) && (
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => handleAcknowledge(recommendation.id)}
                              disabled={hasAcknowledged(recommendation)}
                              title={hasAcknowledged(recommendation) ? "Acknowledged" : "Acknowledge"}
                            >
                              {hasAcknowledged(recommendation) ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <AlertCircle className="h-4 w-4" />
                              )}
                            </Button>
                          )
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
        <>
          <RecommendationDetails
            open={isViewDialogOpen}
            onOpenChange={setIsViewDialogOpen}
            recommendation={selectedRecommendation}
            isAdmin={isAdmin}
            onAcknowledge={() => handleAcknowledge(selectedRecommendation.id)}
            hasAcknowledged={hasAcknowledged(selectedRecommendation)}
          />

          <EditRecommendationDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            recommendation={selectedRecommendation}
            onSubmit={handleUpdateRecommendation}
          />
        </>
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
