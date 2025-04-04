
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription,
  DialogFooter,
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { loadClients } from "@/utils/localStorage";
import { AlertOctagon, RefreshCw } from "lucide-react";

// Define schema for form validation
const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(2, "Description must be at least 2 characters"),
  type: z.string().min(1, "Type is required"),
  status: z.string().min(1, "Status is required"),
  risk: z.string().min(1, "Risk level is required"),
  clientsAssigned: z.array(z.string()).optional(),
});

type EditRecommendationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recommendation: any;
  onSubmit: (data: any) => void;
};

const EditRecommendationDialog = ({
  open,
  onOpenChange,
  recommendation,
  onSubmit,
}: EditRecommendationDialogProps) => {
  const clients = loadClients();
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: recommendation?.title || "",
      description: recommendation?.description || "",
      type: recommendation?.type || "",
      status: recommendation?.status || "",
      risk: recommendation?.risk || "",
      clientsAssigned: recommendation?.clientsAssigned || [],
    },
  });

  const handleFormSubmit = (data: z.infer<typeof formSchema>) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Recommendation</DialogTitle>
          <DialogDescription>
            Update the details of this investment recommendation.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                    <Textarea {...field} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Stock">Stock</SelectItem>
                        <SelectItem value="Bond">Bond</SelectItem>
                        <SelectItem value="Mutual Fund">Mutual Fund</SelectItem>
                        <SelectItem value="ETF">ETF</SelectItem>
                        <SelectItem value="Real Estate">Real Estate</SelectItem>
                        <SelectItem value="Commodity">Commodity</SelectItem>
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
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Closed">Closed</SelectItem>
                        <SelectItem value="Expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="risk"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Risk Level</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select risk level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Low">Low Risk</SelectItem>
                      <SelectItem value="Medium">Medium Risk</SelectItem>
                      <SelectItem value="High">High Risk</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="clientsAssigned"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign to Clients</FormLabel>
                  <div className="flex flex-wrap gap-2 p-2 border rounded-md">
                    {clients.length === 0 && (
                      <div className="w-full text-center py-2 text-muted-foreground flex items-center justify-center">
                        <AlertOctagon className="w-4 h-4 mr-2" />
                        No clients available
                      </div>
                    )}
                    {clients.map((client) => (
                      <div key={client.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`client-${client.id}`}
                          className="mr-2"
                          checked={(field.value || []).includes(client.id)}
                          onChange={(e) => {
                            const updatedClients = e.target.checked
                              ? [...(field.value || []), client.id]
                              : (field.value || []).filter((id) => id !== client.id);
                            field.onChange(updatedClients);
                          }}
                        />
                        <label
                          htmlFor={`client-${client.id}`}
                          className="text-sm mr-4"
                        >
                          {client.name}
                        </label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="flex items-center">
                <RefreshCw className="mr-2 h-4 w-4" />
                Update Recommendation
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditRecommendationDialog;
