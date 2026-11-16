import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../components/ui/SharedComponents';
import { lmsApi } from '../services/api';
import { StudentCalendarSubPage } from './StudentPages';

vi.mock('../services/api', () => ({
  lmsApi: {
    getDashboardSummary: vi.fn()
  },
  extractErrorMessage: (error) => error?.message || 'Request failed'
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 42 } })
}));

function renderCalendarPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <MemoryRouter>
          <StudentCalendarSubPage />
        </MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
}

describe('StudentCalendarSubPage study planner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    lmsApi.getDashboardSummary.mockResolvedValue({
      data: {
        enrolledCourses: [{
          classId: 12,
          courseCode: 'NET-201',
          courseTitle: 'Enterprise Networking'
        }],
        upcomingAssignments: [],
        upcomingExams: [],
        overdueAssignments: [],
        overdueExams: [],
        lateAllowedExams: []
      }
    });
  });

  it('creates, completes, deletes, and persists study sessions for the student', async () => {
    renderCalendarPage();

    expect(await screen.findByText('No study sessions planned yet. Add one above to get started.')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Study topic'), { target: { value: 'Review OSPF routing' } });
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-11-12' } });
    fireEvent.change(screen.getByLabelText('Start time'), { target: { value: '14:30' } });
    fireEvent.change(screen.getByLabelText('Course'), { target: { value: '12' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add Study Session' }));

    expect(await screen.findByText('Review OSPF routing')).toBeInTheDocument();
    expect(screen.getAllByText(/NET-201 · Enterprise Networking/).length).toBeGreaterThan(0);
    await waitFor(() => {
      const saved = JSON.parse(window.localStorage.getItem('student-study-planner-42'));
      expect(saved).toHaveLength(1);
      expect(saved[0].completed).toBe(false);
    });

    const completeCheckbox = screen.getByRole('checkbox', { name: 'Complete Review OSPF routing' });
    fireEvent.click(completeCheckbox);
    expect(completeCheckbox).toBeChecked();
    await waitFor(() => {
      expect(JSON.parse(window.localStorage.getItem('student-study-planner-42'))[0].completed).toBe(true);
    });

    fireEvent.click(screen.getByRole('button', { name: 'Delete Review OSPF routing' }));
    expect(screen.queryByText('Review OSPF routing')).not.toBeInTheDocument();
    await waitFor(() => {
      expect(JSON.parse(window.localStorage.getItem('student-study-planner-42'))).toEqual([]);
    });
  });

  it('restores saved study sessions for the signed-in student', async () => {
    window.localStorage.setItem('student-study-planner-42', JSON.stringify([{
      id: 'existing',
      title: 'Review subnetting',
      date: '2026-11-14',
      time: '10:00',
      courseTitle: 'General study',
      completed: true
    }]));

    renderCalendarPage();

    expect(await screen.findByText('Review subnetting')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Mark Review subnetting' })).toBeChecked();
  });

  it('shows course deadlines in the calendar and supports category filters and calendar views', async () => {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 3);
    deadline.setHours(16, 0, 0, 0);
    const deadlineIso = deadline.toISOString();

    lmsApi.getDashboardSummary.mockResolvedValue({
      data: {
        enrolledCourses: [{
          classId: 12,
          courseCode: 'NET-201',
          courseTitle: 'Enterprise Networking'
        }],
        upcomingAssignments: [
          { id: 21, classId: 12, title: 'Review capstone project', assignmentType: 'project', dueDate: deadlineIso },
          { id: 22, classId: 12, title: 'Complete lab activity', assignmentType: 'laboratory', dueDate: deadlineIso }
        ],
        upcomingExams: [{
          id: 31,
          classId: 12,
          title: 'Module 2 Quiz',
          assessmentType: 'quiz',
          startDate: deadlineIso,
          closeDate: deadlineIso,
          timeLimitMinutes: 30
        }],
        overdueAssignments: [],
        overdueExams: [],
        lateAllowedExams: []
      }
    });

    renderCalendarPage();

    const calendar = await screen.findByRole('region', { name: 'Academic Calendar' });
    const deadlineCell = within(calendar).getByRole('button', { name: /Review capstone project.*Complete lab activity.*Module 2 Quiz/ });
    fireEvent.click(deadlineCell);

    expect(within(calendar).getByText(/Projects ·/)).toBeInTheDocument();
    expect(within(calendar).getByText(/Activities ·/)).toBeInTheDocument();
    expect(within(calendar).getByText(/Quizzes ·/)).toBeInTheDocument();
    expect(within(calendar).getAllByText(/NET-201 · Enterprise Networking/)).toHaveLength(3);

    fireEvent.click(within(calendar).getByRole('button', { name: 'Projects' }));
    expect(within(calendar).queryByText(/Projects ·/)).not.toBeInTheDocument();
    expect(within(calendar).getByRole('button', { name: 'Projects' })).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(within(calendar).getByRole('button', { name: 'Week View' }));
    expect(within(calendar).getByRole('button', { name: 'Week View' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(within(calendar).getByRole('button', { name: 'Day View' }));
    expect(within(calendar).getByRole('button', { name: 'Day View' })).toHaveAttribute('aria-pressed', 'true');
  });
});
