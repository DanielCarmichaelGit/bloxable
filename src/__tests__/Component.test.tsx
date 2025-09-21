import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Component } from './Component';

describe('Component', () => {
  it('renders without crashing', () => {
    render(<Component />);
    expect(screen.getByText('Component')).toBeInTheDocument();
  });

  it('renders with props', () => {
    const props = { testProp: 'test value' };
    render(<Component {...props} />);
    expect(screen.getByText('test value')).toBeInTheDocument();
  });

  it('handles missing props', () => {
    render(<Component />);
    expect(screen.getByText('Component')).toBeInTheDocument();
  });

});