package io.temperate.datamodel

import java.time.ZonedDateTime
import java.util.concurrent.Executors

import com.typesafe.scalalogging.LazyLogging

import scala.concurrent._
import geotrellis.raster._
import geotrellis.spark._
import geotrellis.spark.io._
import geotrellis.spark.io.s3._
import geotrellis.vector.Polygon


object Operations extends LazyLogging {

  val ec = ExecutionContext.fromExecutor(Executors.newFixedThreadPool(Runtime.getRuntime.availableProcessors)) // XXX

  type KV = (SpaceTimeKey, MultibandTile)
  type Dictionary = Map[String, Double]
  type TimedDictionary = (ZonedDateTime, Dictionary)

  val bucket = "ingested-loca-data"
  val prefix = "CCSM4"
  val as = S3AttributeStore(bucket, prefix)
  val id = LayerId("CCSM4_rcp85_r6i1p1", 0)
  val dataset = S3CollectionLayerReader(as)

  /**
    * Perform a query, wrap the computation in a future for
    * asynchrony.
    */
  def futureQuery(
    startTime: ZonedDateTime, endTime: ZonedDateTime, area: Polygon,
    divide: Seq[KV] => Map[ZonedDateTime, Seq[KV]],
    narrower: Seq[MultibandTile] => Dictionary,
    box: Seq[TimedDictionary] => Seq[Double]
  ): Future[Map[ZonedDateTime, Seq[Double]]] = {
    Future{ query(startTime, endTime, area, divide, narrower, box) }(ec)
  }

  /**
    * Perform a query.
    *
    * @param  startTime The beginning of the temporal search range
    * @param  endTime   The end of the temporal search range
    * @param  area      The spatial search range (given as a multipolygon)
    * @param  divide    A function that takes a sequence of (key, tile) pairs a divides it into appropriate temporally-contiguous divisions
    * @param  narrower  A function that turns an area (some tiles) into a dictionary of variables to their values, e.g. Map("tasmin" -> 1, "tasmax" -> 3).
    * @param  box       A function that turns a sequence of dictionaries into a sequence of scalers
    * @return           A map from dates to sequences of doubles.  The dates mark the beginnings of temporal divisions and the sequences of one or more scalers are the values derived from the respective chunks.
    */
  def query(
    startTime: ZonedDateTime, endTime: ZonedDateTime, area: Polygon,
    divide: Seq[KV] => Map[ZonedDateTime, Seq[KV]],
    narrower: Seq[MultibandTile] => Dictionary,
    box: Seq[TimedDictionary] => Seq[Double]
  ): Map[ZonedDateTime, Seq[Double]] = {
    val collection = dataset
      .query[SpaceTimeKey, MultibandTile, TileLayerMetadata[SpaceTimeKey]](id)
      .where(Intersects(area))
      .where(Between(startTime, endTime))
      .result.mask(area)

    logger.info("Collection acquired, grouping...")
    // map of zoned date times to sequences of key-value pairs
    val grouped: Map[ZonedDateTime, Map[ZonedDateTime, Seq[(SpaceTimeKey, MultibandTile)]]] = divide(collection)
      .map({ pair =>
        val zdt: ZonedDateTime = pair._1
        val kvs: Seq[KV] = pair._2
        val group = kvs.groupBy({ kv => kv._1.time })
        (zdt, group)
      })
    logger.info("Narrowing...")
    // map of zoned date times to maps of zoned date times to sequences of key-value pairs
    val narrowed: Map[ZonedDateTime, List[(ZonedDateTime, Dictionary)]] = grouped.map({ pair =>
        val zdt: ZonedDateTime = pair._1
        val m: Map[ZonedDateTime, Seq[KV]] = pair._2
        val narrowed = m.map({ pair =>
          val zdt2: ZonedDateTime = pair._1
          val kvs: Seq[KV] = pair._2
          val vs = kvs.map({ kv => kv._2 })
          (zdt2, narrower(vs))
        })
        .toList.sortBy({ pair => pair._1.toEpochSecond })
        (zdt, narrowed)
      })
    // map of zoned date times to sequences of dictionaries
    logger.info("Boxing...")
    val boxed: Map[ZonedDateTime, Seq[Double]] = narrowed.map({ pair =>
      val zdt: ZonedDateTime = pair._1
      val ds: Seq[TimedDictionary] = pair._2
      val scalers = box(ds)
      (zdt, scalers)
    })
    boxed
  }
}
