-- Fix: notify_counseling_request() called LOWER() directly on
-- NEW.status, which is of type counseling_status_type (an ENUM),
-- not text. Postgres's lower() has no overload for a custom enum
-- type, so every UPDATE of counseling_requests.status threw:
--
--   function lower(counseling_status_type) does not exist

CREATE OR REPLACE FUNCTION public.notify_counseling_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.notifications (recipient_id, title, description, type, link_url)
    SELECT p.id,
           'New Counseling Request',
           CASE WHEN NEW.is_anonymous THEN 'A student submitted an anonymous counseling request.'
                ELSE 'A new counseling request has been submitted.' END,
           'COUNSELING',
           '/spiritual/counseling'
    FROM public.profiles p
    WHERE p.role = 'ASSOCIATE_COORDINATOR';
  ELSIF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    PERFORM public.create_notification(
      NEW.student_id,
      'Counseling Status Updated',
      'Your counseling request is now ' || REPLACE(INITCAP(LOWER(NEW.status::text)), '_', ' ') || '.',
      'COUNSELING',
      '/spiritual/counseling'
    );
  END IF;
  RETURN NEW;
END;
$$;
