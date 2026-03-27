-- Skill tags managed by admin
CREATE TABLE public.skill_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT, -- optional grouping: 'diplome', 'competence', 'specialite'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: anyone can read, only admins can write
ALTER TABLE public.skill_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view skill tags" ON public.skill_tags FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Admins can manage skill tags" ON public.skill_tags FOR ALL TO authenticated USING ((SELECT public.is_admin()));

-- Seed some default tags
INSERT INTO public.skill_tags (name, category) VALUES
  ('Montessori', 'competence'),
  ('Premier Secours (PSC1)', 'competence'),
  ('Langue des Signes Bébé', 'competence'),
  ('Éveil Musical', 'competence'),
  ('Psychomotricité', 'competence'),
  ('Alimentation et Nutrition', 'competence'),
  ('Gestion de Groupe', 'competence'),
  ('Accompagnement Handicap', 'competence'),
  ('CAP Petite Enfance', 'diplome'),
  ('Diplôme EJE', 'diplome'),
  ('Auxiliaire de Puériculture', 'diplome'),
  ('Infirmière Puéricultrice', 'diplome'),
  ('BAFA', 'diplome'),
  ('Crèche', 'specialite'),
  ('Halte-garderie', 'specialite'),
  ('Multi-accueil', 'specialite'),
  ('MAM', 'specialite'),
  ('Garde à domicile', 'specialite');
