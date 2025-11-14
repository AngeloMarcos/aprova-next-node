import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { selectedDates } from "@/lib/mockData";

export function CalendarCard() {
  const [date, setDate] = useState<Date | undefined>(selectedDates[0]);
  const [selectedMultiple, setSelectedMultiple] = useState<Date[]>(selectedDates);

  return (
    <Card className="transition-all duration-300 hover:shadow-xl">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border-0"
          modifiers={{
            selected: selectedMultiple
          }}
          modifiersStyles={{
            selected: {
              backgroundColor: 'hsl(var(--primary))',
              color: 'hsl(var(--primary-foreground))'
            }
          }}
        />
      </CardContent>
    </Card>
  );
}
