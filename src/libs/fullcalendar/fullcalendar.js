import { Calendar } from '@fullcalendar/core/main.js';
import bootstrapPlugin from '@fullcalendar/bootstrap/main.js';
import dayGridPlugin from '@fullcalendar/daygrid/main.js';
import interactionPlugin from '@fullcalendar/interaction/main.js';
import listPlugin from '@fullcalendar/list/main.js';
import timegridPlugin from '@fullcalendar/timegrid/main.js';
import timelinePlugin from '@fullcalendar/timeline/main.js';

const calendarPlugins = {
  bootstrap: bootstrapPlugin,
  dayGrid: dayGridPlugin,
  interaction: interactionPlugin,
  list: listPlugin,
  timeGrid: timegridPlugin,
  timeline: timelinePlugin
}

export { Calendar, calendarPlugins };
