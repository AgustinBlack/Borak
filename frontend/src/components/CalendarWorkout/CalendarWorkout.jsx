import Calendar from "react-calendar"
import "react-calendar/dist/Calendar.css"
import "./CalendarWorkout.css"

const WorkoutCalendar = ({ workoutSessions, routineDays, onDateClick }) => {

  const getTileClass = ({ date, view }) => {
    if (view !== "month") return

    const dateString = date.toISOString().split("T")[0]
    const dayOfWeek = date.getDay()

    // 🔥 sesiones (check de completado)
    const session = workoutSessions?.find(
      (s) => s.date === dateString
    )

    if (session && session.completed) {
      return "completed-day"
    }

    if (session && !session.completed) {
      return "missed-day"
    }

    // 🔥 ACÁ ESTÁ LA CLAVE
    const isTrainingDay = routineDays?.some(
      (d) => d.weekDay === dayOfWeek
    )

    if (isTrainingDay) {
      return "training-day"
    }

    return "rest-day"
  }

  console.log("Routine days:", routineDays)

  return (
    <Calendar
      tileClassName={getTileClass}
      onClickDay={onDateClick}
    />
  )
}

export default WorkoutCalendar