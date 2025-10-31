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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Clock, Target, TrendingUp, Calendar, BookOpen, Timer as TimerIcon } from "lucide-react";
import { formatTime, calculateAccuracy } from "@/lib/utils";
import { Timer } from "@/components/timer/Timer";

interface StudySession {
  id: string;
  session_date: string;
  subject_name: string;
  duration_minutes: number;
  questions_total: number;
  questions_correct: number;
  questions_wrong: number;
  topics_studied: string;
  notes: string | null;
  created_at: string;
}

interface Subject {
  id: string;
  name: string;
  color: string;
}

interface Stats {
  totalHours: number;
  totalQuestions: number;
  totalCorrect: number;
  accuracy: number;
  sessionsCount: number;
  averageQuestionsPerSession: number;
}

export default function StudySessionsPage() {
  const params = useParams();
  const workspaceId = params.id as string;
  
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalHours: 0,
    totalQuestions: 0,
    totalCorrect: 0,
    accuracy: 0,
    sessionsCount: 0,
    averageQuestionsPerSession: 0,
  });
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    session_date: new Date().toISOString().split('T')[0],
    subject_name: "",
    duration_minutes: "",
    questions_total: "",
    questions_correct: "",
    topics_studied: "",
    notes: "",
  });
  const [useTimer, setUseTimer] = useState(false);

  useEffect(() => {
    loadData();
  }, [workspaceId]);

  const loadData = async () => {
    const supabase = createClient();
    
    // Load sessions
    const { data: sessionsData } = await supabase
      .from('sessions')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('session_type', 'study')
      .order('session_date', { ascending: false });

    // Load subjects
    const { data: subjectsData } = await supabase
      .from('subjects')
      .select('id, name, color')
      .eq('workspace_id', workspaceId)
      .order('name');

    if (sessionsData) {
      const formattedSessions = sessionsData.map((s: any) => ({
        id: s.id,
        session_date: s.start_at.split('T')[0],
        subject_name: s.metadata?.subject_name || 'Não especificado',
        duration_minutes: s.metadata?.duration_minutes || 0,
        questions_total: s.metadata?.questions_total || 0,
        questions_correct: s.metadata?.questions_correct || 0,
        questions_wrong: s.metadata?.questions_wrong || 0,
        topics_studied: s.metadata?.topics_studied || '',
        notes: s.metadata?.notes || null,
        created_at: s.created_at,
      }));
      setSessions(formattedSessions);
      calculateStats(formattedSessions);
    }

    if (subjectsData) setSubjects(subjectsData);
    setLoading(false);
  };

  const calculateStats = (sessions: StudySession[]) => {
    const totalMinutes = sessions.reduce((sum, s) => sum + s.duration_minutes, 0);
    const totalQuestions = sessions.reduce((sum, s) => sum + s.questions_total, 0);
    const totalCorrect = sessions.reduce((sum, s) => sum + s.questions_correct, 0);
    
    setStats({
      totalHours: totalMinutes / 60,
      totalQuestions,
      totalCorrect,
      accuracy: totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0,
      sessionsCount: sessions.length,
      averageQuestionsPerSession: sessions.length > 0 ? totalQuestions / sessions.length : 0,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const questions_wrong = parseInt(formData.questions_total) - parseInt(formData.questions_correct);
    
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    await supabase
      .from('sessions')
      .insert({
        workspace_id: workspaceId,
        user_id: user?.id,
        session_type: 'study',
        start_at: new Date(formData.session_date).toISOString(),
        end_at: new Date(formData.session_date).toISOString(),
        metadata: {
          subject_name: formData.subject_name,
          duration_minutes: parseInt(formData.duration_minutes),
          questions_total: parseInt(formData.questions_total),
          questions_correct: parseInt(formData.questions_correct),
          questions_wrong,
          topics_studied: formData.topics_studied,
          notes: formData.notes || null,
        },
      });

    setDialogOpen(false);
    setFormData({
      session_date: new Date().toISOString().split('T')[0],
      subject_name: "",
      duration_minutes: "",
      questions_total: "",
      questions_correct: "",
      topics_studied: "",
      notes: "",
    });
    loadData();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link href={`/workspaces/${workspaceId}`}>
              <Button variant="ghost">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Sessões de Estudo</h1>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Registrar Sessão
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Registrar Sessão de Estudo</DialogTitle>
                  <DialogDescription>
                    Registre o que você estudou hoje
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="session_date">Data</Label>
                    <Input
                      id="session_date"
                      type="date"
                      value={formData.session_date}
                      onChange={(e) => setFormData({ ...formData, session_date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject_name">Matéria</Label>
                    {subjects.length > 0 ? (
                      <Select 
                        value={formData.subject_name} 
                        onValueChange={(value) => setFormData({ ...formData, subject_name: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma matéria" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem key={subject.id} value={subject.name}>
                              {subject.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id="subject_name"
                        value={formData.subject_name}
                        onChange={(e) => setFormData({ ...formData, subject_name: e.target.value })}
                        placeholder="Ex: Português"
                        required
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="duration_minutes">Tempo de Estudo (minutos)</Label>
                      <div className="flex items-center gap-2">
                        <TimerIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Usar temporizador</span>
                        <input
                          type="checkbox"
                          checked={useTimer}
                          onChange={(e) => setUseTimer(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </div>
                    </div>
                    
                    {useTimer ? (
                      <Timer 
                        onTimeUpdate={(minutes) => {
                          setFormData(prev => ({ 
                            ...prev, 
                            duration_minutes: minutes.toString() 
                          }));
                        }} 
                      />
                    ) : (
                      <Input
                        id="duration_minutes"
                        type="number"
                        value={formData.duration_minutes}
                        onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                        placeholder="Ex: 120"
                        required
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="questions_total">Questões Resolvidas</Label>
                      <Input
                        id="questions_total"
                        type="number"
                        value={formData.questions_total}
                        onChange={(e) => setFormData({ ...formData, questions_total: e.target.value })}
                        placeholder="Ex: 50"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="questions_correct">Questões Corretas</Label>
                      <Input
                        id="questions_correct"
                        type="number"
                        value={formData.questions_correct}
                        onChange={(e) => setFormData({ ...formData, questions_correct: e.target.value })}
                        placeholder="Ex: 40"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="topics_studied">Tópicos Estudados</Label>
                    <Input
                      id="topics_studied"
                      value={formData.topics_studied}
                      onChange={(e) => setFormData({ ...formData, topics_studied: e.target.value })}
                      placeholder="Ex: Concordância verbal, Regência"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Dificuldades, pontos a revisar, etc."
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Registrar Sessão</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Horas</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalHours.toFixed(1)}h</div>
              <p className="text-xs text-muted-foreground">
                {stats.sessionsCount} sessões
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Questões Resolvidas</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalQuestions}</div>
              <p className="text-xs text-muted-foreground">
                Média: {Math.round(stats.averageQuestionsPerSession)} por sessão
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Acerto</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.accuracy.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalCorrect} de {stats.totalQuestions} corretas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Última Sessão</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {sessions.length > 0 ? new Date(sessions[0].session_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : '-'}
              </div>
              <p className="text-xs text-muted-foreground">
                {sessions.length > 0 ? sessions[0].subject_name : 'Nenhuma sessão'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sessions List */}
        {sessions.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                Nenhuma sessão registrada ainda
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Registrar Primeira Sessão
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Histórico de Sessões</h2>
            {sessions.map((session) => {
              const accuracy = session.questions_total > 0 
                ? ((session.questions_correct / session.questions_total) * 100).toFixed(1)
                : '0';
              
              return (
                <Card key={session.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{session.subject_name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {new Date(session.session_date).toLocaleDateString('pt-BR', {
                            weekday: 'long',
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <Badge 
                        variant={parseFloat(accuracy) >= 70 ? "default" : parseFloat(accuracy) >= 50 ? "secondary" : "destructive"}
                      >
                        {accuracy}% de acerto
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Tempo</p>
                        <p className="font-semibold">{session.duration_minutes} min</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Questões</p>
                        <p className="font-semibold">{session.questions_total}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Acertos</p>
                        <p className="font-semibold text-green-600">{session.questions_correct}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Erros</p>
                        <p className="font-semibold text-red-600">{session.questions_wrong}</p>
                      </div>
                    </div>

                    {session.topics_studied && (
                      <div className="mb-2">
                        <p className="text-xs text-muted-foreground mb-1">Tópicos:</p>
                        <p className="text-sm">{session.topics_studied}</p>
                      </div>
                    )}

                    {session.notes && (
                      <div className="mt-2 p-3 bg-muted rounded-md">
                        <p className="text-xs text-muted-foreground mb-1">Observações:</p>
                        <p className="text-sm">{session.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
