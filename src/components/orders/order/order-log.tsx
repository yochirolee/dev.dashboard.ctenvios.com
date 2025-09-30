import {  Copy } from "lucide-react"
import { Card, CardDescription, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

type EventType = "FULFILLMENT" | "INTERNAL" | "CUSTOMER"

interface OrderEvent {
  id: string
  timestamp: string
  type: EventType
  title: string
  description: string
}

interface OrderLogProps {
  events?: OrderEvent[]
}

const eventTypeStyles: Record<EventType, string> = {
  FULFILLMENT: "bg-primary text-primary-foreground",
  INTERNAL: "bg-accent text-accent-foreground",
  CUSTOMER: "bg-foreground text-background",
}

const eventDotStyles: Record<EventType, string> = {
  FULFILLMENT: "bg-primary",
  INTERNAL: "bg-accent",
  CUSTOMER: "bg-foreground",
}


const defaultEvents: OrderEvent[] = [
  {
    id: "1",
    timestamp: "28 AUGUST 2025 11:05 AM",
    type: "FULFILLMENT",
    title: "Order shipped",
    description: "Tracking #A1B2C3XYZ",
  },
  {
    id: "2",
    timestamp: "27 AUGUST 2025 16:30 PM",
    type: "INTERNAL",
    title: "Payment verified",
    description: "By Sarah Jenkins, Staff ID: 102",
  },
  {
    id: "3",
    timestamp: "27 AUGUST 2025 10:15 AM",
    type: "CUSTOMER",
    title: "Order placed",
    description: "By Lam'aan, Customer ID: 2039",
  },
]

export function OrderLog({ events = defaultEvents }: OrderLogProps) {
  return (
    <Card className=" col-span-1 xl:col-span-3 px-4 py-2">
      	<div className="grid gap-0.5">
					<CardTitle className="group flex justify-between items-center gap-2 text-lg">
						Order No. 9999
						<Button
							size="icon"
							variant="outline"
							className="h-6 w-6 transition-opacity group-hover:opacity-100"
						>
							<Copy className="h-3 w-3" />
							<span className="sr-only">Copy Order ID</span>
						</Button>
					</CardTitle>
					<CardDescription>
						Order Log
					</CardDescription>
		</div>



      <div className="relative space-y-6">
        {/* Timeline line */}
        <div className="absolute left-[7px] top-2 bottom-0 w-[2px] bg-border" />

        {events.map((event) => (
          <div key={event.id} className="relative pl-8">
            {/* Timeline dot */}
            <div className={`absolute left-1 top-1 h-2 w-2 rounded-full ${eventDotStyles[event.type]}`} />

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <time className="text-xs">{event.timestamp}</time>
                <Badge variant="secondary" className={`text-[10px] font-semibold ${eventTypeStyles[event.type]}`}>
                  {event.type}
                </Badge>
              </div>

              <h3 className="font-sans text-xs font-semibold text-foreground">{event.title}</h3>

              <p className="text-xs text-muted-foreground">{event.description}</p>
            </div>
          </div>
        ))}
      </div>
        
         <div className="mt-2">
        <Textarea
          placeholder="Add an internal note (not visible to customer)"
          className="min-h-[80px] resize-none text-sm"
        />
      </div>
    </Card>
  )
}

