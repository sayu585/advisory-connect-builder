
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, MoreVertical, UserPlus, Pencil, Trash2, LockKeyhole, Tags } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { loadClients, saveClients, loadSubscriptions } from "@/utils/localStorage";
import { v4 as uuidv4 } from 'uuid';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Clients = () => {
  const { user, isMainAdmin, hasAccessToClient, requestClientAccess } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [clients, setClients] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [isAddClientDialogOpen, setIsAddClientDialogOpen] = useState(false);
  const [isEditClientDialogOpen, setIsEditClientDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);

  // Load clients and subscriptions from localStorage
  useEffect(() => {
    setClients(loadClients());
    setSubscriptions(loadSubscriptions());
  }, []);

  // Redirect if not admin
  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  // Filter clients based on search query and access permissions
  const filteredClients = clients.filter(
    client => {
      const matchesSearch = client.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Main admin can see all clients
      if (isMainAdmin()) return matchesSearch;
      
      // Sub-admin can only see clients they own or have access to
      return matchesSearch && hasAccessToClient(client.id);
    }
  );

  // Check if there are clients the sub-admin doesn't have access to
  const hasInaccessibleClients = !isMainAdmin() && 
    clients.some(client => !hasAccessToClient(client.id));

  const handleAddClientSubmit = (data: any) => {
    const newClient = {
      id: uuidv4(),
      name: data.name,
      email: data.email,
      phone: data.phone,
      status: "Active",
      subscriptionId: data.subscriptionId,
      recommendationsAssigned: 0,
      recommendationsAcknowledged: 0,
      ownerId: user?.id || "1" // Default to current user or main admin
    };
    
    const updatedClients = [...clients, newClient];
    setClients(updatedClients);
    saveClients(updatedClients);
    setIsAddClientDialogOpen(false);
    toast.success("New client added");
  };

  const handleEditClient = (client: any) => {
    setSelectedClient(client);
    setIsEditClientDialogOpen(true);
  };

  const handleEditClientSubmit = (data: any) => {
    const updatedClients = clients.map(client => 
      client.id === selectedClient.id ? { ...client, ...data } : client
    );
    
    setClients(updatedClients);
    saveClients(updatedClients);
    setIsEditClientDialogOpen(false);
    toast.success("Client updated successfully");
  };

  const handleDeleteClient = (clientId: string) => {
    const updatedClients = clients.filter(client => client.id !== clientId);
    setClients(updatedClients);
    saveClients(updatedClients);
    toast.success("Client deleted");
  };

  const handleAssignRecommendation = (client: any) => {
    toast.info(`Assigning recommendation to ${client.name}`);
    // In a real app, this would open a dialog to assign a recommendation
  };

  // Get subscription name by ID
  const getSubscriptionName = (subscriptionId: string) => {
    const subscription = subscriptions.find(sub => sub.id === subscriptionId);
    return subscription ? subscription.name : "None";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Client Management</h1>
          <p className="text-muted-foreground">
            Manage your client relationships and track their advisory progress
          </p>
        </div>
        <Button onClick={() => setIsAddClientDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" /> Add Client
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {!isMainAdmin() && hasInaccessibleClients && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-blue-700 text-sm mb-4">
          <p className="font-medium">Access Notice</p>
          <p>
            You can only view clients you've created or been granted access to. 
            To access other clients, use the "Request Access" option from the actions menu.
          </p>
        </div>
      )}

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Recommendations</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.length > 0 ? (
              filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell>{getSubscriptionName(client.subscriptionId)}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        client.status === "Active"
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {client.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {client.recommendationsAcknowledged || 0}/{client.recommendationsAssigned || 0}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {hasAccessToClient(client.id) ? (
                          <>
                            <DropdownMenuItem onClick={() => handleEditClient(client)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              <span>Edit Details</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAssignRecommendation(client)}>
                              <PlusCircle className="mr-2 h-4 w-4" />
                              <span>Assign Recommendation</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDeleteClient(client.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete Client</span>
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <DropdownMenuItem onClick={() => requestClientAccess(client.id, client.name)}>
                            <LockKeyhole className="mr-2 h-4 w-4" />
                            <span>Request Access</span>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No clients found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Add Client Dialog */}
      <Dialog open={isAddClientDialogOpen} onOpenChange={setIsAddClientDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
            <DialogDescription>Enter client details and assign a subscription.</DialogDescription>
          </DialogHeader>

          <AddEditClientForm 
            onSubmit={handleAddClientSubmit} 
            subscriptions={subscriptions}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Client Dialog */}
      {selectedClient && (
        <Dialog open={isEditClientDialogOpen} onOpenChange={setIsEditClientDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Client</DialogTitle>
              <DialogDescription>Update client details.</DialogDescription>
            </DialogHeader>

            <AddEditClientForm 
              onSubmit={handleEditClientSubmit} 
              subscriptions={subscriptions}
              defaultValues={selectedClient}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

// Reusable form for both adding and editing clients
const AddEditClientForm = ({ 
  onSubmit, 
  subscriptions, 
  defaultValues = { 
    name: '', 
    email: '', 
    phone: '', 
    subscriptionId: 'default',
    status: 'Active'
  } 
}: { 
  onSubmit: (data: any) => void, 
  subscriptions: any[],
  defaultValues?: any
}) => {
  const form = useForm({
    defaultValues
  });

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
                <Input placeholder="Client name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Email address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input placeholder="Phone number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="subscriptionId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subscription</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subscription" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {subscriptions.map((sub) => (
                    <SelectItem key={sub.id} value={sub.id}>
                      {sub.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <DialogFooter>
          <Button type="submit">{defaultValues.id ? 'Update Client' : 'Add Client'}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default Clients;
