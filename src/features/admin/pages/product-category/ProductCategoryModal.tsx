import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import { X, Check, Sparkles, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import { validateWithZod } from '@/lib/validation/zod-formik';
import {
  productCategorySchema,
  ProductCategoryFormData,
} from '../../schemas/productCategory.schema';
import { ProductCategory } from '../../types/productCategory.types';

interface ProductCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: ProductCategoryFormData) => Promise<void>;
  initialData?: ProductCategory | null;
  nextOrderBy?: number;
}

export const ProductCategoryModal: React.FC<ProductCategoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  nextOrderBy = 1,
}) => {
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    setServerError(null);
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const isEditing = Boolean(initialData);

  const initialValues: ProductCategoryFormData = {
    id: initialData?.categoryId || '',
    title: initialData?.title || '',
    description: initialData?.description || '',
    image_url: initialData?.imageUrl || '',
    banner_image_url: initialData?.bannerImageUrl || '',
    order_by: initialData?.orderBy ?? nextOrderBy,
    is_active: initialData?.isActive ?? true,
  };

  const handleSubmit = async (
    values: ProductCategoryFormData,
    { setSubmitting }: FormikHelpers<ProductCategoryFormData>
  ) => {
    setServerError(null);
    try {
      await onSubmit(values);
      onClose();
    } catch (err: any) {
      setServerError(err?.message || 'Failed to save product category');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to slugify text
  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
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
      <div className="relative z-10 w-full max-w-xl max-h-[90vh] flex flex-col bg-[#141414] border border-[#2e2a27] rounded-lg shadow-2xl overflow-hidden text-neutral-100 animate-scaleIn">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#2e2a27] flex items-center justify-between bg-[#191817] shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded bg-[#2a221b] text-[#c9a87c] border border-[#4a3a2c]">
              <Sparkles size={16} />
            </span>
            <div>
              <h3 className="font-serif text-lg tracking-wide text-neutral-100">
                {isEditing ? 'Edit Category' : 'Create Product Category'}
              </h3>
              <p className="text-xs text-neutral-400 font-sans">
                {isEditing
                  ? `Update catalog hierarchy and media for "${initialData?.title}"`
                  : 'Configure category slug, title, banner visuals, and display sequence'}
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

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto flex-1">
          <Formik<ProductCategoryFormData>
            initialValues={initialValues}
            validate={validateWithZod(productCategorySchema)}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isSubmitting, values, setFieldValue, touched }) => (
              <Form className="p-6 space-y-5">
                {serverError && (
                  <div className="p-3 rounded bg-rose-950/70 border border-rose-800/80 text-rose-200 text-xs flex items-center gap-2.5">
                    <AlertTriangle size={16} className="shrink-0 text-rose-400" />
                    <span>{serverError}</span>
                  </div>
                )}

                {/* Title & Slug Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category Title */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">
                      Category Title <span className="text-[#c9a87c]">*</span>
                    </label>
                    <Field
                      type="text"
                      name="title"
                      placeholder="e.g. Ethnic Wear, Kurtis"
                      autoFocus
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const val = e.target.value;
                        setFieldValue('title', val);
                        // Auto-populate slug if user hasn't explicitly edited slug in create mode
                        if (!isEditing && !touched.id) {
                          setFieldValue('id', slugify(val));
                        }
                      }}
                      className="w-full bg-[#1e1c1a] border border-[#38332e] focus:border-[#c9a87c] rounded px-3.5 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-500 outline-none transition-colors"
                    />
                    <ErrorMessage
                      name="title"
                      component="p"
                      className="text-xs text-rose-400 mt-1 font-sans"
                    />
                  </div>

                  {/* Slug / ID */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">
                      Category Slug (ID) <span className="text-[#c9a87c]">*</span>
                    </label>
                    <Field
                      type="text"
                      name="id"
                      placeholder="e.g. ethnic-wear"
                      disabled={isEditing}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setFieldValue('id', e.target.value.toLowerCase().replace(/\s+/g, '-'));
                      }}
                      className={`w-full bg-[#1e1c1a] border border-[#38332e] focus:border-[#c9a87c] rounded px-3.5 py-2.5 text-sm font-mono text-neutral-100 placeholder:text-neutral-500 outline-none transition-colors ${
                        isEditing ? 'opacity-60 cursor-not-allowed' : ''
                      }`}
                    />
                    <ErrorMessage
                      name="id"
                      component="p"
                      className="text-xs text-rose-400 mt-1 font-sans"
                    />
                    <p className="text-[11px] text-neutral-500 mt-1">
                      {isEditing
                        ? 'Unique identifier cannot be modified once created.'
                        : 'Lowercase slug for URLs and APIs (e.g. suits, ethnic-wear).'}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">
                    Description
                  </label>
                  <Field
                    as="textarea"
                    rows={2}
                    name="description"
                    placeholder="Brief description of the silhouettes, craftsmanship, or styling in this collection..."
                    className="w-full bg-[#1e1c1a] border border-[#38332e] focus:border-[#c9a87c] rounded px-3.5 py-2.5 text-xs text-neutral-100 placeholder:text-neutral-500 outline-none transition-colors resize-none"
                  />
                  <ErrorMessage
                    name="description"
                    component="p"
                    className="text-xs text-rose-400 mt-1 font-sans"
                  />
                </div>

                {/* Image URL & Preview */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">
                    Category Image URL
                  </label>
                  <div className="flex gap-3 items-center">
                    <Field
                      type="text"
                      name="image_url"
                      placeholder="https://example.com/images/ethnic.jpg"
                      className="flex-1 bg-[#1e1c1a] border border-[#38332e] focus:border-[#c9a87c] rounded px-3.5 py-2.5 text-xs text-neutral-100 placeholder:text-neutral-500 outline-none transition-colors"
                    />
                    <div className="w-10 h-10 rounded border border-[#38322c] bg-[#1a1816] overflow-hidden shrink-0 flex items-center justify-center">
                      {values.image_url ? (
                        <img
                          src={values.image_url}
                          alt="Category preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <ImageIcon size={14} className="text-neutral-500" />
                      )}
                    </div>
                  </div>
                  <ErrorMessage
                    name="image_url"
                    component="p"
                    className="text-xs text-rose-400 mt-1 font-sans"
                  />
                  <p className="text-[11px] text-neutral-500 mt-1">
                    Card thumbnail image displayed on category navigation.
                  </p>
                </div>

                {/* Banner Image URL & Preview */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">
                    Banner Image URL
                  </label>
                  <Field
                    type="text"
                    name="banner_image_url"
                    placeholder="https://example.com/images/ethnic-banner.jpg"
                    className="w-full bg-[#1e1c1a] border border-[#38332e] focus:border-[#c9a87c] rounded px-3.5 py-2.5 text-xs text-neutral-100 placeholder:text-neutral-500 outline-none transition-colors"
                  />
                  {values.banner_image_url && (
                    <div className="mt-2 h-16 w-full rounded border border-[#38322c] bg-[#1a1816] overflow-hidden">
                      <img
                        src={values.banner_image_url}
                        alt="Banner preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <ErrorMessage
                    name="banner_image_url"
                    component="p"
                    className="text-xs text-rose-400 mt-1 font-sans"
                  />
                  <p className="text-[11px] text-neutral-500 mt-1">
                    High-resolution hero header banner for the collection listing page.
                  </p>
                </div>

                {/* Order and Active Status Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#2e2a27]">
                  {/* Order By */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">
                      Display Priority <span className="text-[#c9a87c]">*</span>
                    </label>
                    <Field
                      type="number"
                      name="order_by"
                      min={1}
                      className="w-full bg-[#1e1c1a] border border-[#38332e] focus:border-[#c9a87c] rounded px-3.5 py-2.5 text-sm font-mono text-neutral-100 outline-none transition-colors"
                    />
                    <ErrorMessage
                      name="order_by"
                      component="p"
                      className="text-xs text-rose-400 mt-1 font-sans"
                    />
                    <p className="text-[11px] text-neutral-500 mt-1">Lower order numbers appear first.</p>
                  </div>

                  {/* Active Toggle */}
                  <div className="flex flex-col justify-center">
                    <div className="flex items-center justify-between p-2.5 rounded bg-[#191715] border border-[#2e2a27]">
                      <div>
                        <span className="text-xs uppercase tracking-wider text-neutral-200 font-medium block">
                          Storefront Active
                        </span>
                        <span className="text-[10px] text-neutral-400">
                          {values.is_active ? 'Visible to customers' : 'Hidden / Draft'}
                        </span>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={values.is_active}
                        onClick={() => setFieldValue('is_active', !values.is_active)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          values.is_active ? 'bg-[#8d674f]' : 'bg-neutral-700'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            values.is_active ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
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
                        ? 'Update Category'
                        : 'Create Category'}
                    </span>
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};
