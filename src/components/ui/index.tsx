'use client';

import { ReactNode } from 'react';
import {
  TrendingUp,
  TrendingDown,
  LucideIcon
} from 'lucide-react';

// ============================================
// BUTTON COMPONENT
// ============================================
interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  title?: string;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  onClick,
  type = 'button',
  className = '',
  title,
}: ButtonProps) {
  const sizeClasses = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
  };

  return (
    <button
      type={type}
      className={`btn btn-${variant} ${sizeClasses[size]} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      title={title}
    >
      {loading ? (
        <span className="spinner" />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon size={16} />}
          {children}
          {Icon && iconPosition === 'right' && <Icon size={16} />}
        </>
      )}
    </button>
  );
}

// ============================================
// CARD COMPONENT
// ============================================
interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return <div className={`card ${className}`}>{children}</div>;
}

export function CardHeader({ children, className = '' }: CardProps) {
  return <div className={`card-header ${className}`}>{children}</div>;
}

export function CardBody({ children, className = '' }: CardProps) {
  return <div className={`card-body ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }: CardProps) {
  return <div className={`card-footer ${className}`}>{children}</div>;
}

// ============================================
// STAT CARD COMPONENT (Premium)
// ============================================
interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'primary' | 'success' | 'warning' | 'error';
  premium?: boolean;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  variant = 'primary',
  premium = true,
}: StatCardProps) {
  if (premium) {
    return (
      <div className={`stat-card-premium ${variant} hover-lift`}>
        <div className="flex justify-between items-start">
          <div className="stat-card-content">
            <div className="stat-card-label">{label}</div>
            <div className="stat-value-premium">{value}</div>
            {trend && (
              <div className={`stat-card-trend ${trend.isPositive ? 'up' : 'down'}`}>
                {trend.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {trend.isPositive ? '+' : ''}{trend.value}%
              </div>
            )}
          </div>
          <div className={`stat-icon-premium ${variant}`}>
            <Icon size={24} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="stat-card">
      <div className={`stat-card-icon ${variant}`}>
        <Icon size={24} />
      </div>
      <div className="stat-card-content">
        <div className="stat-card-label">{label}</div>
        <div className="stat-card-value">{value}</div>
        {trend && (
          <div className={`stat-card-trend ${trend.isPositive ? 'up' : 'down'}`}>
            {trend.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend.isPositive ? '+' : ''}{trend.value}%
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// BADGE COMPONENT
// ============================================
interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'gray' | 'default';
  className?: string;
}

export function Badge({ children, variant = 'primary', className = '' }: BadgeProps) {
  const variantClass = variant === 'default' ? 'badge-gray' : `badge-${variant}`;
  return (
    <span className={`badge ${variantClass} ${className}`}>
      {children}
    </span>
  );
}

// ============================================
// INPUT COMPONENT
// ============================================
interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  error?: string;
  hint?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function Input({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  hint,
  required = false,
  disabled = false,
  className = '',
  id,
  ...props
}: InputProps) {
  return (
    <div className={`input-group ${className}`} style={{ margin: 0, width: '100%' }}>
      {label && (
        <label htmlFor={id} className={`form-label ${required ? 'required' : ''}`}>
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        className={`form-input ${error ? 'error' : ''}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        {...props}
      />
      {error && <div className="form-error">{error}</div>}
      {hint && !error && <div className="form-hint">{hint}</div>}
    </div>
  );
}

// ============================================
// SELECT COMPONENT
// ============================================
interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  options?: SelectOption[];
  children?: ReactNode;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
}

export function Select({
  label,
  options,
  children,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  className = '',
  id,
  style,
}: SelectProps) {
  return (
    <div className={`form-group ${className}`} style={{ margin: 0 }}>
      {label && (
        <label htmlFor={id} className={`form-label ${required ? 'required' : ''}`}>
          {label}
        </label>
      )}
      <select
        id={id}
        className={`form-input form-select ${error ? 'error' : ''}`}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        style={style}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {children ? children : options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <div className="form-error">{error}</div>}
    </div>
  );
}

// ============================================
// TEXTAREA COMPONENT
// ============================================
interface TextareaProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  className?: string;
  id?: string;
}

export function Textarea({
  label,
  placeholder,
  value,
  onChange,
  error,
  hint,
  required = false,
  disabled = false,
  rows = 4,
  className = '',
  id,
}: TextareaProps) {
  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={id} className={`form-label ${required ? 'required' : ''}`}>
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={`form-input form-textarea ${error ? 'error' : ''}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        rows={rows}
      />
      {error && <div className="form-error">{error}</div>}
      {hint && !error && <div className="form-hint">{hint}</div>}
    </div>
  );
}

// ============================================
// SPINNER COMPONENT
// ============================================
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizeClass = size === 'lg' ? 'spinner-lg' : '';
  return <div className={`spinner ${sizeClass} ${className}`} />;
}

// ============================================
// EMPTY STATE COMPONENT
// ============================================
interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <Icon className="empty-state-icon" size={64} />
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-description">{description}</p>}
      {action}
    </div>
  );
}

// ============================================
// AVATAR COMPONENT
// ============================================
interface AvatarProps {
  name?: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ name, src, size = 'md', className = '' }: AvatarProps) {
  const sizeClass = size === 'sm' ? 'avatar-sm' : size === 'lg' ? 'avatar-lg' : '';
  const initials = name
    ? name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
    : '?';

  return (
    <div className={`avatar ${sizeClass} ${className}`}>
      {src ? (
        <img src={src} alt={name || 'Avatar'} />
      ) : (
        initials
      )}
    </div>
  );
}

// ============================================
// PROGRESS BAR COMPONENT
// ============================================
interface ProgressProps {
  value: number;
  max?: number;
  variant?: 'primary' | 'success' | 'warning' | 'error';
  className?: string;
}

export function Progress({ value, max = 100, variant = 'primary', className = '' }: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={`progress ${className}`}>
      <div
        className={`progress-bar ${variant}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

// ============================================
// TABS COMPONENT
// ============================================
interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className = '' }: TabsProps) {
  return (
    <div className={`tabs ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
