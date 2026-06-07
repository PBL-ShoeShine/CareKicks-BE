ALTER TABLE public.shops
ADD COLUMN IF NOT EXISTS alasan_penangguhan text,
ADD COLUMN IF NOT EXISTS suspended_at timestamp without time zone,
ADD COLUMN IF NOT EXISTS suspended_by integer;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'shops_suspended_by_fkey'
  ) THEN
    ALTER TABLE public.shops
    ADD CONSTRAINT shops_suspended_by_fkey
    FOREIGN KEY (suspended_by)
    REFERENCES public.superadmin(id_superadmin);
  END IF;
END $$;
