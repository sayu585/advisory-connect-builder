
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
import { PlusCircle, Trash2, IndianRupee } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import { loadClients, loadSubscriptions } from "@/utils/localStorage";

// Market segments
const marketSegments = [
  "Equity", 
  "Futures", 
  "Options", 
  "Commodity", 
  "Currency"
];

interface Target {
  id: string;
  price: string;
}

interface AddRecommendationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (recommendation: any) => void;
}

const AddRecommendationDialog: React.FC<AddRecommendationDialogProps> = ({ 
  open, 
  onOpenChange, 
  onSubmit 
}) => {
  const [title, setTitle] = useState("");
  const [segment, setSegment] = useState("");
  const [instrument, setInstrument] = useState("");
  const [strikePrice, setStrikePrice] = useState("");
  const [optionType, setOptionType] = useState("");
  const [description, setDescription] = useState("");
  const [entryPrice, setEntryPrice] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [targets, setTargets] = useState<Target[]>([
    { id: uuidv4(), price: "" }
  ]);
  const [subscriptionId, setSubscriptionId] = useState("default");
  const [clientsAssigned, setClientsAssigned] = useState<string[]>([]);
  
  const clients = loadClients();
  const subscriptions = loadSubscriptions();

  const handleAddTarget = () => {
    setTargets([...targets, { id: uuidv4(), price: "" }]);
  };

  const handleRemoveTarget = (id: string) => {
    if (targets.length > 1) {
      setTargets(targets.filter(target => target.id !== id));
    }
  };

  const handleTargetChange = (id: string, value: string) => {
    setTargets(targets.map(target => 
      target.id === id ? { ...target, price: value } : target
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
    // Format targets with timeframe
    const formattedTargets = targets.map((target, index) => ({
      id: target.id,
      price: parseFloat(target.price),
      timeframe: index === 0 ? "Short-term" : index === 1 ? "Medium-term" : "Long-term"
    })).filter(target => !isNaN(target.price));

    // Calculate which clients to assign based on selected subscription
    let allAssignedClients = [...clientsAssigned];
    
    // Add clients that have this subscription
    const clientsWithThisSubscription = clients
      .filter(client => client.subscriptionId === subscriptionId)
      .map(client => client.id);
    
    clientsWithThisSubscription.forEach(clientId => {
      if (!allAssignedClients.includes(clientId)) {
        allAssignedClients.push(clientId);
      }
    });

    // Create recommendation object
    const recommendation = {
      id: uuidv4(),
      title,
      type: segment || "Stock",
      description,
      entryPrice: parseFloat(entryPrice),
      stopLoss: parseFloat(stopLoss),
      targets: formattedTargets,
      status: "Active",
      createdAt: new Date().toISOString(),
      subscriptionIds: [subscriptionId],
      clientsAssigned: allAssignedClients,
      clientsAcknowledged: [],
      // For options specific fields
      ...(segment === "Options" && { strikePrice, optionType }),
    };

    onSubmit(recommendation);
    
    // Reset form
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setTitle("");
    setSegment("");
    setInstrument("");
    setStrikePrice("");
    setOptionType("");
    setDescription("");
    setEntryPrice("");
    setStopLoss("");
    setTargets([{ id: uuidv4(), price: "" }]);
    setSubscriptionId("default");
    setClientsAssigned([]);
  };

  const showStrikePriceAndType = segment === "Options";

  // Filter clients by selected subscription
  const subscribedClients = clients.filter(client => 
    client.subscriptionId === subscriptionId
  );

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
          
          {/* Market Segment Selection */}
          <div className="grid gap-2">
            <Label htmlFor="segment">Segment</Label>
            <Select value={segment} onValueChange={setSegment}>
              <SelectTrigger>
                <SelectValue placeholder="Select market segment" />
              </SelectTrigger>
              <SelectContent>
                {marketSegments.map((seg) => (
                  <SelectItem key={seg} value={seg}>{seg}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Instrument Input Field (free text) */}
          {segment && (
            <div className="grid gap-2">
              <Label htmlFor="instrument">Instrument</Label>
              <Input
                id="instrument"
                value={instrument}
                onChange={(e) => setInstrument(e.target.value)}
                placeholder="Enter instrument name"
              />
            </div>
          )}
          
          {/* Strike Price and Option Type (for Options only) */}
          {showStrikePriceAndType && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="strikePrice">Strike Price</Label>
                <Input
                  id="strikePrice"
                  value={strikePrice}
                  onChange={(e) => setStrikePrice(e.target.value)}
                  placeholder="Enter strike price"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="optionType">Option Type</Label>
                <Select value={optionType} onValueChange={setOptionType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Call">Call</SelectItem>
                    <SelectItem value="Put">Put</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Enter recommendation details"
            />
          </div>
          
          {/* Price details */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="entryPrice">Entry Price (₹)</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <IndianRupee className="h-4 w-4 text-gray-400" />
                </div>
                <Input 
                  id="entryPrice" 
                  value={entryPrice} 
                  onChange={(e) => setEntryPrice(e.target.value)} 
                  placeholder="Entry Price"
                  className="pl-8"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stopLoss">Stop Loss (₹)</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <IndianRupee className="h-4 w-4 text-gray-400" />
                </div>
                <Input 
                  id="stopLoss" 
                  value={stopLoss} 
                  onChange={(e) => setStopLoss(e.target.value)} 
                  placeholder="Stop Loss"
                  className="pl-8"
                />
              </div>
            </div>
          </div>
          
          {/* Targets */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Price Targets (₹)</Label>
              <Button 
                variant="outline" 
                size="sm" 
                type="button" 
                onClick={handleAddTarget}
                className="flex items-center gap-1"
              >
                <PlusCircle className="h-4 w-4" />
                Add Target
              </Button>
            </div>
            
            {targets.map((target, index) => (
              <div key={target.id} className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Label className="text-gray-500">Target {index + 1}</Label>
                  </div>
                  <div className="absolute inset-y-0 right-8 flex items-center pointer-events-none">
                    <IndianRupee className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input 
                    value={target.price} 
                    onChange={(e) => handleTargetChange(target.id, e.target.value)} 
                    placeholder={`Target ${index + 1}`}
                    className="pl-20 pr-6"
                  />
                </div>
                {targets.length > 1 && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleRemoveTarget(target.id)}
                    className="h-9 w-9 text-destructive hover:text-destructive/80"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          
          {/* Subscription Selection */}
          <div className="grid gap-2">
            <Label htmlFor="subscription">Assign to Subscription</Label>
            <Select value={subscriptionId} onValueChange={setSubscriptionId}>
              <SelectTrigger>
                <SelectValue placeholder="Select subscription" />
              </SelectTrigger>
              <SelectContent>
                {subscriptions.map((sub: any) => (
                  <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              All clients with this subscription will see this recommendation
            </p>
          </div>
          
          {/* Additional Client Selection */}
          <div className="grid gap-2">
            <Label>Additional Clients</Label>
            {clients.length > 0 ? (
              <div className="border rounded-md p-3 space-y-2">
                {clients.map((client) => (
                  <div key={client.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`client-${client.id}`}
                      checked={clientsAssigned.includes(client.id) || client.subscriptionId === subscriptionId}
                      disabled={client.subscriptionId === subscriptionId}
                      onChange={() => handleToggleClient(client.id)}
                      className="mr-2"
                    />
                    <Label htmlFor={`client-${client.id}`}>
                      {client.name} 
                      {client.subscriptionId === subscriptionId && (
                        <span className="text-xs text-muted-foreground ml-2">(via subscription)</span>
                      )}
                    </Label>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No clients available</p>
            )}
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
