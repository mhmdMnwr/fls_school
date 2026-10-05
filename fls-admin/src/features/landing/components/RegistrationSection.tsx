import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  CheckCircle2,
  Send,
  Loader2,
  GraduationCap,
  Phone,
  HelpCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { publicApi, CreatePublicRegistrationInput } from '@/api/public';
import { SiteSettings } from '@/types/api';

const registrationSchema = z.object({
  firstName: z
    .string()
    .min(1, 'Le prénom est obligatoire')
    .max(50, '50 caractères maximum'),
  lastName: z
    .string()
    .min(1, 'Le nom est obligatoire')
    .max(50, '50 caractères maximum'),
  birthDate: z.string().min(1, 'La date de naissance est obligatoire'),
  gender: z.enum(['MALE', 'FEMALE'], {
    required_error: 'Veuillez sélectionner le sexe',
  }),
  phone: z
    .string()
    .min(6, 'Numéro de téléphone trop court')
    .max(25, '25 caractères maximum'),
  email: z
    .string()
    .email('Adresse email invalide')
    .optional()
    .or(z.literal('')),
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

export interface RegistrationSectionProps {
  settings?: SiteSettings;
}

export const RegistrationSection: React.FC<RegistrationSectionProps> = ({ settings }) => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredName, setRegisteredName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      birthDate: '',
      gender: 'MALE',
      phone: '',
      email: '',
    },
  });

  const selectedGender = watch('gender');

  const onSubmit = async (values: RegistrationFormValues) => {
    setIsSubmitting(true);
    try {
      const payload: CreatePublicRegistrationInput = {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        birthDate: values.birthDate,
        gender: values.gender,
        phone: values.phone.trim(),
        email: values.email?.trim() || undefined,
      };

      const res = await publicApi.register(payload);
      setIsSuccess(true);
      setRegisteredName(`${payload.firstName} ${payload.lastName}`);
      toast.success(res.message || 'Pré-inscription enregistrée avec succès !');
      reset();
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        "Une erreur est survenue lors de l'enregistrement de votre demande. Veuillez vérifier vos informations.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="inscription" className="py-16 sm:py-20 bg-white border-b border-slate-100 scroll-mt-16">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <span className="inline-block px-3.5 py-1 rounded-full bg-slate-100 text-xs font-bold uppercase tracking-wider text-[#0B2545]">
            Inscriptions Ouvertes
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B2545] tracking-tight">
            Pré-inscription en ligne
          </h2>
          <p className="text-sm text-slate-500">
            Remplissez ce formulaire rapide (aucun paiement exigé). Notre secrétariat vous contactera pour convenir des matières et horaires.
          </p>
        </div>

        {/* Centered Formulaire d'inscription (Left section deleted as requested) */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-[#0B2545] text-white rounded-3xl p-7 sm:p-10 shadow-2xl shadow-black/20">
              {/* Header inside Navy card */}
              <div className="flex items-start gap-3.5 mb-6">
                <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-md p-1 border border-white/20">
                  <img
                    src="/images/fls-logo.png"
                    alt="FLS School Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight">
                    Formulaire d'inscription
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5 leading-snug">
                    Inscrivez votre enfant dès maintenant et offrez-lui le meilleur pour son avenir.
                  </p>
                </div>
              </div>

              {isSuccess ? (
                <div className="bg-white/10 rounded-2xl p-8 border border-white/15 text-center space-y-4 animate-in fade-in zoom-in-95">
                  <div className="w-16 h-16 rounded-full bg-[#F5A623] text-[#0B2545] flex items-center justify-center mx-auto font-black shadow-lg">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <h4 className="text-xl font-bold text-white">Demande transmise avec succès !</h4>
                  <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                    Merci, la demande pour <strong className="text-[#F5A623]">{registeredName}</strong> a
                    bien été enregistrée. L'école vous appellera rapidement pour confirmer.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsSuccess(false)}
                    className="px-6 py-2.5 rounded-full bg-white text-[#0B2545] text-xs font-bold shadow-sm"
                  >
                    Nouvelle pré-inscription
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* Row 1: Nom & Prénom */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <input
                        placeholder="Nom de l'élève *"
                        className="w-full h-11 px-4 rounded-xl bg-white text-slate-900 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                        {...register('lastName')}
                      />
                      {errors.lastName && (
                        <p className="text-[11px] text-amber-300 mt-1">{errors.lastName.message}</p>
                      )}
                    </div>

                    <div>
                      <input
                        placeholder="Prénom de l'élève *"
                        className="w-full h-11 px-4 rounded-xl bg-white text-slate-900 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                        {...register('firstName')}
                      />
                      {errors.firstName && (
                        <p className="text-[11px] text-amber-300 mt-1">{errors.firstName.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Date de naissance & Sexe */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <input
                        type="date"
                        className="w-full h-11 px-4 rounded-xl bg-white text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                        {...register('birthDate')}
                      />
                      {errors.birthDate && (
                        <p className="text-[11px] text-amber-300 mt-1">{errors.birthDate.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 h-11">
                      <button
                        type="button"
                        onClick={() => setValue('gender', 'MALE')}
                        className={`h-full rounded-xl text-xs font-bold transition-all ${
                          selectedGender === 'MALE'
                            ? 'bg-[#F5A623] text-[#0B2545] shadow-sm'
                            : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                        }`}
                      >
                        Garçon
                      </button>
                      <button
                        type="button"
                        onClick={() => setValue('gender', 'FEMALE')}
                        className={`h-full rounded-xl text-xs font-bold transition-all ${
                          selectedGender === 'FEMALE'
                            ? 'bg-[#F5A623] text-[#0B2545] shadow-sm'
                            : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                        }`}
                      >
                        Fille
                      </button>
                    </div>
                  </div>

                  {/* Row 3: Téléphone & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <input
                        type="tel"
                        placeholder="Téléphone des parents *"
                        className="w-full h-11 px-4 rounded-xl bg-white text-slate-900 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                        {...register('phone')}
                      />
                      {errors.phone && (
                        <p className="text-[11px] text-amber-300 mt-1">{errors.phone.message}</p>
                      )}
                    </div>

                    <div>
                      <input
                        type="email"
                        placeholder="Adresse e-mail"
                        className="w-full h-11 px-4 rounded-xl bg-white text-slate-900 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                        {...register('email')}
                      />
                      {errors.email && (
                        <p className="text-[11px] text-amber-300 mt-1">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Golden Pill Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-12 rounded-full bg-[#F5A623] hover:bg-[#E59819] text-[#0B2545] font-black text-sm shadow-xl shadow-black/30 transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-[#0B2545]" />
                          <span>Envoi en cours...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 text-[#0B2545]" />
                          <span>S'inscrire</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-[11px] text-center text-slate-300/80 pt-1">
                    L'école vous contactera pour convenir des matières et des horaires.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  };
