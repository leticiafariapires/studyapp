"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, TrendingUp, TrendingDown, Award, Target, Clock, Calendar } from "lucide-react";
import { TAFEvolution } from "@/components/taf-evolution";

interface SubjectStats {
  name: string;
  totalTime: number;
  totalQuestions: number;
  correctQuestions: number;
  accuracy: number;
  sessionsCount: number;
  lastStudy: string | null;
}

interface PeriodStats {
  period: string;
  totalQuestions: number;
  correctQuestions: number;
  accuracy: number;
  totalMinutes: number;
}

export default function ReportsPage() {
  const params = useParams();
  const workspaceId = params.id as string;
  
  const [workspaceType, setWorkspaceType] = useState<string>('');
  const [subjectStats, setSubjectStats] = useState<SubjectStats[]>([]);
  const [periodStats, setPeriodStats] = useState<PeriodStats[]>([]);
  const [tafTrainings, setTafTrainings] = useState<any[]>([]);
  const [exerciseTypes, setExerciseTypes] = useState<string[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState("30");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, [workspaceId, selectedPeriod]);

  const loadReports = async () => {
    const supabase = createClient();
    
    // Load workspace to check type
    const { data: workspace } = await supabase
      .from('workspaces')
      .select('type')
      .eq('id', workspaceId)
      .single();
    
    if (workspace) {
      setWorkspaceType(workspace.type);
    }
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(selectedPeriod));
    
    // Load TAF data if it's a TAF workspace
    if (workspace?.type === 'taf') {
      const { data: trainings } = await supabase
        .from('taf_trainings')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('training_date', { ascending: true });
      
      if (trainings) {
        setTafTrainings(trainings);
        
        // Get unique exercise types
        const types = Array.from(new Set(trainings.map(t => t.exercise_type)));
        setExerciseTypes(types);
      }
      
      setLoading(false);
      return;
    }

    const { data: sessions } = await supabase
      .from('sessions')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('session_type', 'study')
      .gte('start_at', startDate.toISOString())
      .order('start_at', { ascending: true });

    if (sessions) {
      calculateSubjectStats(sessions);
      calculatePeriodStats(sessions);
    }

    setLoading(false);
  };

  const calculateSubjectStats = (sessions: any[]) => {
    const subjectMap = new Map<string, any>();

    sessions.forEach((session: any) => {
      const subjectName = session.metadata?.subject_name || 'Não especificado';
      
      if (!subjectMap.has(subjectName)) {
        subjectMap.set(subjectName, {
          name: subjectName,
          totalTime: 0,
          totalQuestions: 0,
          correctQuestions: 0,
          sessionsCount: 0,
          lastStudy: null,
        });
      }

      const stats = subjectMap.get(subjectName);
      stats.totalTime += session.metadata?.duration_minutes || 0;
      stats.totalQuestions += session.metadata?.questions_total || 0;
      stats.correctQuestions += session.metadata?.questions_correct || 0;
      stats.sessionsCount += 1;
      stats.lastStudy = session.start_at;
    });

    const statsArray: SubjectStats[] = Array.from(subjectMap.values()).map(stat => ({
      ...stat,
      accuracy: stat.totalQuestions > 0 ? (stat.correctQuestions / stat.totalQuestions) * 100 : 0,
    })).sort((a, b) => b.totalQuestions - a.totalQuestions);

    setSubjectStats(statsArray);
  };

  const calculatePeriodStats = (sessions: any[]) => {
    // Group by week
    const weekMap = new Map<string, any>();

    sessions.forEach((session: any) => {
      const date = new Date(session.start_at);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!weekMap.has(weekKey)) {
        weekMap.set(weekKey, {
          period: weekKey,
          totalQuestions: 0,
          correctQuestions: 0,
          totalMinutes: 0,
        });
      }

      const stats = weekMap.get(weekKey);
      stats.totalQuestions += session.metadata?.questions_total || 0;
      stats.correctQuestions += session.metadata?.questions_correct || 0;
      stats.totalMinutes += session.metadata?.duration_minutes || 0;
    });

    const statsArray: PeriodStats[] = Array.from(weekMap.values()).map(stat => ({
      ...stat,
      accuracy: stat.totalQuestions > 0 ? (stat.correctQuestions / stat.totalQuestions) * 100 : 0,
    })).sort((a, b) => a.period.localeCompare(b.period));

    setPeriodStats(statsArray);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const bestSubject = subjectStats.length > 0 
    ? subjectStats.reduce((best, curr) => curr.accuracy > best.accuracy ? curr : best)
    : null;

  const worstSubject = subjectStats.length > 0
    ? subjectStats.reduce((worst, curr) => curr.accuracy < worst.accuracy ? curr : worst)
    : null;

  const totalQuestions = subjectStats.reduce((sum, s) => sum + s.totalQuestions, 0);
  const totalCorrect = subjectStats.reduce((sum, s) => sum + s.correctQuestions, 0);
  const overallAccuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

  // Render TAF Evolution
  if (workspaceType === 'taf') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href={`/workspaces/${workspaceId}`}>
              <Button variant="ghost">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Evolução TAF</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Acompanhe seu progresso nos exercícios
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : exerciseTypes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Nenhum treino registrado ainda. Comece a registrar seus treinos para ver a evolução!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {exerciseTypes.map(exerciseType => (
              <TAFEvolution 
                key={exerciseType}
                trainings={tafTrainings}
                exerciseType={exerciseType}
              />
            ))}
          </div>
        )}
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
            <h1 className="text-3xl font-bold">Relatórios e Análises</h1>
          </div>

          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
              <SelectItem value="365">Último ano</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Overview Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Award className="w-4 h-4 text-green-600" />
                Melhor Matéria
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bestSubject ? (
                <>
                  <p className="text-lg font-bold">{bestSubject.name}</p>
                  <p className="text-2xl font-bold text-green-600">{bestSubject.accuracy.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {bestSubject.correctQuestions} de {bestSubject.totalQuestions} questões
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Sem dados</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="w-4 h-4 text-orange-600" />
                Precisa Melhorar
              </CardTitle>
            </CardHeader>
            <CardContent>
              {worstSubject && worstSubject !== bestSubject ? (
                <>
                  <p className="text-lg font-bold">{worstSubject.name}</p>
                  <p className="text-2xl font-bold text-orange-600">{worstSubject.accuracy.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {worstSubject.correctQuestions} de {worstSubject.totalQuestions} questões
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Sem dados</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Média Geral
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">{overallAccuracy.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground mt-1">
                {totalCorrect} de {totalQuestions} questões corretas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Performance by Subject */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Desempenho por Matéria</CardTitle>
            <CardDescription>
              Análise detalhada das últimas {selectedPeriod} dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            {subjectStats.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum dado disponível para o período selecionado
              </p>
            ) : (
              <div className="space-y-4">
                {subjectStats.map((subject) => (
                  <div key={subject.name} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{subject.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {subject.sessionsCount} sessões • {subject.totalTime} minutos
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{subject.accuracy.toFixed(1)}%</p>
                        <p className="text-xs text-muted-foreground">
                          {subject.correctQuestions}/{subject.totalQuestions}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div
                        className={`h-2.5 rounded-full ${
                          subject.accuracy >= 70
                            ? 'bg-green-600'
                            : subject.accuracy >= 50
                            ? 'bg-yellow-600'
                            : 'bg-red-600'
                        }`}
                        style={{ width: `${subject.accuracy}%` }}
                      ></div>
                    </div>

                    {subject.lastStudy && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Última sessão: {new Date(subject.lastStudy).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Period Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução Semanal</CardTitle>
            <CardDescription>
              Progresso ao longo das semanas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {periodStats.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum dado disponível
              </p>
            ) : (
              <div className="space-y-3">
                {periodStats.map((period, index) => {
                  const weekStart = new Date(period.period);
                  const weekEnd = new Date(weekStart);
                  weekEnd.setDate(weekEnd.getDate() + 6);

                  return (
                    <div key={period.period} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">
                          Semana {index + 1}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {weekStart.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} -{' '}
                          {weekEnd.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Questões</p>
                        <p className="font-semibold">{period.totalQuestions}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Tempo</p>
                        <p className="font-semibold">{Math.round(period.totalMinutes / 60)}h</p>
                      </div>
                      <div className="text-center min-w-[80px]">
                        <p className="text-sm text-muted-foreground">Acerto</p>
                        <p className={`font-bold text-lg ${
                          period.accuracy >= 70 ? 'text-green-600' :
                          period.accuracy >= 50 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {period.accuracy.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
