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
import React, { useState } from 'react';
import styled from 'styled-components';
import StudyCard from '../components/StudyCard';

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: #FAFAFA;
  font-family: 'Inter', sans-serif;
`;

const Header = styled.header`
  background: #FFFFFF;
  padding: 24px 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.h1`
  font-family: 'Poppins', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #4F46E5;
  margin: 0;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
`;

const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 48px 32px;
`;

const PageTitle = styled.h2`
  font-family: 'Poppins', sans-serif;
  font-size: 2rem;
  font-weight: 600;
  color: #1F2937;
  margin: 0 0 8px 0;
`;

const PageSubtitle = styled.p`
  font-size: 1rem;
  color: #6B7280;
  margin: 0 0 32px 0;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
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

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #6B7280;
  margin-bottom: 8px;
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
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.color || '#1F2937'};
`;

const SectionTitle = styled.h3`
  font-family: 'Poppins', sans-serif;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1F2937;
  margin: 0 0 24px 0;
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
`;

const Dashboard = () => {
  const [studyCards] = useState([
    {
      id: 1,
      title: 'React Advanced Patterns',
      description: 'Learn about HOCs, Render Props, and Custom Hooks for better React applications.',
      status: 'in-progress',
      progress: 65
    },
    {
      id: 2,
      title: 'TypeScript Fundamentals',
      description: 'Master TypeScript basics including types, interfaces, and generics.',
      status: 'completed',
      progress: 100
    },
    {
      id: 3,
      title: 'Next.js App Router',
      description: 'Explore the new App Router in Next.js 14 with server components.',
      status: 'pending',
      progress: 20
    },
    {
      id: 4,
      title: 'CSS-in-JS with Styled Components',
      description: 'Build maintainable styles with styled-components and theming.',
      status: 'in-progress',
      progress: 45
    },
    {
      id: 5,
      title: 'State Management with Zustand',
      description: 'Learn modern state management patterns with Zustand.',
      status: 'pending',
      progress: 0
    },
    {
      id: 6,
      title: 'Testing with Vitest',
      description: 'Write unit and integration tests using Vitest and React Testing Library.',
      status: 'pending',
      progress: 10
    }
  ]);

  const stats = {
    totalCourses: studyCards.length,
    completed: studyCards.filter(card => card.status === 'completed').length,
    inProgress: studyCards.filter(card => card.status === 'in-progress').length,
    averageProgress: Math.round(
      studyCards.reduce((sum, card) => sum + card.progress, 0) / studyCards.length
    )
  };

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
        <HeaderContent>
          <Logo>StudyApp</Logo>
          <UserInfo>
            <Avatar>LF</Avatar>
          </UserInfo>
        </HeaderContent>
      </Header>

      <MainContent>
        <PageTitle>My Learning Dashboard</PageTitle>
        <PageSubtitle>Track your progress and continue learning</PageSubtitle>

        <StatsContainer>
          <StatCard>
            <StatLabel>Total Courses</StatLabel>
            <StatValue>{stats.totalCourses}</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Completed</StatLabel>
            <StatValue color="#10B981">{stats.completed}</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>In Progress</StatLabel>
            <StatValue color="#F59E0B">{stats.inProgress}</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Average Progress</StatLabel>
            <StatValue color="#4F46E5">{stats.averageProgress}%</StatValue>
          </StatCard>
        </StatsContainer>

        <SectionTitle>Your Study Cards</SectionTitle>
        <CardsGrid>
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
              status={card.status}
              progress={card.progress}
              onClick={() => console.log(`Clicked on ${card.title}`)}
            />
          ))}
        </CardsGrid>
      </MainContent>
    </DashboardContainer>
  );
};

export default Dashboard;
