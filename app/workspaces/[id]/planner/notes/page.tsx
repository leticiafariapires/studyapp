"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Pencil, Trash2, Pin, PinOff, StickyNote } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Note {
  id: string;
  title: string;
  content: string | null;
  color: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

const noteColors = [
  { name: 'Amarelo', value: '#fef3c7' },
  { name: 'Rosa', value: '#fce7f3' },
  { name: 'Azul', value: '#dbeafe' },
  { name: 'Verde', value: '#d1fae5' },
  { name: 'Roxo', value: '#ede9fe' },
  { name: 'Laranja', value: '#fed7aa' },
];

export default function PlannerNotesPage() {
  const params = useParams();
  const workspaceId = params.id as string;
  const { showToast, ToastContainer } = useToast();

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    color: "#fef3c7",
    is_pinned: false
  });

  useEffect(() => {
    loadNotes();
  }, [workspaceId]);

  const loadNotes = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('planner_notes')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('is_pinned', { ascending: false })
      .order('updated_at', { ascending: false });

    if (data) setNotes(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();

    const noteData = {
      workspace_id: workspaceId,
      title: formData.title,
      content: formData.content || null,
      color: formData.color,
      is_pinned: formData.is_pinned,
      updated_at: new Date().toISOString()
    };

    if (editingNote) {
      await supabase
        .from('planner_notes')
        .update(noteData)
        .eq('id', editingNote.id);
      showToast('Nota atualizada com sucesso!', 'success');
    } else {
      await supabase
        .from('planner_notes')
        .insert(noteData);
      showToast('Nota criada com sucesso!', 'success');
    }

    setDialogOpen(false);
    setEditingNote(null);
    setFormData({ title: "", content: "", color: "#fef3c7", is_pinned: false });
    loadNotes();
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content || "",
      color: note.color,
      is_pinned: note.is_pinned
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta nota?")) return;

    const supabase = createClient();
    await supabase.from('planner_notes').delete().eq('id', id);
    showToast('Nota excluída com sucesso!', 'success');
    loadNotes();
  };

  const togglePin = async (note: Note) => {
    const supabase = createClient();
    await supabase
      .from('planner_notes')
      .update({ 
        is_pinned: !note.is_pinned,
        updated_at: new Date().toISOString()
      })
      .eq('id', note.id);

    showToast(note.is_pinned ? 'Nota desafixada' : 'Nota fixada', 'success');
    loadNotes();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const pinnedNotes = notes.filter(n => n.is_pinned);
  const regularNotes = notes.filter(n => !n.is_pinned);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Link href={`/workspaces/${workspaceId}/planner`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Notas</h1>
              <p className="text-muted-foreground text-sm">
                {notes.length} notas • {pinnedNotes.length} fixadas
              </p>
            </div>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                onClick={() => {
                  setEditingNote(null);
                  setFormData({ title: "", content: "", color: "#fef3c7", is_pinned: false });
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Nota
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingNote ? "Editar Nota" : "Nova Nota"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingNote ? "Atualize o conteúdo da nota" : "Crie uma nova nota rápida"}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Ex: Ideias para o projeto"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Conteúdo</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Escreva suas anotações..."
                      rows={6}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Cor da Nota</Label>
                    <div className="flex gap-2">
                      {noteColors.map(color => (
                        <button
                          key={color.value}
                          type="button"
                          className={`w-10 h-10 rounded-lg border-2 transition-all ${
                            formData.color === color.value 
                              ? 'border-primary scale-110' 
                              : 'border-gray-200 hover:scale-105'
                          }`}
                          style={{ backgroundColor: color.value }}
                          onClick={() => setFormData({ ...formData, color: color.value })}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_pinned"
                      checked={formData.is_pinned}
                      onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="is_pinned" className="cursor-pointer">
                      Fixar nota
                    </Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingNote ? "Salvar" : "Criar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {notes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <StickyNote className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Nenhuma nota criada ainda</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {pinnedNotes.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Pin className="w-5 h-5" />
                  Fixadas
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {pinnedNotes.map(note => (
                    <Card
                      key={note.id}
                      className="hover:shadow-lg transition-shadow"
                      style={{ backgroundColor: note.color }}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-base">{note.title}</CardTitle>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => togglePin(note)}
                              className="h-8 w-8 p-0"
                            >
                              <Pin className="w-4 h-4 fill-current" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {note.content && (
                          <p className="text-sm whitespace-pre-line text-gray-700 dark:text-gray-900 mb-3">
                            {note.content.length > 150 
                              ? note.content.substring(0, 150) + '...' 
                              : note.content}
                          </p>
                        )}
                        <div className="flex gap-1 pt-2 border-t border-gray-300">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(note)}
                            className="h-8 px-2"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(note.id)}
                            className="h-8 px-2 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {regularNotes.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Todas as Notas</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {regularNotes.map(note => (
                    <Card
                      key={note.id}
                      className="hover:shadow-lg transition-shadow"
                      style={{ backgroundColor: note.color }}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-base">{note.title}</CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => togglePin(note)}
                            className="h-8 w-8 p-0"
                          >
                            <PinOff className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {note.content && (
                          <p className="text-sm whitespace-pre-line text-gray-700 dark:text-gray-900 mb-3">
                            {note.content.length > 150 
                              ? note.content.substring(0, 150) + '...' 
                              : note.content}
                          </p>
                        )}
                        <div className="flex gap-1 pt-2 border-t border-gray-300">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(note)}
                            className="h-8 px-2"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(note.id)}
                            className="h-8 px-2 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <ToastContainer />
    </div>
  );
}
