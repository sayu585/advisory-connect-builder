
import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Target {
  id: string;
  price: number;
  timeframe: string;
}

interface RecommendationDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recommendation: {
    id: string;
    title: string;
    type: string;
    description: string;
    targets: Target[];
    status: string;
    createdAt: string;
    clientsAcknowledged: string[];
    clientsAssigned: string[];
  };
  isAdmin: boolean;
  onAcknowledge: () => void;
  hasAcknowledged: boolean;
}

const RecommendationDetails = ({
  open,
  onOpenChange,
  recommendation,
  isAdmin,
  onAcknowledge,
  hasAcknowledged
}: RecommendationDetailsProps) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMMM d, yyyy 'at' h:mm a");
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{recommendation.title}</DialogTitle>
            <Badge variant="outline" className="bg-green-50 text-green-700">
              {recommendation.status}
            </Badge>
          </div>
          <DialogDescription>
            Created on {formatDate(recommendation.createdAt)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-1">Type</h4>
            <p>{recommendation.type}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-1">Description</h4>
            <p className="text-sm">{recommendation.description}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-1">Price Targets</h4>
            <div className="space-y-2">
              {recommendation.targets.map((target, idx) => (
                <div key={target.id} className="flex items-center justify-between border-b pb-1">
                  <span className="text-sm font-medium">Target {idx + 1}</span>
                  <div className="text-sm">
                    <span className="font-bold">${target.price}</span>
                    <span className="text-muted-foreground ml-2">({target.timeframe})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {isAdmin && (
            <div>
              <h4 className="text-sm font-medium mb-1">Client Acknowledgments</h4>
              <div className="text-sm">
                {recommendation.clientsAcknowledged.length} out of {recommendation.clientsAssigned.length} clients have acknowledged
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {!isAdmin && (
            <Button 
              onClick={onAcknowledge} 
              disabled={hasAcknowledged}
              className="mr-auto"
            >
              {hasAcknowledged ? "Acknowledged" : "Acknowledge"}
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RecommendationDetails;
