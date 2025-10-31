"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Trash2, AlertTriangle, Settings } from "lucide-react";

export default function WorkspaceSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.id as string;
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteWorkspace = async () => {
    if (deleteConfirmation !== "APAGAR") {
      alert("Digite 'APAGAR' para confirmar");
      return;
    }

    setIsDeleting(true);
    
    try {
      const supabase = createClient();
      
      // Delete all related data first
      await supabase.from('faculty_assessments').delete().eq('subject_id', workspaceId);
      await supabase.from('faculty_topics').delete().eq('subject_id', workspaceId);
      await supabase.from('faculty_readings').delete().eq('subject_id', workspaceId);
      await supabase.from('faculty_notes').delete().eq('subject_id', workspaceId);
      await supabase.from('subjects').delete().eq('workspace_id', workspaceId);
      await supabase.from('readings').delete().eq('workspace_id', workspaceId);
      await supabase.from('sessions').delete().eq('workspace_id', workspaceId);
      await supabase.from('tasks').delete().eq('workspace_id', workspaceId);
      await supabase.from('taf_trainings').delete().eq('workspace_id', workspaceId);
      
      // Finally delete the workspace
      const { error } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', workspaceId);

      if (error) throw error;

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error deleting workspace:', error);
      alert('Erro ao apagar workspace. Tente novamente.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href={`/workspaces/${workspaceId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Settings className="w-8 h-8" />
              Configurações do Workspace
            </h1>
            <p className="text-muted-foreground">
              Gerencie as configurações do seu workspace
            </p>
          </div>
        </div>

        {/* Danger Zone */}
        <Card className="border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <AlertTriangle className="w-5 h-5" />
              Zona Perigosa
            </CardTitle>
            <CardDescription>
              Ações irreversíveis que afetam permanentemente seu workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Card className="mb-4 border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/30">
              <CardContent className="pt-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                  <div className="text-sm text-red-800 dark:text-red-200">
                    <strong>Atenção:</strong> Apagar o workspace irá remover permanentemente todos os dados:
                    matérias, avaliações, anotações, leituras, sessões de estudo e tarefas. 
                    Esta ação não pode ser desfeita.
                  </div>
                </div>
              </CardContent>
            </Card>

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="w-full sm:w-auto">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Apagar Workspace
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="w-5 h-5" />
                    Confirmar Exclusão
                  </DialogTitle>
                  <DialogDescription>
                    Esta ação é irreversível. Todos os dados deste workspace serão permanentemente removidos.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <Card className="border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/30">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                        <div className="text-sm text-red-800 dark:text-red-200">
                          <strong>O que será removido:</strong>
                          <ul className="list-disc ml-4 mt-2 space-y-1">
                            <li>Todas as matérias e disciplinas</li>
                            <li>Provas e trabalhos (avaliações)</li>
                            <li>Anotações e resumos</li>
                            <li>Leituras e livros</li>
                            <li>Sessões de estudo</li>
                            <li>Tarefas e treinos</li>
                            <li>Histórico e progresso</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-2">
                    <Label htmlFor="confirmation">
                      Digite <strong>"APAGAR"</strong> para confirmar:
                    </Label>
                    <Input
                      id="confirmation"
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                      placeholder="APAGAR"
                      className="font-mono"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setDeleteDialogOpen(false);
                      setDeleteConfirmation("");
                    }}
                    disabled={isDeleting}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleDeleteWorkspace}
                    disabled={deleteConfirmation !== "APAGAR" || isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Apagando...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Apagar Definitivamente
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
