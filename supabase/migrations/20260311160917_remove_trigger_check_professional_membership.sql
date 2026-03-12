-- Remove trigger
DROP TRIGGER IF EXISTS trigger_check_professional_membership
ON public.missions;

-- Remove function
DROP FUNCTION IF EXISTS public.check_professional_membership();
