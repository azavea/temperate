package io.temperate.datamodel

sealed trait TemperateException extends Exception

final case class InvalidVariableException(message: String) extends TemperateException
