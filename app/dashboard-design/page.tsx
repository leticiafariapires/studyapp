'use client';

import React from 'react';
import styled from 'styled-components';
import { StudyCard } from '@/components/StudyCard';
import { BookOpen, Target, TrendingUp, Calendar, Clock, Award } from 'lucide-react';

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #F9FAFB 0%, #E3F2FD 100%);
  font-family: 'Inter', sans-serif;
`;

const Header = styled.header`
  background: linear-gradient(135deg, #4A90E2 0%, #9C27B0 100%);
  padding: 32px 24px;
  color: white;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Greeting = styled.h1`
  font-family: 'Poppins', sans-serif;
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
`;

const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
`;

const Section = styled.section`
  margin-bottom: 48px;
`;

const SectionTitle = styled.h2`
  font-family: 'Poppins', sans-serif;
  font-size: 24px;
  font-weight: 600;
  color: #1F2937;
  margin: 0 0 24px 0;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 48px;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.2s ease-in-out;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
  }
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.color || '#E3F2FD'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.iconColor || '#4A90E2'};
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #1F2937;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #6B7280;
`;

const QuickActions = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 24px;
`;

const QuickActionButton = styled.button`
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  padding: 12px 24px;
  border-radius: 8px;
  border: 2px solid #E3F2FD;
  background: white;
  color: #4A90E2;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: #E3F2FD;
    transform: translateY(-2px);
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const Dashboard = () => {
  const handleCardAction = (cardName) => {
    console.log(`Action clicked for: ${cardName}`);
  };

  return (
    <DashboardContainer>
      <Header>
        <HeaderContent>
          <Greeting>Welcome back, Student! 👋</Greeting>
          <Subtitle>Ready to continue your learning journey?</Subtitle>
        </HeaderContent>
      </Header>

      <MainContent>
        {/* Stats Overview */}
        <StatsContainer>
          <StatCard>
            <StatIcon color="#E3F2FD" iconColor="#4A90E2">
              <Clock size={24} />
            </StatIcon>
            <StatContent>
              <StatValue>12.5h</StatValue>
              <StatLabel>Study Time</StatLabel>
            </StatContent>
          </StatCard>
          
          <StatCard>
            <StatIcon color="#F3E5F5" iconColor="#9C27B0">
              <BookOpen size={24} />
            </StatIcon>
            <StatContent>
              <StatValue>24</StatValue>
              <StatLabel>Topics Covered</StatLabel>
            </StatContent>
          </StatCard>
          
          <StatCard>
            <StatIcon color="#DCFCE7" iconColor="#10B981">
              <Target size={24} />
            </StatIcon>
            <StatContent>
              <StatValue>85%</StatValue>
              <StatLabel>Goal Progress</StatLabel>
            </StatContent>
          </StatCard>
          
          <StatCard>
            <StatIcon color="#FEF3C7" iconColor="#F59E0B">
              <Award size={24} />
            </StatIcon>
            <StatContent>
              <StatValue>7</StatValue>
              <StatLabel>Days Streak</StatLabel>
            </StatContent>
          </StatCard>
        </StatsContainer>

        {/* Active Study Sessions */}
        <Section>
          <SectionTitle>Continue Learning</SectionTitle>
          <CardGrid>
            <StudyCard
              title="Mathematics"
              description="Linear Algebra and Calculus fundamentals for competitive exams"
              progress={65}
              timeSpent="3.5h"
              totalItems={45}
              gradient={true}
              icon="book"
              onAction={() => handleCardAction('Mathematics')}
              actionText="Continue"
            />
            
            <StudyCard
              title="Portuguese"
              description="Grammar rules and text interpretation practice"
              progress={40}
              timeSpent="2.1h"
              totalItems={30}
              gradient={false}
              icon="book"
              onAction={() => handleCardAction('Portuguese')}
              actionText="Resume"
            />
            
            <StudyCard
              title="History"
              description="Brazilian history from colonial period to republic"
              progress={80}
              timeSpent="4.2h"
              totalItems={28}
              gradient={false}
              icon="clock"
              onAction={() => handleCardAction('History')}
              actionText="Review"
            />
          </CardGrid>
        </Section>

        {/* Recommended Activities */}
        <Section>
          <SectionTitle>Today's Goals</SectionTitle>
          <CardGrid>
            <StudyCard
              title="Daily Practice"
              description="Complete 20 questions from previous exams"
              progress={25}
              timeSpent="0.5h"
              totalItems={20}
              gradient={false}
              icon="target"
              onAction={() => handleCardAction('Daily Practice')}
              actionText="Start"
            />
            
            <StudyCard
              title="Reading Assignment"
              description="Chapter 5: Constitutional Law principles"
              progress={0}
              timeSpent="0h"
              totalItems={15}
              gradient={false}
              icon="book"
              onAction={() => handleCardAction('Reading Assignment')}
              actionText="Begin"
            />
            
            <StudyCard
              title="Weekly Review"
              description="Review all topics covered this week"
              progress={50}
              timeSpent="1.5h"
              totalItems={12}
              gradient={true}
              icon="trending"
              onAction={() => handleCardAction('Weekly Review')}
              actionText="Continue"
            />
          </CardGrid>
        </Section>

        {/* Quick Actions */}
        <Section>
          <SectionTitle>Quick Actions</SectionTitle>
          <QuickActions>
            <QuickActionButton>
              <Calendar />
              View Schedule
            </QuickActionButton>
            <QuickActionButton>
              <Target />
              Set New Goal
            </QuickActionButton>
            <QuickActionButton>
              <TrendingUp />
              View Progress
            </QuickActionButton>
            <QuickActionButton>
              <BookOpen />
              Browse Library
            </QuickActionButton>
          </QuickActions>
        </Section>
      </MainContent>
    </DashboardContainer>
  );
};

export default Dashboard;
