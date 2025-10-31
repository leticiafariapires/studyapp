"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Trash2, AlertTriangle } from "lucide-react";

export function WorkspaceSettingsDialog({ 
  workspace, 
  open, 
  onOpenChange 
}: { 
  workspace: any; 
  open: boolean; 
  onOpenChange: (open: boolean) => void 
}) {
  const router = useRouter();
  const { showToast, ToastContainer } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState({
    name: workspace?.name || '',
    description: workspace?.description || '',
    is_public: workspace?.is_public || false,
  });

  const handleDeleteWorkspace = async () => {
    if (!workspace) return;
    
    try {
      setIsDeleting(true);
      const supabase = createClient();
      const { error } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', workspace.id);

      if (error) throw error;

      showToast("Workspace excluído com sucesso.", "success");
      
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      console.error('Error deleting workspace:', error);
      showToast("Erro ao excluir o workspace. Tente novamente.", "error");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      onOpenChange(false);
    }
  };

  const handleUpdateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('workspaces')
        .update({
          name: formData.name,
          description: formData.description,
          is_public: formData.is_public,
          updated_at: new Date().toISOString(),
        })
        .eq('id', workspace.id);

      if (error) throw error;

      showToast("Configurações do workspace atualizadas com sucesso.", "success");
      
      router.refresh();
    } catch (error) {
      console.error('Error updating workspace:', error);
      showToast("Erro ao atualizar as configurações. Tente novamente.", "error");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configurações do Workspace</DialogTitle>
          <DialogDescription>
            Gerencie as configurações e preferências do seu workspace.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleUpdateWorkspace} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Workspace</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Meu Workspace"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Uma breve descrição sobre este workspace"
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <h4 className="font-medium">Workspace Público</h4>
                <p className="text-sm text-muted-foreground">
                  Torna este workspace visível para outros usuários
                </p>
              </div>
              <Switch
                checked={formData.is_public}
                onCheckedChange={(checked: boolean) => setFormData({...formData, is_public: checked})}
              />
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <Button 
              type="button"
              variant="outline" 
              onClick={() => setShowDeleteConfirm(true)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir Workspace
            </Button>
            <Button type="submit">Salvar Alterações</Button>
          </DialogFooter>
        </form>

        {/* Confirmação de exclusão */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <div className="flex items-center gap-2 text-amber-500">
                <AlertTriangle className="w-5 h-5" />
                <DialogTitle>Excluir Workspace</DialogTitle>
              </div>
              <DialogDescription>
                Tem certeza que deseja excluir permanentemente este workspace? 
                <span className="font-semibold text-foreground"> Esta ação não pode ser desfeita</span>.
              </DialogDescription>
            </DialogHeader>
            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-md border border-amber-200 dark:border-amber-900/50">
              <p className="text-sm text-amber-700 dark:text-amber-400">
                <span className="font-medium">Atenção:</span> Todas as matérias, tópicos, anotações e 
                leituras associadas a este workspace serão permanentemente removidas.
              </p>
            </div>
            <DialogFooter className="mt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteWorkspace}
                disabled={isDeleting}
              >
                {isDeleting ? 'Excluindo...' : 'Sim, excluir'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
      <ToastContainer />
    </Dialog>
  );
}
