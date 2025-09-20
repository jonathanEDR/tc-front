import React, { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  htmlFor?: string;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  required = false,
  children,
  htmlFor,
  className = ''
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        {children}
      </div>

      {error && (
        <div className="flex items-center mt-1">
          <svg
            className="w-4 h-4 text-red-500 mr-1 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
};

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  required = false,
  className = '',
  onBlur,
  ...props
}) => {
  const inputClassName = `
    block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    ${error
      ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
      : 'border-gray-300'
    }
    ${className}
  `.trim();

  return (
    <FormField
      label={label}
      error={error}
      required={required}
      htmlFor={props.id}
    >
      <input
        {...props}
        onBlur={onBlur}
        className={inputClassName}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${props.id}-error` : undefined}
      />
    </FormField>
  );
};

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  required?: boolean;
  options: { value: string; label: string }[];
  onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  error,
  required = false,
  options,
  className = '',
  onBlur,
  ...props
}) => {
  const selectClassName = `
    block w-full px-3 py-2 border rounded-md shadow-sm
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    ${error
      ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500'
      : 'border-gray-300'
    }
    ${className}
  `.trim();

  return (
    <FormField
      label={label}
      error={error}
      required={required}
      htmlFor={props.id}
    >
      <select
        {...props}
        onBlur={onBlur}
        className={selectClassName}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${props.id}-error` : undefined}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FormField>
  );
};

interface TextAreaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  required?: boolean;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
}

export const TextAreaField: React.FC<TextAreaFieldProps> = ({
  label,
  error,
  required = false,
  className = '',
  onBlur,
  ...props
}) => {
  const textareaClassName = `
    block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    resize-none
    ${error
      ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
      : 'border-gray-300'
    }
    ${className}
  `.trim();

  return (
    <FormField
      label={label}
      error={error}
      required={required}
      htmlFor={props.id}
    >
      <textarea
        {...props}
        onBlur={onBlur}
        className={textareaClassName}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${props.id}-error` : undefined}
      />
    </FormField>
  );
};