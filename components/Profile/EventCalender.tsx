import { CalendarOptions } from "@fullcalendar/core/index.js";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import multiMonthPlugin from "@fullcalendar/multimonth";
import FullCalendar from "@fullcalendar/react";
import { JSX, useEffect, useRef } from "react";

const EventCalender = (
  props: JSX.IntrinsicAttributes & JSX.IntrinsicClassAttributes<FullCalendar> & Readonly<CalendarOptions>
) => {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      // ref.current prototype do rerender
      ref.current.doResize();
    }
  }, []);
  return (
    <FullCalendar
      ref={ref}
      plugins={[dayGridPlugin, interactionPlugin, multiMonthPlugin]}
      initialDate={new Date()}
      initialView="dayGridMonth"
      // views={{
      //   multiMonthFourMonth: {
      //     type: "multiMonth",
      //     duration: { months: 1 },
      //   },
      // }}
      editable={true}
      contentHeight={600}
      {...props}
      // eventDrop={this.handleEventDrop}
      // eventClick={this.handleEventClick}
      // events={this.formatEvents()}
    />
  );
};

export default EventCalender;
