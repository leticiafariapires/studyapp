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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, CheckCircle2, XCircle, FileQuestion } from "lucide-react";

interface Question {
  id: string;
  statement: string;
  choices: string[];
  answer_correct: number | null;
  answer_user: number | null;
  difficulty: string | null;
  source: string | null;
  subject_id: string | null;
}

interface Subject {
  id: string;
  name: string;
  color: string;
}

export default function QuestionsPage() {
  const params = useParams();
  const workspaceId = params.id as string;
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    statement: "",
    choice1: "",
    choice2: "",
    choice3: "",
    choice4: "",
    choice5: "",
    answer_correct: "0",
    difficulty: "medium",
    source: "",
    subject_id: "",
  });

  useEffect(() => {
    loadData();
  }, [workspaceId]);

  const loadData = async () => {
    const supabase = createClient();
    
    const [questionsRes, subjectsRes] = await Promise.all([
      supabase
        .from('questions')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false }),
      supabase
        .from('subjects')
        .select('id, name, color')
        .eq('workspace_id', workspaceId)
        .order('name')
    ]);

    if (questionsRes.data) setQuestions(questionsRes.data);
    if (subjectsRes.data) setSubjects(subjectsRes.data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const choices = [
      formData.choice1,
      formData.choice2,
      formData.choice3,
      formData.choice4,
      formData.choice5,
    ].filter(c => c.trim() !== "");

    const supabase = createClient();
    await supabase
      .from('questions')
      .insert({
        workspace_id: workspaceId,
        statement: formData.statement,
        choices,
        answer_correct: parseInt(formData.answer_correct),
        difficulty: formData.difficulty,
        source: formData.source || null,
        subject_id: formData.subject_id || null,
        spent_seconds: 0,
        tags: [],
      });

    setDialogOpen(false);
    setFormData({
      statement: "",
      choice1: "",
      choice2: "",
      choice3: "",
      choice4: "",
      choice5: "",
      answer_correct: "0",
      difficulty: "medium",
      source: "",
      subject_id: "",
    });
    loadData();
  };

  const handleAnswer = async (questionId: string, answerIndex: number) => {
    const supabase = createClient();
    await supabase
      .from('questions')
      .update({ answer_user: answerIndex })
      .eq('id', questionId);
    
    loadData();
  };

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
            <h1 className="text-3xl font-bold">Questões</h1>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova Questão
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Nova Questão</DialogTitle>
                  <DialogDescription>
                    Adicione uma nova questão ao banco
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="statement">Enunciado</Label>
                    <Textarea
                      id="statement"
                      value={formData.statement}
                      onChange={(e) => setFormData({ ...formData, statement: e.target.value })}
                      required
                      rows={4}
                    />
                  </div>

                  {[1, 2, 3, 4, 5].map((num) => (
                    <div key={num} className="space-y-2">
                      <Label htmlFor={`choice${num}`}>Alternativa {num}</Label>
                      <Input
                        id={`choice${num}`}
                        value={formData[`choice${num}` as keyof typeof formData]}
                        onChange={(e) => setFormData({ ...formData, [`choice${num}`]: e.target.value })}
                        required={num <= 2}
                      />
                    </div>
                  ))}

                  <div className="space-y-2">
                    <Label htmlFor="answer_correct">Resposta Correta</Label>
                    <Select value={formData.answer_correct} onValueChange={(value) => setFormData({ ...formData, answer_correct: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Alternativa 1</SelectItem>
                        <SelectItem value="1">Alternativa 2</SelectItem>
                        <SelectItem value="2">Alternativa 3</SelectItem>
                        <SelectItem value="3">Alternativa 4</SelectItem>
                        <SelectItem value="4">Alternativa 5</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Dificuldade</Label>
                    <Select value={formData.difficulty} onValueChange={(value) => setFormData({ ...formData, difficulty: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Fácil</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="hard">Difícil</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject_id">Matéria (Opcional)</Label>
                    <Select value={formData.subject_id} onValueChange={(value) => setFormData({ ...formData, subject_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma matéria" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="source">Fonte (Opcional)</Label>
                    <Input
                      id="source"
                      value={formData.source}
                      onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                      placeholder="Ex: CESPE 2020"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Criar Questão</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {questions.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileQuestion className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                Nenhuma questão criada ainda
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Questão
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {questions.map((question, index) => (
              <Card key={question.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">Questão {index + 1}</CardTitle>
                    <div className="flex gap-2">
                      {question.difficulty && (
                        <Badge className={getDifficultyColor(question.difficulty)}>
                          {question.difficulty === 'easy' ? 'Fácil' : question.difficulty === 'medium' ? 'Média' : 'Difícil'}
                        </Badge>
                      )}
                      {question.answer_user !== null && (
                        <Badge variant={question.answer_user === question.answer_correct ? "default" : "destructive"}>
                          {question.answer_user === question.answer_correct ? (
                            <><CheckCircle2 className="w-3 h-3 mr-1" /> Correta</>
                          ) : (
                            <><XCircle className="w-3 h-3 mr-1" /> Errada</>
                          )}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm whitespace-pre-wrap">{question.statement}</p>
                  
                  <div className="space-y-2">
                    {question.choices.map((choice, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAnswer(question.id, idx)}
                        className={`w-full p-3 text-left rounded-md border-2 transition-colors ${
                          question.answer_user === idx
                            ? question.answer_correct === idx
                              ? 'border-green-500 bg-green-50'
                              : 'border-red-500 bg-red-50'
                            : question.answer_user !== null && question.answer_correct === idx
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="font-semibold">{String.fromCharCode(65 + idx)})</span> {choice}
                      </button>
                    ))}
                  </div>

                  {question.source && (
                    <p className="text-xs text-muted-foreground">
                      Fonte: {question.source}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
