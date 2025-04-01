
import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, MoreVertical, UserPlus, Pencil, Trash2, LockKeyhole } from "lucide-react";
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

// Sample data - in a real app this would come from an API
const mockClients = [
  {
    id: "client1",
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "555-123-4567",
    status: "Active",
    recommendationsAssigned: 3,
    recommendationsAcknowledged: 2,
    ownerId: "1" // Main admin owns this client
  },
  {
    id: "client2",
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    phone: "555-987-6543",
    status: "Active",
    recommendationsAssigned: 5,
    recommendationsAcknowledged: 5,
    ownerId: "1" // Main admin owns this client
  },
  {
    id: "client3",
    name: "Michael Williams",
    email: "m.williams@example.com",
    phone: "555-567-8901",
    status: "Inactive",
    recommendationsAssigned: 2,
    recommendationsAcknowledged: 0,
    ownerId: "1" // Main admin owns this client
  },
  {
    id: "client4",
    name: "Jessica Brown",
    email: "jessica.b@example.com",
    phone: "555-234-5678",
    status: "Active",
    recommendationsAssigned: 4,
    recommendationsAcknowledged: 3,
    ownerId: "1" // Main admin owns this client
  },
];

const Clients = () => {
  const { user, isMainAdmin, hasAccessToClient, requestClientAccess } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [clients] = useState(mockClients);

  // Redirect if not admin
  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  // Filter clients based on search query and access permissions
  const filteredClients = clients.filter(
    client => {
      const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Main admin can see all clients
      if (isMainAdmin()) return matchesSearch;
      
      // Sub-admin can only see clients they own or have access to
      return matchesSearch && hasAccessToClient(client.id);
    }
  );

  // Check if there are clients the sub-admin doesn't have access to
  const hasInaccessibleClients = !isMainAdmin() && 
    clients.some(client => !hasAccessToClient(client.id));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Client Management</h1>
          <p className="text-muted-foreground">
            Manage your client relationships and track their advisory progress
          </p>
        </div>
        <Button>
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
                    {client.recommendationsAcknowledged}/{client.recommendationsAssigned}
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
                            <DropdownMenuItem>
                              <Pencil className="mr-2 h-4 w-4" />
                              <span>Edit Details</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <PlusCircle className="mr-2 h-4 w-4" />
                              <span>Assign Recommendation</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
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
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No clients found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default Clients;
