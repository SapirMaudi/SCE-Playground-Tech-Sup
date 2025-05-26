
// Mocking the api.js service used inside TechSupportPage
jest.mock('../src/services/api.js', () => ({
    __esModule: true,
    default: {
      get: jest.fn((url) => {

         // Agent check based on email
        if (url.includes('/techsupportisagent')) {
          if (url.includes('test8@gmail.com')) {
            return Promise.resolve({ data: { agent: true } }); // return true if agent
          }
          return Promise.resolve({ data: { agent: false } });
        }

        // Return user requests for regular user
        if (url.includes('/techsupportfetchuserrequests')) {
          return Promise.resolve({ data: { userRequest: [
            { id: 1, category: 'Bug report', status: 1, urgency: 2 }
          ] } });
        }

        // Return all support tickets for agent
        if (url.includes('/techsupport')) {
          return Promise.resolve({
            data: [
              {
                id: 1,
                category: 'Bug report',
                status: 1,
                urgency: 2,
                type: 1,
                date: '2024-05-15T14:00:00.000Z'
              },
              {
                id: 2,
                category: 'Other',
                status: 2,
                urgency: 3,
                type: 2,
                date: '2024-05-14T10:00:00.000Z'
              }
            ]
          });
        }

        // Return message history for forum popup
        if (url.includes('/gettechsupportforum')) {
          return Promise.resolve({ data: { messages: [
            { name: 'Dana', content: 'Hello, how can I help you?' },
            { name: 'Alice', content: 'I have an issue.' }
          ] } });
        }
        return Promise.resolve({ data: {} });
      }),

      // Mock post and patch requests
      post: jest.fn(() => Promise.resolve({ data: {} })),
      patch: jest.fn(() => Promise.resolve({ data: {} })),
    },
  }));

import React from 'react';
import api from '../src/services/api.js';
import { act } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import TechSupportPage from '../src/pages/TechSupportPage.jsx';
import { StoreContext } from '../src/store/StoreContext.jsx';
jest.mock('../src/App.css', () => ({}));


const renderWithContext = async (ui, contextValue) => {
  await act(async () => {
    render(
      <StoreContext.Provider value={contextValue}>
        <BrowserRouter>
        {ui}
        </BrowserRouter>
      </StoreContext.Provider>
    );
  });
};


describe('TechSupportPage - User', () => {
  const mockUser = { firstName: 'Alice', email: 'alice@test.com' };
  const mockContext = { user: mockUser };

  // Test: Verify user page renders with requests
  test('renders My Requests and a request entry', async () => {
    await act(async () => {
      await renderWithContext(
        <StoreContext.Provider value={mockContext}>
            <TechSupportPage />
        </StoreContext.Provider>
      );
    });
  
    expect(await screen.findByText(/My Requests/i)).toBeInTheDocument();
    expect(await screen.findByText(/Request #1/i)).toBeInTheDocument();
  });

  // Test: Clicking on a request should open the popup and show chat history
  test('opens request popup and shows message history', async () => {
    await renderWithContext(
      <StoreContext.Provider value={mockContext}>
          <TechSupportPage />
      </StoreContext.Provider>
    );
    fireEvent.click(await screen.findByText(/Request #1/i));
    expect(await screen.findByText(/Hello, how can I help you/i)).toBeInTheDocument();
    expect(screen.getByText(/I have an issue/i)).toBeInTheDocument();
  });

   // Test: Typing and sending a message should trigger api.post
  test('can type and send a message in the popup', async () => {
    await renderWithContext(
      <StoreContext.Provider value={mockContext}>
          <TechSupportPage />
      </StoreContext.Provider>
    );
    fireEvent.click(await screen.findByText(/Request #1/i));
    const textarea = await screen.findByPlaceholderText(/Write your reply here/i);
    fireEvent.change(textarea, { target: { value: 'Test message' } });
    const sendButton = screen.getByText(/Send/i);
    fireEvent.click(sendButton);
    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
    });
  });
});

describe('TechSupportPage - Agent', () => {
  const mockAgent = { firstName: 'test2', email: 'test8@gmail.com' };
  const mockContext = { user: mockAgent };

  // Test: Verify agent dashboard renders with both customer and lead requests
  test('renders agent view with customers and leads', async () => {
    await renderWithContext(
      <StoreContext.Provider value={mockContext}>
          <TechSupportPage />
      </StoreContext.Provider>
    );
    expect(await screen.findByText((content) => content.includes('Welcome agent'))).toBeInTheDocument();
    expect(await screen.findByText(/Request #1/i)).toBeInTheDocument();
    expect(await screen.findByText(/Request #2/i)).toBeInTheDocument();
  });

  // Test: Agent opens ticket and sends message
  test('agent can open request and send message', async () => {
    await renderWithContext(
      <StoreContext.Provider value={mockContext}>
          <TechSupportPage />
      </StoreContext.Provider>
    );
    fireEvent.click(await screen.findByText(/Request #1/i));
    expect(await screen.findByText(/Hello, how can I help you/i)).toBeInTheDocument();
    const textarea = screen.getByPlaceholderText(/Write your reply here/i);
    fireEvent.change(textarea, { target: { value: 'Agent reply' } });
    fireEvent.click(screen.getByText(/Send/i));
    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
    });
  });

  // Test: If unsent message exists, clicking 'Close' should trigger a warning
  test('agent sees warning on close if message is unsent', async () => {
    window.alert = jest.fn();
    render(
      <StoreContext.Provider value={mockContext}>
          <TechSupportPage />
      </StoreContext.Provider>
    );
    fireEvent.click(await screen.findByText(/Request #1/i)); // Click request
    const textarea = screen.getByPlaceholderText(/Write your reply here/i);
    fireEvent.change(textarea, { target: { value: 'Draft message' } }); // Unsent content
    fireEvent.click(screen.getByText(/Mark Request as Closed/i)); // Click close
    expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/Warning/i)); // Check warning
  });
});

// Test: User sees loading state when no user is set yet
test('shows loading screen when user is null', () => {
  render(
    <StoreContext.Provider value={{ user: null }}>
        <TechSupportPage />
    </StoreContext.Provider>
  );
  expect(screen.getByText(/Loading/i)).toBeInTheDocument();
});

// Test: User sees 'No requests yet' when there are no tickets
test('shows message when user has no requests', async () => {
  api.get.mockImplementation((url) => {
    if (url.includes('/techsupportfetchuserrequests')) {
      return Promise.resolve({ data: { userRequest: [] } });
    }
    return Promise.resolve({ data: {} });
  });

  const mockUser = { firstName: 'Alice', email: 'alice@test.com' };
  const mockContext = { user: mockUser };

  render(
    <StoreContext.Provider value={mockContext}>
        <TechSupportPage />
    </StoreContext.Provider>
  );
  await waitFor(() => {
  expect(screen.queryByText(/Loading requests/i)).not.toBeInTheDocument();
});

expect(await screen.findByText(/No requests yet/i)).toBeInTheDocument();
});


