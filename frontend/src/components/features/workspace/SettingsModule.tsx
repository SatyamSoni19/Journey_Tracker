import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Save, Trash2, AlertTriangle } from "lucide-react";
import { journeyApi, type Journey } from "@/lib/api";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageUpload } from "@/components/common/ImageUpload";
import { DateInput } from "@/components/ui/date-input";
import { LocationPicker } from "@/components/maps/LocationPicker";
import type { LocationData } from "@/types/maps.types";

interface SettingsModuleProps {
  journey: Journey;
}

export function SettingsModule({ journey }: SettingsModuleProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    title: journey.title,
    destination: journey.destination,
    description: journey.description || "",
    coverImage: journey.coverImage || "",
    coverImagePublicId: journey.coverImagePublicId || "",
    status: journey.status,
    budget: journey.budget.toString(),
    startDate: new Date(journey.startDate).toISOString().split('T')[0],
    endDate: new Date(journey.endDate).toISOString().split('T')[0],
  });

  const [location, setLocation] = useState<LocationData | null>(
    journey.placeId && journey.latitude && journey.longitude
      ? {
          placeId: journey.placeId,
          latitude: journey.latitude,
          longitude: journey.longitude,
          formattedAddress: journey.formattedAddress || "",
          city: journey.city || "",
          state: journey.state || "",
          country: journey.country || "",
          googlePlaceName: journey.googlePlaceName || journey.destination,
        }
      : null
  );

  const handleCoverImageChange = (url: string | null, publicId: string | null) => {
    setFormData(prev => ({
      ...prev,
      coverImage: url || "",
      coverImagePublicId: publicId || "",
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeSave();
  };

  const executeSave = async () => {
    try {
      setIsSaving(true);
      const updateData = {
        title: formData.title,
        destination: formData.destination,
        description: formData.description || null,
        coverImage: formData.coverImage || null,
        coverImagePublicId: formData.coverImagePublicId || null,
        status: formData.status,
        budget: parseFloat(formData.budget),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        ...(location && {
          destination: location.googlePlaceName || location.formattedAddress,
          placeId: location.placeId,
          latitude: location.latitude,
          longitude: location.longitude,
          formattedAddress: location.formattedAddress,
          city: location.city,
          state: location.state,
          country: location.country,
          googlePlaceName: location.googlePlaceName,
        }),
      };

      await journeyApi.update(journey.id, updateData as any);
      queryClient.invalidateQueries({ queryKey: ["journey", journey.id] });
      queryClient.invalidateQueries({ queryKey: ["journeys"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
      toast.success("Changes Saved ✅");
    } catch (error: any) {
      toast.error(error.message || "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    setIsDeleteDialogOpen(false);
    try {
      setIsDeleting(true);
      await journeyApi.delete(journey.id);
      toast.success(`Journey "${journey.title}" deleted`);
      navigate("/my-trips");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete journey");
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full bg-background p-4 sm:p-6 lg:p-10 pb-24">
      <div className="mx-auto max-w-3xl space-y-10">
        
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Settings</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage your journey details and preferences.</p>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-6 rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
          <h3 className="text-lg font-semibold border-b border-border pb-4">General Information</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Title <span className="text-destructive">*</span></label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Destination <span className="text-destructive">*</span></label>
              <LocationPicker
                value={location}
                onChange={setLocation}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Cover Image</label>
            <ImageUpload
              value={formData.coverImage || null}
              publicId={formData.coverImagePublicId || null}
              onChange={handleCoverImageChange}
              folder="Journey_Tracker/journey-covers"
              disabled={isSaving}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
              >
                <option value="PLANNED">Planned</option>
                <option value="ONGOING">Ongoing</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Start Date <span className="text-destructive">*</span></label>
              <DateInput
                required
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">End Date <span className="text-destructive">*</span></label>
              <DateInput
                required
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2 sm:w-1/3">
            <label className="text-sm font-medium text-foreground">Budget <span className="text-destructive">*</span></label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.budget}
              onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
             <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 text-sm font-medium rounded-xl text-white bg-brand hover:bg-brand/90 transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2 min-w-[120px] justify-center"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Changes
            </button>
          </div>
        </form>

        <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-6 sm:p-8 space-y-4">
           <div className="flex items-center gap-3 text-destructive">
             <AlertTriangle size={24} />
             <h3 className="text-lg font-semibold">Danger Zone</h3>
           </div>
           <p className="text-sm text-destructive/80 max-w-xl">
             Once you delete a journey, there is no going back. Please be certain.
           </p>
           <button
             onClick={handleDeleteClick}
             disabled={isDeleting}
             className="px-6 py-2.5 text-sm font-medium rounded-xl text-white bg-gradient-to-r from-red-500 to-red-600 shadow-md shadow-red-500/20 hover:from-red-600 hover:to-red-700 hover:shadow-lg hover:shadow-red-500/30 transition-all disabled:opacity-70 flex items-center gap-2"
           >
             {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
             Delete Journey
           </button>
        </div>

      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle size={18} />
              Delete Journey
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete 
              "{journey.title}" and all related timeline entries, expenses, and photos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <button
              onClick={() => setIsDeleteDialogOpen(false)}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-input bg-background hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={executeDelete}
              className="px-4 py-2 text-sm font-medium rounded-lg text-white bg-destructive hover:bg-destructive/90 transition-colors"
            >
              Delete Permanently
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
