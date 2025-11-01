import React from 'react';
import styled from 'styled-components';
import { BookOpen, Clock, TrendingUp } from 'lucide-react';

const CardContainer = styled.div`
  background: ${props => props.gradient 
    ? 'linear-gradient(135deg, #4A90E2 0%, #9C27B0 100%)'
    : '#FFFFFF'};
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.gradient ? 'transparent' : 'linear-gradient(90deg, #4A90E2 0%, #9C27B0 100%)'};
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const CardTitle = styled.h3`
  font-family: 'Poppins', sans-serif;
  font-size: 20px;
  font-weight: 600;
  color: ${props => props.light ? '#FFFFFF' : '#1F2937'};
  margin: 0;
`;

const CardIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.light ? 'rgba(255, 255, 255, 0.2)' : '#E3F2FD'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.light ? '#FFFFFF' : '#4A90E2'};
`;

const CardDescription = styled.p`
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: ${props => props.light ? 'rgba(255, 255, 255, 0.9)' : '#6B7280'};
  margin: 0 0 16px 0;
  line-height: 1.6;
`;

const CardStats = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: ${props => props.light ? 'rgba(255, 255, 255, 0.9)' : '#6B7280'};
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: ${props => props.light ? 'rgba(255, 255, 255, 0.2)' : '#F3E5F5'};
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 16px;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${props => props.light ? '#FFFFFF' : 'linear-gradient(90deg, #4A90E2 0%, #9C27B0 100%)'};
  border-radius: 4px;
  width: ${props => props.progress}%;
  transition: width 0.3s ease-in-out;
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ActionButton = styled.button`
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  background: ${props => props.light ? '#FFFFFF' : 'linear-gradient(135deg, #4A90E2 0%, #9C27B0 100%)'};
  color: ${props => props.light ? '#4A90E2' : '#FFFFFF'};
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  
  &:hover {
    opacity: 0.9;
    transform: scale(1.05);
  }
`;

const ProgressText = styled.span`
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.light ? '#FFFFFF' : '#1F2937'};
`;

export const StudyCard = ({ 
  title = "Study Session",
  description = "Complete your daily study goals",
  progress = 0,
  timeSpent = "0h",
  totalItems = 0,
  gradient = false,
  icon = "book",
  onAction = () => {},
  actionText = "Continue"
}) => {
  const IconComponent = icon === "book" ? BookOpen : icon === "clock" ? Clock : TrendingUp;
  const isLight = gradient;
  
  return (
    <CardContainer gradient={gradient}>
      <CardHeader>
        <CardTitle light={isLight}>{title}</CardTitle>
        <CardIcon light={isLight}>
          <IconComponent size={24} />
        </CardIcon>
      </CardHeader>
      
      <CardDescription light={isLight}>
        {description}
      </CardDescription>
      
      <CardStats>
        <StatItem light={isLight}>
          <Clock />
          <span>{timeSpent}</span>
        </StatItem>
        <StatItem light={isLight}>
          <BookOpen />
          <span>{totalItems} items</span>
        </StatItem>
      </CardStats>
      
      <ProgressBar light={isLight}>
        <ProgressFill progress={progress} light={isLight} />
      </ProgressBar>
      
      <CardFooter>
        <ProgressText light={isLight}>{progress}% Complete</ProgressText>
        <ActionButton light={isLight} onClick={onAction}>
          {actionText}
        </ActionButton>
      </CardFooter>
    </CardContainer>
  );
};

export default StudyCard;
