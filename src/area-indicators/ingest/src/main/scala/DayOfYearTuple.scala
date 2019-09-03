package io.temperate.ingest

import java.time.{LocalDateTime, ZoneOffset, ZonedDateTime}

case class DayOfYearTuple(year: Int, dayOfYear: Int) {

  def toZonedDateTime: Option[ZonedDateTime] = {
    try {
      Some(
        LocalDateTime
          .of(year, 1, 1, 0, 0)
          .atZone(ZoneOffset.UTC)
          .withDayOfYear(dayOfYear))
    } catch {
      case _: Throwable => None
    }
  }
}
