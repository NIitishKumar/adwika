import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import {
  X,
  Check,
  Sparkles,
  AlertTriangle,
  Image as ImageIcon,
  Layers,
  Star,
} from 'lucide-react';
import { validateWithZod } from '@/lib/validation/zod-formik';
import {
  productImageSchema,
  ProductImageFormData,
} from '../../../schemas/productImage.schema';
import { ProductImage } from '../../../types/productImage.types';
import { Product } from '../../../types/product.types';

interface ProductImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: ProductImageFormData) => Promise<void>;
  initialData?: ProductImage | null;
  products: Product[];
  nextDisplayOrder?: number;
}

export const ProductImageModal: React.FC<ProductImageModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  products,
  nextDisplayOrder = 1,
}) => {
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    setServerError(null);
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const isEditing = Boolean(initialData);

  const initialValues: ProductImageFormData = {
    productId: initialData?.productId || (products[0]?.id || ''),
    image_url: initialData?.imageUrl || '',
    alt_text: initialData?.altText || '',
    display_order: initialData?.displayOrder ?? nextDisplayOrder,
    is_primary: initialData?.isPrimary ?? false,
  };

  const handleSubmit = async (
    values: ProductImageFormData,
    { setSubmitting }: FormikHelpers<ProductImageFormData>
  ) => {
    setServerError(null);
    try {
      await onSubmit(values);
      onClose();
    } catch (err: any) {
      setServerError(err?.message || 'Failed to save product image');
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
                {isEditing ? 'Edit Garment Image' : 'Upload Garment Image'}
              </h3>
              <p className="text-xs text-neutral-400 font-sans">
                {isEditing
                  ? 'Update image link, alt description, and primary cover status'
                  : 'Assign photography asset URL, sequence priority, and alt text to a garment'}
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
        <Formik<ProductImageFormData>
          initialValues={initialValues}
          validate={validateWithZod(productImageSchema)}
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

              {/* Image URL & Instant Live Preview */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">
                  Image URL <span className="text-[#c9a87c]">*</span>
                </label>
                <Field
                  type="text"
                  name="image_url"
                  placeholder="https://example.com/images/floral-kurta-front.jpg"
                  autoFocus
                  className="w-full bg-[#1e1c1a] border border-[#38332e] focus:border-[#c9a87c] rounded px-3.5 py-2.5 text-xs text-neutral-100 placeholder:text-neutral-500 outline-none transition-colors"
                />
                <ErrorMessage
                  name="image_url"
                  component="p"
                  className="text-xs text-rose-400 mt-1 font-sans"
                />

                {/* Live Preview Container */}
                <div className="mt-2.5 h-36 w-full rounded border border-[#38322c] bg-[#1a1816] overflow-hidden flex items-center justify-center relative">
                  {values.image_url ? (
                    <img
                      src={values.image_url}
                      alt="Product preview"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="text-center text-neutral-500">
                      <ImageIcon size={24} className="mx-auto mb-1 opacity-60" />
                      <p className="text-[11px] font-mono">Image preview appears here</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Alt Text */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">
                  Alt Text (Accessibility & SEO)
                </label>
                <Field
                  type="text"
                  name="alt_text"
                  placeholder="e.g. Front view of floral embroidered kurta on model"
                  className="w-full bg-[#1e1c1a] border border-[#38332e] focus:border-[#c9a87c] rounded px-3.5 py-2.5 text-xs text-neutral-100 placeholder:text-neutral-500 outline-none transition-colors"
                />
                <ErrorMessage
                  name="alt_text"
                  component="p"
                  className="text-xs text-rose-400 mt-1 font-sans"
                />
              </div>

              {/* Display Order & Primary Cover Toggle Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#2e2a27]">
                {/* Display Order */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">
                    Display Priority <span className="text-[#c9a87c]">*</span>
                  </label>
                  <Field
                    type="number"
                    name="display_order"
                    min={1}
                    className="w-full bg-[#1e1c1a] border border-[#38332e] focus:border-[#c9a87c] rounded px-3.5 py-2.5 text-sm font-mono text-neutral-100 outline-none transition-colors"
                  />
                  <ErrorMessage
                    name="display_order"
                    component="p"
                    className="text-xs text-rose-400 mt-1 font-sans"
                  />
                  <p className="text-[11px] text-neutral-500 mt-1">Lower values appear first in gallery.</p>
                </div>

                {/* Primary Cover Switch */}
                <div className="flex flex-col justify-center">
                  <div className="flex items-center justify-between p-2.5 rounded bg-[#191715] border border-[#2e2a27]">
                    <div>
                      <span className="text-xs uppercase tracking-wider text-neutral-200 font-medium flex items-center gap-1.5">
                        <Star size={12} className="text-amber-400" />
                        <span>Primary Cover</span>
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        {values.is_primary ? 'Main catalog thumbnail' : 'Secondary gallery photo'}
                      </span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={values.is_primary}
                      onClick={() => setFieldValue('is_primary', !values.is_primary)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        values.is_primary ? 'bg-[#8d674f]' : 'bg-neutral-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          values.is_primary ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
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
                      ? 'Update Image'
                      : 'Add Image'}
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
