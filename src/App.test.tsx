import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders chat app', () => {
  render(<App />);
  const chatTitle = screen.getByText(/Chat AI/i);
  expect(chatTitle).toBeInTheDocument();
});

test('renders powered by google gemini', () => {
  render(<App />);
  const poweredBy = screen.getByText(/Powered by Google Gemini/i);
  expect(poweredBy).toBeInTheDocument();
});

test('renders welcome message', () => {
  render(<App />);
  const welcomeMessage = screen.getByText(/Olá! Como posso ajudar?/i);
  expect(welcomeMessage).toBeInTheDocument();
});
