import { z } from 'zod'

export const internshipSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(10),
    program: z.string().min(2),
})