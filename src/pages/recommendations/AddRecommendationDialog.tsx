
import React, { useState, useEffect } from "react";
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
import { PlusCircle, X, IndianRupee, Trash2 } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';

// Mock clients data
const mockClients = [
  { id: "1", name: "John Doe" },
  { id: "2", name: "Jane Smith" },
  { id: "3", name: "Robert Johnson" },
];

// Market segments and their instruments
const marketSegments = {
  "Equity": ["Reliance", "TCS", "HDFC Bank", "Infosys", "ITC"],
  "Futures": ["Nifty Futures", "Bank Nifty Futures", "Reliance Futures", "TCS Futures"],
  "Options": ["Nifty Options", "Bank Nifty Options", "Reliance Options"],
  "Commodity": ["Gold", "Silver", "Crude Oil", "Natural Gas"],
  "Currency": ["USD-INR", "EUR-INR", "GBP-INR", "JPY-INR"]
};

// Strike prices for options (example)
const strikeOptions = {
  "Nifty Options": ["18000", "18100", "18200", "18300", "18400", "18500", "18600", "18700"],
  "Bank Nifty Options": ["40000", "40500", "41000", "41500", "42000", "42500", "43000"],
  "Reliance Options": ["2400", "2450", "2500", "2550", "2600", "2650", "2700"]
};

interface Target {
  id: string;
  price: string;
}

interface AddRecommendationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (recommendation: {
    title: string;
    segment: string;
    instrument: string;
    strikePrice?: string;
    optionType?: string;
    description: string;
    entryPrice: string;
    stopLoss: string;
    targets: { price: string }[];
    clientsAssigned: string[];
  }) => void;
}

const AddRecommendationDialog: React.FC<AddRecommendationDialogProps> = ({ 
  open, 
  onOpenChange, 
  onSubmit 
}) => {
  const [title, setTitle] = useState("");
  const [segment, setSegment] = useState("");
  const [instrument, setInstrument] = useState("");
  const [instruments, setInstruments] = useState<string[]>([]);
  const [strikePrice, setStrikePrice] = useState("");
  const [optionType, setOptionType] = useState("");
  const [description, setDescription] = useState("");
  const [entryPrice, setEntryPrice] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [targets, setTargets] = useState<Target[]>([
    { id: uuidv4(), price: "" }
  ]);
  const [clientsAssigned, setClientsAssigned] = useState<string[]>([]);

  // Update instruments when segment changes
  useEffect(() => {
    if (segment && marketSegments[segment]) {
      setInstruments(marketSegments[segment]);
      setInstrument("");
      setStrikePrice("");
      setOptionType("");
    } else {
      setInstruments([]);
    }
  }, [segment]);

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
    // Format targets
    const formattedTargets = targets.map(target => ({
      price: target.price
    }));

    // Create recommendation object
    const recommendation = {
      title,
      segment,
      instrument,
      ...(segment === "Options" && { strikePrice, optionType }),
      description,
      entryPrice,
      stopLoss,
      targets: formattedTargets,
      clientsAssigned
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
    setClientsAssigned([]);
  };

  const showStrikePriceAndType = segment === "Options" && instrument;
  const strikePrices = instrument && strikeOptions[instrument] ? strikeOptions[instrument] : [];

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
                {Object.keys(marketSegments).map((seg) => (
                  <SelectItem key={seg} value={seg}>{seg}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Instrument Selection (based on segment) */}
          {segment && (
            <div className="grid gap-2">
              <Label htmlFor="instrument">Instrument</Label>
              <Select value={instrument} onValueChange={setInstrument}>
                <SelectTrigger>
                  <SelectValue placeholder="Select instrument" />
                </SelectTrigger>
                <SelectContent>
                  {instruments.map((inst) => (
                    <SelectItem key={inst} value={inst}>{inst}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Strike Price and Option Type (for Options only) */}
          {showStrikePriceAndType && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="strikePrice">Strike Price</Label>
                <Select value={strikePrice} onValueChange={setStrikePrice}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select strike price" />
                  </SelectTrigger>
                  <SelectContent>
                    {strikePrices.map((strike) => (
                      <SelectItem key={strike} value={strike}>{strike}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
