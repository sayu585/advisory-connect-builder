
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { PlusCircle, Trash } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// For demo purposes - in a real app would come from API
const mockClients = [
  { id: "client1", name: "John Smith" },
  { id: "client2", name: "Sarah Johnson" },
  { id: "client3", name: "Michael Williams" },
];

// Form schema validation
const targetSchema = z.object({
  price: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Price must be a positive number",
  }),
  timeframe: z.string().min(1, "Timeframe is required"),
});

const recommendationSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  type: z.string().min(1, "Type is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  targets: z.array(targetSchema).min(1, "At least one target is required"),
  clientsAssigned: z.array(z.string()).min(1, "At least one client must be assigned"),
});

type RecommendationFormValues = z.infer<typeof recommendationSchema>;

interface AddRecommendationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: RecommendationFormValues) => void;
}

const AddRecommendationDialog = ({ 
  open, 
  onOpenChange,
  onSubmit 
}: AddRecommendationDialogProps) => {
  const form = useForm<RecommendationFormValues>({
    resolver: zodResolver(recommendationSchema),
    defaultValues: {
      title: "",
      type: "",
      description: "",
      targets: [{ price: "", timeframe: "" }],
      clientsAssigned: [],
    },
  });

  const addTarget = () => {
    const targets = form.getValues("targets");
    form.setValue("targets", [...targets, { price: "", timeframe: "" }]);
  };

  const removeTarget = (index: number) => {
    const targets = form.getValues("targets");
    if (targets.length > 1) {
      form.setValue("targets", targets.filter((_, i) => i !== index));
    }
  };

  const handleFormSubmit = (data: RecommendationFormValues) => {
    // Process the form data
    const processedData = {
      ...data,
      targets: data.targets.map((target, idx) => ({
        id: `target-${Date.now()}-${idx}`,
        price: parseFloat(target.price),
        timeframe: target.timeframe,
      })),
    };
    
    onSubmit(processedData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Recommendation</DialogTitle>
          <DialogDescription>
            Create a new investment recommendation for your clients
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="AAPL Buy Recommendation" {...field} />
                  </FormControl>
                  <FormDescription>
                    A concise title for your recommendation
                  </FormDescription>
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
                        <SelectValue placeholder="Select a recommendation type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Equity">Equity</SelectItem>
                      <SelectItem value="Fixed Income">Fixed Income</SelectItem>
                      <SelectItem value="Alternative">Alternative</SelectItem>
                      <SelectItem value="Fund">Fund</SelectItem>
                      <SelectItem value="ETF">ETF</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The type of investment recommendation
                  </FormDescription>
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
                      placeholder="Provide details about your recommendation..." 
                      className="min-h-[100px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    A detailed explanation of your investment recommendation
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Price Targets</FormLabel>
              <FormDescription className="mb-2">
                Set one or more price targets with timeframes
              </FormDescription>
              
              {form.watch("targets").map((_, index) => (
                <div key={index} className="flex gap-3 items-end mb-2">
                  <FormField
                    control={form.control}
                    name={`targets.${index}.price`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel className="text-xs">Target Price ($)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="185.50" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`targets.${index}.timeframe`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel className="text-xs">Timeframe</FormLabel>
                        <FormControl>
                          <Input placeholder="3 months" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTarget(index)}
                    disabled={form.watch("targets").length <= 1}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={addTarget}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Target
              </Button>
            </div>

            <FormField
              control={form.control}
              name="clientsAssigned"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign Clients</FormLabel>
                  <div className="grid grid-cols-2 gap-2">
                    {mockClients.map(client => (
                      <div key={client.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`client-${client.id}`}
                          value={client.id}
                          checked={field.value.includes(client.id)}
                          onChange={e => {
                            const checked = e.target.checked;
                            const value = e.target.value;
                            if (checked) {
                              field.onChange([...field.value, value]);
                            } else {
                              field.onChange(field.value.filter(val => val !== value));
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor={`client-${client.id}`} className="text-sm">
                          {client.name}
                        </label>
                      </div>
                    ))}
                  </div>
                  <FormDescription>
                    Select which clients should receive this recommendation
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Recommendation</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddRecommendationDialog;
