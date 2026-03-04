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

const studio = new MathigonStudioApp()
  .setup({sessionSecret: 'physics132L-secret'})
  .get('/', (req, res) => res.render('home.pug', {courses: getValidCourses(req, res)}))
  .get('/courses', (req, res) => res.render('courses.pug', {courses: getValidCourses(req, res)}))
  .get('/dashboard', dashboardHandler)
  .accounts()
  .use(mergeTmpUserProgress)
  .course({})
  .errors()
  .listen(8080);

