
import React from "react";
import { useForm } from "react-hook-form";
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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { v4 as uuidv4 } from "uuid";
import { loadClients, loadSubscriptions } from "@/utils/localStorage";

interface EditRecommendationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recommendation: any;
  onSubmit: (data: any) => void;
}

const EditRecommendationDialog = ({
  open,
  onOpenChange,
  recommendation,
  onSubmit,
}: EditRecommendationDialogProps) => {
  const clients = loadClients();
  const subscriptions = loadSubscriptions();
  
  const form = useForm({
    defaultValues: {
      title: recommendation?.title || "",
      type: recommendation?.type || "Stock",
      description: recommendation?.description || "",
      targetPrice1: recommendation?.targets?.[0]?.price || "",
      targetTimeframe1: recommendation?.targets?.[0]?.timeframe || "Short-term",
      targetPrice2: recommendation?.targets?.[1]?.price || "",
      targetTimeframe2: recommendation?.targets?.[1]?.timeframe || "Medium-term",
      targetPrice3: recommendation?.targets?.[2]?.price || "",
      targetTimeframe3: recommendation?.targets?.[2]?.timeframe || "Long-term",
      subscriptionIds: recommendation?.subscriptionIds || ["default"],
      clientsAssigned: recommendation?.clientsAssigned || [],
    },
  });

  const handleFormSubmit = (data: any) => {
    // Build targets array
    const targets = [];
    
    if (data.targetPrice1) {
      targets.push({
        id: recommendation?.targets?.[0]?.id || uuidv4(),
        price: parseFloat(data.targetPrice1),
        timeframe: data.targetTimeframe1
      });
    }
    
    if (data.targetPrice2) {
      targets.push({
        id: recommendation?.targets?.[1]?.id || uuidv4(),
        price: parseFloat(data.targetPrice2),
        timeframe: data.targetTimeframe2
      });
    }
    
    if (data.targetPrice3) {
      targets.push({
        id: recommendation?.targets?.[2]?.id || uuidv4(),
        price: parseFloat(data.targetPrice3),
        timeframe: data.targetTimeframe3
      });
    }

    // Calculate which clients to assign based on selected subscriptions
    let clientsAssigned: string[] = [];
    
    if (data.subscriptionIds && data.subscriptionIds.length > 0) {
      // Get clients who have any of these subscription IDs
      clientsAssigned = clients
        .filter(client => client.subscriptionId && data.subscriptionIds.includes(client.subscriptionId))
        .map(client => client.id);
    }

    // If also individually selecting clients, add them
    if (data.clientsAssigned && data.clientsAssigned.length > 0) {
      data.clientsAssigned.forEach((clientId: string) => {
        if (!clientsAssigned.includes(clientId)) {
          clientsAssigned.push(clientId);
        }
      });
    }
    
    onSubmit({
      title: data.title,
      type: data.type,
      description: data.description,
      targets,
      subscriptionIds: data.subscriptionIds,
      clientsAssigned,
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Recommendation</DialogTitle>
          <DialogDescription>
            Update the details of this investment recommendation.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recommendation Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Stock">Stock</SelectItem>
                      <SelectItem value="Bond">Bond</SelectItem>
                      <SelectItem value="ETF">ETF</SelectItem>
                      <SelectItem value="Mutual Fund">Mutual Fund</SelectItem>
                      <SelectItem value="Crypto">Cryptocurrency</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
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
                      placeholder="Enter description and rationale" 
                      className="min-h-[100px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h3 className="font-medium">Price Targets</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="targetPrice1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target 1 Price</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="₹" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetTimeframe1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target 1 Timeframe</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select timeframe" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Short-term">Short-term</SelectItem>
                          <SelectItem value="Medium-term">Medium-term</SelectItem>
                          <SelectItem value="Long-term">Long-term</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="targetPrice2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target 2 Price (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="₹" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetTimeframe2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target 2 Timeframe</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select timeframe" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Short-term">Short-term</SelectItem>
                          <SelectItem value="Medium-term">Medium-term</SelectItem>
                          <SelectItem value="Long-term">Long-term</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="targetPrice3"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target 3 Price (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="₹" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetTimeframe3"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target 3 Timeframe</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select timeframe" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Short-term">Short-term</SelectItem>
                          <SelectItem value="Medium-term">Medium-term</SelectItem>
                          <SelectItem value="Long-term">Long-term</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="subscriptionIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign to subscription groups</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange([value])}
                    defaultValue={field.value?.[0]}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subscription" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subscriptions.map((sub: any) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    All clients in this subscription group will see this recommendation
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex justify-between items-center pt-4">
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Recommendation</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditRecommendationDialog;
