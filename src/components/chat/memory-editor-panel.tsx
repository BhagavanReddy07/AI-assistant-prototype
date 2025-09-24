import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { BrainCircuit } from 'lucide-react';

export function MemoryEditorPanel() {
  return (
    <aside className="hidden lg:block w-80 h-full border-l p-4 bg-card/50">
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-primary" />
          <div>
            <CardTitle className="text-lg">Memory Editor</CardTitle>
            <CardDescription>View and manage AI memory.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 text-sm">
          <p className="text-muted-foreground">
            This is a placeholder for the memory editing interface. In the full version, you'll be able to directly influence how your AI assistant remembers and learns.
          </p>
          <Separator />
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">User Preferences</h3>
            <div className="space-y-2">
              <Label htmlFor="communication-style">Communication Style</Label>
              <Input id="communication-style" value="Formal, concise" disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interests">Key Interests</Label>
              <Input id="interests" value="AI, Quantum Physics, Cooking" disabled />
            </div>
          </div>
          <Separator />
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Core Memories</h3>
            <div className="flex items-center justify-between space-x-2 rounded-md border p-3">
              <p className="truncate">User's birthday is October 26th.</p>
              <Switch disabled />
            </div>
            <div className="flex items-center justify-between space-x-2 rounded-md border p-3">
              <p className="truncate">Favorite color is Teal (#008080).</p>
              <Switch disabled checked />
            </div>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
