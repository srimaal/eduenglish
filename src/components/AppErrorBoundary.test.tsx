import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AppErrorBoundary } from './AppErrorBoundary';

function BrokenComponent(): never {
  throw new Error('test failure');
}

describe('AppErrorBoundary', () => {
  it('shows a recovery screen instead of a blank app', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(
      <AppErrorBoundary>
        <BrokenComponent />
      </AppErrorBoundary>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
    expect(screen.getByText(/saved learning progress has not been deleted/i)).toBeInTheDocument();
  });

  it('can retry rendering its children', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    let shouldFail = true;
    function SometimesBroken() {
      if (shouldFail) throw new Error('first render fails');
      return <p>Recovered successfully</p>;
    }
    render(<AppErrorBoundary><SometimesBroken /></AppErrorBoundary>);
    shouldFail = false;
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(screen.getByText('Recovered successfully')).toBeInTheDocument();
  });
});
