// import Calendar from "react-calendar"
// import "react-calendar/dist/Calendar.css"
// import "./CalendarWorkout.css"

// const WorkoutCalendar = ({ workoutSessions }) => {

//   const trainingDays = [1,3,5]

//   const getTileClass = ({ date, view }) => {

//     if (view !== "month") return

//     const dateString = date.toISOString().split("T")[0]
//     const dayOfWeek = date.getDay()
    
//     const session = workoutSessions.find(
//       (s) => s.date === dateString
//     )

//     if (session && session.completed) {
//       return "completed-day"
//     }

//     if (session && !session.completed) {
//       return "missed-day"
//     }

//     if (trainingDays.includes(dayOfWeek)) {
//       return "training-day"
//     }

//     return "rest-day"
//   }

//   const handleClickDay = (date) => {

//     const dayNumber = date.getDay()

//     console.log("Fecha seleccionada:", date)
//     console.log("Día de la semana:", dayNumber)

//   }


//   return (
//     <Calendar
//       tileClassName={getTileClass}
//       onClickDay={handleClickDay}
//     />
//   )
// }

// export default WorkoutCalendar

import Calendar from "react-calendar"
import "react-calendar/dist/Calendar.css"
import "./CalendarWorkout.css"

const WorkoutCalendar = ({ workoutSessions, onDateClick }) => {

  const trainingDays = [1,3,5]

  const getTileClass = ({ date, view }) => {

    if (view !== "month") return

    const dateString = date.toISOString().split("T")[0]
    const dayOfWeek = date.getDay()

    const session = workoutSessions.find(
      (s) => s.date === dateString
    )

    if (session && session.completed) {
      return "completed-day"
    }

    if (session && !session.completed) {
      return "missed-day"
    }

    if (trainingDays.includes(dayOfWeek)) {
      return "training-day"
    }

    return "rest-day"
  }

  return (
    <Calendar
      tileClassName={getTileClass}
      onClickDay={onDateClick}
    />
  )
}

export default WorkoutCalendar