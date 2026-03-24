import { SupabaseClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

import { Database } from '../../../../../types/database/schema.ts';

/**
 * Get or create a Stripe customer for a professional
 * If the professional already has a stripe_customer_id, returns it
 * Otherwise, creates a new Stripe customer and returns the ID
 */
export const getOrCreateProfessionalStripeCustomerId = async (
  stripe: Stripe,
  supabase: SupabaseClient<Database>,
  userId: string,
  professionalEmail?: string,
  professionalFullName?: string
): Promise<string> => {
  console.log('usaerid', userId);
  // Check if professional already has a Stripe customer ID
  const { data: professional, error: professionalError } = await supabase
    .from('professionals')
    .select(
      `
      stripe_customer_id,
      profile:profiles(email, first_name, last_name)
      `
    )
    .eq('user_id', userId)
    .maybeSingle();

  console.log('prof', professional);

  if (professionalError || !professional) {
    throw new Error(
      `Failed to fetch professional: ${professionalError?.message}`
    );
  }

  // If user already has a Stripe customer ID, return it
  if (professional.stripe_customer_id) {
    return professional.stripe_customer_id;
  }

  // Create a new Stripe customer
  const customerEmail =
    professionalEmail || professional.profile.email || undefined;
  const customerName =
    professionalFullName ||
    (professional.profile.first_name && professional.profile.last_name
      ? `${professional.profile.first_name} ${professional.profile.last_name}`
      : professional.profile.first_name || undefined);

  const customer = await stripe.customers.create({
    email: customerEmail || undefined,
    metadata: {
      user_id: userId,
    },
    name: customerName,
  });

  // Save the Stripe customer ID to the professional record
  await supabase
    .from('professionals')
    .update({ stripe_customer_id: customer.id })
    .eq('user_id', userId);

  return customer.id;
};

/**
 * Get or create a Stripe customer for a structure
 * If the structure already has a stripe_customer_id, returns it
 * Otherwise, creates a new Stripe customer and returns the ID
 */
export const getOrCreateStructureStripeCustomerId = async (
  stripe: Stripe,
  supabase: SupabaseClient<Database>,
  userId: string,
  structureEmail?: string,
  structureFullName?: string
): Promise<string> => {
  // Check if structure already has a Stripe customer ID
  const { data: structure, error: structureError } = await supabase
    .from('structures')
    .select(
      `
      stripe_customer_id,
      profile:profiles(email, first_name, last_name)
      `
    )
    .eq('user_id', userId)
    .maybeSingle();

  if (structureError || !structure) {
    throw new Error(`Failed to fetch structure: ${structureError?.message}`);
  }

  // If user already has a Stripe customer ID, return it
  if (structure.stripe_customer_id) {
    return structure.stripe_customer_id;
  }

  // Create a new Stripe customer
  const customerEmail = structureEmail || structure.profile.email || undefined;
  const customerName =
    structureFullName ||
    (structure.profile.first_name && structure.profile.last_name
      ? `${structure.profile.first_name} ${structure.profile.last_name}`
      : structure.profile.first_name || undefined);

  const customer = await stripe.customers.create({
    email: customerEmail || undefined,
    metadata: {
      user_id: userId,
    },
    name: customerName,
  });

  // Save the Stripe customer ID to the structure record
  await supabase
    .from('structures')
    .update({ stripe_customer_id: customer.id })
    .eq('user_id', userId);

  return customer.id;
};
