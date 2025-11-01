import React from 'react';
import styled from 'styled-components';
import StudyCard from '../components/StudyCard';

/**
 * Dashboard Page Component
 * Main dashboard view showcasing study cards in a responsive grid
 * Follows Dribbble-style design system from DESIGN.md
 */

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #F9FAFB 0%, #FFFFFF 100%);
`;

const Header = styled.header`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 64px 24px;
  text-align: center;
  color: #FFFFFF;
`;

const HeaderTitle = styled.h1`
  font-family: 'Poppins', sans-serif;
  font-size: 48px;
  font-weight: 700;
  margin: 0 0 16px 0;
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: 36px;
  }
`;

const HeaderSubtitle = styled.p`
  font-family: 'Inter', sans-serif;
  font-size: 18px;
  font-weight: 400;
  margin: 0;
  opacity: 0.9;
  
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const ContentWrapper = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 48px 24px;
`;

const SectionTitle = styled.h2`
  font-family: 'Poppins', sans-serif;
  font-size: 36px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 32px 0;
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: 28px;
  }
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 48px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  margin-bottom: 48px;
`;

const StatCard = styled.div`
  background: #FFFFFF;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const StatValue = styled.div`
  font-family: 'Poppins', sans-serif;
  font-size: 36px;
  font-weight: 700;
  color: #4F46E5;
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Dashboard = () => {
  // Sample data - in production, this would come from props or state management
  const studyCards = [
    {
      id: 1,
      title: 'Mathematics',
      description: 'Calculus II - Integrals and derivatives practice',
      badge: 'In Progress',
      badgeColor: '#4F46E5',
      progress: 65,
      stats: [
        { label: 'Hours', value: '12.5' },
        { label: 'Topics', value: '8/15' }
      ]
    },
    {
      id: 2,
      title: 'Computer Science',
      description: 'Data Structures - Trees and graphs implementation',
      badge: 'Active',
      badgeColor: '#10B981',
      progress: 80,
      stats: [
        { label: 'Hours', value: '18.2' },
        { label: 'Topics', value: '12/15' }
      ]
    },
    {
      id: 3,
      title: 'Physics',
      description: 'Quantum Mechanics - Wave functions and operators',
      badge: 'Planned',
      badgeColor: '#F59E0B',
      progress: 30,
      stats: [
        { label: 'Hours', value: '5.0' },
        { label: 'Topics', value: '3/10' }
      ]
    }
  ];

  const dashboardStats = [
    { label: 'Total Hours', value: '35.7' },
    { label: 'Active Subjects', value: '3' },
    { label: 'Completed Topics', value: '23' },
    { label: 'Study Streak', value: '7 days' }
  ];

  return (
    <DashboardContainer>
      <Header>
        <HeaderTitle>Study Dashboard</HeaderTitle>
        <HeaderSubtitle>
          Track your progress and stay organized with your studies
        </HeaderSubtitle>
      </Header>

      <ContentWrapper>
        <StatsContainer>
          {dashboardStats.map((stat, index) => (
            <StatCard key={index}>
              <StatValue>{stat.value}</StatValue>
              <StatLabel>{stat.label}</StatLabel>
            </StatCard>
          ))}
        </StatsContainer>

        <SectionTitle>Your Subjects</SectionTitle>
        <CardGrid>
          {studyCards.map(card => (
            <StudyCard
              key={card.id}
              title={card.title}
              description={card.description}
              badge={card.badge}
              badgeColor={card.badgeColor}
              progress={card.progress}
              stats={card.stats}
              onClick={() => console.log(`Clicked on ${card.title}`)}
            />
          ))}
        </CardGrid>
      </ContentWrapper>
    </DashboardContainer>
  );
};

export default Dashboard;
