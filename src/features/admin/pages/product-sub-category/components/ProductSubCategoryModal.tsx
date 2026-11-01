import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import { X, Check, Sparkles, AlertTriangle, Image as ImageIcon, FolderTree } from 'lucide-react';
import { validateWithZod } from '@/lib/validation/zod-formik';
import {
  productSubCategorySchema,
  ProductSubCategoryFormData,
} from '../../../schemas/productSubCategory.schema';
import { ProductSubCategory } from '../../../types/productSubCategory.types';
import { ProductCategory } from '../../../types/productCategory.types';

interface ProductSubCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: ProductSubCategoryFormData) => Promise<void>;
  initialData?: ProductSubCategory | null;
  parentCategories: ProductCategory[];
}

export const ProductSubCategoryModal: React.FC<ProductSubCategoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  parentCategories,
}) => {
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    setServerError(null);
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const isEditing = Boolean(initialData);

  const initialValues: ProductSubCategoryFormData = {
    categoryId: initialData?.categoryId || (parentCategories[0]?.id || ''),
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    image_url: initialData?.imageUrl || '',
    is_active: initialData?.isActive ?? true,
  };

  const handleSubmit = async (
    values: ProductSubCategoryFormData,
    { setSubmitting }: FormikHelpers<ProductSubCategoryFormData>
  ) => {
    setServerError(null);
    try {
      await onSubmit(values);
      onClose();
    } catch (err: any) {
      setServerError(err?.message || 'Failed to save product sub-category');
    } finally {
      setSubmitting(false);
    }
  };

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
                {isEditing ? 'Edit Sub-Category' : 'Create Product Sub-Category'}
              </h3>
              <p className="text-xs text-neutral-400 font-sans">
                {isEditing
                  ? `Update attributes and parent category for "${initialData?.name}"`
                  : 'Assign a sub-category under a parent collection with slug and imagery'}
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
          <Formik<ProductSubCategoryFormData>
            initialValues={initialValues}
            validate={validateWithZod(productSubCategorySchema)}
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

                {/* Parent Category Dropdown */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">
                    Parent Category <span className="text-[#c9a87c]">*</span>
                  </label>
                  <div className="relative">
                    <Field
                      as="select"
                      name="categoryId"
                      className="w-full bg-[#1e1c1a] border border-[#38332e] focus:border-[#c9a87c] rounded px-3.5 py-2.5 text-sm text-neutral-100 outline-none transition-colors cursor-pointer appearance-none"
                    >
                      <option value="" disabled className="bg-[#1e1c1a] text-neutral-500">
                        Select a parent collection...
                      </option>
                      {parentCategories.map((cat) => (
                        <option key={cat.id} value={cat.id} className="bg-[#1e1c1a] text-neutral-200">
                          {cat.title} ({cat.categoryId})
                        </option>
                      ))}
                    </Field>
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                      <FolderTree size={14} className="text-[#c9a87c]" />
                    </div>
                  </div>
                  <ErrorMessage
                    name="categoryId"
                    component="p"
                    className="text-xs text-rose-400 mt-1 font-sans"
                  />
                  <p className="text-[11px] text-neutral-500 mt-1">
                    Connects this sub-category to its primary catalog collection.
                  </p>
                </div>

                {/* Name & Slug Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Sub-Category Name */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">
                      Sub-Category Name <span className="text-[#c9a87c]">*</span>
                    </label>
                    <Field
                      type="text"
                      name="name"
                      placeholder="e.g. Kurtas & Suits, Anarkali Sets"
                      autoFocus
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const val = e.target.value;
                        setFieldValue('name', val);
                        if (!isEditing && !touched.slug) {
                          setFieldValue('slug', slugify(val));
                        }
                      }}
                      className="w-full bg-[#1e1c1a] border border-[#38332e] focus:border-[#c9a87c] rounded px-3.5 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-500 outline-none transition-colors"
                    />
                    <ErrorMessage
                      name="name"
                      component="p"
                      className="text-xs text-rose-400 mt-1 font-sans"
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">
                      Slug <span className="text-[#c9a87c]">*</span>
                    </label>
                    <Field
                      type="text"
                      name="slug"
                      placeholder="e.g. kurtas-and-suits"
                      disabled={isEditing}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setFieldValue('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'));
                      }}
                      className={`w-full bg-[#1e1c1a] border border-[#38332e] focus:border-[#c9a87c] rounded px-3.5 py-2.5 text-sm font-mono text-neutral-100 placeholder:text-neutral-500 outline-none transition-colors ${
                        isEditing ? 'opacity-60 cursor-not-allowed' : ''
                      }`}
                    />
                    <ErrorMessage
                      name="slug"
                      component="p"
                      className="text-xs text-rose-400 mt-1 font-sans"
                    />
                    <p className="text-[11px] text-neutral-500 mt-1">
                      {isEditing
                        ? 'Slug identifier cannot be edited.'
                        : 'Unique lowercase identifier for URL routing.'}
                    </p>
                  </div>
                </div>

                {/* Image URL & Thumbnail Preview */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">
                    Image URL
                  </label>
                  <div className="flex gap-3 items-center">
                    <Field
                      type="text"
                      name="image_url"
                      placeholder="https://example.com/images/kurtas.jpg"
                      className="flex-1 bg-[#1e1c1a] border border-[#38332e] focus:border-[#c9a87c] rounded px-3.5 py-2.5 text-xs text-neutral-100 placeholder:text-neutral-500 outline-none transition-colors"
                    />
                    <div className="w-10 h-10 rounded border border-[#38322c] bg-[#1a1816] overflow-hidden shrink-0 flex items-center justify-center">
                      {values.image_url ? (
                        <img
                          src={values.image_url}
                          alt="Sub-category preview"
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
                    Visual icon or thumbnail representing this sub-category in navigation and filters.
                  </p>
                </div>

                {/* Storefront Active Toggle */}
                <div className="pt-2 border-t border-[#2e2a27]">
                  <div className="flex items-center justify-between p-3 rounded bg-[#191715] border border-[#2e2a27]">
                    <div>
                      <span className="text-xs uppercase tracking-wider text-neutral-200 font-medium block">
                        Storefront Active Status
                      </span>
                      <span className="text-[11px] text-neutral-400">
                        {values.is_active
                          ? 'Active — clients can filter and explore garments in this sub-category'
                          : 'Inactive — hidden from public catalog navigation'}
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
                        ? 'Update Sub-Category'
                        : 'Create Sub-Category'}
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
