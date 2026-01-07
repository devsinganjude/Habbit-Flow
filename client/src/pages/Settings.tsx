import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell, Moon, User } from "lucide-react";

export default function Settings() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold">Settings</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Manage your account preferences and app settings.
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Section */}
          <section className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <User className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold">Profile</h2>
            </div>
            
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label>Username</Label>
                <Input defaultValue="demo_user" disabled className="bg-muted/50" />
              </div>
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input defaultValue="user@example.com" disabled className="bg-muted/50" />
              </div>
            </div>
          </section>

          {/* Preferences Section */}
          <section className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Bell className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold">Notifications</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Daily Reminders</div>
                  <div className="text-sm text-muted-foreground">Get reminded to check your habits.</div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Weekly Summary</div>
                  <div className="text-sm text-muted-foreground">Receive a summary of your progress.</div>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </section>

          {/* Appearance Section */}
          <section className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Moon className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold">Appearance</h2>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Dark Mode</div>
                <div className="text-sm text-muted-foreground">Toggle dark theme. (Default enabled)</div>
              </div>
              <Switch defaultChecked disabled />
            </div>
          </section>

          <div className="flex justify-end pt-4">
            <Button className="px-8">Save Changes</Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
