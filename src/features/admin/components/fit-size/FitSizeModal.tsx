import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import { X, Check, Sparkles, AlertTriangle } from 'lucide-react';
import { validateWithZod } from '@/lib/validation/zod-formik';
import { fitSizeSchema, FitSizeFormData } from '../../schemas/fitSize.schema';
import { FitSize } from '../../types/fitSize.types';

interface FitSizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: FitSizeFormData) => Promise<void>;
  initialData?: FitSize | null;
  nextDisplayOrder?: number;
}

export const FitSizeModal: React.FC<FitSizeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  nextDisplayOrder = 1,
}) => {
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    setServerError(null);
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const isEditing = Boolean(initialData);

  const initialValues: FitSizeFormData = {
    name: initialData?.name || '',
    fitCode: initialData?.fitCode || '',
    displayOrder: initialData?.displayOrder ?? nextDisplayOrder,
    isActive: initialData?.isActive ?? true,
  };

  const handleSubmit = async (
    values: FitSizeFormData,
    { setSubmitting }: FormikHelpers<FitSizeFormData>
  ) => {
    setServerError(null);
    try {
      await onSubmit(values);
      onClose();
    } catch (err: any) {
      setServerError(err?.message || 'Failed to save fit size');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-lg bg-[#141414] border border-[#2e2a27] rounded-lg shadow-2xl overflow-hidden text-neutral-100 animate-scaleIn">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#2e2a27] flex items-center justify-between bg-[#191817]">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded bg-[#2a221b] text-[#c9a87c] border border-[#4a3a2c]">
              <Sparkles size={16} />
            </span>
            <div>
              <h3 className="font-serif text-lg tracking-wide text-neutral-100">
                {isEditing ? 'Edit Fit Size' : 'Create Fit Size'}
              </h3>
              <p className="text-xs text-neutral-400 font-sans">
                {isEditing
                  ? `Update silhouette attributes for ${initialData?.name}`
                  : 'Define a garment cut, silhouette code, and sort order'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-100 p-1.5 rounded hover:bg-neutral-800/60 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <Formik<FitSizeFormData>
          initialValues={initialValues}
          validate={validateWithZod(fitSizeSchema)}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting, values, setFieldValue }) => (
            <Form className="p-6 space-y-5">
              {serverError && (
                <div className="p-3 rounded bg-rose-950/70 border border-rose-800/80 text-rose-200 text-xs flex items-center gap-2.5">
                  <AlertTriangle size={16} className="shrink-0 text-rose-400" />
                  <span>{serverError}</span>
                </div>
              )}

              {/* Name Field */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">
                  Fit Name <span className="text-[#c9a87c]">*</span>
                </label>
                <Field
                  type="text"
                  name="name"
                  placeholder="e.g. Regular Fit, Slim Fit, Relaxed Fit"
                  autoFocus
                  className="w-full bg-[#1e1c1a] border border-[#38332e] focus:border-[#c9a87c] rounded px-3.5 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-500 outline-none transition-colors"
                />
                <ErrorMessage
                  name="name"
                  component="p"
                  className="text-xs text-rose-400 mt-1 font-sans"
                />
              </div>

              {/* Fit Code and Display Order Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Fit Code */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">
                    Fit Code <span className="text-[#c9a87c]">*</span>
                  </label>
                  <Field
                    type="text"
                    name="fitCode"
                    placeholder="e.g. REG, SLIM, RLX"
                    maxLength={10}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setFieldValue('fitCode', e.target.value.toUpperCase());
                    }}
                    className="w-full bg-[#1e1c1a] border border-[#38332e] focus:border-[#c9a87c] rounded px-3.5 py-2.5 text-sm font-mono uppercase text-neutral-100 placeholder:text-neutral-500 outline-none transition-colors"
                  />
                  <ErrorMessage
                    name="fitCode"
                    component="p"
                    className="text-xs text-rose-400 mt-1 font-sans"
                  />
                  <p className="text-[11px] text-neutral-500 mt-1">Short identifier used on product tags.</p>
                </div>

                {/* Display Order */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">
                    Display Order <span className="text-[#c9a87c]">*</span>
                  </label>
                  <Field
                    type="number"
                    name="displayOrder"
                    min={1}
                    className="w-full bg-[#1e1c1a] border border-[#38332e] focus:border-[#c9a87c] rounded px-3.5 py-2.5 text-sm font-mono text-neutral-100 outline-none transition-colors"
                  />
                  <ErrorMessage
                    name="displayOrder"
                    component="p"
                    className="text-xs text-rose-400 mt-1 font-sans"
                  />
                  <p className="text-[11px] text-neutral-500 mt-1">Lower values appear first in filters.</p>
                </div>
              </div>

              {/* Is Active Toggle */}
              <div className="pt-2 border-t border-[#2e2a27]">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs uppercase tracking-wider text-neutral-200 font-medium block">
                      Active Status
                    </label>
                    <p className="text-xs text-neutral-400">
                      When active, this fit silhouette is selectable on the storefront.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={values.isActive}
                    onClick={() => setFieldValue('isActive', !values.isActive)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      values.isActive ? 'bg-[#8d674f]' : 'bg-neutral-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        values.isActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-5 border-t border-[#2e2a27] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 text-xs uppercase tracking-wider text-neutral-400 hover:text-neutral-100 rounded border border-neutral-700 hover:border-neutral-500 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-xs uppercase tracking-wider bg-[#54382c] hover:bg-[#3e271d] text-white rounded font-medium transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  <Check size={14} />
                  <span>{isSubmitting ? 'Saving...' : isEditing ? 'Update Fit Size' : 'Create Fit Size'}</span>
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};
