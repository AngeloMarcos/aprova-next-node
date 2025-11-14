import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function UpgradeCard() {
  return (
    <Card className="col-span-1 md:col-span-2 transition-all duration-300 hover:shadow-xl">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Subscribe / Upgrade</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" placeholder="Enter your name" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="Enter your email" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="card">Card Number</Label>
            <Input id="card" placeholder="•••• •••• •••• ••••" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="expiry">MM/YY</Label>
              <Input id="expiry" placeholder="12/24" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvc">CVC</Label>
              <Input id="cvc" placeholder="123" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Select Plan</Label>
          <RadioGroup defaultValue="starter" className="flex gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="starter" id="starter" />
              <Label htmlFor="starter" className="cursor-pointer">Starter - $9/mo</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pro" id="pro" />
              <Label htmlFor="pro" className="cursor-pointer">Pro - $29/mo</Label>
            </div>
          </RadioGroup>
        </div>

        <Button className="w-full">
          Subscribe Now
        </Button>
      </CardContent>
    </Card>
  );
}
