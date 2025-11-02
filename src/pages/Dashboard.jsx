import React from 'react';
import styled from 'styled-components';
import StudyCard from '../components/StudyCard';

// Styled Components
const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #F9FAFB 0%, #FFFFFF 100%);
  font-family: 'Inter', sans-serif;
`;

const Header = styled.header`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 64px 24px;
  text-align: center;
  color: #FFFFFF;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
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
  max-width: 600px;
  
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
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 48px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

// Main Component
const Dashboard = () => {
  // Sample data - in production, this would come from props or state management
  const studyCards = [
    {
      id: 1,
      title: 'Mathematics',
      progress: 65,
      totalTopics: 24,
      completedTopics: 15,
      lastStudied: '2 days ago',
    },
    {
      id: 2,
      title: 'Physics',
      progress: 30,
      totalTopics: 18,
      completedTopics: 5,
      lastStudied: '1 week ago',
    },
    {
      id: 3,
      title: 'Chemistry',
      progress: 45,
      totalTopics: 20,
      completedTopics: 9,
      lastStudied: '3 days ago',
    },
  ];

  return (
    <DashboardContainer>
      <Header>
        <HeaderContent>
          <HeaderTitle>Study Dashboard</HeaderTitle>
          <HeaderSubtitle>Track your learning progress and manage your study sessions</HeaderSubtitle>
        </HeaderContent>
      </Header>
      
      <ContentWrapper>
        <SectionTitle>My Study Subjects</SectionTitle>
        <CardGrid>
          {studyCards.map((subject) => (
            <StudyCard
              key={subject.id}
              title={subject.title}
              progress={subject.progress}
              totalTopics={subject.totalTopics}
              completedTopics={subject.completedTopics}
              lastStudied={subject.lastStudied}
            />
          ))}
        </CardGrid>
      </ContentWrapper>
    </DashboardContainer>
  );
};

export default Dashboard;
