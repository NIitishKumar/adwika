import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import { z } from 'zod';
import { validateWithZod } from '@/lib/validation/zod-formik';
import { FormikInput } from '@/components/common/fields';
import { Button } from '@/components/ui';
import { CheckCircle2, Mail } from 'lucide-react';

const newsletterSchema = z.object({
  email: z.string().min(1, 'Please enter your email').email('Please enter a valid email address'),
});

type NewsletterFormData = z.infer<typeof newsletterSchema>;

export const NewsletterSection: React.FC = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = async (
    values: NewsletterFormData,
    { setSubmitting, resetForm }: { setSubmitting: (b: boolean) => void; resetForm: () => void }
  ) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSubmitting(false);
    setIsSubscribed(true);
    resetForm();
  };

  return (
    <section className="bg-[#0e0e11] text-neutral-100 py-20 px-6 md:px-12 border-t border-neutral-800">
      <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
        <Mail size={24} className="text-adwika-sand mb-4" />
        <span className="text-[10px] tracking-wide-luxury uppercase text-adwika-sand font-medium">
          PATRONS CIRCLE
        </span>
        <h2 className="font-serif text-3xl md:text-4xl uppercase tracking-wider text-neutral-100 mt-2 mb-4">
          Private Releases & Salon Invitations
        </h2>
        <p className="text-xs md:text-sm text-neutral-400 font-sans max-w-lg mb-8 leading-relaxed">
          Be welcomed into our seasonal edit launches, bespoke textile documentaries, and private atelier showings in New Delhi & Mumbai.
        </p>

        {isSubscribed ? (
          <div className="flex items-center gap-2.5 p-4 bg-white/5 border border-adwika-sand/40 text-neutral-200 text-xs tracking-wider animate-fadeIn">
            <CheckCircle2 size={18} className="text-adwika-sand" />
            <span>You have been enrolled in the Patrons Circle. An invitation will arrive in your inbox.</span>
          </div>
        ) : (
          <div className="w-full max-w-md">
            <Formik<NewsletterFormData>
              initialValues={{ email: '' }}
              validate={validateWithZod(newsletterSchema)}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <FormikInput
                      name="email"
                      type="email"
                      placeholder="ENTER YOUR EMAIL FOR PRIVILEGE ACCESS"
                      className="text-xs py-3 px-4 uppercase tracking-wider bg-black/60 border-neutral-700"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="filled"
                    size="md"
                    isLoading={isSubmitting}
                    className="whitespace-nowrap sm:w-auto"
                  >
                    Subscribe
                  </Button>
                </Form>
              )}
            </Formik>
          </div>
        )}
      </div>
    </section>
  );
};
