'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Target, Award } from 'lucide-react';

interface Training {
  id: string;
  training_date: string;
  exercise_type: string;
  distance_m?: number;
  time_s?: number;
  repetitions?: number;
  weight_kg?: number;
}

interface TAFEvolutionProps {
  trainings: Training[];
  exerciseType: string;
}

export function TAFEvolution({ trainings, exerciseType }: TAFEvolutionProps) {
  // Filtrar treinos do tipo específico e ordenar por data
  const filtered = trainings
    .filter(t => t.exercise_type === exerciseType)
    .sort((a, b) => new Date(a.training_date).getTime() - new Date(b.training_date).getTime());

  if (filtered.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{exerciseType}</CardTitle>
          <CardDescription>Registre pelo menos 2 treinos para ver a evolução</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Calcular evolução
  const first = filtered[0];
  const last = filtered[filtered.length - 1];
  const evolution = calculateEvolution(first, last, exerciseType);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{exerciseType}</CardTitle>
            <CardDescription>{filtered.length} treinos registrados</CardDescription>
          </div>
          {evolution.icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Evolução Principal */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Evolução Total</p>
              <p className="text-2xl font-bold">{evolution.text}</p>
            </div>
            <Badge variant={evolution.isPositive ? "default" : "destructive"} className="text-lg px-4 py-2">
              {evolution.isPositive ? '+' : ''}{evolution.percentage}%
            </Badge>
          </div>

          {/* Melhor e Pior */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border bg-green-50 dark:bg-green-900/20">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-4 h-4 text-green-600" />
                <p className="text-xs font-medium text-green-700 dark:text-green-400">Melhor</p>
              </div>
              <p className="text-lg font-bold text-green-900 dark:text-green-100">
                {formatValue(getBest(filtered, exerciseType), exerciseType)}
              </p>
            </div>
            <div className="p-3 rounded-lg border bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-gray-600" />
                <p className="text-xs font-medium text-gray-700 dark:text-gray-400">Último</p>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {formatValue(last, exerciseType)}
              </p>
            </div>
          </div>

          {/* Mini Gráfico */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Progresso</p>
            <div className="flex items-end gap-1 h-20">
              {filtered.slice(-10).map((training, index) => {
                const value = getValue(training, exerciseType);
                const maxValue = Math.max(...filtered.map(t => getValue(t, exerciseType)));
                const height = (value / maxValue) * 100;
                
                return (
                  <div
                    key={training.id}
                    className="flex-1 bg-blue-500 rounded-t hover:bg-blue-600 transition-all cursor-pointer"
                    style={{ height: `${height}%` }}
                    title={`${formatValue(training, exerciseType)} - ${new Date(training.training_date).toLocaleDateString('pt-BR')}`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Funções auxiliares
function getValue(training: Training, exerciseType: string): number {
  if (!training || !exerciseType) return 0;
  
  if (exerciseType.includes('Corrida') || exerciseType.includes('Cooper')) {
    return training.distance_m || 0;
  }
  if (exerciseType.includes('Flexão') || exerciseType.includes('Abdominal') || exerciseType.includes('Barra')) {
    return training.repetitions || 0;
  }
  return training.time_s || 0;
}

function formatValue(training: Training, exerciseType: string): string {
  if (!training || !exerciseType) return '0';
  
  if (exerciseType.includes('Corrida') || exerciseType.includes('Cooper')) {
    const km = (training.distance_m || 0) / 1000;
    return `${km.toFixed(2)} km`;
  }
  if (exerciseType.includes('Flexão') || exerciseType.includes('Abdominal') || exerciseType.includes('Barra')) {
    return `${training.repetitions || 0} reps`;
  }
  const min = Math.floor((training.time_s || 0) / 60);
  const sec = (training.time_s || 0) % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

function getBest(trainings: Training[], exerciseType: string): Training {
  return trainings.reduce((best, current) => {
    const bestValue = getValue(best, exerciseType);
    const currentValue = getValue(current, exerciseType);
    
    // Para tempo, menor é melhor; para distância/reps, maior é melhor
    if (exerciseType.includes('Corrida') || exerciseType.includes('Flexão') || exerciseType.includes('Abdominal') || exerciseType.includes('Barra') || exerciseType.includes('Cooper')) {
      return currentValue > bestValue ? current : best;
    }
    return currentValue < bestValue ? current : best;
  });
}

function calculateEvolution(first: Training, last: Training, exerciseType: string) {
  if (!first || !last || !exerciseType) {
    return {
      text: '0',
      percentage: 0,
      isPositive: false,
      icon: <Minus className="w-8 h-8 text-gray-600" />,
    };
  }
  
  const firstValue = getValue(first, exerciseType);
  const lastValue = getValue(last, exerciseType);
  
  if (firstValue === 0) {
    return {
      text: formatValue(last, exerciseType),
      percentage: 0,
      isPositive: false,
      icon: <Minus className="w-8 h-8 text-gray-600" />,
    };
  }
  
  const diff = lastValue - firstValue;
  const percentage = ((diff / firstValue) * 100).toFixed(1);
  
  const isPositive = exerciseType.includes('Corrida') || exerciseType.includes('Flexão') || exerciseType.includes('Abdominal') || exerciseType.includes('Barra') || exerciseType.includes('Cooper')
    ? diff > 0  // Para estes, mais é melhor
    : diff < 0; // Para tempo, menos é melhor
  
  const icon = isPositive 
    ? <TrendingUp className="w-8 h-8 text-green-600" />
    : diff === 0
    ? <Minus className="w-8 h-8 text-gray-600" />
    : <TrendingDown className="w-8 h-8 text-red-600" />;
  
  return {
    text: formatValue(last, exerciseType),
    percentage: Math.abs(parseFloat(percentage)),
    isPositive,
    icon,
  };
}
