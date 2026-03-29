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

import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./CalendarWorkout.css";

// Agregamos = [] para que si llega undefined, el código no rompa
const WorkoutCalendar = ({ routineDays = [], workoutSessions = [], onDateClick }) => {

  const getTileClass = ({ date, view }) => {
    // Solo aplicar lógica en la vista de mes
    if (view !== "month") return;

    const dayOfWeek = date.getDay(); // 0 (Dom) a 6 (Sáb)
    const dateString = date.toISOString().split("T")[0];

    // 1. Ver historial con Optional Chaining (?.)
    const session = workoutSessions?.find(s => s.date === dateString);
    if (session) return "completed-day";

    // 2. Ver si hay rutina asignada para ese día de la semana
    // Usamos ?. por si routineDays llega nulo accidentalmente
    const hasRoutine = routineDays?.some(day => day.weekDay === dayOfWeek);
    
    if (hasRoutine) {
      return "training-day"; 
    }

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