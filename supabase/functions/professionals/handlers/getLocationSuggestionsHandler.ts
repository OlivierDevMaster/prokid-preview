import { createFactory } from '@hono/hono/factory';
import { z } from 'zod';

import { validateRequestQuery } from '../../_shared/utils/requests.ts';
import { apiResponse } from '../../_shared/utils/responses.ts';

const factory = createFactory();

const ProfessionalLocationSearchQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(10).optional(),
  q: z.string().min(2),
});

export interface ProfessionalLocationSuggestion {
  city: string;
  departmentCode: string;
  inseeCode: string;
  population: number;
  postalCodes: string[];
}

interface GeoGouvCommune {
  code: string;
  codeDepartement: string;
  codesPostaux: string[];
  nom: string;
  population: number;
}

export const getLocationSuggestionsHandler = factory.createHandlers(
  async ({ req }) => {
    try {
      const validationResult = validateRequestQuery(
        ProfessionalLocationSearchQuerySchema,
        req
      );

      if (!validationResult.success) {
        return validationResult.response;
      }

      const { limit, q } = validationResult.data;
      const searchLimit = limit ?? 10;

      const searchParams = new URLSearchParams({
        boost: 'population',
        limit: String(searchLimit),
        nom: q,
      });

      const response = await fetch(
        `https://geo.api.gouv.fr/communes?${searchParams.toString()}`
      );

      if (!response.ok) {
        console.error(
          'Failed to fetch communes from geo.api.gouv.fr',
          response.status,
          response.statusText
        );

        return apiResponse.internalServerError(
          'Failed to fetch location suggestions from external service',
          {
            code: 'GEO_SERVICE_UNAVAILABLE',
          }
        );
      }

      const data = (await response.json()) as GeoGouvCommune[];

      const suggestions: ProfessionalLocationSuggestion[] = data.map(
        commune => ({
          city: commune.nom,
          departmentCode: commune.codeDepartement,
          inseeCode: commune.code,
          population: commune.population,
          postalCodes: commune.codesPostaux,
        })
      );

      return apiResponse.ok(suggestions);
    } catch (error) {
      console.error('Error in getLocationSuggestionsHandler:', error);
      return apiResponse.internalServerError();
    }
  }
);
