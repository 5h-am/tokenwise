import { z } from 'zod';

export const leadInputSchema = z.object({
  shareId: z.string().uuid(),
  email: z.string().email(),
  companyName: z.string().optional(),
  role: z.string().optional(),
  teamSize: z.number().int().positive().optional(),
  website: z.string().optional(),
  screenshot: z.string().optional()
});

export type LeadInput = z.infer<typeof leadInputSchema>;
