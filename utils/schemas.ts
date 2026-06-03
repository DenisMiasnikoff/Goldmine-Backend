import { z } from 'zod';

export const signupSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(21, 'Username must be at most 21 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores'),

  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please provide a valid email address'),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters'),

  confirmpassword: z
    .string()
    .min(1, 'Please confirm your password')
}).refine(data => data.password === data.confirmpassword, {
  message: 'Passwords do not match',
  path: ['confirmpassword']
});

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please provide a valid email address'),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
});

export const createPostSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be at most 200 characters'),

  content: z
    .string()
    .min(1, 'Content cannot be empty')
    .max(10000, 'Content is too long')
});

export const createCommentSchema = z.object({
  text: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(2000, 'Comment is too long')
});

export const updateMeSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(21, 'Username must be at most 21 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores')
    .optional(),

  email: z
    .string()
    .email('Please provide a valid email address')
    .optional()
});