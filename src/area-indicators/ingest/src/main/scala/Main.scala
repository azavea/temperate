package io.temperate.ingest

import cats.implicits._
import com.monovore.decline._
import org.apache.spark._

object Main
    extends CommandApp(
      name = "area-indicators-ingest",
      header = "Copy NetCDF Climate Data to GeoTrellis Avro Layers for Area Indicators API",
      main = {
        val digitsOpt =
          Opts.option[Int]("digits", short = "d", help = "Digits to calculate").withDefault(1000000)

        val quietOpt = Opts.flag("quiet", help = "Whether to be quiet.").orFalse

        (digitsOpt, quietOpt).mapN { (digits, quiet) =>
          val conf = new SparkConf()
          val sc   = new SparkContext(conf)
          //your algorithm
          val n = digits
          val count = sc
            .parallelize(1 to n)
            .map { i =>
              val x = scala.math.random
              val y = scala.math.random
              if (x * x + y * y < 1) 1 else 0
            }
            .reduce(_ + _)
          println("Pi is roughly " + 4.0 * count / n)
        }
      }
    )
