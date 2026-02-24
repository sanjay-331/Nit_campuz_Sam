
import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../../ui/Sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/Tabs";
import { Card, CardContent } from '../../ui/Card';
import Button from '../../ui/Button';

interface SettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SettingsSheet: React.FC<SettingsSheetProps> = ({ open, onOpenChange }) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md p-0">
        <SheetHeader className="p-6 border-b">
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>
            Manage your account and system settings.
          </SheetDescription>
        </SheetHeader>
        <div className="p-6">
            <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>
            <TabsContent value="profile">
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <p className="text-sm text-gray-500">Manage your personal profile information.</p>
                             <Button className="w-full">Update Profile</Button>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="system">
                <Card>
                     <CardContent className="pt-6">
                        <div className="space-y-4">
                            <p className="text-sm text-gray-500">Configure system-wide application settings.</p>
                             <Button className="w-full">Save System Settings</Button>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
            </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SettingsSheet;
