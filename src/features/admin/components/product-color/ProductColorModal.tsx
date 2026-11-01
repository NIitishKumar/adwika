import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import { X, Check, Palette, AlertTriangle } from 'lucide-react';
import { validateWithZod } from '@/lib/validation/zod-formik';
import { productColorSchema, ProductColorFormData } from '../../schemas/productColor.schema';
import { ProductColor } from '../../types/productColor.types';
import { getColorHex } from '../../utils/colorHelper';

interface ProductColorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: ProductColorFormData) => Promise<void>;
  initialData?: ProductColor | null;
}

export const ProductColorModal: React.FC<ProductColorModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    setServerError(null);
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const isEditing = Boolean(initialData);

  const initialValues: ProductColorFormData = {
    name: initialData?.name || '',
    code: initialData?.code || '',
    isActive: initialData?.isActive ?? true,
  };

  const handleSubmit = async (
    values: ProductColorFormData,
    { setSubmitting }: FormikHelpers<ProductColorFormData>
  ) => {
    setServerError(null);
    try {
      await onSubmit(values);
      onClose();
    } catch (err: any) {
      setServerError(err?.message || 'Failed to save product color');
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
              <Palette size={16} />
            </span>
            <div>
              <h3 className="font-serif text-lg tracking-wide text-neutral-100">
                {isEditing ? 'Edit Product Color' : 'Add Product Color'}
              </h3>
              <p className="text-xs text-neutral-400 font-sans">
                {isEditing
                  ? `Update color swatch attributes for ${initialData?.name}`
                  : 'Register a new artisanal dye or garment colorway'}
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
        <Formik<ProductColorFormData>
          initialValues={initialValues}
          validate={validateWithZod(productColorSchema)}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting, values, setFieldValue }) => {
            const previewHex = getColorHex(values.name, values.code);

            return (
              <Form className="p-6 space-y-5">
                {serverError && (
                  <div className="p-3 rounded bg-rose-950/70 border border-rose-800/80 text-rose-200 text-xs flex items-center gap-2.5">
                    <AlertTriangle size={16} className="shrink-0 text-rose-400" />
                    <span>{serverError}</span>
                  </div>
                )}

                {/* Swatch Live Preview Banner */}
                <div className="p-3.5 rounded bg-[#1b1917] border border-[#302b26] flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full border border-white/20 shadow-inner shrink-0 transition-colors duration-200"
                    style={{ backgroundColor: previewHex }}
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-[#c9a87c] block">
                      Swatch Preview
                    </span>
                    <span className="text-sm font-serif text-neutral-200 truncate block">
                      {values.name || 'Untitled Shade'}
                    </span>
                  </div>
                  {values.code && (
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#25201b] border border-[#3d342a] text-[#d6c7b2]">
                      {values.code}
                    </span>
                  )}
                </div>

                {/* Color Name Field */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">
                    Color Name <span className="text-[#c9a87c]">*</span>
                  </label>
                  <Field
                    type="text"
                    name="name"
                    placeholder="e.g. Midnight Blue, Gulabi Pink, Kashmiri Ivory"
                    autoFocus
                    className="w-full bg-[#1e1c1a] border border-[#38332e] focus:border-[#c9a87c] rounded px-3.5 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-500 outline-none transition-colors"
                  />
                  <ErrorMessage
                    name="name"
                    component="p"
                    className="text-xs text-rose-400 mt-1 font-sans"
                  />
                </div>

                {/* Color Code Field */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">
                    Color Code <span className="text-[#c9a87c]">*</span>
                  </label>
                  <Field
                    type="text"
                    name="code"
                    placeholder="e.g. MID-BLU, GLB-PNK, IVR"
                    maxLength={20}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setFieldValue('code', e.target.value.toUpperCase());
                    }}
                    className="w-full bg-[#1e1c1a] border border-[#38332e] focus:border-[#c9a87c] rounded px-3.5 py-2.5 text-sm font-mono uppercase text-neutral-100 placeholder:text-neutral-500 outline-none transition-colors"
                  />
                  <ErrorMessage
                    name="code"
                    component="p"
                    className="text-xs text-rose-400 mt-1 font-sans"
                  />
                  <p className="text-[11px] text-neutral-500 mt-1">
                    Unique shorthand identifier (e.g., MID-BLU for Midnight Blue) used in SKUs and product variants.
                  </p>
                </div>

                {/* Is Active Toggle */}
                <div className="pt-2 border-t border-[#2e2a27]">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs uppercase tracking-wider text-neutral-200 font-medium block">
                        Active Status
                      </label>
                      <p className="text-xs text-neutral-400">
                        When active, this colorway is selectable in garment variants on the storefront.
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
                    <span>{isSubmitting ? 'Saving...' : isEditing ? 'Update Color' : 'Create Color'}</span>
                  </button>
                </div>
              </Form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
};
