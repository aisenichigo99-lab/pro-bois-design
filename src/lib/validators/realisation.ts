import { z } from "zod";

export const RealisationStatusEnum = z.enum(["brouillon", "publie", "archive"]);

export const PhotoSchema = z.object({
  url: z.string().url(),
  public_id: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
  alt: z.string().optional(),
});

export const RealisationFormSchema = z.object({
  titre: z.string().min(3, "Titre trop court (3 caractères min)"),
  slug: z
    .string()
    .min(3)
    .regex(/^[a-z0-9-]+$/, "Slug invalide (a-z, 0-9, tirets uniquement)"),
  description_courte: z.string().max(300).optional().or(z.literal("")),
  description_longue: z.string().optional().or(z.literal("")),
  categorie_id: z.string().uuid("Catégorie requise"),
  annee: z.coerce.number().int().min(2000).max(2100).optional(),
  lieu: z.string().optional().or(z.literal("")),
  dimensions: z.string().optional().or(z.literal("")),
  duree_realisation: z.string().optional().or(z.literal("")),
  statut: RealisationStatusEnum,
  a_la_une: z.coerce.boolean().default(false),
  seo_title: z.string().optional().or(z.literal("")),
  seo_description: z.string().max(160).optional().or(z.literal("")),
  tags: z.array(z.string().uuid()).default([]),
  photos: z.array(PhotoSchema).default([]),
});

export type RealisationFormValues = z.infer<typeof RealisationFormSchema>;
