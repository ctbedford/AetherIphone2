import { protectedProcedure, router } from '../router';
import { z } from 'zod';

const Output = z.object({
  userName:       z.string(),
  tasksTotal:     z.number(),
  tasksCompleted: z.number(),
  tasksOpen:      z.number(),
  tasksOverdue:   z.number(),
  unreadMessages: z.number(),
  tasks: z.array(
    z.object({
      id:        z.string(),
      title:     z.string(),
      completed: z.boolean(),
      dueDate:   z.string().nullable()
    })
  )
});

export const dashboardRouter = router({
  getDashboardData: protectedProcedure.output(Output).query(async ({ ctx }) => {
    const uid = ctx.userId;

    // ----- summary row (materialised view) -----
    const { data: summary, error: sumErr } = await ctx.supabaseAdmin
      .from('dashboard_view')
      .select('name, tasks_total, tasks_completed, tasks_open, tasks_overdue, unread_messages')
      .eq('user_id', uid)
      .maybeSingle();
    if (sumErr) throw sumErr;

    // ----- task list (≤ 20 upcoming / overdue) -----
    const { data: tasks, error: taskErr } = await ctx.supabaseAdmin
      .from('tasks')
      .select('id, title, completed, due AS due_date')
      .eq('user_id', uid)
      .is('archived_at', null)
      .neq('status', 'completed')
      .order('due_date', { ascending: true, nullsFirst: false })
      .limit(20);
    if (taskErr) throw taskErr;

    return Output.parse({
      userName:       summary?.name             ?? '',
      tasksTotal:     summary?.tasks_total      ?? 0,
      tasksCompleted: summary?.tasks_completed  ?? 0,
      tasksOpen:      summary?.tasks_open       ?? 0,
      tasksOverdue:   summary?.tasks_overdue    ?? 0,
      unreadMessages: summary?.unread_messages  ?? 0,
      tasks: tasks?.map(t => ({
        id:        String(t.id),
        title:     t.title,
        completed: t.completed,
        dueDate:   t.due_date
      })) ?? []
    });
  }),

  // minor mutation used by optimistic UI
  completeTask: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabaseAdmin
        .from('tasks')
        .update({ completed: true })
        .match({ id: input.id, user_id: ctx.userId });
      if (error) throw error;
      return { success: true };
    })
});
