
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, X } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';

// Mock clients data
const mockClients = [
  { id: "1", name: "John Doe" },
  { id: "2", name: "Jane Smith" },
  { id: "3", name: "Robert Johnson" },
];

interface Target {
  id: string;
  price: string;
  timeframe: string;
}

interface AddRecommendationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (recommendation: {
    title: string;
    type: string;
    description: string;
    targets: { price: string; timeframe: string; }[];
    clientsAssigned: string[];
  }) => void;
}

const AddRecommendationDialog: React.FC<AddRecommendationDialogProps> = ({ 
  open, 
  onOpenChange, 
  onSubmit 
}) => {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [targets, setTargets] = useState<Target[]>([
    { id: uuidv4(), price: "", timeframe: "" }
  ]);
  const [clientsAssigned, setClientsAssigned] = useState<string[]>([]);

  const handleAddTarget = () => {
    setTargets([...targets, { id: uuidv4(), price: "", timeframe: "" }]);
  };

  const handleRemoveTarget = (id: string) => {
    if (targets.length > 1) {
      setTargets(targets.filter(target => target.id !== id));
    }
  };

  const handleTargetChange = (id: string, field: keyof Target, value: string) => {
    setTargets(targets.map(target => 
      target.id === id ? { ...target, [field]: value } : target
    ));
  };

  const handleToggleClient = (clientId: string) => {
    if (clientsAssigned.includes(clientId)) {
      setClientsAssigned(clientsAssigned.filter(id => id !== clientId));
    } else {
      setClientsAssigned([...clientsAssigned, clientId]);
    }
  };

  const handleSubmit = () => {
    // Convert targets to the expected format
    const formattedTargets = targets.map(target => ({
      price: target.price,
      timeframe: target.timeframe
    }));

    onSubmit({
      title,
      type,
      description,
      targets: formattedTargets,
      clientsAssigned
    });
    
    // Reset form
    setTitle("");
    setType("");
    setDescription("");
    setTargets([{ id: uuidv4(), price: "", timeframe: "" }]);
    setClientsAssigned([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Recommendation</DialogTitle>
          <DialogDescription>
            Create a new investment recommendation for your clients.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input 
              id="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Enter recommendation title"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="type">Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Select recommendation type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Equity">Equity</SelectItem>
                <SelectItem value="Fixed Income">Fixed Income</SelectItem>
                <SelectItem value="Alternative">Alternative</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Enter recommendation details"
            />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Price Targets</Label>
              <Button 
                variant="outline" 
                size="sm" 
                type="button" 
                onClick={handleAddTarget}
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                Add Target
              </Button>
            </div>
            {targets.map((target, index) => (
              <div key={target.id} className="flex items-center gap-2">
                <div className="flex-1">
                  <Input 
                    value={target.price} 
                    onChange={(e) => handleTargetChange(target.id, "price", e.target.value)} 
                    placeholder="Price"
                    type="text"
                  />
                </div>
                <div className="flex-1">
                  <Input 
                    value={target.timeframe} 
                    onChange={(e) => handleTargetChange(target.id, "timeframe", e.target.value)} 
                    placeholder="Timeframe"
                  />
                </div>
                {targets.length > 1 && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleRemoveTarget(target.id)}
                    className="h-9 w-9"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <div className="grid gap-2">
            <Label>Assign Clients</Label>
            <div className="border rounded-md p-3 space-y-2">
              {mockClients.map((client) => (
                <div key={client.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`client-${client.id}`}
                    checked={clientsAssigned.includes(client.id)}
                    onChange={() => handleToggleClient(client.id)}
                    className="mr-2"
                  />
                  <Label htmlFor={`client-${client.id}`}>{client.name}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Create Recommendation</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddRecommendationDialog;
