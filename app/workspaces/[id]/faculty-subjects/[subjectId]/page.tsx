import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BookOpen, FileText, StickyNote, Plus, ClipboardCheck } from 'lucide-react';

export default async function SubjectPage({
  params,
}: {
  params: { id: string; subjectId: string };
}) {
  const supabase = await createClient();
  
  // Verificar se a matéria existe
  const { data: subject } = await supabase
    .from('subjects')
    .select('*')
    .eq('id', params.subjectId)
    .single();

  if (!subject) {
    notFound();
  }

  // Contar tópicos, leituras, notas e avaliações
  const { count: topicsCount } = await supabase
    .from('faculty_topics')
    .select('*', { count: 'exact', head: true })
    .eq('subject_id', params.subjectId);

  const { count: readingsCount } = await supabase
    .from('faculty_readings')
    .select('*', { count: 'exact', head: true })
    .eq('subject_id', params.subjectId);

  const { count: notesCount } = await supabase
    .from('faculty_notes')
    .select('*', { count: 'exact', head: true })
    .eq('subject_id', params.subjectId);

  const { count: assessmentsCount } = await supabase
    .from('faculty_assessments')
    .select('*', { count: 'exact', head: true })
    .eq('subject_id', params.subjectId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href={`/workspaces/${params.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>

        {/* Subject Info */}
        <div className="mb-8">
          <div 
            className="w-full h-32 rounded-lg mb-4"
            style={{ backgroundColor: subject.color + '20' }}
          />
          <h1 className="text-4xl font-bold mb-2">{subject.name}</h1>
          <p className="text-muted-foreground">
            Organize seus estudos com tópicos, leituras sugeridas e anotações
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tópicos</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{topicsCount || 0}</div>
              <p className="text-xs text-muted-foreground">Temas de aulas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leituras</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{readingsCount || 0}</div>
              <p className="text-xs text-muted-foreground">Livros e artigos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Anotações</CardTitle>
              <StickyNote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{notesCount || 0}</div>
              <p className="text-xs text-muted-foreground">Notas de estudo</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avaliações</CardTitle>
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assessmentsCount || 0}</div>
              <p className="text-xs text-muted-foreground">Provas e trabalhos</p>
            </CardContent>
          </Card>
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href={`/workspaces/${params.id}/faculty-subjects/${params.subjectId}/topics`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Tópicos</CardTitle>
                  <BookOpen className="w-5 h-5" style={{ color: subject.color }} />
                </div>
                <CardDescription>Temas das aulas</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Organize os tópicos abordados em cada aula da matéria
                </p>
                <Button className="w-full" style={{ backgroundColor: subject.color }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Gerenciar Tópicos
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href={`/workspaces/${params.id}/faculty-subjects/${params.subjectId}/readings`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Leituras Sugeridas</CardTitle>
                  <FileText className="w-5 h-5" style={{ color: subject.color }} />
                </div>
                <CardDescription>Livros e materiais</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Livros, artigos e materiais recomendados para a disciplina
                </p>
                <Button className="w-full" style={{ backgroundColor: subject.color }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Leituras
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href={`/workspaces/${params.id}/faculty-subjects/${params.subjectId}/notes`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Anotações</CardTitle>
                  <StickyNote className="w-5 h-5" style={{ color: subject.color }} />
                </div>
                <CardDescription>Notas de estudo</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Anote resumos, insights e pontos importantes
                </p>
                <Button className="w-full" style={{ backgroundColor: subject.color }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Anotação
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href={`/workspaces/${params.id}/faculty-subjects/${params.subjectId}/assessments`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Avaliações</CardTitle>
                  <ClipboardCheck className="w-5 h-5" style={{ color: subject.color }} />
                </div>
                <CardDescription>Provas e trabalhos</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Gerencie provas, trabalhos, projetos e acompanhe suas notas
                </p>
                <Button className="w-full" style={{ backgroundColor: subject.color }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Ver Avaliações
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
