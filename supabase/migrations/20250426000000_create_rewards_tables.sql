-- Create rewards tables and related schemas

-- Rewards table for different types of rewards (badges, achievements, etc.)
CREATE TABLE public.rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('badge', 'achievement', 'item', 'discount')),
  required_points INTEGER NOT NULL DEFAULT 0,
  can_earn_multiple BOOLEAN NOT NULL DEFAULT FALSE,
  image_url TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.rewards IS 'Available rewards that users can earn';

-- Junction table for user-earned rewards
CREATE TABLE public.user_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES public.rewards(id) ON DELETE CASCADE,
  reward_type TEXT, -- Denormalized for easier querying
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  points_spent INTEGER NOT NULL DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, reward_id) -- Only when can_earn_multiple is false
);

COMMENT ON TABLE public.user_rewards IS 'Rewards earned by users';

-- Point transactions table to track point history
CREATE TABLE public.point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  source_type TEXT NOT NULL,
  source_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.point_transactions IS 'History of point transactions';

-- Add points columns to profiles if they don't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS points INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS lifetime_points INTEGER NOT NULL DEFAULT 0;

-- Enable RLS
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Rewards policies (public read, admin write)
CREATE POLICY "Anyone can view rewards" 
  ON public.rewards 
  FOR SELECT 
  USING (true);

-- User rewards policies (user can see their own)
CREATE POLICY "Users can view their rewards" 
  ON public.user_rewards 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their rewards" 
  ON public.user_rewards 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Point transactions policies (user can see their own)
CREATE POLICY "Users can view their point transactions" 
  ON public.point_transactions 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Insert some sample rewards
INSERT INTO public.rewards (name, description, type, required_points, can_earn_multiple, image_url)
VALUES
  ('Early Bird', 'Complete 5 tasks before 9 AM', 'badge', 0, false, 'https://api.dicebear.com/7.x/icons/svg?icon=coffee'),
  ('Task Master', 'Complete 100 tasks', 'achievement', 0, false, 'https://api.dicebear.com/7.x/icons/svg?icon=checkSquare'),
  ('Habit Hero', 'Maintain a streak for 30 days', 'achievement', 0, false, 'https://api.dicebear.com/7.x/icons/svg?icon=award'),
  ('Goal Getter', 'Complete 10 goals', 'achievement', 0, false, 'https://api.dicebear.com/7.x/icons/svg?icon=target'),
  ('Theme Customization', 'Unlock custom themes', 'item', 500, false, 'https://api.dicebear.com/7.x/icons/svg?icon=palette'),
  ('Icon Pack', 'Unlock premium icons', 'item', 300, false, 'https://api.dicebear.com/7.x/icons/svg?icon=image'),
  ('Weekly Booster', 'Double points for one week', 'item', 200, true, 'https://api.dicebear.com/7.x/icons/svg?icon=zap'),
  ('Perfectionist', 'Complete all tasks for a week', 'badge', 0, true, 'https://api.dicebear.com/7.x/icons/svg?icon=clipboard');

-- Create function to award points on habit completion
CREATE OR REPLACE FUNCTION public.award_points_for_habit_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed = true THEN
    -- Insert a point transaction
    INSERT INTO public.point_transactions (user_id, points, reason, source_type, source_id)
    VALUES (NEW.user_id, 10, 'Completed habit', 'habit', NEW.habit_id);
    
    -- Update user points
    UPDATE public.profiles
    SET 
      points = points + 10,
      lifetime_points = lifetime_points + 10
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for habit entries to award points
CREATE TRIGGER on_habit_entry_completed
  AFTER INSERT OR UPDATE ON public.habit_entries
  FOR EACH ROW
  WHEN (NEW.completed = true)
  EXECUTE FUNCTION public.award_points_for_habit_completion();

-- Create function to award points on task completion
CREATE OR REPLACE FUNCTION public.award_points_for_task_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Insert a point transaction
    INSERT INTO public.point_transactions (user_id, points, reason, source_type, source_id)
    VALUES (NEW.user_id, 5, 'Completed task', 'task', NEW.id);
    
    -- Update user points
    UPDATE public.profiles
    SET 
      points = points + 5,
      lifetime_points = lifetime_points + 5
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for tasks to award points
CREATE TRIGGER on_task_completed
  AFTER INSERT OR UPDATE ON public.tasks
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION public.award_points_for_task_completion(); 