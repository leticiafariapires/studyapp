import React from 'react';
import styled from 'styled-components';

/**
 * StudyCard Component
 * A reusable card component following Dribbble-style modern aesthetics
 * Used to display study sessions, subjects, or progress items
 */

const Card = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 280px;
  cursor: pointer;
  
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
  align-items: center;
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
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 4px 12px;
  border-radius: 12px;
  background: ${props => {
    switch (props.status) {
      case 'completed':
        return '#D1FAE5';
      case 'in-progress':
        return '#FEF3C7';
      case 'pending':
        return '#E0E7FF';
      default:
        return '#F3F4F6';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'completed':
        return '#065F46';
      case 'in-progress':
        return '#92400E';
      case 'pending':
        return '#3730A3';
      default:
        return '#374151';
    }
  }};
`;

const CardDescription = styled.p`
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  color: #6B7280;
  margin: 0 0 16px 0;
  line-height: 1.5;
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #E5E7EB;
`;

const ProgressBar = styled.div`
  flex: 1;
  height: 6px;
  background: #E5E7EB;
  border-radius: 3px;
  overflow: hidden;
  margin-right: 12px;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #4F46E5 0%, #6366F1 100%);
  width: ${props => props.progress || 0}%;
  border-radius: 3px;
  transition: width 0.3s ease;
`;

const ProgressText = styled.span`
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  color: #4F46E5;
`;

const StudyCard = ({ 
  title, 
  description, 
  status = 'pending', 
  progress = 0,
  onClick 
}) => {
  return (
    <Card onClick={onClick}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardBadge status={status}>
          {status.replace('-', ' ').toUpperCase()}
        </CardBadge>
      </CardHeader>
      
      {description && <CardDescription>{description}</CardDescription>}
      
      <CardFooter>
        <ProgressBar>
          <ProgressFill progress={progress} />
        </ProgressBar>
        <ProgressText>{progress}%</ProgressText>
      </CardFooter>
    </Card>
  );
};

export default StudyCard;
