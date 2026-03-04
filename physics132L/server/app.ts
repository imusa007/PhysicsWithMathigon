import mongoose from 'mongoose';
import {MathigonStudioApp} from '@mathigon/studio/server/app';
import {COURSES} from '@mathigon/studio/server/utilities/utilities';

function getValidCourses(req: any, res: any) {
  const localeId = res.locals.locale?.id || 'en';
  const getCourse = res.locals.getCourse;
  return (COURSES || []).filter((id: string) => getCourse(id, localeId));
}

/** Merge any anonymous (tmpUser) progress into the logged-in user, then clear tmp cookie. */
async function mergeTmpUserProgress(req: any, res: any, next: () => void) {
  if (req.user && req.tmpUser && req.tmpUser !== req.user.id) {
    try {
      const Progress = mongoose.connection.model('Progress');
      await Progress.updateMany(
        {userId: req.tmpUser},
        {userId: req.user.id}
      ).exec();
      res.cookie('tmp_user', '', {maxAge: 0, path: '/'});
    } catch (_) {
      // ignore merge errors
    }
  }
  next();
}

/** Custom dashboard: show all modules (not just recent/in-progress). */
async function dashboardHandler(req: any, res: any) {
  if (!req.session?.auth?.user) return res.redirect('/login');
  const User = mongoose.connection.model('User');
  const user = await User.findById(req.session.auth.user);
  if (!user) return res.redirect('/login');

  const Progress = mongoose.connection.model('Progress') as any;
  const CourseAnalytics = mongoose.connection.model('CourseAnalytics') as any;
  const progress = await Progress.getUserData(user.id);
  const recent = (await Progress.getRecentCourses(user.id)).slice(0, 6);
  const items = Math.min(4, Math.max(0, 6 - recent.length));
  const recommended = (COURSES as string[]).filter((x: string) => !progress.has(x)).slice(0, items);
  const stats = CourseAnalytics
    ? await CourseAnalytics.getLastWeekStats(user.id)
    : {points: 0, minutes: 0};
  const allCourses = getValidCourses(req, res);
  // Template mixin uses progress[id]; Map doesn't support [id], so pass a plain object
  const progressForTemplate = Object.fromEntries(progress);

  res.render('dashboard', {
    user,
    progress: progressForTemplate,
    recent,
    recommended,
    stats,
    allCourses,
  });
}

/** Phase 2: Instructor-only — require user.type === 'teacher'. */
function requireInstructor(req: any, res: any) {
  if (!req.user) return res.redirect('/login');
  if (req.user.type !== 'teacher') return res.status(403).send('Instructor access only.');
}

/** GET /instructor — list students with progress (read-only). */
async function instructorList(req: any, res: any) {
  requireInstructor(req, res);
  if (res.headersSent) return;
  const Progress = mongoose.connection.model('Progress') as any;
  const User = mongoose.connection.model('User');
  const userIds = await Progress.distinct('userId');
  const users = userIds.length
    ? await User.find({_id: {$in: userIds}}).select('id firstName lastName email updatedAt').lean().exec()
    : [];
  const progressDocs = await Progress.find({}).sort({updatedAt: -1}).lean().exec();
  const byUser = new Map<string, {user: any; courses: any[]}>();
  for (const u of users) {
    byUser.set(u._id.toString(), {user: u, courses: []});
  }
  for (const p of progressDocs) {
    const entry = byUser.get(p.userId);
    if (entry) entry.courses.push({courseId: p.courseId, progress: p.progress || 0, updatedAt: p.updatedAt});
  }
  const students = Array.from(byUser.values()).sort(
    (a, b) => new Date(b.user.updatedAt || 0).getTime() - new Date(a.user.updatedAt || 0).getTime()
  );
  res.render('instructor.pug', {students});
}

/** GET /instructor/export — CSV of student progress for grading. */
async function instructorExport(req: any, res: any) {
  requireInstructor(req, res);
  if (res.headersSent) return;
  const Progress = mongoose.connection.model('Progress') as any;
  const User = mongoose.connection.model('User');
  const userIds = await Progress.distinct('userId');
  const users = userIds.length
    ? await User.find({_id: {$in: userIds}}).select('id firstName lastName email').lean().exec()
    : [];
  const userMap = new Map(users.map((u: any) => [u._id.toString(), u]));
  const progressDocs = await Progress.find({}).lean().exec();
  const format = (req.query.format as string) || 'csv';
  if (format === 'json') {
    const rows = progressDocs.map((p: any) => {
      const u = userMap.get(p.userId);
      const steps: any = {};
      if (p.steps && typeof p.steps.entries === 'function') {
        for (const [k, v] of p.steps.entries()) steps[k] = {scores: v.scores, data: v.data ? JSON.parse(v.data) : undefined};
      } else if (p.steps && typeof p.steps === 'object') {
        for (const k of Object.keys(p.steps)) {
          const v = p.steps[k];
          steps[k] = {scores: v.scores || [], data: v.data ? (typeof v.data === 'string' ? JSON.parse(v.data) : v.data) : undefined};
        }
      }
      return {
        userId: p.userId,
        email: u?.email,
        name: u ? `${u.firstName || ''} ${u.lastName || ''}`.trim() : '',
        courseId: p.courseId,
        progress: p.progress || 0,
        updatedAt: p.updatedAt,
        steps,
      };
    });
    return res.type('application/json').send(JSON.stringify(rows, null, 2));
  }
  const header = 'Email,Name,Course,Progress %,Last updated\n';
  const rows = progressDocs.map((p: any) => {
    const u = userMap.get(p.userId);
    const name = u ? `${u.firstName || ''} ${u.lastName || ''}`.trim() : '';
    const email = (u?.email || '').replace(/"/g, '""');
    const updated = p.updatedAt ? new Date(p.updatedAt).toISOString() : '';
    return `"${email}","${name}",${p.courseId},${p.progress || 0},"${updated}"`;
  });
  res.type('text/csv').attachment('progress-export.csv').send(header + rows.join('\n'));
}

const studio = new MathigonStudioApp()
  .setup({sessionSecret: 'physics132L-secret'})
  .get('/', (req, res) => res.render('home.pug', {courses: getValidCourses(req, res)}))
  .get('/courses', (req, res) => res.render('courses.pug', {courses: getValidCourses(req, res)}))
  .get('/dashboard', dashboardHandler)
  .accounts()
  .use(mergeTmpUserProgress)
  .course({})
  .get('/instructor', instructorList)
  .get('/instructor/export', instructorExport)
  .errors()
  .listen(8080);

