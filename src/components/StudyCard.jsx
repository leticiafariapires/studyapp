import React from 'react';
import styled from 'styled-components';

const Card = styled.div`
  background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 8px 24px rgba(2,6,23,0.6);
  color: #E6EEF8;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Title = styled.h3`
  margin: 0;
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  font-size: 18px;
`;

const Meta = styled.div`
  font-size: 14px;
  color: #B6C6D8;
`;

const ProgressBar = styled.div`
  height: 8px;
  background: #071021;
  border-radius: 8px;
  overflow: hidden;
`;

const Progress = styled.div`
  height: 100%;
  background: linear-gradient(90deg,#6C5CE7,#00B7FF);
  transition: width 300ms ease;
`;

export default function StudyCard({ title = 'Matemática', duration = '25 min', progress = 0.4 }) {
  return (
    <Card>
      <Title>{title}</Title>
      <Meta>{duration} • Progresso {(progress*100).toFixed(0)}%</Meta>
      <ProgressBar>
        <Progress style={{ width: `${Math.min(100, Math.max(0, progress*100))}%` }} />
      </ProgressBar>
    </Card>
  );
}