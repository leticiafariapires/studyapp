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
import { ArrowLeft, Plus, Pencil, Trash2, Calendar, Cake, Stethoscope, FlaskConical, Briefcase, GraduationCap, Heart, Plane, Users, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: string;
  name: string;
  color: string;
  icon: string | null;
  created_at: string;
}

const predefinedEventCategories = [
  { name: 'Aniversário', color: '#ec4899', icon: '🎂', lucideIcon: Cake },
  { name: 'Consulta Médica', color: '#ef4444', icon: '🏥', lucideIcon: Stethoscope },
  { name: 'Exame', color: '#f97316', icon: '📋', lucideIcon: FlaskConical },
  { name: 'Trabalho', color: '#3b82f6', icon: '💼', lucideIcon: Briefcase },
  { name: 'Estudos', color: '#8b5cf6', icon: '📚', lucideIcon: GraduationCap },
  { name: 'Pessoal', color: '#10b981', icon: '💚', lucideIcon: Heart },
  { name: 'Viagem', color: '#06b6d4', icon: '✈️', lucideIcon: Plane },
  { name: 'Reunião', color: '#6366f1', icon: '👥', lucideIcon: Users },
  { name: 'Importante', color: '#f59e0b', icon: '⭐', lucideIcon: Star },
];

const colorPalette = [
  { name: 'Azul', value: '#3b82f6' },
  { name: 'Verde', value: '#10b981' },
  { name: 'Roxo', value: '#8b5cf6' },
  { name: 'Rosa', value: '#ec4899' },
  { name: 'Amarelo', value: '#f59e0b' },
  { name: 'Vermelho', value: '#ef4444' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Laranja', value: '#f97316' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Lime', value: '#84cc16' },
];

export default function EventCategoriesPage() {
  const params = useParams();
  const workspaceId = params.id as string;
  const { showToast, ToastContainer } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    color: "#3b82f6",
    icon: ""
  });

  useEffect(() => {
    loadCategories();
  }, [workspaceId]);

  const loadCategories = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('planner_categories')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('name');

    if (data) setCategories(data);
    setLoading(false);
  };

  const handleQuickAdd = async (category: typeof predefinedEventCategories[0]) => {
    const supabase = createClient();

    // Verificar se já existe
    const existing = categories.find(c => c.name.toLowerCase() === category.name.toLowerCase());
    if (existing) {
      showToast('Esta categoria já existe!', 'warning');
      return;
    }

    await supabase
      .from('planner_categories')
      .insert({
        workspace_id: workspaceId,
        name: category.name,
        color: category.color,
        icon: category.icon
      });

    showToast(`Categoria "${category.name}" adicionada!`, 'success');
    loadCategories();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();

    const categoryData = {
      workspace_id: workspaceId,
      name: formData.name,
      color: formData.color,
      icon: formData.icon || null
    };

    if (editingCategory) {
      await supabase
        .from('planner_categories')
        .update(categoryData)
        .eq('id', editingCategory.id);
      showToast('Categoria atualizada com sucesso!', 'success');
    } else {
      await supabase
        .from('planner_categories')
        .insert(categoryData);
      showToast('Categoria criada com sucesso!', 'success');
    }

    setDialogOpen(false);
    setEditingCategory(null);
    setFormData({ name: "", color: "#3b82f6", icon: "" });
    loadCategories();
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      color: category.color,
      icon: category.icon || ""
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta categoria? Os eventos não serão excluídos, apenas desvinculados.")) return;

    const supabase = createClient();
    await supabase.from('planner_categories').delete().eq('id', id);
    showToast('Categoria excluída com sucesso!', 'success');
    loadCategories();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Link href={`/workspaces/${workspaceId}/planner/calendar`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Calendário
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Categorias de Eventos</h1>
              <p className="text-muted-foreground text-sm">
                Organize seus eventos com categorias personalizadas
              </p>
            </div>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                onClick={() => {
                  setEditingCategory(null);
                  setFormData({ name: "", color: "#3b82f6", icon: "" });
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Categoria
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? "Editar Categoria" : "Nova Categoria"}
                  </DialogTitle>
                  <DialogDescription>
                    Crie uma categoria personalizada para seus eventos
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Dentista, Academia, Compras"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Cor</Label>
                    <div className="grid grid-cols-5 gap-2">
                      {colorPalette.map(color => (
                        <button
                          key={color.value}
                          type="button"
                          className={`w-full h-12 rounded-lg border-2 transition-all hover:scale-105 ${
                            formData.color === color.value 
                              ? 'border-primary ring-2 ring-primary ring-offset-2' 
                              : 'border-gray-200 dark:border-gray-700'
                          }`}
                          style={{ backgroundColor: color.value }}
                          onClick={() => setFormData({ ...formData, color: color.value })}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="icon">Emoji (opcional)</Label>
                    <Input
                      id="icon"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      placeholder="Ex: 🦷, 🏋️, 🛒"
                      maxLength={2}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingCategory ? "Salvar" : "Criar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Predefined Categories */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Categorias Sugeridas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {predefinedEventCategories.map(category => {
                const Icon = category.lucideIcon;
                const exists = categories.some(c => c.name.toLowerCase() === category.name.toLowerCase());
                
                return (
                  <Button
                    key={category.name}
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2"
                    onClick={() => handleQuickAdd(category)}
                    disabled={exists}
                    style={{
                      borderColor: exists ? category.color : undefined,
                      backgroundColor: exists ? category.color + '10' : undefined
                    }}
                  >
                    <span className="text-2xl">{category.icon}</span>
                    <span className="text-sm font-medium">{category.name}</span>
                    {exists && (
                      <span className="text-xs text-muted-foreground">Adicionada ✓</span>
                    )}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* User Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Minhas Categorias ({categories.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Nenhuma categoria criada ainda</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Use as categorias sugeridas acima ou crie uma personalizada
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map(category => (
                  <Card key={category.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div
                            className="w-4 h-4 rounded-full flex-shrink-0"
                            style={{ backgroundColor: category.color }}
                          />
                          {category.icon && (
                            <span className="text-xl flex-shrink-0">{category.icon}</span>
                          )}
                          <CardTitle className="text-base truncate">{category.name}</CardTitle>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(category)}
                            className="h-8 w-8 p-0"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(category.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div
                        className="px-3 py-1.5 rounded-full text-sm font-medium inline-block"
                        style={{
                          backgroundColor: category.color + '20',
                          color: category.color
                        }}
                      >
                        {category.color}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <ToastContainer />
    </div>
  );
}
