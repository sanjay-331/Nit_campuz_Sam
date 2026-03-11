import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../ui/Sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/Tabs";
import { Card, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import { Input } from '../ui/Input';
import { useDispatch, useSelector } from 'react-redux';
import { showToast } from '../../store/slices/uiSlice';
import { selectUser, selectCan } from '../../store/slices/authSlice';
import { Permission, UserRole } from '../../types';

interface SettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SettingsSheet: React.FC<SettingsSheetProps> = ({ open, onOpenChange }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const canConfigureSystem = useSelector(selectCan(Permission.CONFIGURE_SYSTEM));
  
  const [isSaving, setIsSaving] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const handleSave = () => {
      setIsSaving(true);
      setTimeout(() => {
          setIsSaving(false);
          dispatch(showToast({ type: 'success', title: 'Settings Saved', message: 'Your preferences have been successfully updated.' }));
          onOpenChange(false);
      }, 800);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md p-0 bg-white">
        <SheetHeader className="p-6 border-b bg-slate-50">
          <SheetTitle className="text-2xl font-bold text-slate-900">Settings</SheetTitle>
          <SheetDescription className="text-slate-500">
            Manage your personal preferences {canConfigureSystem ? 'and system-wide configurations' : ''}.
          </SheetDescription>
        </SheetHeader>
        <div className="p-6 h-[calc(100vh-140px)] overflow-y-auto">
            <Tabs defaultValue="preferences" className="w-full">
                <TabsList className={`grid w-full ${canConfigureSystem ? 'grid-cols-2' : 'grid-cols-1'} mb-6 p-1 bg-slate-100 rounded-xl`}>
                    <TabsTrigger value="preferences" className="rounded-lg text-sm">Preferences</TabsTrigger>
                    {canConfigureSystem && <TabsTrigger value="system" className="rounded-lg text-sm">System</TabsTrigger>}
                </TabsList>
                
                <TabsContent value="preferences" className="space-y-4">
                    <Card className="border-slate-200 shadow-sm overflow-hidden">
                        <CardContent className="pt-6 space-y-6">
                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-slate-700">Notifications</label>
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-slate-800">Email Alerts</span>
                                        <span className="text-[10px] text-slate-500">Receive important updates via email</span>
                                    </div>
                                    <button 
                                        onClick={() => setEmailNotifs(!emailNotifs)}
                                        className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 ${emailNotifs ? 'bg-indigo-600' : 'bg-slate-300'}`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${emailNotifs ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-slate-700">Appearance</label>
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-slate-800">Dark Mode</span>
                                        <span className="text-[10px] text-slate-500">Switch between light and dark themes</span>
                                    </div>
                                    <button 
                                        onClick={() => setDarkMode(!darkMode)}
                                        className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 ${darkMode ? 'bg-indigo-600' : 'bg-slate-300'}`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${darkMode ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                    </button>
                                </div>
                            </div>

                            <div className="pt-2">
                                <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-11" onClick={handleSave} disabled={isSaving}>
                                    {isSaving ? 'Saving...' : 'Save Preferences'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                        <p className="text-[11px] text-blue-700 leading-relaxed">
                            Looking to change your password or personal info? Head over to your <a href="/profile" className="font-bold underline">Profile Page</a>.
                        </p>
                    </div>
                </TabsContent>

                {canConfigureSystem && (
                    <TabsContent value="system" className="space-y-4">
                        <Card className="border-slate-200 shadow-sm overflow-hidden">
                            <CardContent className="pt-6 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Current Academic Year</label>
                                    <Input defaultValue="2023-24" className="bg-slate-50 border-slate-200" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-slate-700">Site Status</label>
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-slate-800">Maintenance Mode</span>
                                            <span className="text-[10px] text-slate-500">Restrict access to system actions</span>
                                        </div>
                                        <button 
                                            onClick={() => setMaintenanceMode(!maintenanceMode)}
                                            className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 ${maintenanceMode ? 'bg-rose-600' : 'bg-slate-300'}`}
                                        >
                                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${maintenanceMode ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                        </button>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-slate-100">
                                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11" onClick={handleSave} disabled={isSaving}>
                                        {isSaving ? 'Configuring...' : 'Apply System Changes'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0"></div>
                            <p className="text-[10px] text-amber-800 leading-relaxed italic">
                                System setting changes are logged for auditing. Ensure all scheduled tasks are paused before enabling maintenance mode.
                            </p>
                        </div>
                    </TabsContent>
                )}
            </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SettingsSheet;
