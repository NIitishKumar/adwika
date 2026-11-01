import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import { X, Check, Sparkles, AlertTriangle, Layers, Tag } from 'lucide-react';
import { validateWithZod } from '@/lib/validation/zod-formik';
import {
  productAttributeSchema,
  ProductAttributeFormData,
} from '../../../schemas/productAttribute.schema';
import { ProductAttribute } from '../../../types/productAttribute.types';
import { Product } from '../../../types/product.types';

interface ProductAttributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: ProductAttributeFormData) => Promise<void>;
  initialData?: ProductAttribute | null;
  products: Product[];
}

const COMMON_ATTRIBUTE_SUGGESTIONS = [
  'Fabric',
  'Weave',
  'Care Instructions',
  'Occasion',
  'Embroidery',
  'Craft Technique',
  'Lining',
  'Neckline',
  'Sleeve Length',
  'Origin',
];

export const ProductAttributeModal: React.FC<ProductAttributeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  products,
}) => {
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    setServerError(null);
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const isEditing = Boolean(initialData);

  const initialValues: ProductAttributeFormData = {
    productId: initialData?.productId || (products[0]?.id || ''),
    name: initialData?.name || '',
    value: initialData?.value || '',
  };

  const handleSubmit = async (
    values: ProductAttributeFormData,
    { setSubmitting }: FormikHelpers<ProductAttributeFormData>
  ) => {
    setServerError(null);
    try {
      await onSubmit(values);
      onClose();
    } catch (err: any) {
      setServerError(err?.message || 'Failed to save product attribute');
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
                {isEditing ? 'Edit Product Attribute' : 'Add Product Attribute'}
              </h3>
              <p className="text-xs text-neutral-400 font-sans">
                {isEditing
                  ? `Update specification details for "${initialData?.name}"`
                  : 'Record artisanal specifications like fabric composition, weave, and care instructions'}
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
        <Formik<ProductAttributeFormData>
          initialValues={initialValues}
          validate={validateWithZod(productAttributeSchema)}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting, setFieldValue, values }) => (
            <Form className="p-6 space-y-5">
              {serverError && (
                <div className="p-3 rounded bg-rose-950/70 border border-rose-800/80 text-rose-200 text-xs flex items-center gap-2.5">
                  <AlertTriangle size={16} className="shrink-0 text-rose-400" />
                  <span>{serverError}</span>
                </div>
              )}

              {/* Target Garment Dropdown */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">
                  Target Garment Product <span className="text-[#c9a87c]">*</span>
                </label>
                <div className="relative">
                  <Field
                    as="select"
                    name="productId"
                    className="w-full bg-[#1e1c1a] border border-[#38332e] focus:border-[#c9a87c] rounded px-3.5 py-2.5 text-sm text-neutral-100 outline-none transition-colors cursor-pointer appearance-none"
                  >
                    <option value="" disabled className="bg-[#1e1c1a] text-neutral-500">
                      Select a product...
                    </option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id} className="bg-[#1e1c1a] text-neutral-200">
                        {p.name} ({p.slug})
                      </option>
                    ))}
                  </Field>
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                    <Layers size={14} className="text-[#c9a87c]" />
                  </div>
                </div>
                <ErrorMessage
                  name="productId"
                  component="p"
                  className="text-xs text-rose-400 mt-1 font-sans"
                />
              </div>

              {/* Attribute Name Field + Suggestion Chips */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">
                  Attribute Name (Key) <span className="text-[#c9a87c]">*</span>
                </label>
                <Field
                  type="text"
                  name="name"
                  placeholder="e.g. Fabric, Weave, Care Instructions, Occasion"
                  autoFocus
                  className="w-full bg-[#1e1c1a] border border-[#38332e] focus:border-[#c9a87c] rounded px-3.5 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-500 outline-none transition-colors"
                />
                <ErrorMessage
                  name="name"
                  component="p"
                  className="text-xs text-rose-400 mt-1 font-sans"
                />

                {/* Quick suggestions */}
                <div className="mt-2.5">
                  <p className="text-[10px] uppercase font-mono text-neutral-500 tracking-wider mb-1.5">
                    Suggested Attributes:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {COMMON_ATTRIBUTE_SUGGESTIONS.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => setFieldValue('name', suggestion)}
                        className={`text-[10px] font-mono px-2 py-0.5 rounded transition-colors ${
                          values.name === suggestion
                            ? 'bg-[#3b2b20] text-[#e0cfba] border border-[#6b4e36]'
                            : 'bg-[#1b1917] hover:bg-[#25221f] text-neutral-400 hover:text-white border border-[#2e2a27]'
                        }`}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Attribute Value */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">
                  Specification Value <span className="text-[#c9a87c]">*</span>
                </label>
                <Field
                  as="textarea"
                  rows={3}
                  name="value"
                  placeholder="e.g. 100% Pure Mulberry Silk, Handloom Chanderi with Zari border, Dry clean only..."
                  className="w-full bg-[#1e1c1a] border border-[#38332e] focus:border-[#c9a87c] rounded px-3.5 py-2.5 text-xs text-neutral-100 placeholder:text-neutral-500 outline-none transition-colors resize-none leading-relaxed"
                />
                <ErrorMessage
                  name="value"
                  component="p"
                  className="text-xs text-rose-400 mt-1 font-sans"
                />
                <p className="text-[11px] text-neutral-500 mt-1">
                  Accurate material or care details displayed on garment product page.
                </p>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-[#2e2a27] flex items-center justify-end gap-3">
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
                  <span>
                    {isSubmitting
                      ? 'Saving...'
                      : isEditing
                      ? 'Update Attribute'
                      : 'Add Attribute'}
                  </span>
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};
