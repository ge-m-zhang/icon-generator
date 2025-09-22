import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PromptInput } from '../PromptInput'

// Types for mocked components
interface MockBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

interface MockTypographyProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
  variant?: string
}

interface MockTextFieldProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  helperText?: string
  error?: string
  disabled?: boolean
  placeholder?: string
  fullWidth?: boolean
  size?: string
  className?: string
}

// Mock the UI components
jest.mock('@gmzh/react-ui', () => ({
  Box: ({ children, ...props }: MockBoxProps) => (
    <div {...props}>
      {children}
    </div>
  ),
  Typography: ({ children, variant, ...props }: MockTypographyProps) => (
    <span data-variant={variant} {...props}>{children}</span>
  ),
  TextField: ({ 
    value, 
    onChange, 
    helperText, 
    error, 
    disabled, 
    placeholder,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    fullWidth,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    size, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    className, 
    ...props 
  }: MockTextFieldProps) => (
    <div>
      <input
        data-testid="prompt-input"
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        {...props}
      />
      {helperText && !error && <span data-testid="helper-text">{helperText}</span>}
      {error && <span data-testid="error-text">{error}</span>}
    </div>
  ),
}))

describe('PromptInput', () => {
  const defaultProps = {
    value: '',
    onChange: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render with default props', () => {
      render(<PromptInput {...defaultProps} />)
      
      expect(screen.getByText('What icons do you need?')).toBeInTheDocument()
      expect(screen.getByTestId('prompt-input')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('e.g., hockey, dog, cooking')).toBeInTheDocument()
    })

    it('should show character count in helper text', () => {
      render(<PromptInput {...defaultProps} value="test" />)
      
      expect(screen.getByTestId('helper-text')).toHaveTextContent('4/30')
    })

    it('should show external error when provided', () => {
      render(<PromptInput {...defaultProps} error="External error message" />)
      
      expect(screen.getByTestId('error-text')).toHaveTextContent('External error message')
    })

    it('should be disabled when disabled prop is true', () => {
      render(<PromptInput {...defaultProps} disabled={true} />)
      
      expect(screen.getByTestId('prompt-input')).toBeDisabled()
    })
  })

  describe('validation', () => {
    it('should show error for input less than 2 characters', async () => {
      const onChange = jest.fn()
      render(<PromptInput {...defaultProps} onChange={onChange} />)
      
      const input = screen.getByTestId('prompt-input')
      await userEvent.type(input, 'a')
      
      await waitFor(() => {
        expect(screen.getByTestId('error-text')).toHaveTextContent('Prompt must be at least 2 characters')
      })
      expect(onChange).toHaveBeenCalledWith('a')
    })

    it('should show error for input more than 30 characters', async () => {
      const onChange = jest.fn()
      render(<PromptInput {...defaultProps} onChange={onChange} />)
      
      const input = screen.getByTestId('prompt-input')
      const longText = 'a'.repeat(31)
      fireEvent.change(input, { target: { value: longText } })
      
      await waitFor(() => {
        expect(screen.getByTestId('error-text')).toHaveTextContent('Prompt must be 30 characters or less')
      })
      expect(onChange).toHaveBeenCalledWith(longText)
    })

    it('should not show error for valid input', async () => {
      const onChange = jest.fn()
      render(<PromptInput {...defaultProps} onChange={onChange} />)
      
      const input = screen.getByTestId('prompt-input')
      fireEvent.change(input, { target: { value: 'valid prompt' } })
      
      await waitFor(() => {
        expect(screen.queryByTestId('error-text')).not.toBeInTheDocument()
        expect(screen.getByTestId('helper-text')).toHaveTextContent('Describe what kind of icons you want')
      })
    })

    it('should show "Ready to generate" for valid input', async () => {
      const onChange = jest.fn()
      // Render with a valid value prop directly
      render(<PromptInput value="sports" onChange={onChange} />)
      
      await waitFor(() => {
        expect(screen.getByText('Ready to generate')).toBeInTheDocument()
      })
    })
  })

  describe('user interactions', () => {
    it('should call onChange on input change', async () => {
      const onChange = jest.fn()
      render(<PromptInput {...defaultProps} onChange={onChange} />)
      
      const input = screen.getByTestId('prompt-input')
      // Use fireEvent.change instead of userEvent.type for simpler testing
      fireEvent.change(input, { target: { value: 'test' } })
      
      expect(onChange).toHaveBeenCalledWith('test')
    })

    it('should handle clearing input', async () => {
      const onChange = jest.fn()
      render(<PromptInput {...defaultProps} value="initial" onChange={onChange} />)
      
      const input = screen.getByTestId('prompt-input')
      await userEvent.clear(input)
      
      expect(onChange).toHaveBeenCalledWith('')
    })
  })

  describe('console logging', () => {
    it('should log input changes', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      const onChange = jest.fn()
      render(<PromptInput {...defaultProps} onChange={onChange} />)
      
      const input = screen.getByTestId('prompt-input')
      fireEvent.change(input, { target: { value: 'test' } })
      
      expect(consoleSpy).toHaveBeenCalledWith('Prompt input changed:', {
        value: 'test',
        length: 4,
        isValid: true,
        validationError: null,
      })
      
      consoleSpy.mockRestore()
    })
  })
})
