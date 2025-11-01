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
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-bottom: 48px;
`;

const StatCard = styled.div`
  background: #FFFFFF;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #6B7280;
  margin-bottom: 8px;
`;

const StatValue = styled.div`
  font-family: 'Poppins', sans-serif;
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
