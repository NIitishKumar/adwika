import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import {
  X,
  Check,
  Sparkles,
  AlertTriangle,
  FolderTree,
  FolderGit2,
  Scissors,
  IndianRupee,
  ChevronDown,
  Image as ImageIcon,
} from 'lucide-react';
import { validateWithZod } from '@/lib/validation/zod-formik';
import { productSchema, ProductFormData } from '../../../schemas/product.schema';
import { Product } from '../../../types/product.types';
import { ProductCategory } from '../../../types/productCategory.types';
import { ProductSubCategory } from '../../../types/productSubCategory.types';
import { FitSize } from '../../../types/fitSize.types';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: ProductFormData) => Promise<void>;
  initialData?: Product | null;
  categories: ProductCategory[];
  subCategories: ProductSubCategory[];
  fitSizes: FitSize[];
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  categories,
  subCategories,
  fitSizes,
}) => {
  const [serverError, setServerError] = useState<string | null>(null);
  const [showSeo, setShowSeo] = useState<boolean>(false);

  useEffect(() => {
    setServerError(null);
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const isEditing = Boolean(initialData);

  const initialValues: ProductFormData = {
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    categoryId: initialData?.categoryId || (categories[0]?.id || ''),
    subCategoryId: initialData?.subCategoryId || '',
    short_description: initialData?.shortDescription || '',
    description: initialData?.description || '',
    gender: initialData?.gender || 'WOMEN',
    fit: initialData?.fit || (fitSizes[0]?.name || 'Regular Fit'),
    imageUrl: initialData?.imageUrl || '',
    base_price: initialData?.basePrice ?? 1499,
    status: initialData?.status || 'ACTIVE',
    meta_title: initialData?.metaTitle || '',
    meta_description: initialData?.metaDescription || '',
  };

  const handleSubmit = async (
    values: ProductFormData,
    { setSubmitting }: FormikHelpers<ProductFormData>
  ) => {
    setServerError(null);
    try {
      await onSubmit(values);
      onClose();
    } catch (err: any) {
      setServerError(err?.message || 'Failed to save product');
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
      <div className="relative z-10 w-full max-w-2xl max-h-[92vh] flex flex-col bg-[#141414] border border-[#2e2a27] rounded-lg shadow-2xl overflow-hidden text-neutral-100 animate-scaleIn">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#2e2a27] flex items-center justify-between bg-[#191817] shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded bg-[#2a221b] text-[#c9a87c] border border-[#4a3a2c]">
              <Sparkles size={16} />
            </span>
            <div>
              <h3 className="font-serif text-lg tracking-wide text-neutral-100">
                {isEditing ? 'Edit Garment Product' : 'Create Garment Product'}
              </h3>
              <p className="text-xs text-neutral-400 font-sans">
                {isEditing
                  ? `Update catalog specifications for "${initialData?.name}"`
                  : 'Define garment title, categories, silhouette fit, and base pricing in INR'}
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
          <Formik<ProductFormData>
            initialValues={initialValues}
            validate={validateWithZod(productSchema)}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isSubmitting, values, setFieldValue, touched }) => {
              // Filter sub-categories based on selected category
              const availableSubCategories = subCategories.filter(
                (s) => !values.categoryId || s.categoryId === values.categoryId
              );

              return (
                <Form className="p-6 space-y-5">
                  {serverError && (
                    <div className="p-3 rounded bg-rose-950/70 border border-rose-800/80 text-rose-200 text-xs flex items-center gap-2.5">
                      <AlertTriangle size={16} className="shrink-0 text-rose-400" />
                      <span>{serverError}</span>
                    </div>
                  )}

                  {/* Product Name */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">
                      Garment Name <span className="text-[#c9a87c]">*</span>
                    </label>
                    <Field
                      type="text"
                      name="name"
                      placeholder="e.g. Classic Oxford Cotton Shirt Ragular Fit"
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

                  {/* Slug & Base Price Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Slug */}
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">
                        URL Slug
                      </label>
                      <Field
                        type="text"
                        name="slug"
                        placeholder="e.g. classic-oxford-cotton-shirt"
                        className="w-full bg-[#1e1c1a] border border-[#38332e] focus:border-[#c9a87c] rounded px-3.5 py-2.5 text-sm font-mono text-neutral-100 placeholder:text-neutral-500 outline-none transition-colors"
                      />
                      <ErrorMessage
                        name="slug"
                        component="p"
                        className="text-xs text-rose-400 mt-1 font-sans"
                      />
                    </div>

                    {/* Base Price */}
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">
                        Base Price (INR) <span className="text-[#c9a87c]">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#c9a87c]">
                          <IndianRupee size={14} />
                        </span>
                        <Field
                          type="number"
                          name="base_price"
                          min={0}
                          placeholder="1498"
                          className="w-full bg-[#1e1c1a] border border-[#38332e] focus:border-[#c9a87c] rounded pl-9 pr-3.5 py-2.5 text-sm font-mono text-neutral-100 outline-none transition-colors"
                        />
                      </div>
                      <ErrorMessage
                        name="base_price"
                        component="p"
                        className="text-xs text-rose-400 mt-1 font-sans"
                      />
                    </div>
                  </div>

                  {/* Garment Image URL */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">
                      Garment Image URL (imageUrl)
                    </label>
                    <div className="flex gap-3 items-center">
                      <div className="relative flex-1">
                        <Field
                          type="url"
                          name="imageUrl"
                          placeholder="https://images.unsplash.com/... or uploaded garment image URL"
                          className="w-full bg-[#1e1c1a] border border-[#38332e] focus:border-[#c9a87c] rounded pl-9 pr-3.5 py-2.5 text-xs font-mono text-neutral-100 placeholder:text-neutral-500 outline-none transition-colors"
                        />
                        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                          <ImageIcon size={14} className="text-[#c9a87c]" />
                        </div>
                      </div>
                      {values.imageUrl && (
                        <div className="w-10 h-10 rounded border border-[#38332e] overflow-hidden bg-[#141211] shrink-0">
                          <img
                            src={values.imageUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <ErrorMessage
                      name="imageUrl"
                      component="p"
                      className="text-xs text-rose-400 mt-1 font-sans"
                    />
                  </div>

                  {/* Category & Sub-Category Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Category Select */}
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">
                        Primary Collection <span className="text-[#c9a87c]">*</span>
                      </label>
                      <div className="relative">
                        <Field
                          as="select"
                          name="categoryId"
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                            setFieldValue('categoryId', e.target.value);
                            setFieldValue('subCategoryId', '');
                          }}
                          className="w-full bg-[#1e1c1a] border border-[#38332e] focus:border-[#c9a87c] rounded px-3.5 py-2.5 text-sm text-neutral-100 outline-none transition-colors cursor-pointer appearance-none"
                        >
                          <option value="" disabled className="bg-[#1e1c1a] text-neutral-500">
                            Select a category...
                          </option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id} className="bg-[#1e1c1a] text-neutral-200">
                              {cat.title}
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
                    </div>

                    {/* Sub-Category Select */}
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">
                        Sub-Category
                      </label>
                      <div className="relative">
                        <Field
                          as="select"
                          name="subCategoryId"
                          className="w-full bg-[#1e1c1a] border border-[#38332e] focus:border-[#c9a87c] rounded px-3.5 py-2.5 text-sm text-neutral-100 outline-none transition-colors cursor-pointer appearance-none"
                        >
                          <option value="" className="bg-[#1e1c1a] text-neutral-500">
                            None (or select sub-category)
                          </option>
                          {availableSubCategories.map((sub) => (
                            <option key={sub.id} value={sub.id} className="bg-[#1e1c1a] text-neutral-200">
                              {sub.name}
                            </option>
                          ))}
                        </Field>
                        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                          <FolderGit2 size={14} className="text-[#c9a87c]" />
                        </div>
                      </div>
                      <ErrorMessage
                        name="subCategoryId"
                        component="p"
                        className="text-xs text-rose-400 mt-1 font-sans"
                      />
                    </div>
                  </div>

                  {/* Gender, Fit, and Status Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Gender */}
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">
                        Gender <span className="text-[#c9a87c]">*</span>
                      </label>
                      <Field
                        as="select"
                        name="gender"
                        className="w-full bg-[#1e1c1a] border border-[#38332e] focus:border-[#c9a87c] rounded px-3.5 py-2.5 text-sm text-neutral-100 outline-none transition-colors cursor-pointer"
                      >
                        <option value="WOMEN" className="bg-[#1e1c1a]">WOMEN</option>
                        <option value="UNISEX" className="bg-[#1e1c1a]">UNISEX</option>
                      </Field>
                    </div>

                    {/* Fit Silhouette */}
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">
                        Fit Silhouette <span className="text-[#c9a87c]">*</span>
                      </label>
                      <div className="relative">
                        <Field
                          as="select"
                          name="fit"
                          className="w-full bg-[#1e1c1a] border border-[#38332e] focus:border-[#c9a87c] rounded px-3.5 py-2.5 text-sm text-neutral-100 outline-none transition-colors cursor-pointer appearance-none"
                        >
                          {fitSizes.length > 0 ? (
                            fitSizes.map((f) => (
                              <option key={f.id} value={f.name} className="bg-[#1e1c1a]">
                                {f.name} ({f.fitCode})
                              </option>
                            ))
                          ) : (
                            <>
                              <option value="Slim Fit" className="bg-[#1e1c1a]">Slim Fit</option>
                              <option value="Regular Fit" className="bg-[#1e1c1a]">Regular Fit</option>
                              <option value="Relaxed Fit" className="bg-[#1e1c1a]">Relaxed Fit</option>
                              <option value="Oversized Fit" className="bg-[#1e1c1a]">Oversized Fit</option>
                            </>
                          )}
                        </Field>
                        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                          <Scissors size={14} className="text-[#c9a87c]" />
                        </div>
                      </div>
                      <ErrorMessage
                        name="fit"
                        component="p"
                        className="text-xs text-rose-400 mt-1 font-sans"
                      />
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">
                        Status <span className="text-[#c9a87c]">*</span>
                      </label>
                      <Field
                        as="select"
                        name="status"
                        className="w-full bg-[#1e1c1a] border border-[#38332e] focus:border-[#c9a87c] rounded px-3.5 py-2.5 text-sm text-neutral-100 outline-none transition-colors cursor-pointer"
                      >
                        <option value="ACTIVE" className="bg-[#1e1c1a]">ACTIVE</option>
                        <option value="DRAFT" className="bg-[#1e1c1a]">DRAFT</option>
                        <option value="INACTIVE" className="bg-[#1e1c1a]">INACTIVE</option>
                      </Field>
                    </div>
                  </div>

                  {/* Short Description */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">
                      Short Tagline / Teaser
                    </label>
                    <Field
                      type="text"
                      name="short_description"
                      placeholder="e.g. Premium breathable 100% cotton shirt with mother-of-pearl buttons"
                      className="w-full bg-[#1e1c1a] border border-[#38332e] focus:border-[#c9a87c] rounded px-3.5 py-2.5 text-xs text-neutral-100 placeholder:text-neutral-500 outline-none transition-colors"
                    />
                    <ErrorMessage
                      name="short_description"
                      component="p"
                      className="text-xs text-rose-400 mt-1 font-sans"
                    />
                  </div>

                  {/* Full Description */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">
                      Artisanal Story & Garment Details
                    </label>
                    <Field
                      as="textarea"
                      rows={3}
                      name="description"
                      placeholder="Detailed narrative describing craftsmanship, fabric weave, styling recommendations..."
                      className="w-full bg-[#1e1c1a] border border-[#38332e] focus:border-[#c9a87c] rounded px-3.5 py-2.5 text-xs text-neutral-100 placeholder:text-neutral-500 outline-none transition-colors resize-none"
                    />
                    <ErrorMessage
                      name="description"
                      component="p"
                      className="text-xs text-rose-400 mt-1 font-sans"
                    />
                  </div>

                  {/* Expandable SEO Details */}
                  <div className="pt-2 border-t border-[#2e2a27]">
                    <button
                      type="button"
                      onClick={() => setShowSeo((prev) => !prev)}
                      className="flex items-center justify-between w-full py-1 text-xs text-[#c9a87c] uppercase tracking-wider font-mono hover:text-white transition-colors"
                    >
                      <span>Search Engine Optimization (SEO Metadata)</span>
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-200 ${showSeo ? 'rotate-180' : ''
                          }`}
                      />
                    </button>

                    {showSeo && (
                      <div className="mt-3 space-y-3 p-3.5 rounded bg-[#181615] border border-[#2e2a27]">
                        <div>
                          <label className="block text-[11px] uppercase tracking-wider text-neutral-300 mb-1 font-mono">
                            Meta Title
                          </label>
                          <Field
                            type="text"
                            name="meta_title"
                            placeholder="e.g. Classic Oxford Cotton Shirt Ragular fit - Adwika"
                            className="w-full bg-[#141414] border border-[#38332e] focus:border-[#c9a87c] rounded px-3 py-2 text-xs text-neutral-100 placeholder:text-neutral-500 outline-none transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] uppercase tracking-wider text-neutral-300 mb-1 font-mono">
                            Meta Description
                          </label>
                          <Field
                            type="text"
                            name="meta_description"
                            placeholder="e.g. Shop premium 100% cotton oxford shirts for men."
                            className="w-full bg-[#141414] border border-[#38332e] focus:border-[#c9a87c] rounded px-3 py-2 text-xs text-neutral-100 placeholder:text-neutral-500 outline-none transition-colors"
                          />
                        </div>
                      </div>
                    )}
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
                            ? 'Update Product'
                            : 'Create Product'}
                      </span>
                    </button>
                  </div>
                </Form>
              );
            }}
          </Formik>
        </div>
      </div>
    </div>
  );
};
