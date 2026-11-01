import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import {
  X,
  Check,
  Sparkles,
  AlertTriangle,
  Boxes,
  Scissors,
  Palette,
  IndianRupee,
  Wand2,
} from 'lucide-react';
import { validateWithZod } from '@/lib/validation/zod-formik';
import {
  productVariantSchema,
  ProductVariantFormData,
} from '../../../schemas/productVariant.schema';
import { ProductVariant } from '../../../types/productVariant.types';
import { Product } from '../../../types/product.types';
import { FitSize } from '../../../types/fitSize.types';
import { ProductColor } from '../../../types/productColor.types';
import { getColorHex } from '../../../utils/colorHelper';

interface ProductVariantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: ProductVariantFormData) => Promise<void>;
  initialData?: ProductVariant | null;
  products: Product[];
  fitSizes: FitSize[];
  colors: ProductColor[];
}

export const ProductVariantModal: React.FC<ProductVariantModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  products,
  fitSizes,
  colors,
}) => {
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    setServerError(null);
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const isEditing = Boolean(initialData);

  const defaultProductId = initialData?.productId || (products[0]?.id || '');
  const defaultFitSizeId = initialData?.fitSizeId || (fitSizes[0]?.id || '');
  const defaultColorId = initialData?.productColorId || (colors[0]?.id || '');

  const initialValues: ProductVariantFormData = {
    productId: defaultProductId,
    fitSizeId: defaultFitSizeId,
    productColorId: defaultColorId,
    price: initialData?.price ?? (products[0]?.basePrice || 1999),
    compare_at_price: initialData?.compareAtPrice ?? null,
    sku: initialData?.sku || '',
    stock_quantity: initialData?.stockQuantity ?? 20,
    is_active: initialData?.isActive ?? true,
  };

  const generateSku = (
    productId: string,
    fitSizeId: string,
    colorId: string,
    setFieldValue: (field: string, value: any) => void
  ) => {
    const prod = products.find((p) => p.id === productId);
    const fit = fitSizes.find((f) => f.id === fitSizeId);
    const col = colors.find((c) => c.id === colorId);

    const prodPrefix = (prod?.slug || 'GARMENT')
      .split('-')
      .map((w) => w.substring(0, 3).toUpperCase())
      .slice(0, 2)
      .join('');
    const fitPart = (fit?.fitCode || 'FIT').toUpperCase();
    const colPart = (col?.code || 'COL').toUpperCase().replace(/[^A-Z0-9]/g, '');
    const rand = Math.floor(10 + Math.random() * 90);

    const generated = `${prodPrefix}-${fitPart}-${colPart}-${rand}`;
    setFieldValue('sku', generated);
  };

  const handleSubmit = async (
    values: ProductVariantFormData,
    { setSubmitting }: FormikHelpers<ProductVariantFormData>
  ) => {
    setServerError(null);
    try {
      await onSubmit(values);
      onClose();
    } catch (err: any) {
      setServerError(err?.message || 'Failed to save product variant. Please verify inputs.');
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
      <div className="relative z-10 w-full max-w-xl bg-[#141414] border border-[#2e2a27] rounded-lg shadow-2xl overflow-hidden text-neutral-100 animate-scaleIn max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#2e2a27] flex items-center justify-between bg-[#191817] shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded bg-[#2a221b] text-[#c9a87c] border border-[#4a3a2c]">
              <Sparkles size={16} />
            </span>
            <div>
              <h3 className="font-serif text-lg tracking-wide text-neutral-100">
                {isEditing ? 'Edit Garment Variant' : 'Create Garment Variant'}
              </h3>
              <p className="text-xs text-neutral-400 font-sans">
                {isEditing
                  ? 'Update SKU code, selling price, inventory stock, and storefront status'
                  : 'Link a garment product to a fit silhouette and artisanal colorway with SKU'}
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
        <Formik<ProductVariantFormData>
          initialValues={initialValues}
          validate={validateWithZod(productVariantSchema)}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting, setFieldValue, values }) => {
            const selectedProd = products.find((p) => p.id === values.productId);
            const selectedFit = fitSizes.find((f) => f.id === values.fitSizeId);
            const selectedCol = colors.find((c) => c.id === values.productColorId);
            const colorHex = getColorHex(selectedCol?.name || '', selectedCol?.code || '');

            return (
              <Form className="p-6 space-y-4 overflow-y-auto">
                {serverError && (
                  <div className="p-3 rounded bg-rose-950/70 border border-rose-800/80 text-rose-200 text-xs flex items-center gap-2.5">
                    <AlertTriangle size={16} className="shrink-0 text-rose-400" />
                    <span>{serverError}</span>
                  </div>
                )}

                {/* 1. Target Product Garment */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">
                    Garment Product <span className="text-[#c9a87c]">*</span>
                  </label>
                  <Field
                    as="select"
                    name="productId"
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      const newProdId = e.target.value;
                      setFieldValue('productId', newProdId);
                      const p = products.find((prod) => prod.id === newProdId);
                      if (p?.basePrice && !isEditing) {
                        setFieldValue('price', p.basePrice);
                      }
                    }}
                    className="w-full bg-[#1e1c1a] border border-[#38332e] focus:border-[#c9a87c] rounded px-3.5 py-2.5 text-sm text-neutral-100 outline-none transition-colors cursor-pointer"
                  >
                    <option value="" disabled className="bg-[#1e1c1a] text-neutral-500">
                      Select parent product...
                    </option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id} className="bg-[#1e1c1a] text-neutral-200">
                        {p.name} {p.basePrice ? `(Base: ₹${p.basePrice})` : ''}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage
                    name="productId"
                    component="div"
                    className="text-rose-400 text-[11px] mt-1"
                  />
                </div>

                {/* 2. Fit Silhouette & Artisanal Color (2 columns) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Fit Silhouette */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5 flex items-center gap-1.5">
                      <Scissors size={13} className="text-[#c9a87c]" />
                      <span>Fit Silhouette *</span>
                    </label>
                    <Field
                      as="select"
                      name="fitSizeId"
                      className="w-full bg-[#1e1c1a] border border-[#38332e] focus:border-[#c9a87c] rounded px-3.5 py-2 text-sm text-neutral-100 outline-none transition-colors cursor-pointer"
                    >
                      <option value="" disabled className="bg-[#1e1c1a] text-neutral-500">
                        Select fit silhouette...
                      </option>
                      {fitSizes.map((f) => (
                        <option key={f.id} value={f.id} className="bg-[#1e1c1a] text-neutral-200">
                          {f.name} ({f.fitCode})
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage
                      name="fitSizeId"
                      component="div"
                      className="text-rose-400 text-[11px] mt-1"
                    />
                  </div>

                  {/* Artisanal Color */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5 flex items-center gap-1.5">
                      <Palette size={13} className="text-[#c9a87c]" />
                      <span>Artisanal Colorway *</span>
                    </label>
                    <Field
                      as="select"
                      name="productColorId"
                      className="w-full bg-[#1e1c1a] border border-[#38332e] focus:border-[#c9a87c] rounded px-3.5 py-2 text-sm text-neutral-100 outline-none transition-colors cursor-pointer"
                    >
                      <option value="" disabled className="bg-[#1e1c1a] text-neutral-500">
                        Select colorway...
                      </option>
                      {colors.map((c) => (
                        <option key={c.id} value={c.id} className="bg-[#1e1c1a] text-neutral-200">
                          {c.name} ({c.code})
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage
                      name="productColorId"
                      component="div"
                      className="text-rose-400 text-[11px] mt-1"
                    />
                  </div>
                </div>

                {/* 3. SKU Code with Auto-Generate Helper */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium">
                      Stock Keeping Unit (SKU) <span className="text-[#c9a87c]">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        generateSku(
                          values.productId,
                          values.fitSizeId,
                          values.productColorId,
                          setFieldValue
                        )
                      }
                      className="inline-flex items-center gap-1 text-[10px] font-mono uppercase text-[#c9a87c] hover:text-white transition-colors"
                      title="Generate SKU using product, fit, and color codes"
                    >
                      <Wand2 size={11} />
                      <span>Auto-Generate SKU</span>
                    </button>
                  </div>
                  <Field
                    type="text"
                    name="sku"
                    placeholder="e.g. KURTA-SLIM-MIDBLU-01"
                    className="w-full bg-[#1e1c1a] border border-[#38332e] focus:border-[#c9a87c] rounded px-3.5 py-2 text-sm font-mono tracking-wider text-neutral-100 placeholder:text-neutral-600 outline-none uppercase transition-colors"
                  />
                  <ErrorMessage
                    name="sku"
                    component="div"
                    className="text-rose-400 text-[11px] mt-1"
                  />
                </div>

                {/* 4. Pricing & Inventory Row (3 columns) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Selling Price */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5 flex items-center gap-1">
                      <IndianRupee size={12} className="text-[#c9a87c]" />
                      <span>Selling Price *</span>
                    </label>
                    <Field
                      type="number"
                      name="price"
                      min="0"
                      placeholder="1999"
                      className="w-full bg-[#1e1c1a] border border-[#38332e] focus:border-[#c9a87c] rounded px-3 py-2 text-sm font-mono text-neutral-100 placeholder:text-neutral-600 outline-none transition-colors"
                    />
                    <ErrorMessage
                      name="price"
                      component="div"
                      className="text-rose-400 text-[11px] mt-1"
                    />
                  </div>

                  {/* Compare-at Price */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neutral-400 font-medium mb-1.5">
                      Compare Price (MRP)
                    </label>
                    <Field
                      type="number"
                      name="compare_at_price"
                      min="0"
                      placeholder="2499"
                      className="w-full bg-[#1e1c1a] border border-[#38332e] focus:border-[#c9a87c] rounded px-3 py-2 text-sm font-mono text-neutral-100 placeholder:text-neutral-600 outline-none transition-colors"
                    />
                    <ErrorMessage
                      name="compare_at_price"
                      component="div"
                      className="text-rose-400 text-[11px] mt-1"
                    />
                  </div>

                  {/* Stock Quantity */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">
                      Stock Quantity *
                    </label>
                    <Field
                      type="number"
                      name="stock_quantity"
                      min="0"
                      placeholder="25"
                      className="w-full bg-[#1e1c1a] border border-[#38332e] focus:border-[#c9a87c] rounded px-3 py-2 text-sm font-mono text-neutral-100 placeholder:text-neutral-600 outline-none transition-colors"
                    />
                    <ErrorMessage
                      name="stock_quantity"
                      component="div"
                      className="text-rose-400 text-[11px] mt-1"
                    />
                  </div>
                </div>

                {/* 5. Live Variant Composition Preview Badge */}
                <div className="p-3 bg-[#191715] border border-[#2e2823] rounded-md flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-neutral-600 shrink-0"
                      style={{ backgroundColor: colorHex }}
                    />
                    <div>
                      <span className="font-serif text-neutral-200">
                        {selectedProd?.name || 'Selected Product'}
                      </span>
                      <span className="text-[11px] font-mono text-neutral-400 ml-2">
                        • {selectedFit?.name || 'Fit'} • {selectedCol?.name || 'Color'}
                      </span>
                    </div>
                  </div>
                  <div className="font-mono text-[11px] text-[#c9a87c]">
                    ₹{Number(values.price || 0).toLocaleString('en-IN')}
                  </div>
                </div>

                {/* 6. Active Status Checkbox */}
                <div className="pt-2">
                  <label className="relative flex items-center gap-3 p-3 bg-[#1a1816] border border-[#2f2a25] rounded-md cursor-pointer hover:border-[#423932] transition-colors">
                    <Field
                      type="checkbox"
                      name="is_active"
                      className="w-4 h-4 rounded bg-[#26201b] border-[#483727] text-[#c9a87c] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#c9a87c]"
                    />
                    <div className="flex-1">
                      <span className="text-xs font-medium text-neutral-200 block">
                        Active on Storefront
                      </span>
                      <span className="text-[11px] text-neutral-400">
                        When active, clients can select this size & colorway on the storefront product page.
                      </span>
                    </div>
                  </label>
                </div>

                {/* Modal Footer Actions */}
                <div className="pt-4 border-t border-[#2e2a27] flex items-center justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-xs uppercase tracking-wider text-neutral-400 hover:text-white rounded border border-[#332e29] hover:bg-[#201d1a] transition-colors font-sans"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 text-xs uppercase tracking-wider bg-[#54382c] hover:bg-[#3e271d] text-white rounded font-sans font-medium transition-all duration-150 flex items-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check size={14} />
                        <span>{isEditing ? 'Save Changes' : 'Create Variant'}</span>
                      </>
                    )}
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
