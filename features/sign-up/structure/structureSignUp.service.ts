import { createClient } from '@/lib/supabase/client';

export interface StructureSignUpFormData {
  address: string;
  city: string;
  firstName: string;
  lastName: string;
  latitude?: number;
  longitude?: number;
  name: string;
  phone: string;
  postalCode: string;
  structureType: string;
}

export async function registerStructureProfile(
  userId: string,
  formData: StructureSignUpFormData
): Promise<void> {
  const supabase = createClient();

  // Geocode city if coordinates are missing
  let { latitude, longitude } = formData;
  if (
    (typeof latitude !== 'number' || typeof longitude !== 'number') &&
    formData.city
  ) {
    try {
      const res = await fetch(
        `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(formData.city)}&fields=nom,centre&limit=1`
      );
      const cities = await res.json();
      if (cities?.[0]?.centre?.coordinates) {
        longitude = cities[0].centre.coordinates[0];
        latitude = cities[0].centre.coordinates[1];
      }
    } catch {
      // Geocoding failed, continue without coordinates
    }
  }

  const hasCoordinates =
    typeof latitude === 'number' && typeof longitude === 'number';

  // Update structures table
  const { error: structureUpdateError } = await supabase
    .from('structures')
    .update({
      address: formData.address,
      city: formData.city,
      latitude: hasCoordinates ? latitude : null,
      location: hasCoordinates
        ? `SRID=4326;POINT(${longitude} ${latitude})`
        : null,
      longitude: hasCoordinates ? longitude : null,
      name: formData.name,
      phone: formData.phone || null,
      postal_code: formData.postalCode || null,
      structure_type: formData.structureType,
    })
    .eq('user_id', userId);

  if (structureUpdateError) {
    throw new Error(
      `Failed to update structure: ${structureUpdateError.message}`
    );
  }

  // Update profiles table
  const { error: profileUpdateError } = await supabase
    .from('profiles')
    .update({
      first_name: formData.firstName,
      is_onboarded: true,
      last_name: formData.lastName,
    })
    .eq('user_id', userId);

  if (profileUpdateError) {
    throw new Error(`Failed to update profile: ${profileUpdateError.message}`);
  }

  // Insert into structure_account_members with role='owner'
  const { error: memberInsertError } = await supabase
    .from('structure_account_members')
    .upsert(
      {
        role: 'owner',
        structure_id: userId,
        user_id: userId,
      },
      { onConflict: 'structure_id,user_id' }
    );

  if (memberInsertError) {
    throw new Error(
      `Failed to create account member: ${memberInsertError.message}`
    );
  }
}
