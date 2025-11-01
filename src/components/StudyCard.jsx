import React from 'react';
import styled from 'styled-components';

/**
 * StudyCard Component
 * A reusable card component following Dribbble-style modern aesthetics
 * Used to display study sessions, subjects, or progress items
 */

const CardContainer = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 280px;
  
  &:hover {
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);
    transform: translateY(-2px);
  }

  &:focus-within {
    outline: 2px solid #4F46E5;
    outline-offset: 2px;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const CardTitle = styled.h3`
  font-family: 'Poppins', sans-serif;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin: 0;
  line-height: 1.2;
`;

const CardBadge = styled.span`
  background: ${props => props.color || '#4F46E5'};
  color: #ffffff;
  padding: 4px 12px;
  border-radius: 12px;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 500;
`;

const CardContent = styled.div`
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #6B7280;
  line-height: 1.7;
  margin-bottom: 16px;
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #E5E7EB;
`;

const CardStat = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StatLabel = styled.span`
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: #9CA3AF;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatValue = styled.span`
  font-family: 'Inter', sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #F3F4F6;
  border-radius: 4px;
  overflow: hidden;
  margin: 12px 0;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #4F46E5 0%, #818CF8 100%);
  width: ${props => props.progress || 0}%;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
`;

const StudyCard = ({ 
  title, 
  description, 
  badge, 
  badgeColor, 
  stats = [], 
  progress,
  onClick 
}) => {
  return (
    <CardContainer onClick={onClick} role="article" tabIndex={0}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {badge && <CardBadge color={badgeColor}>{badge}</CardBadge>}
      </CardHeader>
      
      {description && (
        <CardContent>{description}</CardContent>
      )}
      
      {progress !== undefined && (
        <ProgressBar role="progressbar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100">
          <ProgressFill progress={progress} />
        </ProgressBar>
      )}
      
      {stats && stats.length > 0 && (
        <CardFooter>
          {stats.map((stat, index) => (
            <CardStat key={index}>
              <StatLabel>{stat.label}</StatLabel>
              <StatValue>{stat.value}</StatValue>
            </CardStat>
          ))}
        </CardFooter>
      )}
    </CardContainer>
  );
};

export default StudyCard;
