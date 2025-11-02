'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Revision {
  id: string;
  topic_id: string;
  revision_number: number;
  scheduled_date: string;
  completed: boolean;
  topic: {
    name: string;
    subject: {
      name: string;
      color: string;
      weight: number;
    };
  };
}

interface RevisionTrackerProps {
  workspaceId: string;
}

export function RevisionTracker({ workspaceId }: RevisionTrackerProps) {
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRevisions();
  }, [workspaceId]);

  const loadRevisions = async () => {
    const supabase = createClient();
    
    // Buscar revisões dos próximos 7 dias
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const { data: revisionsData, error } = await supabase
      .from('topic_revisions')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('completed', false)
      .lte('scheduled_date', nextWeek.toISOString())
      .order('scheduled_date', { ascending: true })
      .limit(10);

    if (error) {
      console.error('Erro ao carregar revisões:', error);
      setLoading(false);
      return;
    }

    if (!revisionsData || revisionsData.length === 0) {
      setLoading(false);
      return;
    }

    // Buscar tópicos e matérias separadamente
    const topicIds = revisionsData.map(r => r.topic_id);
    const { data: topics } = await supabase
      .from('topics')
      .select('id, name, subject_id')
      .in('id', topicIds);

    const subjectIds = topics?.map(t => t.subject_id) || [];
    const { data: subjects } = await supabase
      .from('subjects')
      .select('id, name, color, weight')
      .in('id', subjectIds);

    // Combinar dados
    const enrichedRevisions = revisionsData.map(rev => {
      const topic = topics?.find(t => t.id === rev.topic_id);
      const subject = subjects?.find(s => s.id === topic?.subject_id);
      
      return {
        ...rev,
        topic: {
          name: topic?.name || 'Tópico desconhecido',
          subject: {
            name: subject?.name || 'Matéria desconhecida',
            color: subject?.color || '#3b82f6',
            weight: subject?.weight || 3
          }
        }
      };
    });

    setRevisions(enrichedRevisions as any);
    setLoading(false);
  };

  const markAsCompleted = async (revisionId: string) => {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('topic_revisions')
      .update({ 
        completed: true, 
        completed_at: new Date().toISOString() 
      })
      .eq('id', revisionId);

    if (!error) {
      loadRevisions();
    }
  };

  const getStatusColor = (scheduledDate: string) => {
    const today = new Date();
    const scheduled = new Date(scheduledDate);
    const diffDays = Math.ceil((scheduled.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'text-red-600 bg-red-50 dark:bg-red-900/20';
    if (diffDays === 0) return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20';
    return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
  };

  const getStatusIcon = (scheduledDate: string) => {
    const today = new Date();
    const scheduled = new Date(scheduledDate);
    const diffDays = Math.ceil((scheduled.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return <AlertCircle className="w-4 h-4" />;
    if (diffDays === 0) return <Clock className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Carregando revisões...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (revisions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Revisões Programadas
          </CardTitle>
          <CardDescription>
            Nenhuma revisão agendada para os próximos dias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Marque tópicos como concluídos para criar revisões automáticas baseadas na curva de Ebbinghaus
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Revisões Programadas
        </CardTitle>
        <CardDescription>
          Próximas revisões espaçadas (método Ebbinghaus)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {revisions.map((revision) => {
            const scheduledDate = new Date(revision.scheduled_date);
            const isOverdue = scheduledDate < new Date();
            
            return (
              <div
                key={revision.id}
                className={`p-3 rounded-lg border ${getStatusColor(revision.scheduled_date)}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(revision.scheduled_date)}
                      <h4 className="font-medium text-sm truncate">
                        {revision.topic.name}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge 
                        variant="secondary" 
                        className="text-xs"
                        style={{ 
                          backgroundColor: `${revision.topic.subject.color}20`,
                          color: revision.topic.subject.color 
                        }}
                      >
                        {revision.topic.subject.name}
                      </Badge>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        Revisão #{revision.revision_number}
                      </span>
                      <span className="text-xs font-medium">
                        {isOverdue ? 'Atrasada' : formatDistanceToNow(scheduledDate, { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600 h-8 px-3"
                    onClick={() => markAsCompleted(revision.id)}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
