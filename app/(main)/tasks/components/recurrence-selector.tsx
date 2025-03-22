import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addMonths, format } from "date-fns";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { RecurrencePattern, RecurrenceFrequency } from "../types";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface RecurrenceSelectorProps {
  value: RecurrencePattern | null;
  onChange: (pattern: RecurrencePattern | null) => void;
}

export function RecurrenceSelector({
  value,
  onChange,
}: RecurrenceSelectorProps) {
  const [, setShowCustom] = useState(false);

  const handleFrequencyChange = (frequency: RecurrenceFrequency) => {
    if (frequency === "custom") {
      setShowCustom(true);
      return;
    }

    const newPattern: RecurrencePattern = {
      frequency,
      interval: 1,
      daysOfWeek: frequency === "weekly" ? [new Date().getDay()] : undefined,
      dayOfMonth: frequency === "monthly" ? new Date().getDate() : undefined,
      endDate: null,
    };
    onChange(newPattern);
  };

  return (
    <div className="grid gap-2">
      <Label>Repeat</Label>
      <Select
        value={value?.frequency || "never"}
        onValueChange={(v: RecurrenceFrequency | "never") => {
          if (v === "never") {
            onChange(null);
          } else {
            handleFrequencyChange(v as RecurrenceFrequency);
          }
        }}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="never">Never</SelectItem>
          <SelectItem value="daily">Daily</SelectItem>
          <SelectItem value="weekly">Weekly</SelectItem>
          <SelectItem value="monthly">Monthly</SelectItem>
          <SelectItem value="custom">Custom</SelectItem>
        </SelectContent>
      </Select>
      {value && (
        <div className="grid gap-4 mt-4">
          <div className="grid gap-2">
            <Label>Every</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="1"
                value={value.interval}
                onChange={(e) =>
                  onChange({
                    ...value,
                    interval: parseInt(e.target.value) || 1,
                  })
                }
                className="w-20"
              />
              <span className="text-muted-foreground">
                {value.frequency === "daily" && "days"}
                {value.frequency === "weekly" && "weeks"}
                {value.frequency === "monthly" && "months"}
              </span>
            </div>
          </div>
          {value.frequency === "monthly" && (
            <div className="grid gap-2">
              <Label>Day of month</Label>
              <Input
                type="number"
                min="1"
                max="31"
                value={value.dayOfMonth}
                onChange={(e) =>
                  onChange({
                    ...value,
                    dayOfMonth: parseInt(e.target.value) || 1,
                  })
                }
              />
            </div>
          )}
          <div className="grid gap-2">
            <Label>Ends</Label>
            <Select
              value={
                value.endDate ? "on" : value.occurrences ? "after" : "never"
              }
              onValueChange={(v) => {
                if (v === "never") {
                  onChange({ ...value, endDate: null, occurrences: null });
                } else if (v === "after") {
                  onChange({ ...value, endDate: null, occurrences: 10 });
                } else {
                  onChange({
                    ...value,
                    endDate: addMonths(new Date(), 1),
                    occurrences: null,
                  });
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never">Never</SelectItem>
                <SelectItem value="after">After</SelectItem>
                <SelectItem value="on">On date</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {value.occurrences && (
            <div className="grid gap-2">
              <Label>Number of occurrences</Label>
              <Input
                type="number"
                min="1"
                value={value.occurrences}
                onChange={(e) =>
                  onChange({
                    ...value,
                    occurrences: parseInt(e.target.value) || 1,
                  })
                }
              />
            </div>
          )}
          {value.endDate && (
            <div className="grid gap-2">
              <Label>End date</Label>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !value.endDate && "text-muted-foreground"
                    )}
                  >
                    {value.endDate ? (
                      format(value.endDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="p-0">
                  <Calendar
                    mode="single"
                    selected={value.endDate}
                    onSelect={(date) =>
                      onChange({
                        ...value,
                        endDate: date,
                      })
                    }
                    initialFocus
                  />
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default RecurrenceSelector;

