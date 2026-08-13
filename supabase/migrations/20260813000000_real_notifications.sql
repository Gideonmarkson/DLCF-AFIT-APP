-- Real in-app notifications for DLCF AFIT.
-- Notifications are generated server-side by database triggers, not by client-supplied data.

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('ACADEMIC', 'COUNSELING', 'SCHOLARSHIP', 'GOVERNANCE', 'FELLOWSHIP')),
  link_url TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notifications_recipient_created_idx
  ON public.notifications (recipient_id, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own notifications" ON public.notifications;
CREATE POLICY "Users can read their own notifications"
ON public.notifications FOR SELECT TO authenticated
USING (recipient_id = auth.uid());

DROP POLICY IF EXISTS "Users can mark their own notifications read" ON public.notifications;
CREATE POLICY "Users can mark their own notifications read"
ON public.notifications FOR UPDATE TO authenticated
USING (recipient_id = auth.uid())
WITH CHECK (recipient_id = auth.uid());

-- Notification rows are created only by trusted trigger functions.
REVOKE INSERT ON public.notifications FROM anon, authenticated;
REVOKE DELETE ON public.notifications FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.create_notification(
  p_recipient_id UUID,
  p_title TEXT,
  p_description TEXT,
  p_type TEXT,
  p_link_url TEXT DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_recipient_id IS NULL OR p_title IS NULL OR p_description IS NULL THEN
    RETURN;
  END IF;

  INSERT INTO public.notifications (recipient_id, title, description, type, link_url)
  VALUES (p_recipient_id, p_title, p_description, p_type, p_link_url);
END;
$$;

REVOKE ALL ON FUNCTION public.create_notification(UUID, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_notification(UUID, TEXT, TEXT, TEXT, TEXT) TO authenticated;

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
      'Your counseling request is now ' || REPLACE(INITCAP(LOWER(NEW.status)), '_', ' ') || '.',
      'COUNSELING',
      '/spiritual/counseling'
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS counseling_request_notifications ON public.counseling_requests;
CREATE TRIGGER counseling_request_notifications
AFTER INSERT OR UPDATE OF status ON public.counseling_requests
FOR EACH ROW EXECUTE FUNCTION public.notify_counseling_request();

CREATE OR REPLACE FUNCTION public.notify_counseling_reply()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student_id UUID;
BEGIN
  SELECT student_id INTO v_student_id
  FROM public.counseling_requests
  WHERE id = NEW.request_id;

  PERFORM public.create_notification(
    v_student_id,
    'Counseling Response Received',
    'An Associate Coordinator has replied to your counseling request.',
    'COUNSELING',
    '/spiritual/counseling'
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS counseling_reply_notifications ON public.counseling_replies;
CREATE TRIGGER counseling_reply_notifications
AFTER INSERT ON public.counseling_replies
FOR EACH ROW EXECUTE FUNCTION public.notify_counseling_reply();

CREATE OR REPLACE FUNCTION public.notify_new_scholarship()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (recipient_id, title, description, type, link_url)
  SELECT p.id,
         'New Scholarship Opportunity',
         NEW.title,
         'SCHOLARSHIP',
         '/academic/scholarships'
  FROM public.profiles p
  WHERE p.id <> COALESCE(NEW.created_by, '00000000-0000-0000-0000-000000000000'::UUID);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS scholarship_notifications ON public.scholarships;
CREATE TRIGGER scholarship_notifications
AFTER INSERT ON public.scholarships
FOR EACH ROW EXECUTE FUNCTION public.notify_new_scholarship();

CREATE OR REPLACE FUNCTION public.notify_new_pairing()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.create_notification(
    NEW.student_id,
    'Peer Mentor Assigned',
    'An Academic Director has assigned you a peer mentor.',
    'ACADEMIC',
    '/academic/peer-network'
  );

  PERFORM public.create_notification(
    NEW.mentor_id,
    'New Mentee Assigned',
    'You have been assigned a student in the peer mentorship network.',
    'ACADEMIC',
    '/academic/peer-network'
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS mentor_pairing_notifications ON public.mentor_pairings;
CREATE TRIGGER mentor_pairing_notifications
AFTER INSERT ON public.mentor_pairings
FOR EACH ROW EXECUTE FUNCTION public.notify_new_pairing();

CREATE OR REPLACE FUNCTION public.notify_forum_announcement()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_announcement = TRUE THEN
    INSERT INTO public.notifications (recipient_id, title, description, type, link_url)
    SELECT p.id,
           'New Fellowship Unit Notice',
           NEW.title,
           'FELLOWSHIP',
           '/fellowship/forums'
    FROM public.profiles p
    WHERE p.id <> NEW.author_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS forum_announcement_notifications ON public.forum_posts;
CREATE TRIGGER forum_announcement_notifications
AFTER INSERT ON public.forum_posts
FOR EACH ROW EXECUTE FUNCTION public.notify_forum_announcement();

-- Make notifications available through Supabase Realtime when the publication exists.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
     AND NOT EXISTS (
       SELECT 1
       FROM pg_publication_tables
       WHERE pubname = 'supabase_realtime'
         AND schemaname = 'public'
         AND tablename = 'notifications'
     ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END;
$$;
