import React, { useState } from 'react';
import { cn } from '@/lib/utils';

export interface CheckoutStep {
  id: string;
  number: number;
  label: string;
}

export interface ShippingFormData {
  firstName: string;
  lastName: string;
  company?: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
}

export interface CheckoutFormProps {
  steps: CheckoutStep[];
  currentStep: number;
  shippingMethods: ShippingMethod[];
  selectedShippingId?: string;
  onStepChange?: (step: number) => void;
  onShippingMethodChange?: (methodId: string) => void;
  onSubmit?: (data: ShippingFormData) => void;
  className?: string;
}

export function CheckoutForm({
  steps,
  currentStep,
  shippingMethods,
  selectedShippingId,
  onStepChange,
  onShippingMethodChange,
  onSubmit,
  className,
}: CheckoutFormProps) {
  const [formData, setFormData] = useState<ShippingFormData>({
    firstName: '',
    lastName: '',
    company: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  });

  const handleInputChange = (field: keyof ShippingFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  return (
    <div className={cn('', className)}>
      {/* Breadcrumb */}
      <div className="text-xs text-muted-foreground mb-2">
        <span>CART</span>
        <span className="mx-2">/</span>
        <span className="font-semibold text-foreground">CHECKOUT</span>
        <span className="mx-2">/</span>
        <span>CONFIRMATION</span>
      </div>

      <h1 className="text-4xl font-bold text-foreground mb-8">Checkout</h1>

      {/* Step Tabs */}
      <div className="flex gap-8 border-b border-border mb-8">
        {steps.map((step) => (
          <button
            key={step.id}
            onClick={() => onStepChange?.(step.number)}
            className={cn(
              'flex items-center gap-2 pb-4 text-sm font-medium transition-colors',
              'border-b-2 -mb-px',
              currentStep === step.number
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <span
              className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-xs',
                currentStep === step.number
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground'
              )}
            >
              {step.number}
            </span>
            {step.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Form Fields */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              First Name
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              placeholder="John"
              className="w-full h-11 px-4 text-sm bg-background border border-input rounded-md focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/10"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Last Name
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              placeholder="Doe"
              className="w-full h-11 px-4 text-sm bg-background border border-input rounded-md focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/10"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Company (Optional)
          </label>
          <input
            type="text"
            value={formData.company}
            onChange={(e) => handleInputChange('company', e.target.value)}
            placeholder="Industrial Painting Services Ltd."
            className="w-full h-11 px-4 text-sm bg-background border border-input rounded-md focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/10"
          />
        </div>

        <div className="mb-6">
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Address
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="123 Industrial Way, Building 4B"
            className="w-full h-11 px-4 text-sm bg-background border border-input rounded-md focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/10"
          />
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              City
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              placeholder="Detroit"
              className="w-full h-11 px-4 text-sm bg-background border border-input rounded-md focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/10"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              State
            </label>
            <select
              value={formData.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              className="w-full h-11 px-4 text-sm bg-background border border-input rounded-md focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/10"
            >
              <option value="">Select</option>
              <option value="MI">MI</option>
              <option value="OH">OH</option>
              <option value="IL">IL</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              ZIP
            </label>
            <input
              type="text"
              value={formData.zip}
              onChange={(e) => handleInputChange('zip', e.target.value)}
              placeholder="48201"
              className="w-full h-11 px-4 text-sm bg-background border border-input rounded-md focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/10"
            />
          </div>
        </div>

        {/* Shipping Methods */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">Shipping Method</h3>
          <div className="space-y-3">
            {shippingMethods.map((method) => (
              <label
                key={method.id}
                className={cn(
                  'flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors',
                  selectedShippingId === method.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-foreground/30'
                )}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shipping"
                    checked={selectedShippingId === method.id}
                    onChange={() => onShippingMethodChange?.(method.id)}
                    className="w-4 h-4 text-primary"
                  />
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {method.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {method.description}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  ${method.price.toFixed(2)}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full h-12 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary-light transition-colors flex items-center justify-center gap-2"
        >
          Continue to Payment
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </form>
    </div>
  );
}

export default CheckoutForm;
