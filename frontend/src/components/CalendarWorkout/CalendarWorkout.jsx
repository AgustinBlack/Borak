import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./CalendarWorkout.css";

const WorkoutCalendar = ({ routineDays, workoutSessions, onDateClick, completedDates = [] }) => {

  const getTileClass = ({ date, view }) => {
    if (view !== "month") return;

    const dateStr = date.toISOString().slice(0, 10);
    const dayOfWeek = date.getDay();
    const hasRoutine = routineDays?.some(day => Number(day.weekDay) === dayOfWeek);
    const isCompleted = completedDates.includes(dateStr);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isPast = date < today;

    if (isCompleted) return "completed-day";
    if (isPast && hasRoutine && !isCompleted) return "missed-day";
    if (hasRoutine) return "training-day";
    return "rest-day";
  };

  return (
    <div className="calendar-container">
      <Calendar
        tileClassName={getTileClass}
        onClickDay={onDateClick}
      />
    </div>
  );
};

export default WorkoutCalendar;