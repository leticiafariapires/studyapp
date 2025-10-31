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
import { ArrowLeft, Plus, Activity, Clock, Ruler } from "lucide-react";
import { formatPace, formatTime } from "@/lib/utils";

interface Training {
  id: string;
  training_date: string;
  kind: string;
  distance_m: number;
  time_s: number;
  modality: string;
  pushups: number;
  situps: number;
  bar_time_s: number;
  jump_cm: number;
  notes: string | null;
}

export default function TrainingsPage() {
  const params = useParams();
  const workspaceId = params.id as string;
  
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    training_date: new Date().toISOString().split('T')[0],
    kind: "corrida",
    distance_m: "",
    time_minutes: "",
    time_seconds: "",
    modality: "",
    pushups: "",
    situps: "",
    bar_time_s: "",
    jump_cm: "",
    notes: "",
  });

  useEffect(() => {
    loadTrainings();
  }, [workspaceId]);

  const loadTrainings = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('taf_trainings')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('training_date', { ascending: false });

    if (data) setTrainings(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const time_s = parseInt(formData.time_minutes || "0") * 60 + parseInt(formData.time_seconds || "0");
    
    const supabase = createClient();
    await supabase
      .from('taf_trainings')
      .insert({
        workspace_id: workspaceId,
        training_date: formData.training_date,
        kind: formData.kind,
        distance_m: parseInt(formData.distance_m) || 0,
        time_s,
        modality: formData.modality || formData.kind,
        pushups: parseInt(formData.pushups) || 0,
        situps: parseInt(formData.situps) || 0,
        bar_time_s: parseInt(formData.bar_time_s) || 0,
        jump_cm: parseInt(formData.jump_cm) || 0,
        notes: formData.notes || null,
      });

    setDialogOpen(false);
    setFormData({
      training_date: new Date().toISOString().split('T')[0],
      kind: "corrida",
      distance_m: "",
      time_minutes: "",
      time_seconds: "",
      modality: "",
      pushups: "",
      situps: "",
      bar_time_s: "",
      jump_cm: "",
      notes: "",
    });
    loadTrainings();
  };

  const getKindLabel = (kind: string) => {
    const labels: { [key: string]: string } = {
      'caminhada': 'Caminhada',
      'corrida': 'Corrida',
      'circuito': 'Circuito',
      'forca': 'Força',
    };
    return labels[kind] || kind;
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
            <h1 className="text-3xl font-bold">Treinos TAF</h1>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Treino
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Novo Treino</DialogTitle>
                  <DialogDescription>
                    Registre seu treino de TAF
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="training_date">Data</Label>
                    <Input
                      id="training_date"
                      type="date"
                      value={formData.training_date}
                      onChange={(e) => setFormData({ ...formData, training_date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="kind">Tipo de Treino</Label>
                    <Select value={formData.kind} onValueChange={(value) => setFormData({ ...formData, kind: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="caminhada">Caminhada</SelectItem>
                        <SelectItem value="corrida">Corrida</SelectItem>
                        <SelectItem value="circuito">Circuito</SelectItem>
                        <SelectItem value="forca">Força</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(formData.kind === 'caminhada' || formData.kind === 'corrida') && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="distance_m">Distância (metros)</Label>
                        <Input
                          id="distance_m"
                          type="number"
                          value={formData.distance_m}
                          onChange={(e) => setFormData({ ...formData, distance_m: e.target.value })}
                          placeholder="Ex: 5000"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="time_minutes">Tempo (minutos)</Label>
                          <Input
                            id="time_minutes"
                            type="number"
                            value={formData.time_minutes}
                            onChange={(e) => setFormData({ ...formData, time_minutes: e.target.value })}
                            placeholder="30"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="time_seconds">Tempo (segundos)</Label>
                          <Input
                            id="time_seconds"
                            type="number"
                            value={formData.time_seconds}
                            onChange={(e) => setFormData({ ...formData, time_seconds: e.target.value })}
                            placeholder="45"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {formData.kind === 'forca' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="pushups">Flexões</Label>
                        <Input
                          id="pushups"
                          type="number"
                          value={formData.pushups}
                          onChange={(e) => setFormData({ ...formData, pushups: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="situps">Abdominais</Label>
                        <Input
                          id="situps"
                          type="number"
                          value={formData.situps}
                          onChange={(e) => setFormData({ ...formData, situps: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bar_time_s">Barra (segundos)</Label>
                        <Input
                          id="bar_time_s"
                          type="number"
                          value={formData.bar_time_s}
                          onChange={(e) => setFormData({ ...formData, bar_time_s: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="jump_cm">Salto (cm)</Label>
                        <Input
                          id="jump_cm"
                          type="number"
                          value={formData.jump_cm}
                          onChange={(e) => setFormData({ ...formData, jump_cm: e.target.value })}
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Registrar Treino</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {trainings.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                Nenhum treino registrado ainda
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Registrar Primeiro Treino
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {trainings.map((training) => (
              <Card key={training.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{getKindLabel(training.kind)}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {new Date(training.training_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {training.distance_m > 0 && (
                      <div className="flex items-center gap-2">
                        <Ruler className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Distância</p>
                          <p className="font-semibold">{training.distance_m}m</p>
                        </div>
                      </div>
                    )}
                    {training.time_s > 0 && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Tempo</p>
                          <p className="font-semibold">{formatTime(training.time_s)}</p>
                        </div>
                      </div>
                    )}
                    {training.distance_m > 0 && training.time_s > 0 && (
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Pace</p>
                          <p className="font-semibold">{formatPace(training.distance_m, training.time_s)}</p>
                        </div>
                      </div>
                    )}
                    {training.pushups > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground">Flexões</p>
                        <p className="font-semibold">{training.pushups}</p>
                      </div>
                    )}
                    {training.situps > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground">Abdominais</p>
                        <p className="font-semibold">{training.situps}</p>
                      </div>
                    )}
                    {training.bar_time_s > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground">Barra</p>
                        <p className="font-semibold">{training.bar_time_s}s</p>
                      </div>
                    )}
                    {training.jump_cm > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground">Salto</p>
                        <p className="font-semibold">{training.jump_cm}cm</p>
                      </div>
                    )}
                  </div>
                  {training.notes && (
                    <p className="text-sm text-muted-foreground mt-4">
                      {training.notes}
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
