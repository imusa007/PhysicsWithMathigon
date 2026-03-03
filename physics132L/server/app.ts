import {MathigonStudioApp} from '@mathigon/studio/server/app';
import {COURSES} from '@mathigon/studio/server/utilities/utilities';

function getValidCourses(req: any, res: any) {
  const localeId = res.locals.locale?.id || 'en';
  const getCourse = res.locals.getCourse;
  return (COURSES || []).filter((id: string) => getCourse(id, localeId));
}

const studio = new MathigonStudioApp()
  .setup({sessionSecret: 'physics132L-secret'})
  .get('/', (req, res) => res.render('home.pug', {courses: getValidCourses(req, res)}))
  .get('/courses', (req, res) => res.render('courses.pug', {courses: getValidCourses(req, res)}))
  .course({})
  .errors()
  .listen(8080);

