'use client';
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useUser } from "@/firebase";

export default function SettingsPage() {
  const { user } = useUser();

  return (
    <div className="grid gap-6">
      <h1 className="font-headline text-3xl font-bold tracking-tight">Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Personal Information</CardTitle>
          <CardDescription>Update your personal details here.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue={user?.displayName || ""} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" defaultValue={user?.email || ""} disabled />
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button>Save Changes</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Notification Settings</CardTitle>
          <CardDescription>Manage how you receive notifications from InvoTrack.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="monthly-reports" className="flex flex-col space-y-1">
              <span>Monthly Reports</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Get a summary of your portfolio performance every month.
              </span>
            </Label>
            <Switch id="monthly-reports" />
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button>Save Preferences</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
