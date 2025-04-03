
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { loadSubscriptions, saveSubscriptions, loadClients, saveClients } from "@/utils/localStorage";
import { v4 as uuidv4 } from 'uuid';

const SubscriptionManagement = () => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Load subscriptions from localStorage on component mount
  useEffect(() => {
    setSubscriptions(loadSubscriptions());
  }, []);

  // Redirect if not admin
  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  const handleAddSubmit = (data: any) => {
    const newSubscription = {
      id: uuidv4(),
      name: data.name,
      description: data.description,
      createdAt: new Date().toISOString(),
      createdBy: user?.id || "",
    };
    
    const updatedSubscriptions = [...subscriptions, newSubscription];
    setSubscriptions(updatedSubscriptions);
    saveSubscriptions(updatedSubscriptions);
    setIsAddModalOpen(false);
    toast.success("New subscription created");
  };

  const handleEditSubscription = (subscription: any) => {
    setSelectedSubscription(subscription);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (data: any) => {
    if (!selectedSubscription) return;
    
    const updatedSubscriptions = subscriptions.map(sub => 
      sub.id === selectedSubscription.id ? { ...sub, ...data } : sub
    );
    
    setSubscriptions(updatedSubscriptions);
    saveSubscriptions(updatedSubscriptions);
    setIsEditModalOpen(false);
    toast.success("Subscription updated successfully");
  };

  const handleDeleteClick = (subscription: any) => {
    setSelectedSubscription(subscription);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedSubscription) {
      // Check if any clients are using this subscription
      const clients = loadClients();
      const clientsUsingSubscription = clients.filter(client => client.subscriptionId === selectedSubscription.id);
      
      if (clientsUsingSubscription.length > 0) {
        // Update these clients to use the default subscription
        const updatedClients = clients.map(client => 
          client.subscriptionId === selectedSubscription.id 
            ? { ...client, subscriptionId: "default" }
            : client
        );
        saveClients(updatedClients);
      }
      
      // Delete the subscription
      const updatedSubscriptions = subscriptions.filter(sub => sub.id !== selectedSubscription.id);
      setSubscriptions(updatedSubscriptions);
      saveSubscriptions(updatedSubscriptions);
      setIsDeleteDialogOpen(false);
      toast.success("Subscription deleted");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Subscription Management</h1>
          <p className="text-muted-foreground">
            Create and manage subscription groups for your clients
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Subscription
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Client Subscriptions</CardTitle>
          <CardDescription>
            Group your clients by subscription type to easily manage recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.length > 0 ? (
                subscriptions.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell className="font-medium">{subscription.name}</TableCell>
                    <TableCell>{subscription.description}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEditSubscription(subscription)}
                          disabled={subscription.id === "default"} // Can't edit default subscription
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeleteClick(subscription)}
                          disabled={subscription.id === "default"} // Can't delete default subscription
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    No subscriptions found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Subscription Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Subscription</DialogTitle>
            <DialogDescription>
              Create a new subscription group for clients
            </DialogDescription>
          </DialogHeader>
          <SubscriptionForm onSubmit={handleAddSubmit} />
        </DialogContent>
      </Dialog>

      {/* Edit Subscription Modal */}
      {selectedSubscription && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Subscription</DialogTitle>
              <DialogDescription>
                Update subscription details
              </DialogDescription>
            </DialogHeader>
            <SubscriptionForm onSubmit={handleEditSubmit} defaultValues={selectedSubscription} />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This will delete the subscription "{selectedSubscription?.name}". Any clients using this subscription will be moved to the default subscription.
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

const SubscriptionForm = ({ 
  onSubmit, 
  defaultValues = { name: '', description: '' } 
}: { 
  onSubmit: (data: any) => void, 
  defaultValues?: any 
}) => {
  const form = useForm({ defaultValues });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Subscription name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Subscription description" 
                  className="min-h-[100px]" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Describe the subscription tier and its benefits
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <DialogFooter>
          <Button type="submit">
            {defaultValues.id ? 'Update Subscription' : 'Create Subscription'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default SubscriptionManagement;
