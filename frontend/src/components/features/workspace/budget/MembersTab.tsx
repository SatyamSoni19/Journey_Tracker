import { useState, useRef } from "react";
import { Plus, Trash2, Loader2, User, Edit2, Check, X, Camera, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { budgetApi, uploadApi, type BudgetMember } from "@/lib/api";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface MembersTabProps {
  journeyId: string;
}

function MemberItem({ member, journeyId, totalSpent, onDelete }: { member: BudgetMember, journeyId: string, totalSpent: number, onDelete: (id: string) => void }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(member.name);
  const [isUploading, setIsUploading] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<BudgetMember>) => budgetApi.updateMember(journeyId, member.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgetMembers", journeyId] });
      queryClient.invalidateQueries({ queryKey: ["budgetSummary", journeyId] });
      setIsEditing(false);
      setIsUploading(false);
      toast.success("Member updated");
    },
    onError: () => {
      setIsUploading(false);
      toast.error("Failed to update member");
    }
  });

  const handleSave = () => {
    if (!editName.trim()) return;
    updateMutation.mutate({ name: editName });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const res = await uploadApi.uploadImage(file, journeyId);
      updateMutation.mutate({ avatarUrl: res.secureUrl });
    } catch (error) {
      setIsUploading(false);
      toast.error("Failed to upload image");
    }
  };

  return (
    <>
      <li className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
        <div className="flex items-center gap-3">
          <div 
            className="relative group flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-brand/10 text-brand overflow-hidden"
            onClick={() => setIsPhotoModalOpen(true)}
          >
            {isUploading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : member.avatarUrl ? (
              <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
            ) : (
              <User size={18} />
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={14} className="text-white" />
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
          </div>
        
        <div className="flex-1">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                autoFocus
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="h-7 px-2 rounded border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-brand w-32 sm:w-48"
                onKeyDown={e => {
                  if (e.key === "Enter") handleSave();
                  if (e.key === "Escape") { setIsEditing(false); setEditName(member.name); }
                }}
              />
              <button disabled={updateMutation.isPending} onClick={handleSave} className="text-brand hover:text-brand/80">
                {updateMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={16} />}
              </button>
              <button onClick={() => { setIsEditing(false); setEditName(member.name); }} className="text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm font-semibold">{member.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Spent: <span className="font-medium text-foreground">{totalSpent.toLocaleString()}</span>
              </p>
            </>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-1 shrink-0">
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-muted-foreground hover:text-brand transition-colors rounded-full hover:bg-brand/10"
          >
            <Edit2 size={16} />
          </button>
        )}
        <button
          onClick={() => onDelete(member.id)}
          className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-full hover:bg-destructive/10"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </li>

    <Dialog open={isPhotoModalOpen} onOpenChange={setIsPhotoModalOpen}>
        <DialogContent className="sm:max-w-md border-border bg-card p-0 overflow-hidden flex flex-col">
          <div className="relative aspect-square w-full bg-muted flex items-center justify-center overflow-hidden">
            {isUploading ? (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Loader2 size={32} className="animate-spin" />
                <span className="text-sm font-medium">Uploading...</span>
              </div>
            ) : member.avatarUrl ? (
              <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <User size={64} className="opacity-20" />
                <p className="text-sm font-medium">No photo available</p>
              </div>
            )}
          </div>
          <div className="p-4 flex items-center justify-between bg-card">
            <div>
              <h3 className="font-semibold text-lg">{member.name}</h3>
              <p className="text-sm text-muted-foreground">Profile Photo</p>
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-xl text-sm font-medium hover:bg-brand/90 transition-colors disabled:opacity-50"
            >
              <ImageIcon size={16} />
              {member.avatarUrl ? "Change Photo" : "Upload Photo"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function MembersTab({ journeyId }: MembersTabProps) {
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["budgetMembers", journeyId],
    queryFn: () => budgetApi.getMembers(journeyId),
  });
  
  const { data: expensesData } = useQuery({
    queryKey: ["budgetExpenses", journeyId],
    queryFn: () => budgetApi.getExpenses(journeyId),
  });

  const members = data?.members || [];
  const expenses = expensesData?.expenses || [];

  // Calculate total spent per member
  const memberSpentMap = new Map<string, number>();
  members.forEach(m => memberSpentMap.set(m.id, 0));

  expenses.forEach(expense => {
    expense.splits.forEach(split => {
      const current = memberSpentMap.get(split.memberId) || 0;
      memberSpentMap.set(split.memberId, current + split.amount);
    });
  });

  const addMutation = useMutation({
    mutationFn: (name: string) => budgetApi.createMember(journeyId, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgetMembers", journeyId] });
      queryClient.invalidateQueries({ queryKey: ["budgetSummary", journeyId] });
      setNewName("");
      toast.success("Member added");
    },
    onError: () => toast.error("Failed to add member"),
  });

  const deleteMutation = useMutation({
    mutationFn: (memberId: string) => budgetApi.deleteMember(journeyId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgetMembers", journeyId] });
      queryClient.invalidateQueries({ queryKey: ["budgetSummary", journeyId] });
      toast.success("Member removed");
    },
    onError: () => toast.error("Cannot remove member (they may have expenses tied to them)."),
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    addMutation.mutate(newName);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Remove this member?")) return;
    deleteMutation.mutate(id);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-sm font-semibold mb-4">Add Member</h3>
        <form onSubmit={handleAdd} className="flex gap-3">
          <input
            type="text"
            required
            placeholder="Member name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
          />
          <button
            type="submit"
            disabled={addMutation.isPending || !newName.trim()}
            className="px-6 py-2.5 text-sm font-medium rounded-xl bg-brand text-white hover:bg-brand/90 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[100px]"
          >
            {addMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : "Add"}
          </button>
        </form>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden min-h-[200px]">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : members.length === 0 ? (
           <div className="text-center py-10 text-muted-foreground text-sm">
             No members added yet. Add members to start splitting expenses.
           </div>
        ) : (
          <ul className="divide-y divide-border">
            {members.map(member => (
              <MemberItem 
                key={member.id} 
                member={member} 
                journeyId={journeyId} 
                totalSpent={memberSpentMap.get(member.id) || 0}
                onDelete={handleDelete}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
